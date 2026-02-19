<template>
  <div class="p-6">
    <!-- ✅ 돌아가기(위로 올림) -->
    <button
      type="button"
      class="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-2"
      @click="onBack"
    >
      ← 분석 화면으로 돌아가기
    </button>

    <div class="mt-2 flex items-start justify-between">
      <div>
        <div class="text-2xl font-semibold">AI 기반 리포트 생성</div>
        <div class="text-sm text-slate-500 mt-1">
          환자: {{ store.selectedPatient?.name || "-" }}
          ({{ store.selectedPatient?.gender || "-" }}/{{ store.selectedPatient?.birth_date || "-" }})
          · {{ store.selectedPatient?.chart_no || store.selectedPatient?._id || "-" }}
          · 24시간 10분 기록
        </div>
      </div>

      <div class="text-sm text-slate-500 flex items-center gap-3">
        <!-- ✅ 저장 상태 배지 -->
        <span
          v-if="store.reportSaveStatus !== 'IDLE'"
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs"
          :class="badgeClass"
        >
          <span v-if="store.reportSaveStatus === 'SAVING'">저장 중…</span>
          <span v-else-if="store.reportSaveStatus === 'SAVED'">임시저장 완료</span>
          <span v-else-if="store.reportSaveStatus === 'ERROR'">{{ store.reportSaveMessage || "저장 실패" }}</span>
        </span>

        모드:
        <span
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200"
        >
          ✨ LLM 리포트 생성기
        </span>
      </div>
    </div>

    <!-- 입력 카드 -->
    <div class="mt-6 border rounded-2xl bg-white p-6">
      <div class="text-lg font-semibold">임상 배경 및 검사 사유</div>

      <div class="mt-4">
        <div class="text-sm font-medium text-slate-700">홀터 모니터링 주요 적응증</div>
        <input
          v-model="store.reportInput.indication"
          class="mt-2 w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-violet-200"
          placeholder="예: Evaluation of palpitations and syncope episodes"
        />
      </div>

      <div class="mt-4">
        <div class="text-sm font-medium text-slate-700">환자 보고 증상</div>
        <textarea
          v-model="store.reportInput.symptoms"
          class="mt-2 w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-violet-200 min-h-[110px]"
        />
      </div>

      <div class="mt-4">
        <div class="text-sm font-medium text-slate-700">관련 병력</div>
        <textarea
          v-model="store.reportInput.history"
          class="mt-2 w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-violet-200 min-h-[110px]"
        />
      </div>

      <!-- ✅ 생성 버튼: 없을 때만 생성(편집본 덮어쓰기 방지) -->
      <button
        class="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
        @click="onGenerateDraft"
      >
        ✨ AI 리포트 초안 생성
      </button>
    </div>

    <!-- 결과 카드(한글) -->
    <div class="mt-6 border rounded-2xl bg-white overflow-hidden">
      <div class="px-6 py-4 bg-violet-50 border-b flex items-center justify-between">
        <div>
          <div class="font-semibold">✨ AI 생성 리포트 초안</div>
          <div class="text-xs text-slate-500 mt-1">
            24시간 ECG 데이터, AI 분석 결과 및 임상 배경을 기반으로 생성됨
          </div>
        </div>

        <button
          class="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          @click="onRegenerate"
          :disabled="!store.reportSet?.draft_ko || isEditing"
          :class="(!store.reportSet?.draft_ko || isEditing) ? 'opacity-50 cursor-not-allowed' : ''"
          title="편집 중에는 재생성을 막습니다."
        >
          ⟳ 재생성
        </button>
      </div>

      <div class="p-6">
        <!-- ✅ 보기 모드 -->
        <pre
          v-if="store.reportSet?.draft_ko && !isEditing"
          class="whitespace-pre-wrap text-sm leading-7 text-slate-900"
        >{{ store.reportSet.draft_ko }}</pre>

        <!-- ✅ 편집 모드 -->
        <div v-else-if="store.reportSet?.draft_ko && isEditing" class="space-y-3">
          <div class="text-sm font-semibold text-slate-800">수동 편집</div>
          <textarea
            v-model="editableKo"
            class="w-full min-h-[360px] rounded-xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-900 outline-none focus:ring-2 focus:ring-violet-200"
          />
          <div class="text-xs text-slate-500">
            * “임시저장”을 누르거나 “편집 닫기”를 누르면 자동 저장됩니다.
          </div>
        </div>

        <div v-else class="text-sm text-slate-500">
          아직 생성된 초안이 없습니다. 위에서 “AI 리포트 초안 생성”을 눌러주세요.
        </div>

        <!-- ✅ 버튼 -->
        <div class="mt-6 flex items-center gap-3">
          <button
            type="button"
            class="rounded-xl border px-4 py-3 text-sm hover:bg-slate-50"
            @click="toggleEdit"
            :disabled="!store.reportSet?.draft_ko"
            :class="!store.reportSet?.draft_ko ? 'opacity-50 cursor-not-allowed' : ''"
          >
            {{ isEditing ? "편집 닫기" : "리포트 수동 편집" }}
          </button>

          <button
            type="button"
            class="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            @click="onFinalize"
            :disabled="!store.reportSet?.draft_ko || store.reportSaveStatus==='SAVING'"
            :class="(!store.reportSet?.draft_ko || store.reportSaveStatus==='SAVING') ? 'opacity-50 cursor-not-allowed' : ''"
          >
            승인 및 리포트 최종 확정
          </button>

          <button
            type="button"
            class="rounded-xl border px-4 py-3 text-sm hover:bg-slate-50"
            @click="onTempSave"
            :disabled="!store.reportSet?.draft_ko || store.reportSaveStatus==='SAVING'"
            :class="(!store.reportSet?.draft_ko || store.reportSaveStatus==='SAVING') ? 'opacity-50 cursor-not-allowed' : ''"
          >
            임시저장
          </button>
        </div>

        <!-- ✅ “본 리포트는…” 문구: 여기 1번만 -->
        <div class="mt-4 text-xs text-slate-500">
          본 리포트는 AI 보조로 생성되었으며 최종 확정을 위해 의사의 검토 및 서명이 필요합니다.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useWorkspaceStore } from "../stores/workspace.store";

