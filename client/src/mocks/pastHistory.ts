export type RiskLevel = "HIGH" | "MID" | "LOW";
export type EventType = "VT" | "AF" | "PVC" | "Pause";

export type PastExamRecord = {
  id: string;
  patient_id: string;
  display_text: string; // 드롭다운 표시
  total_events: number;
  high_risk_events: number;

  rhythm_counts: Partial<Record<EventType, number>>;

  time_distribution: Array<{ label: string; count: number }>;

  risk_distribution: { HIGH: number; MID: number; LOW: number };

  top_events: Array<{
    type: EventType;
    risk: RiskLevel;
    time_range: string;
    description: string;
    count: number;
  }>;

  ai_compare_bullets: string[];
};

export const PAST_HISTORY: PastExamRecord[] = [
  {
    id: "HX_001",
    patient_id: "PT_001",
    display_text: "2025-11-03 (24h Patch ECG)",
    total_events: 45,
    high_risk_events: 5,
    rhythm_counts: { VT: 12, AF: 8, PVC: 25 },
    time_distribution: [
      { label: "00:00-06:00", count: 8 },
      { label: "06:00-12:00", count: 12 },
      { label: "12:00-18:00", count: 9 },
      { label: "18:00-24:00", count: 16 },
    ],
    risk_distribution: { HIGH: 12, MID: 16, LOW: 17 },
    top_events: [
      {
        type: "VT",
        risk: "HIGH",
        time_range: "14:23 - 14:45",
        description: "비지속성 VT, 평균 6박동, 최대 심박수 168 bpm",
        count: 12,
      },
      {
        type: "AF",
        risk: "MID",
        time_range: "09:15 - 10:32",
        description: "발작성 AF, 총 지속시간 77분, 심실 반응 110-145 bpm",
        count: 8,
      },
      {
        type: "PVC",
        risk: "LOW",
        time_range: "18:40 - 19:20",
        description: "PVC 군집, 이단맥 패턴 반복, 단형성",
        count: 25,
      },
    ],
    ai_compare_bullets: [
      "이번 검사에서 PVC 빈도가 이전 검사(2025-10-12) 대비 89% 증가했습니다.",
      "위험 이벤트는 주로 야간 시간대(00:00-06:00, 18:00-24:00)에 집중되어 있습니다.",
      "VT 패턴이 이전 기록 대비 단형성에서 일부 다형성 특징으로 변화하는 경향을 보입니다.",
      "* 이 분석은 맥락 파악을 위한 보조 정보이며, 최종 판독은 의료진의 검토가 필요합니다.",
    ],
  },
  {
    id: "HX_002",
    patient_id: "PT_001",
    display_text: "2025-10-12 (Holter 24h)",
    total_events: 24,
    high_risk_events: 2,
    rhythm_counts: { VT: 6, AF: 3, PVC: 15 },
    time_distribution: [
      { label: "00:00-06:00", count: 3 },
      { label: "06:00-12:00", count: 6 },
      { label: "12:00-18:00", count: 5 },
      { label: "18:00-24:00", count: 10 },
    ],
    risk_distribution: { HIGH: 6, MID: 7, LOW: 11 },
    top_events: [
      { type: "VT", risk: "HIGH", time_range: "22:10 - 22:20", description: "비지속성 VT, 단형성", count: 6 },
      { type: "AF", risk: "MID", time_range: "11:05 - 11:20", description: "AF, 짧은 에피소드", count: 3 },
      { type: "PVC", risk: "LOW", time_range: "18:10 - 18:50", description: "PVC 산발/군집 혼재", count: 15 },
    ],
    ai_compare_bullets: [
      "이번 기록은 PVC가 주로 저녁 시간대에 집중되었습니다.",
      "VT는 단형성 패턴이 주로 관찰됩니다.",
      "* 참고용입니다.",
    ],
  },
];