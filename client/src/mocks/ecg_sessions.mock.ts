import type { EcgSession } from "../types/ecg_sessions";

export const ECG_SESSIONS: EcgSession[] = [
  {
    _id: "SES_001",
    patient_id: "PT_001",
    doctor_id: "DOC_001",
    hospital_id: "HOSP_001",

    start_at: "2026-02-10T08:40:00+09:00",
    end_at: "2026-02-11T08:50:00+09:00",
    status: "DONE",

    sampling_rate: 200,
    channels: ["ECG1"],

    data_path: "/gridfs/RAW_001",
    report_path: "/reports/SES_001.pdf",
    final_opinion: "",

    created_at: "2026-02-10T00:00:00Z",
    updated_at: "2026-02-11T00:00:00Z",
  },
  {
    _id: "SES_002",
    patient_id: "PT_002",
    doctor_id: "DOC_001",
    hospital_id: "HOSP_001",

    start_at: "2026-02-09T09:10:00+09:00",
    end_at: "2026-02-10T09:20:00+09:00",
    status: "ANALYZED",

    sampling_rate: 200,
    channels: ["ECG1"],

    data_path: "/gridfs/RAW_002",
    report_path: "",
    final_opinion: "",

    created_at: "2026-02-09T00:00:00Z",
    updated_at: "2026-02-10T00:00:00Z",
  },
  {
    _id: "SES_003",
    patient_id: "PT_003",
    doctor_id: "DOC_001",
    hospital_id: "HOSP_001",

    start_at: "2026-02-08T10:30:00+09:00",
    end_at: "2026-02-09T10:40:00+09:00",
    status: "CREATED",

    sampling_rate: 200,
    channels: ["ECG1"],

    data_path: "/gridfs/RAW_003",
    report_path: "",
    final_opinion: "",

    created_at: "2026-02-08T00:00:00Z",
    updated_at: "2026-02-08T00:00:00Z",
  },
];