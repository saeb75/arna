import { BrandMark } from "@/components/shared/BrandMark";

/** Oturum okunurken görünen boş sahne — içerik değil, sakin bir marka nefesi */
export function SplashScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <BrandMark className="animate-pulse" />
    </div>
  );
}
