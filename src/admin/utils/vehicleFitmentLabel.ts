import type { VehicleDto } from "@/lib/api/types";

export function vehicleFitmentLabel(v: VehicleDto): string {
  const mid = [v.series, v.specifics].filter(Boolean).join(" ");
  return `${v.brand} ${mid} (${v.chassisCode}) — ${v.yearRange}`;
}
