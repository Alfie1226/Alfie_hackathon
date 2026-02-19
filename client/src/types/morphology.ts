export type EventTypeId =  | "AF" | "PAUSE" | "PVC";

export type RiskBadge = "위험" | "주의" | "정상";

export interface PatientSummary {
  patient_id: string;
  name: string;
  sex: "M" | "F";
  age: number;
  dob: string;
  duration_label: string; // "24h 10m"
  recorded_at: string; // "2025-02-10"
  risk_badge: RiskBadge;
  counts: Partial<Record<EventTypeId, number>>;
}

export interface MorphologyCluster {
  cluster_id: string; // "C1" | "C2" | "OUTLIER"
  title: string; // "클러스터 1 (주요)" ...
  subtitle: string; // "12개 이벤트 · LBBB 형태"
  qrs_ms_mean: number;
  qrs_ms_sd: number;
  confidence_pct: number; // 0~100
  label: "LBBB" | "RBBB" | "다형성" | "AF 패턴" | "PAUSE" | "PVC" | "기타";
  wave_points: number[]; // waveform mock
  ai_description: string;
  is_outlier?: boolean;
}

export interface MorphologySummary {
  total_events: number;
  clusters_detected: number;
  outliers: number;
  morphology_match_pct: number; // 0~100
  ai_overview: string;
}

export interface EventTypeAnalysis {
  event_type_id: EventTypeId;
  title_en: string;
  title_ko: string;
  summary: MorphologySummary;
  clusters: MorphologyCluster[];
}

export interface PatientAnalysisBundle {
  patient: PatientSummary;
  analyses: Record<EventTypeId, EventTypeAnalysis>;
}
