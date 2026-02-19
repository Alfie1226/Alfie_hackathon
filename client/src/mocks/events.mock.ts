  import type { Event } from "../types/events";

  export const EVENTS: Event[] = [
    {
      _id: "EVT_002",
      session_id: "SES_001",
      patient_id: "PT_001",
      hospital_id: "HOSP_001",

      event_type_id: "ET_AF",

      start_at: "2026-02-10T16:10:00+09:00",
      end_at: "2026-02-10T16:12:30+09:00",
      start_sec: 25200,
      end_sec: 25350,
      duration_sec: 150,

      risk_level: "mid",
      priority_score: 0.75,

      metrics: {
        avg_hr: 112,
      },

      description: "AF episode 2분 30초",
      risk_reason: "불규칙 RR 간격, 평균 HR 112",

      waveform_ref: {
        kind: "file_window",
        file_path: "/waveforms/af_001.json",
        start_sample: 5040000,
        end_sample: 5070000,
      },

      confirm_status: "UNCONFIRMED",
      created_at: "2026-02-10T16:13:00Z",
    },

    {
      _id: "EVT_003",
      session_id: "SES_001",
      patient_id: "PT_001",
      hospital_id: "HOSP_001",

      event_type_id: "ET_PVC",

      start_at: "2026-02-10T18:45:12+09:00",
      end_at: "2026-02-10T18:45:13+09:00",
      start_sec: 31512,
      end_sec: 31513,
      duration_sec: 1,

      risk_level: "low",
      priority_score: 0.40,

      metrics: {
        beats: 1,
      },

      description: "단일 PVC",
      risk_reason: "조기 심실수축",

      waveform_ref: {
        kind: "file_window",
        file_path: "/waveforms/pvc_001.json",
        start_sample: 6302400,
        end_sample: 6302600,
      },

      confirm_status: "UNCONFIRMED",
      created_at: "2026-02-10T18:45:14Z",
    },

    {
      _id: "EVT_004",
      session_id: "SES_001",
      patient_id: "PT_001",
      hospital_id: "HOSP_001",

      event_type_id: "ET_PAUSE",

      start_at: "2026-02-10T22:05:00+09:00",
      end_at: "2026-02-10T22:05:04+09:00",
      start_sec: 39900,
      end_sec: 39904,
      duration_sec: 4,

      risk_level: "high",
      priority_score: 0.88,

      metrics: {},

      description: "4초 간 심정지 의심",
      risk_reason: "R-R interval 4초 이상",

      waveform_ref: {
        kind: "file_window",
        file_path: "/waveforms/pause_001.json",
        start_sample: 7980000,
        end_sample: 7980800,
      },

      confirm_status: "UNCONFIRMED",
      created_at: "2026-02-10T22:05:05Z",
    },
  ];