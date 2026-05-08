"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminShopSettings,
  patchAdminShopSettings,
  type AdminShopSettings,
} from "@/lib/api/services/adminSettings";
import { isApiError } from "@/lib/api/errors";
import { Button, FieldError, Input, Label } from "@/shared/ui";
import clsx from "clsx";

const SECTION =
  "rounded-lg border border-secondary/20 bg-white p-3 shadow-sm ring-1 ring-primary/[0.05] sm:p-3.5";
const INPUT = "h-9 min-h-9 py-1.5 text-xs leading-snug";
const NO_SPINNER =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

function stockAlertsOrdered(f: number | null, m: number | null, s: number | null): boolean {
  if (f != null && m != null && f > m) return false;
  if (m != null && s != null && m > s) return false;
  if (f != null && s != null && f > s) return false;
  return true;
}

function parseOptionalInt(raw: string): number | null | "invalid" {
  const t = raw.trim();
  if (!t) return null;
  const n = Number.parseInt(t, 10);
  if (!Number.isFinite(n) || n < 0) return "invalid";
  return n;
}

function optionalIntToInput(v: number | null): string {
  return v == null ? "" : String(v);
}

export function SettingsView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const [waPhone, setWaPhone] = useState("");
  const [waGreetEn, setWaGreetEn] = useState("");
  const [waGreetAr, setWaGreetAr] = useState("");
  const [defFast, setDefFast] = useState("");
  const [defMed, setDefMed] = useState("");
  const [defSlow, setDefSlow] = useState("");
  const [lowSlow, setLowSlow] = useState("");
  const [lowMed, setLowMed] = useState("");
  const [lowFast, setLowFast] = useState("");

  const applySettings = useCallback((s: AdminShopSettings) => {
    setWaPhone(s.whatsappBusinessPhoneDigits ?? "");
    setWaGreetEn(s.whatsappGreetingNameEn ?? "");
    setWaGreetAr(s.whatsappGreetingNameAr ?? "");
    setDefFast(optionalIntToInput(s.defaultStockAlertFast));
    setDefMed(optionalIntToInput(s.defaultStockAlertMedium));
    setDefSlow(optionalIntToInput(s.defaultStockAlertSlow));
    setLowSlow(String(s.lowStockSlowAtOrBelow));
    setLowMed(String(s.lowStockMediumBelow));
    setLowFast(String(s.lowStockFastBelow));
    setUpdatedAt(s.updatedAt);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoadError(null);
      try {
        const s = await fetchAdminShopSettings();
        if (!cancelled) applySettings(s);
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            isApiError(e) ? e.message : e instanceof Error ? e.message : "Could not load settings",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applySettings]);

  const handleSave = useCallback(async () => {
    setError(null);
    const tFast = parseOptionalInt(defFast);
    const tMed = parseOptionalInt(defMed);
    const tSlow = parseOptionalInt(defSlow);
    if (tFast === "invalid" || tMed === "invalid" || tSlow === "invalid") {
      setError("Default stock alerts must be non-negative integers or empty.");
      return;
    }
    if (!stockAlertsOrdered(tFast, tMed, tSlow)) {
      setError("Default stock alerts must satisfy fast ≤ medium ≤ slow when set.");
      return;
    }
    const ls = Number.parseInt(lowSlow.trim(), 10);
    const lm = Number.parseInt(lowMed.trim(), 10);
    const lf = Number.parseInt(lowFast.trim(), 10);
    if (!Number.isFinite(ls) || !Number.isFinite(lm) || !Number.isFinite(lf)) {
      setError("Low-stock cutoffs must be valid integers.");
      return;
    }
    if (ls < 0 || lm < 0 || lf < 0) {
      setError("Low-stock cutoffs must be non-negative.");
      return;
    }
    if (ls >= lm || lm >= lf) {
      setError("Low-stock cutoffs must satisfy slow < medium < fast.");
      return;
    }

    const phoneTrim = waPhone.trim();
    setSaving(true);
    try {
      const next = await patchAdminShopSettings({
        whatsappBusinessPhone: phoneTrim === "" ? null : phoneTrim,
        whatsappGreetingNameEn: waGreetEn.trim() === "" ? null : waGreetEn.trim(),
        whatsappGreetingNameAr: waGreetAr.trim() === "" ? null : waGreetAr.trim(),
        defaultStockAlertFast: tFast,
        defaultStockAlertMedium: tMed,
        defaultStockAlertSlow: tSlow,
        lowStockSlowAtOrBelow: ls,
        lowStockMediumBelow: lm,
        lowStockFastBelow: lf,
      });
      applySettings(next);
    } catch (e) {
      setError(isApiError(e) ? e.message : e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [
    applySettings,
    defFast,
    defMed,
    defSlow,
    lowFast,
    lowMed,
    lowSlow,
    waGreetAr,
    waGreetEn,
    waPhone,
  ]);

  if (loading) {
    return <p className="text-sm text-secondary">Loading settings…</p>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-primary">Settings</h1>
        <p className="mt-1 max-w-2xl text-sm text-secondary">
          WhatsApp checkout defaults and stock alert behavior for new products and the low-stock
          list.
        </p>
        {updatedAt ? (
          <p className="mt-2 text-xs text-secondary">Last saved {new Date(updatedAt).toLocaleString()}</p>
        ) : null}
      </header>

      {loadError ? <FieldError>{loadError}</FieldError> : null}
      {error ? <FieldError>{error}</FieldError> : null}

      <section className={SECTION}>
        <h2 className="text-[0.7rem] font-bold uppercase tracking-wide text-primary">
          WhatsApp checkout
        </h2>
        <p className="mt-1 text-[0.65rem] leading-snug text-secondary">
          Phone is stored as digits only. Leave empty to use{" "}
          <code className="rounded bg-secondary/15 px-1">WHATSAPP_BUSINESS_PHONE</code> from the
          server environment. Greetings fall back to{" "}
          <code className="rounded bg-secondary/15 px-1">WHATSAPP_GREETING_NAME_*</code> when blank.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div>
            <Label className="text-[0.6rem] font-semibold uppercase tracking-wide text-primary">
              Business phone
            </Label>
            <Input
              value={waPhone}
              onChange={(e) => setWaPhone(e.target.value)}
              placeholder="962791234567"
              className={clsx("mt-1", INPUT)}
              autoComplete="off"
            />
          </div>
          <div className="sm:col-span-2 grid gap-2 sm:grid-cols-2">
            <div>
              <Label className="text-[0.6rem] font-semibold uppercase tracking-wide text-primary">
                Greeting name (EN)
              </Label>
              <Input
                value={waGreetEn}
                onChange={(e) => setWaGreetEn(e.target.value)}
                placeholder="there"
                className={clsx("mt-1", INPUT)}
                autoComplete="off"
              />
            </div>
            <div>
              <Label className="text-[0.6rem] font-semibold uppercase tracking-wide text-primary">
                Greeting name (AR)
              </Label>
              <Input
                value={waGreetAr}
                onChange={(e) => setWaGreetAr(e.target.value)}
                placeholder="فريق خدمة العملاء"
                dir="rtl"
                className={clsx("mt-1", INPUT)}
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      </section>

      <section className={SECTION}>
        <h2 className="text-[0.7rem] font-bold uppercase tracking-wide text-primary">
          New product defaults
        </h2>
        <p className="mt-1 text-[0.65rem] leading-snug text-secondary">
          When creating a product without per-tier stock alerts, these values apply. Leave blank for
          no default. Fast ≤ medium ≤ slow.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {(
            [
              ["Fast", defFast, setDefFast] as const,
              ["Medium", defMed, setDefMed] as const,
              ["Slow", defSlow, setDefSlow] as const,
            ] as const
          ).map(([label, val, setVal]) => (
            <div key={label}>
              <Label className="text-[0.6rem] font-semibold uppercase tracking-wide text-primary whitespace-nowrap">
                {label}
              </Label>
              <Input
                type="number"
                min={0}
                step={1}
                value={val}
                onChange={(e) => setVal(e.target.value)}
                className={clsx("mt-1", INPUT, NO_SPINNER)}
                inputMode="numeric"
              />
            </div>
          ))}
        </div>
      </section>

      <section className={SECTION}>
        <h2 className="text-[0.7rem] font-bold uppercase tracking-wide text-primary">
          Low-stock dashboard rules
        </h2>
        <p className="mt-1 text-[0.65rem] leading-snug text-secondary">
          Movement <strong className="text-foreground">slow</strong>: listed when stock is at or
          below the first value. <strong className="text-foreground">Medium</strong> and{" "}
          <strong className="text-foreground">fast</strong>: listed when stock is{" "}
          <em>strictly below</em> their cutoffs. Require slow &lt; medium &lt; fast.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {(
            [
              ["Slow at or below", lowSlow, setLowSlow] as const,
              ["Medium below", lowMed, setLowMed] as const,
              ["Fast below", lowFast, setLowFast] as const,
            ] as const
          ).map(([label, val, setVal]) => (
            <div key={label}>
              <Label className="text-[0.6rem] font-semibold uppercase tracking-wide text-primary whitespace-nowrap">
                {label}
              </Label>
              <Input
                type="number"
                min={0}
                step={1}
                value={val}
                onChange={(e) => setVal(e.target.value)}
                className={clsx("mt-1", INPUT, NO_SPINNER)}
                inputMode="numeric"
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={saving}
          onClick={() => void handleSave()}
        >
          Save settings
        </Button>
      </div>
    </div>
  );
}
