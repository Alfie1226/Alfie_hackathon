import type { RiskLevel } from "./event_types";

export type EventConfirmStatus = "UNCONFIRMED" | "CONFIRMED" | "REJECTED";

export interface WaveformRef {
  kind: "gridfs_window" | "file_window";
  gridfs_file_id?: string;   // GridFS로 원본 저장 시
  file_path?: string;        // 파일 경로로 저장 시(더미/개발용)

  start_sample: number;
  end_sample: number;
}

export interface Event {
  _id: string;

  session_id: string;        // FK -> ecg_sessions._id
  patient_id: string;        // FK -> patients._id
  hospital_id: string;       // FK

  event_type_id: string;     // FK -> event_types._id (VT/AF/PVC/PAUSE 정의)

  // ✅ 타임라인/리스트용 시간 정보 (recording start 기준)
  start_at: string;          // ISO (정확한 시각)
  end_at: string;            // ISO
  start_sec: number;         // 세션 시작 기준 초
  end_sec: number;           // 세션 시작 기준 초
  duration_sec: number;

  // ✅ UI 색/정렬 우선순위
  risk_level: RiskLevel;     // high/mid/low
  priority_score: number;    // 0~1 (AI 우선순위 정렬용)

  // ✅ 이벤트 요약(리스트 한 줄에 들어갈 정보)
  metrics: {
    avg_hr?: number;
    peak_hr?: number;
    beats?: number;
  };

  description?: string;      // "비지속성 VT, 8박동, 단형성" 같은 텍스트

  // ✅ “파형 보기” 눌렀을 때 참조
  waveform_ref: WaveformRef;

  // ✅ 의사 확인/검토 상태
  confirm_status: EventConfirmStatus;
  confirmed_by?: string;     // doctor_id
  confirmed_at?: string;     // ISO

  // ✅ UI에서 쓸 수 있는 부가 정보(선택)
  thumbnail_image?: string;  // 작은 파형 이미지 URL/경로(더미 가능)
  risk_reason?: string;      // "최대 심박수 168bpm, 지속 8.1초" 등

  created_at: string;        // ISO
  summary_text?: string;     // 이벤트 상세 페이지에서 보여줄 텍스트 요약
}