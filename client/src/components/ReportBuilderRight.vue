<template>
  <aside class="border-l bg-white overflow-y-auto">
    <div class="p-4">
      <div class="text-sm font-semibold flex items-center gap-2">✨ LLM 리포트 생성기</div>
      <div class="text-xs text-slate-500 mt-1">AI 기반 구조화 의료 리포트 자동 생성</div>

      <div v-if="store.reportSet" class="mt-3 text-xs text-slate-500">
        Last draft:
        <span class="font-medium">{{ store.reportSet.report_id }}</span>
        · {{ formatTime(store.reportSet.updated_at) }}
      </div>
    </div>

    <div class="px-4 pb-4">
      <div class="rounded-2xl border bg-white p-4">
        <div class="text-sm font-semibold mb-3">English Draft (Medical)</div>

        <pre
          v-if="store.reportSet?.draft_en"
          class="whitespace-pre-wrap text-sm leading-6 text-slate-800"
        >{{ store.reportSet.draft_en }}</pre>

        <div v-else class="text-sm text-slate-500">
          No draft yet. Click “AI 리포트 초안 생성”.
        </div>
      </div>

      <div class="mt-4 space-y-2">
        <button class="w-full rounded-xl border px-4 py-3 text-sm hover:bg-slate-50">
          리포트 편집
        </button>

        <button class="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700">
          ⬇ 내보내기 및 최종 확인
        </button>

        <button
          class="w-full rounded-xl text-sm text-slate-600 hover:text-slate-900"
          @click="store.closeReportBuilder()"
        >
          분석 화면으로 돌아가기
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from "../stores/workspace.store";
const store = useWorkspaceStore();

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
</script>