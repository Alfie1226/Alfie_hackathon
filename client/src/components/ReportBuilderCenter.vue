<template>
  <div class="p-6">
    <!-- ✅ 돌아가기(위로 올림) -->
    <button
      type="button"
      class="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-2"
      @click="store.closeReportBuilder()"
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

      <div class="text-sm text-slate-500">
        모드:
        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
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

      <button
        class="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
        @click="store.generateReportDraft()"
      >
        ✨ AI 리포트 초안 생성
      </button>
    </div>

    <!-- 결과 카드(한글) -->
    <div class="mt-6 border rounded-2xl bg-white overflow-hidden">
      <div class="px-6 py-4 bg-violet-50 border-b flex items-center justify-between">
        <div>
          <div class="font-semibold">✨ AI 생성 리포트 초안</div>
          <div class="text-xs text-slate-500 mt-1">24시간 ECG 데이터, AI 분석 결과 및 임상 배경을 기반으로 생성됨</div>
        </div>

        <button
          class="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          @click="store.regenerateReportDraft()"
        >
          ⟳ 재생성
        </button>
      </div>

      <div class="p-6">
        <pre
          v-if="store.reportSet?.draft_ko"
          class="whitespace-pre-wrap text-sm leading-7 text-slate-900"
        >{{ store.reportSet.draft_ko }}</pre>

        <div v-else class="text-sm text-slate-500">
          아직 생성된 초안이 없습니다. 위에서 “AI 리포트 초안 생성”을 눌러주세요.
        </div>

        <!-- ✅ 버튼 -->
        <div class="mt-6 flex items-center gap-3">
          <button class="rounded-xl border px-4 py-3 text-sm hover:bg-slate-50">
            리포트 수동 편집
          </button>

          <button class="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
            승인 및 리포트 최종 확정
          </button>

          <button class="rounded-xl border px-4 py-3 text-sm hover:bg-slate-50">
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
import { useWorkspaceStore } from "../stores/workspace.store";
const store = useWorkspaceStore();
</script>