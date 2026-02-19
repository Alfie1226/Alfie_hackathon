import type { RiskLevel } from "./event_types";

export interface AnalysisMetrics {
  avg_hr: number;
  hr_min: number;
  hr_max: number;

  pr_ms: number;
  qrs_ms: number;
  qtc_ms: number;

  af_burden_pct: number; // 0~100
}

export interface HighRiskBanner {
  level: RiskLevel;       // high/mid/low
  title: string;          // "고위험 임상 소견"
  text: string;           // 배너 본문
}

export interface EventCounts {
  AF: number;
  PVC: number;
  PAUSE: number;
}

export interface AnalysisSummary {
  _id: string;

  session_id: string;     // FK -> ecg_sessions._id
  patient_id: string;     // FK -> patients._id
  hospital_id: string;    // FK

  metrics: AnalysisMetrics;

  // ✅ UI 배너 + 카운트
  high_risk_banner?: HighRiskBanner;
  event_counts: EventCounts;

  // ✅ 우측 패널에서 보여줄 요약(더미로 시작)
  summary_text?: string;
  key_findings?: string[];
  recommendations?: string[];
  urgency_level?: RiskLevel;

  // ✅ 판독/진단 모드에서 나중에 쓰임
  final_opinion?: string;       // 최종 판독 소견
  is_reviewed?: boolean;        // 검토 완료 여부
  reviewed_by?: string;         // doctor_id
  reviewed_at?: string;         // ISO

  created_at: string;           // ISO
}