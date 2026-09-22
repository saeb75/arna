"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Yeni dil için BCP-47 kodu (tr, es, pt-br…). Sunucu `normalizeNativeLanguage`
 * ile normalize eder; burada yalnız biçim denetimi. Yerel state — sunum durumu.
 */
export function LanguageInput({
  known,
  disabled,
  onSubmit,
}: {
  known: string[];
  disabled: boolean;
  onSubmit: (language: string) => void;
}) {
  const [value, setValue] = useState("");
  const code = value.trim().toLowerCase();
  const valid = /^[a-z]{2,3}(-[a-z0-9]{2,8})?$/.test(code);
  const exists = known.includes(code);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || exists || disabled) return;
    onSubmit(code);
    setValue("");
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="language code (tr, es, pt-br)"
        className="h-8 w-44 font-mono text-xs"
        disabled={disabled}
        aria-invalid={code.length > 0 && (!valid || exists)}
      />
      <Button type="submit" size="sm" variant="outline" disabled={disabled || !valid || exists}>
        <Plus data-icon="inline-start" />
        Generate pack
      </Button>
    </form>
  );
}
