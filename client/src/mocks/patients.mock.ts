import type { Patient } from "../types/patients";

export const PATIENTS: Patient[] = [
  {
    _id: "PT_001",
    hospital_id: "HOSP_001",
    chart_no: "F71958-01-01",
    name: "이영희",
    birth_date: "1957-03-12",
    gender: "female",
    created_at: "2026-02-10T00:00:00Z",

    // ✅ 아래부터 추가(WorkspaceView에서 사용)
    age: 65,
    risk_level: "HIGH",
    session: {
      date: "2025-02-10",
      duration_text: "24h 10m",
    },
    counts: {
      AF: 3,
      PVC: 0,
      Pause: 0,
    },
    review_pending: true,
  },
  {
    _id: "PT_002",
    hospital_id: "HOSP_001",
    chart_no: "M71957-11-10",
    name: "김대호",
    birth_date: "1957-11-10",
    gender: "male",
    created_at: "2026-02-10T00:00:00Z",

    age: 68,
    risk_level: "MID",
    session: {
      date: "2025-02-10",
      duration_text: "24h 00m",
    },
    counts: {
      VT: 0,
      AF: 0,
      PVC: 234,
      Pause: 2,
    },
    review_pending: true,
  },
  {
    _id: "PT_003",
    hospital_id: "HOSP_001",
    chart_no: "F71952-08-20",
    name: "최순자",
    birth_date: "1952-08-20",
    gender: "female",
    created_at: "2026-02-10T00:00:00Z",

    age: 73,
    risk_level: "LOW",
    session: {
      date: "2025-02-10",
      duration_text: "24h 00m",
    },
    counts: {
      VT: 0,
      AF: 0,
      PVC: 12,
      Pause: 0,
    },
    review_pending: false,
  },
];