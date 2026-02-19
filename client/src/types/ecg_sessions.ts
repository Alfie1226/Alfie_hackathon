export type EcgSessionStatus = "CREATED" | "ANALYZED" | "DONE";

export interface EcgSession {
  _id: string;

  patient_id: string;     // FK -> patients._id
  doctor_id: string;      // FK (나중에 연동)
  hospital_id: string;    // FK (필터/권한)

  start_at: string;       // ISO
  end_at: string;         // ISO
  status: EcgSessionStatus;

  sampling_rate: number;  // Hz (예: 200)
  channels: string[];     // 예: ["ECG1"] (더미용으로 최소 1개)

  data_path?: string;     // 원본/가공 데이터 위치(더미에선 optional)
  report_path?: string;   // 리포트 파일 경로(나중)
  final_opinion?: string; // 최종 판독 의견(진단모드에서 활용)

  created_at: string;     // ISO
  updated_at?: string;    // ISO
}