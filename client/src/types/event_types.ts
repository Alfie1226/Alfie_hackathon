export type EventTypeName = "VT" | "AF" | "PVC" | "PAUSE";
export type RiskLevel = "high" | "mid" | "low";

export interface EventType {
  _id: string;

  event_name: EventTypeName;  // VT / AF / PVC / PAUSE
  default_risk: RiskLevel;    // 기본 위험도
  description?: string;       // 설명(선택)

  created_at: string;         // ISO
}