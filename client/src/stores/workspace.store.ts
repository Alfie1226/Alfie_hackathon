import { defineStore } from "pinia";

import { PATIENTS } from "../mocks/patients.mock";
import { ECG_SESSIONS } from "../mocks/ecg_sessions.mock";
import { EVENTS } from "../mocks/events.mock";
import { EVENT_TYPES } from "../mocks/event_types.mock";
import { ANALYSIS_SUMMARIES } from "../mocks/analysis_summary.mock";

import type { Patient } from "../types/patients";
import type { EcgSession } from "../types/ecg_sessions";
import type { Event } from "../types/events";
import type { EventType } from "../types/event_types";
import type { AnalysisSummary } from "../types/analysis_summary";

type Mode = "READING" | "DIAGNOSIS";
export type ViewMode = "ANALYSIS" | "REPORT";

export type ReportInput = {
  indication: string;
  symptoms: string;
  history: string;
};

export type ReportSet = {
  report_id: string;
  input: ReportInput;
  draft_ko: string;
  draft_en: string;
  updated_at: string;
};

/** ✅ 추가: 검토 상태를 프론트에서만 임시로 붙이기 위한 확장 타입 */
export type PatientWithReview = Patient & {
  reviewed?: boolean; // true면 검토 제출 완료
};

/** ✅ 추가: 임상기록 임시저장/제출 payload 타입(패널에서 보내는 값 그대로) */
export type ClinicalReviewPayload = {
  patientId?: string;
  eventId?: string;
  noteText: string;
  checks: Record<string, boolean>;
};

