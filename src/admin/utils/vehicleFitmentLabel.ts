import type { VehicleDto } from "@/lib/api/types";

export function vehicleFitmentLabel(v: VehicleDto): string {
  const mid = [v.series, v.specifics].filter(Boolean).join(" ");
  const gen = v.generation?.trim();
  const genPart = gen ? ` ${gen}` : "";
  return `${v.brand} ${mid}${genPart} (${v.chassisCode}) — ${v.yearRange}`;
}
