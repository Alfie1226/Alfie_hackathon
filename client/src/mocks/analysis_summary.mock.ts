import type { AnalysisSummary } from "../types/analysis_summary";

export const ANALYSIS_SUMMARIES: AnalysisSummary[] = [
  {
    _id: "SUM_001",

    session_id: "SES_001",
    patient_id: "PT_001",
    hospital_id: "HOSP_001",

    metrics: {
      avg_hr: 72,
      hr_min: 45,
      hr_max: 142,
      pr_ms: 168,
      qrs_ms: 92,
      qtc_ms: 438,
      af_burden_pct: 2.3,
    },

    high_risk_banner: {
      level: "high",
      title: "고위험 임상 소견",
      text: "4초 이상 Pause 1회 및 간헐적 AF 에피소드가 감지되었습니다.",
    },

    event_counts: {
      AF: 1,
      PVC: 1,
      PAUSE: 1,
    },

    summary_text:
      "24시간 Holter 분석 결과, 간헐적 AF 및 4초 이상 Pause가 관찰되었습니다. 추가적인 임상 평가가 권장됩니다.",

    key_findings: [
      "AF episode 2분 30초",
      "4초 이상 Pause 1회",
      "단일 PVC 관찰",
    ],

    recommendations: [
      "심장내과 전문의 상담 권고",
      "추적 Holter 검사 고려",
    ],

    urgency_level: "high",

    final_opinion: "",
    is_reviewed: false,

    created_at: "2026-02-11T00:00:00Z",
  },
];
