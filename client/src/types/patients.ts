export type RiskLevel = "HIGH" | "MID" | "LOW";

export type PatientEventCounts = {
  VT?: number;
  AF?: number;
  Pause?: number;
  PVC?: number;
};

export type PatientSessionLite = {
  date?: string;          // 예: "2025-02-10"
  duration_text?: string; // 예: "24h 10m"
};

export type Patient = {
  _id: string;
  hospital_id: string;
  chart_no: string;
  name: string;
  birth_date: string;
  gender: string;
  created_at: string;

  age?: number;

  // ✅ 추가 (optional)
  risk_level?: RiskLevel;
  counts?: PatientEventCounts;
  session?: PatientSessionLite;
  review_pending?: boolean;
};