function makeId() {
  return `RPT_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}
function nowIso() {
  return new Date().toISOString();
}
function safeUpper(v: unknown) {
  return String(v ?? "").toUpperCase();
}

/** ✅ (API 없이) 한글 입력을 영문으로 “데모용 고정 변환” */
function toEnglishOrKeep(text: string, kind: "indication" | "symptoms" | "history") {
  const t = (text ?? "").trim();
  if (!t) return "—";

  const map: Record<string, string> = {
    // indication
    "심계항진 및 실신 에피소드 평가": "Evaluation of palpitations and syncope episodes.",

    // symptoms
    "환자는 빈번한 빠른 심장박동 에피소드, 간헐적 어지러움, 3일 전 짧은 의식 소실 1회를 보고함.":
      "The patient reports frequent episodes of rapid palpitations, intermittent dizziness, and one brief loss of consciousness 3 days ago.",

    // history
    "고혈압(잘 조절됨), 알러지/구조적 심장 질환 없음. 가족력 있음(부친, 62세).":
      "Hypertension (well controlled). No known allergy/structural heart disease. Positive family history (father, age 62).",
  };

  if (map[t]) return map[t];
  return t;
}

function buildKoDraft(input: ReportInput, ctx: any) {
  const name = ctx?.patient?.name ?? "환자";
  const period = ctx?.periodText ?? "24시간";
  const vt = ctx?.vtCount ?? 0;
  const af = ctx?.afCount ?? 0;
  const pause = ctx?.pauseCount ?? 0;

  return `24시간 홀터 모니터 판독 리포트

환자: ${name}
기록 기간: ${period}

임상 적응증:
- ${input.indication || "-"}

환자 보고 증상:
- ${input.symptoms || "-"}

관련 병력:
- ${input.history || "-"}

홀터 검사 소견(요약):
- 비지속성 심실빈맥(NSVT) 의심 이벤트: ${vt}회
- 발작성 심방세동(AF) 이벤트: ${af}회
- 정지(Pause) 이벤트: ${pause}회

임상 해석:
- 유의한 부정맥 부담이 감지되었습니다. 증상과의 상관관계 평가 및 추가 평가가 권고됩니다.

권고사항:
1. 순환기내과 협진 고려
2. 심초음파 등 구조적 심장질환 평가
3. 추적 홀터 모니터링 고려
`;
}

function buildEnDraft(input: ReportInput, ctx: any) {
  const name = ctx?.patient?.name ?? "Patient";
  const pid = ctx?.patient?.chart_no ?? ctx?.patient?._id ?? "—";
  const period = ctx?.periodText ?? "24h";
  const vt = ctx?.vtCount ?? 0;
  const af = ctx?.afCount ?? 0;
  const pause = ctx?.pauseCount ?? 0;

  const enIndication = toEnglishOrKeep(input.indication, "indication");
  const enSymptoms = toEnglishOrKeep(input.symptoms, "symptoms");
  const enHistory = toEnglishOrKeep(input.history, "history");

  return `24-HOUR HOLTER MONITOR INTERPRETATION

PATIENT INFORMATION
Name: ${name}
Patient ID: ${pid}
Recording Period: ${period}

CLINICAL INDICATION
${enIndication}

REPORTED SYMPTOMS
${enSymptoms}

RELEVANT HISTORY
${enHistory}

FINDINGS
Rhythm: Predominantly sinus rhythm
Ventricular Ectopy: ${vt} episodes of non-sustained VT (NSVT) suspected
Atrial Fibrillation: ${af} episodes (paroxysmal)
Pauses: ${pause} episodes

INTERPRETATION
Frequent arrhythmic events are suspected. Clinical correlation is recommended.

RECOMMENDATIONS
1. Cardiology consultation for arrhythmia management
2. Consider echocardiography to assess structural heart disease
3. Follow-up Holter monitoring as clinically indicated
`;
}

export const useWorkspaceStore = defineStore("workspace", {
  state: () => ({
    mode: "READING" as Mode,

    /** ✅ 화면 전환용 */
    viewMode: "ANALYSIS" as ViewMode,

    selectedPatientId: "PT_001" as string,
    selectedEventId: "EVT_001" as string,

    /** ✅ 수정: patients에 reviewed 기본값 보장 */
    patients: (PATIENTS as Patient[]).map((p: any) => ({
      ...p,
      reviewed: p.reviewed ?? false,
    })) as PatientWithReview[],

    sessions: ECG_SESSIONS as EcgSession[],
    events: EVENTS as Event[],
    eventTypes: EVENT_TYPES as EventType[],
    summaries: ANALYSIS_SUMMARIES as AnalysisSummary[],

    /** ✅ 리포트 입력 */
    reportInput: {
      indication: "심계항진 및 실신 에피소드 평가",
      symptoms:
        "환자는 빈번한 빠른 심장박동 에피소드, 간헐적 어지러움, 3일 전 짧은 의식 소실 1회를 보고함.",
      history:
        "고혈압(잘 조절됨), 알러지/구조적 심장 질환 없음. 가족력 있음(부친, 62세).",
    } as ReportInput,

    /** ✅ 생성된 리포트 */
    reportSet: null as ReportSet | null,

    /** ✅ 추가: 임상기록 임시저장/제출 데이터(데모용 저장소) */
    clinicalNotesByPatient: {} as Record<
      string,
      { noteText: string; checks: Record<string, boolean>; updated_at: string; submitted?: boolean }
    >,
  }),

  getters: {
    selectedPatient(state): PatientWithReview | undefined {
      return state.patients.find((p) => p._id === state.selectedPatientId);
    },

    currentSession(state): EcgSession | undefined {
      return state.sessions.find((s) => s.patient_id === state.selectedPatientId);
    },

    currentEvents(state): Event[] {
      const session = (this as any).currentSession as EcgSession | undefined;
      if (!session) return [];
      return state.events
        .filter((e) => e.session_id === session._id)
        .sort((a, b) => b.priority_score - a.priority_score);
    },

    selectedEvent(): Event | undefined {
      return (this as any).currentEvents.find((e: Event) => e._id === this.selectedEventId);
    },

    currentSummary(state): AnalysisSummary | undefined {
      const session = (this as any).currentSession as EcgSession | undefined;
      if (!session) return undefined;
      return state.summaries.find((s) => s.session_id === session._id);
    },

    eventTypeMap(state): Record<string, EventType> {
      return state.eventTypes.reduce((acc, t) => {
        acc[t._id] = t;
        return acc;
      }, {} as Record<string, EventType>);
    },
  },

  actions: {
    /** ✅ (중요) 리포트 화면 진입 */
    openReportBuilder() {
      this.mode = "DIAGNOSIS";
      this.viewMode = "REPORT";
      this.generateReportDraft();
    },

    /** ✅ (중요) 분석 화면 복귀 */
    closeReportBuilder() {
      this.mode = "READING";
      this.viewMode = "ANALYSIS";
    },

    selectPatient(patientId: string) {
      this.selectedPatientId = patientId;
      const firstEvent = this.currentEvents[0];
      this.selectedEventId = firstEvent ? firstEvent._id : "";
    },

    selectEvent(eventId: string) {
      this.selectedEventId = eventId;
    },

    generateReportDraft() {
  const events = this.currentEvents ?? [];

  const afCount = events.filter((e: any) => safeUpper(e.event_type_id).includes("AF")).length;
  const pauseCount = events.filter((e: any) => safeUpper(e.event_type_id).includes("PAUSE")).length;

  const ctx = {
    patient: this.selectedPatient,
    periodText: "2025-02-10 08:40 - 2025-02-11 08:50 (24h 10m)",
    afCount,
    pauseCount,
  };

  const input = this.reportInput;

  this.reportSet = {
    report_id: this.reportSet?.report_id ?? makeId(),
    input: { ...input },
    draft_ko: buildKoDraft(input, ctx),
    draft_en: buildEnDraft(input, ctx),
    updated_at: nowIso(),
  };
},


    regenerateReportDraft() {
      if (!this.reportSet) return this.generateReportDraft();
      const keepId = this.reportSet.report_id;
      this.generateReportDraft();
      if (this.reportSet) this.reportSet.report_id = keepId;
    },

    // ===========================
    // ✅ 여기부터 "검토 제출" 기능 추가
    // ===========================

    /** ✅ reviewed=true로 변경 (검토대기에서 빠지게) */
    markReviewed(patientId: string) {
      const target = this.patients.find((p) => p._id === patientId);
      if (!target) return;
      target.reviewed = true;
    },

    /** ✅ ClinicalRecordPanel.vue에서 쓰는 임시저장 함수 (없어서 콘솔만 찍던 부분 해결) */
    tempSaveClinicalRecord(payload: ClinicalReviewPayload) {
      const pid = payload.patientId || this.selectedPatientId;
      if (!pid) return;

      this.clinicalNotesByPatient[pid] = {
        noteText: payload.noteText ?? "",
        checks: payload.checks ?? {},
        updated_at: nowIso(),
        submitted: false,
      };
    },

    /**
     * ✅ ClinicalRecordPanel.vue에서 쓰는 "검토 제출" 함수
     * - 임시 저장 + submitted 처리 + reviewed=true 처리까지 한번에
     */
    submitClinicalReview(payload: ClinicalReviewPayload) {
      const pid = payload.patientId || this.selectedPatientId;
      if (!pid) return;

      this.clinicalNotesByPatient[pid] = {
        noteText: payload.noteText ?? "",
        checks: payload.checks ?? {},
        updated_at: nowIso(),
        submitted: true,
      };

      // ✅ 핵심: 검토 제출 시 reviewed=true
      this.markReviewed(pid);

      // ✅ 나중에 API 붙일 자리
      // await api.post("/clinical-reviews/submit", { ...payload, sessionId: this.currentSession?._id })
    },

    /** (선택) 버튼에서 그냥 쓰고 싶으면: store.submitReview() */
    submitReview() {
      const pid = this.selectedPatientId;
      if (!pid) return;
      this.markReviewed(pid);
    },

    /** ✅ 제출 완료 → 다시 수정 가능하게(제출 취소) */
    reopenClinicalReview(patientId: string) {
      // 1) reviewed 상태 되돌리기
      const target = this.patients.find((p) => p._id === patientId);
      if (target) target.reviewed = false;

      // 2) 임상기록 저장소도 submitted=false로 되돌리기(선택이지만 권장)
      const saved = this.clinicalNotesByPatient[patientId];
      if (saved) {
        this.clinicalNotesByPatient[patientId] = {
          ...saved,
          submitted: false,
          updated_at: nowIso(),
        };
      }
    },
  },
});