const store = useWorkspaceStore();

const isEditing = ref(false);
const editableKo = ref("");

const badgeClass = computed(() => {
  if (store.reportSaveStatus === "SAVING") return "bg-slate-50 text-slate-700 border-slate-200";
  if (store.reportSaveStatus === "SAVED") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (store.reportSaveStatus === "ERROR") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
});

/** ✅ reportSet 변경되면 편집 버퍼도 최신화
 *  - 단, 편집 중에는 덮어쓰지 않음(사용자 입력 보호)
 */
watch(
  () => store.reportSet?.draft_ko,
  (v) => {
    if (isEditing.value) return;
    if (typeof v === "string") editableKo.value = v;
    else editableKo.value = "";
  },
  { immediate: true }
);

function onGenerateDraft() {
  // ✅ 없을 때만 생성 (편집본 덮어쓰기 방지)
  if (!store.reportSet) store.generateReportDraft();
}

function onRegenerate() {
  // ✅ 편집 중 재생성 막음(버퍼/편집본 보호)
  if (isEditing.value) return;
  store.regenerateReportDraft();
}

async function onBack() {
  // ✅ 돌아가기 = 저장 시도 + 닫기
  await store.closeReportBuilder();
}

/** ✅ 수동편집 토글: "닫을 때" 자동 임시저장 + 저장상태 표시
 *  ✅ 변경: tempSaveReportDraft -> tempSaveReportDraftBoth
 */
async function toggleEdit() {
  if (!store.reportSet?.draft_ko) return;

  if (isEditing.value) {
    // ✅ 닫는 순간: 한/영 모두 반영 + 저장 상태 띄우기
    store.tempSaveReportDraftBoth(editableKo.value);
    await store.saveReportDraft();

    isEditing.value = false;
    return;
  }

  // 여는 순간: draft를 편집 버퍼로 복사
  editableKo.value = store.reportSet.draft_ko ?? "";
  isEditing.value = true;
}

/** ✅ 임시저장 버튼: 한/영 모두 반영 + 저장 상태 띄우기
 *  ✅ 변경: tempSaveReportDraft -> tempSaveReportDraftBoth
 */
async function onTempSave() {
  if (!store.reportSet?.draft_ko) return;
  const next = isEditing.value ? editableKo.value : store.reportSet.draft_ko;

  store.tempSaveReportDraftBoth(next);
  await store.saveReportDraft();
}

/** ✅ 최종 확정 버튼
 *  ✅ 변경: finalize 전에 Both로 맞춰서 오른쪽도 즉시 반영
 */
async function onFinalize() {
  if (!store.reportSet?.draft_ko) return;
  const next = isEditing.value ? editableKo.value : store.reportSet.draft_ko;

  // ✅ 확정 전: 한/영 모두 동일하게 맞춰서 "오른쪽도 보이게"
  store.tempSaveReportDraftBoth(next);

  store.finalizeReport(next);

  // ✅ 확정도 "저장" 흐름으로 태워서 상태 표시(백 붙이면 finalize api로 분리 가능)
  await store.saveReportDraft();

  isEditing.value = false;
}
</script>
