// ✅ 전체 이벤트 타입(환자카드/과거기록/비교용)
export type EventTypeId =
  | "AF"
  | "PAC"
  | "PVC"
  | "Pause"
  | "Bradycardia"
  | "Tachycardia"
  | "Noise"
  | "Artifact"
  | "Baseline Wander";

// ✅ Morphology(형태학 클러스터) 분석 대상만
export type MorphologyEventTypeId = "AF" | "PAC" | "PVC" | "Pause";

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

  // ✅ 9개 전체 카운트 표시용
  counts: Partial<Record<EventTypeId, number>>;
}

export interface MorphologyCluster {
  cluster_id: string; // "C1" | "C2" | "OUTLIER"
  title: string;
  subtitle: string;
  qrs_ms_mean: number;
  qrs_ms_sd: number;
  confidence_pct: number; // 0~100

  // UI 라벨(표시용)
  label:
    | "LBBB"
    | "RBBB"
    | "다형성"
    | "AF 패턴"
    | "PAC 패턴"
    | "Pause"
    | "PVC"
    | "PAC"
    | "기타";

  wave_points: number[];
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
  // ✅ morphology 분석은 4개만
  event_type_id: MorphologyEventTypeId;
  title_en: string;
  title_ko: string;
  summary: MorphologySummary;
  clusters: MorphologyCluster[];
}

export interface PatientAnalysisBundle {
  patient: PatientSummary;

  // ✅ 핵심: AF/PAC/PVC/Pause 중 "있는 것만" 오면 됨
  analyses: Partial<Record<MorphologyEventTypeId, EventTypeAnalysis>>;
}
