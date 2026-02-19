<template>
  <aside class="h-full border-l bg-white overflow-y-auto">
    <!-- Header -->
    <div class="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center gap-2">
          <span class="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            📝
          </span>
          <div>
            <div class="text-sm font-semibold text-slate-900">임상 기록</div>
            <div class="text-[11px] text-slate-500">
              선택 이벤트: {{ store.selectedEvent?._id || "-" }}
            </div>
          </div>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 active:scale-[0.99]"
          @click="onGenerateReport"
        >
          <span class="text-sm">✨</span>
          리포트 생성
        </button>
      </div>
    </div>

    <div class="px-4 py-4 space-y-4">
      <!-- 현재 환자 -->
      <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="px-4 pt-4 pb-2">
          <div class="text-xs font-semibold text-slate-600">현재 환자</div>
        </div>

        <div class="px-4 pb-3 space-y-2">
          <div class="grid grid-cols-[80px_1fr] items-center gap-2 text-sm">
            <div class="text-slate-500">이름</div>
            <div class="text-right font-semibold text-slate-900">{{ patientName }}</div>
          </div>

          <div class="grid grid-cols-[80px_1fr] items-center gap-2 text-sm">
            <div class="text-slate-500">나이/성별</div>
            <div class="text-right font-semibold text-slate-900">{{ ageGender }}</div>
          </div>

          <div class="grid grid-cols-[80px_1fr] items-center gap-2 text-sm">
            <div class="text-slate-500">환자 ID</div>
            <div class="text-right font-semibold text-slate-900">{{ patientId }}</div>
          </div>

          <div class="grid grid-cols-[80px_1fr] items-center gap-2 text-sm">
            <div class="text-slate-500">기록 시간</div>
            <div class="text-right font-semibold text-slate-900">{{ recordDurationText }}</div>
          </div>
        </div>

        <!-- 입력 영역 -->
        <div class="px-4 pb-4">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <textarea
              v-model="noteText"
              rows="6"
              class="w-full resize-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              placeholder="임상 관찰 소견, 감별 진단, 판독 노트를 입력하세요..."
              :disabled="isSubmitted"
            />

            <!-- ✅ 제출 완료 상태 안내 -->
            <div v-if="isSubmitted" class="mt-2 text-[11px] text-emerald-700 font-semibold">
              ✅ 제출 완료 상태입니다. 수정이 필요하면 아래 “수정하기”를 누르세요.
            </div>
          </div>
        </div>
      </section>

      <!-- AI 임상 인사이트 -->
      <section class="rounded-2xl border border-violet-200 bg-violet-50 shadow-sm">
        <div class="px-4 pt-4 pb-2">
          <div class="flex items-center gap-2 text-sm font-semibold text-violet-900">
            <span class="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100">✨</span>
            AI 임상 인사이트
          </div>
        </div>

        <div class="px-4 pb-4">
          <p class="text-sm leading-6 text-slate-800">
            {{ aiInsightText }}
          </p>

          <div class="mt-2 text-[11px] text-violet-900/70">
            * 참고용 초안이며, 최종 판단은 의료진 검토가 필요합니다.
          </div>
        </div>
      </section>

      <!-- 주요 소견 체크 -->
      <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="px-4 pt-4 pb-2">
          <div class="text-sm font-semibold text-slate-900">주요 소견</div>
        </div>

        <div class="px-4 pb-4 space-y-2">
          <label class="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-50">
            <input
              v-model="checks.hrBurdenDone"
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300"
              :disabled="isSubmitted"
            />
            <span class="text-sm text-slate-800">심방세동 부담 기록 완료</span>
          </label>

          <label class="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-50">
            <input
              v-model="checks.ventricularDone"
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300"
              :disabled="isSubmitted"
            />
            <span class="text-sm text-slate-800">심실 부정맥 특성 분석 완료</span>
          </label>

          <label class="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-50">
            <input
              v-model="checks.conductionDone"
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300"
              :disabled="isSubmitted"
            />
            <span class="text-sm text-slate-800">전도 이상 기록 완료</span>
          </label>

          <label class="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-50">
            <input
              v-model="checks.symptomDone"
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300"
              :disabled="isSubmitted"
            />
            <span class="text-sm text-slate-800">증상 상관관계 분석 완료</span>
          </label>
        </div>
      </section>

      <!-- 하단 버튼 -->
      <div class="sticky bottom-0 bg-white pt-2 pb-4">
        <div class="grid grid-cols-2 gap-3">
          <!-- 임시저장 -->
          <button
            type="button"
            class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-2"
            @click="onTempSave"
            :disabled="isSubmitted"
            :class="isSubmitted ? 'opacity-50 cursor-not-allowed' : ''"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 3v12" />
              <path d="M7 10l5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            임시저장
          </button>

          <!-- ✅ 검토 제출 / 제출 완료 -->
          <button
            type="button"
            class="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white flex items-center justify-center gap-2"
            @click="onSubmit"
            :disabled="isSubmitted"
            :class="isSubmitted
              ? 'bg-emerald-600 cursor-not-allowed'
              : 'bg-violet-600 hover:bg-violet-700'"
          >
            <svg v-if="!isSubmitted" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12l18-9-9 18-2-7-7-2z" />
            </svg>

            <svg v-else viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>

            {{ isSubmitted ? "제출 완료" : "검토 제출" }}
          </button>
        </div>

        <!-- ✅ 제출 후: 수정하기 버튼 추가 (오작동/오입력 대비 UX) -->
        <button
          v-if="isSubmitted"
          type="button"
          class="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
          @click="onEdit"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          수정하기
        </button>
      </div>

      <div class="h-2"></div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useWorkspaceStore } from "../stores/workspace.store";

