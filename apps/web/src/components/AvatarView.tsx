// Avatar çizicisi seçimi — aktif avatarın SİSTEMİNE göre 3D sahne (AvatarScene)
// ya da 2.5D sprite portre (SpriteAvatar). İkisi aynı sürüş girdilerini alır;
// sayfalar ve embed hangi sistemin çizildiğini bilmez.
"use client";

import dynamic from "next/dynamic";
import type { AvatarActivity } from "@glotmate/contracts";
import SpriteAvatar from "@/components/SpriteAvatar";
import type { AvatarSpec } from "@/lib/avatarProfiles";
import type { Timeline } from "@/lib/viseme";

// three.js paketi yalnız 3D seçiliyse iner
const AvatarScene = dynamic(() => import("@/components/AvatarScene"), { ssr: false });

type Props = {
  spec: AvatarSpec;
  timeline: Timeline | null;
  getTime: () => number | null;
  getLevel: () => number | null;
  /** 3D: ders açılışında bir kez el sallama (2.5D'de yok) */
  greet?: boolean;
  /** 2.5D: bütün katmanlar indiğinde (3D kendi yükleme yöneticisinden bildirir) */
  onSpriteReady?: () => void;
  /** 2.5D: dinliyor/düşünüyor duruşu (3D sahne henüz kullanmıyor) */
  getActivity?: () => AvatarActivity;
};

export default function AvatarView({ spec, timeline, getTime, getLevel, greet, onSpriteReady, getActivity }: Props) {
  if (spec.system === "2.5d") {
    return (
      <SpriteAvatar
        key={spec.rig.id}
        rig={spec.rig}
        timeline={timeline}
        getTime={getTime}
        getLevel={getLevel}
        onReady={onSpriteReady}
        getActivity={getActivity}
      />
    );
  }
  return <AvatarScene profile={spec.profile} timeline={timeline} getTime={getTime} getLevel={getLevel} greet={greet} />;
}
