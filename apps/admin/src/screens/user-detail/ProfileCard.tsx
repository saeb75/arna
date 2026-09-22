import type { AdminUser, AdminUserDetail } from "@glotmate/contracts";
import { TRACK_LABEL, TUTOR_LANGUAGE_LABEL, languageName } from "@/lib/labels";

/** Onboarding profili — salt okunur (kullanıcı kendi ayarlarından değiştirir). */
export function ProfileCard({ user, profile }: { user: AdminUser; profile: AdminUserDetail["profile"] }) {
  if (!user.hasProfile || !profile) {
    return (
      <section className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
        <h2 className="text-sm font-semibold">Profile</h2>
        <p className="mt-2 text-sm text-muted-foreground">This account has not completed onboarding yet.</p>
      </section>
    );
  }
  const rows: [string, string][] = [
    ["Native language", user.nativeLanguage ? `${languageName(user.nativeLanguage)} (${user.nativeLanguage})` : "—"],
    ["Level", user.cefrLevel ?? "—"],
    ["Context", TRACK_LABEL[user.track ?? ""] ?? user.track ?? "—"],
    ["Tutor language", TUTOR_LANGUAGE_LABEL[user.tutorLanguage ?? ""] ?? user.tutorLanguage ?? "—"],
    ["Daily goal", `${profile.dailyGoalMinutes} min`],
    ["Occupation", profile.occupation ?? "—"],
  ];
  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <h2 className="text-sm font-semibold">Profile</h2>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted-foreground">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
        <dt className="text-muted-foreground">Interests</dt>
        <dd className="flex flex-wrap gap-1">
          {profile.interests.length ? (
            profile.interests.map((i) => (
              <code key={i} className="rounded bg-muted px-1.5 py-0.5 text-[11px]">{i}</code>
            ))
          ) : (
            "—"
          )}
        </dd>
      </dl>
    </section>
  );
}