const store = useWorkspaceStore();

/** ---- 표시용 환자 정보 ---- */
const patientName = computed(() => store.selectedPatient?.name ?? "-");
const patientId = computed(() => store.selectedPatient?.chart_no ?? store.selectedPatient?._id ?? "-");

/** ✅ 제출 여부: store.selectedPatient.reviewed 기준 */
const isSubmitted = computed(() => !!store.selectedPatient?.reviewed);

const ageGender = computed(() => {
  const p: any = store.selectedPatient;
  const gender = p?.gender ?? "-";

  let ageText = "-";
  if (typeof p?.age === "number") {
    ageText = String(p.age);
  } else if (p?.birth_date) {
    const d = new Date(p.birth_date);
    if (!Number.isNaN(d.getTime())) {
      const today = new Date();
      let age = today.getFullYear() - d.getFullYear();
      const m = today.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
      ageText = String(age);
    }
  }

  return `${ageText} / ${gender}`;
});

const recordDurationText = computed(() => {
  const session: any = store.currentSession;
  return (session?.duration_text as string) ?? "24시간 10분";
});

/** ---- 입력 상태 ---- */
/** ✅ 중요: watch(immediate)에서 쓰기 때문에 먼저 선언돼 있어야 함 */
const noteText = ref("");

const checks = reactive({
  hrBurdenDone: false,
  ventricularDone: false,
  conductionDone: false,
  symptomDone: false,
});

/** ✅ 환자 바뀔 때 저장된 임상기록을 패널에 채워줌 */
watch(
  () => store.selectedPatientId,
  () => {
    const pid = store.selectedPatientId;
    const saved = (store as any).clinicalNotesByPatient?.[pid];

    if (saved) {
      noteText.value = saved.noteText ?? "";
      const c = saved.checks ?? {};
      checks.hrBurdenDone = !!c.hrBurdenDone;
      checks.ventricularDone = !!c.ventricularDone;
      checks.conductionDone = !!c.conductionDone;
      checks.symptomDone = !!c.symptomDone;
    } else {
      noteText.value = "";
      checks.hrBurdenDone = false;
      checks.ventricularDone = false;
      checks.conductionDone = false;
      checks.symptomDone = false;
    }
  },
  { immediate: true }
);

/** ---- AI 인사이트 문장 ---- */
const aiInsightText = computed(() => {
  const anyInsight = (store.currentSummary as any)?.insight_text;
  if (typeof anyInsight === "string" && anyInsight.trim()) return anyInsight;

  const base = store.currentSummary?.summary_text?.trim();
  if (base) return `${base} 환자 증상과의 임상 상관관계를 고려하세요.`;

  return "이벤트/지표 기반으로 임상적으로 참고할 만한 인사이트가 여기에 표시됩니다. 환자 증상과의 상관관계를 함께 확인하세요.";
});

/** ---- 버튼 핸들러 ---- */
function onGenerateReport() {
  store.openReportBuilder();
}

function onTempSave() {
  const payload = {
    patientId: store.selectedPatient?._id,
    eventId: store.selectedEvent?._id,
    noteText: noteText.value,
    checks: { ...checks },
  };

  store.tempSaveClinicalRecord(payload);
}

function onSubmit() {
  const payload = {
    patientId: store.selectedPatient?._id,
    eventId: store.selectedEvent?._id,
    noteText: noteText.value,
    checks: { ...checks },
  };

  store.submitClinicalReview(payload);
}

function onEdit() {
  const pid = store.selectedPatient?._id;
  if (!pid) return;

  // ✅ 스토어에 추가한 액션 그대로 호출
  store.reopenClinicalReview(pid);
}
</script>