import type { AdminOverview } from "@glotmate/contracts";
import { sql } from "../../db/client.js";

/**
 * OVERVIEW — panelin açılış ekranı: kullanıcı, aktiflik, Pro, oturum ve
 * `llm_calls` maliyet panosu (README Faz 6). Hepsi tek seferde, salt okunur.
 *
 * "Aktif" = öğrencinin en az bir turu olan oturum (yalnız açıp çıkmak sayılmaz).
 * Gün sınırı burada UTC — operatör görünümü, kullanıcı dilimine göre değil.
 */
const num = (v: unknown) => Number(v ?? 0);

export async function getAdminOverview(days: number): Promise<AdminOverview> {
  const since = sql`now() - make_interval(days => ${days})`;

  const [users, active, pro, sess, cost, byDay, byPurpose, byModel, topUsers] = await Promise.all([
    sql<{ total: number; anonymous: number; new_in_range: number }[]>`
      select count(*)::int as total,
        count(*) filter (where is_anonymous)::int as anonymous,
        count(*) filter (where created_at > ${since})::int as new_in_range
      from auth.users`,
    sql<{ today: number; in_range: number }[]>`
      select
        count(distinct s.user_id) filter (where t.created_at >= date_trunc('day', now()))::int as today,
        count(distinct s.user_id)::int as in_range
      from transcript_turns t join sessions s on s.id = t.session_id
      where t.role = 'user' and t.created_at > ${since}`,
    sql<{ n: number }[]>`
      select count(*)::int as n from user_entitlements
      where (rc_active and (rc_expires_at is null or rc_expires_at > now()))
         or (admin_grant_until is not null and admin_grant_until > now())`,
    sql<{ lesson: number; roleplay: number; completed: number }[]>`
      select
        (select count(*)::int from sessions where session_kind = 'lesson' and started_at > ${since}) as lesson,
        (select count(*)::int from sessions where session_kind = 'roleplay' and started_at > ${since}) as roleplay,
        (select count(*)::int from lesson_progress where status = 'completed' and completed_at > ${since}) as completed`,
    sql<{ usd: string }[]>`select coalesce(sum(cost_usd), 0) as usd from llm_calls where created_at > ${since}`,
    sql<{ date: string; usd: string; calls: number }[]>`
      with d as (
        select generate_series(date_trunc('day', now()) - make_interval(days => ${days - 1}), date_trunc('day', now()), interval '1 day') as day
      )
      select to_char(d.day, 'YYYY-MM-DD') as date,
        coalesce(sum(c.cost_usd), 0) as usd,
        count(c.id)::int as calls
      from d left join llm_calls c on date_trunc('day', c.created_at) = d.day
      group by d.day order by d.day`,
    sql<{ purpose: string; calls: number; usd: string }[]>`
      select purpose, count(*)::int as calls, coalesce(sum(cost_usd), 0) as usd
      from llm_calls where created_at > ${since}
      group by purpose order by sum(cost_usd) desc nulls last`,
    sql<{ model: string; calls: number; usd: string }[]>`
      select model, count(*)::int as calls, coalesce(sum(cost_usd), 0) as usd
      from llm_calls where created_at > ${since}
      group by model order by sum(cost_usd) desc nulls last`,
    sql<{ user_id: string; email: string | null; name: string | null; calls: number; usd: string }[]>`
      select c.user_id, u.email, p.display_name as name, count(*)::int as calls, coalesce(sum(c.cost_usd), 0) as usd
      from llm_calls c
      left join auth.users u on u.id = c.user_id
      left join user_profiles p on p.user_id = c.user_id
      where c.created_at > ${since} and c.user_id is not null
      group by c.user_id, u.email, p.display_name
      order by sum(c.cost_usd) desc nulls last
      limit 10`,
  ]);

  const totalUsd = num(cost[0]?.usd);
  const activeInRange = active[0]?.in_range ?? 0;

  return {
    days,
    users: {
      total: users[0]?.total ?? 0,
      anonymous: users[0]?.anonymous ?? 0,
      newInRange: users[0]?.new_in_range ?? 0,
      activeToday: active[0]?.today ?? 0,
      activeInRange,
      pro: pro[0]?.n ?? 0,
    },
    sessions: {
      lessonInRange: sess[0]?.lesson ?? 0,
      roleplayInRange: sess[0]?.roleplay ?? 0,
      completedLessonsInRange: sess[0]?.completed ?? 0,
    },
    cost: {
      totalUsd,
      perActiveUserUsd: activeInRange > 0 ? totalUsd / activeInRange : null,
      byDay: byDay.map((r) => ({ date: r.date, usd: num(r.usd), calls: r.calls })),
      byPurpose: byPurpose.map((r) => ({ purpose: r.purpose, calls: r.calls, usd: num(r.usd) })),
      byModel: byModel.map((r) => ({ model: r.model, calls: r.calls, usd: num(r.usd) })),
      topUsers: topUsers.map((r) => ({ userId: r.user_id, email: r.email, name: r.name, calls: r.calls, usd: num(r.usd) })),
    },
    generatedAt: new Date().toISOString(),
  };
}
