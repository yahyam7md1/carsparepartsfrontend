import clsx from "clsx";

export type LabeledSwitchProps = Readonly<{
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  activeLabel?: string;
  inactiveLabel?: string;
  disabled?: boolean;
  /** Passed to the switch button for a11y */
  "aria-labelledby"?: string;
  id?: string;
}>;

const TRACK =
  "relative inline-flex h-[18px] w-[34px] shrink-0 cursor-pointer items-center rounded-full p-[3px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50";
const THUMB =
  "pointer-events-none block size-[12px] rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-out";

/** Compact pill switch with status dot + label, vertically aligned. */
export function LabeledSwitch({
  checked,
  onCheckedChange,
  activeLabel = "Active",
  inactiveLabel = "Hidden",
  disabled = false,
  "aria-labelledby": ariaLabelledby,
  id,
}: LabeledSwitchProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={ariaLabelledby}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={clsx(
          TRACK,
          checked ? "bg-emerald-500" : "bg-secondary/25",
        )}
      >
        <span
          className={clsx(
            THUMB,
            checked ? "translate-x-4" : "translate-x-0",
          )}
          aria-hidden
        />
      </button>
      <span className="inline-flex items-center gap-1.5 text-xs leading-none text-foreground">
        <span
          className={clsx(
            "size-1.5 shrink-0 rounded-full",
            checked ? "bg-emerald-500" : "bg-secondary/55",
          )}
          aria-hidden
        />
        <span className="font-normal">{checked ? activeLabel : inactiveLabel}</span>
      </span>
    </div>
  );
}
