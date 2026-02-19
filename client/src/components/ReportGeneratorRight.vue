<template>
  <aside class="border-l bg-white overflow-y-auto">
    <div class="p-4">
      <div class="text-sm font-semibold flex items-center gap-2">
        ✨ LLM Report Generator
      </div>
      <div class="text-xs text-slate-500 mt-1">
        AI-assisted structured medical report draft
      </div>

      <div v-if="store.reportSet" class="mt-3 text-xs text-slate-500">
        Draft ID:
        <span class="font-medium">{{ store.reportSet.report_id }}</span>
        · {{ formatTime(store.reportSet.updated_at) }}
      </div>
    </div>

    <div class="px-4 pb-4">
      <!-- English Draft -->
      <div class="rounded-2xl border bg-white p-4">
        <div class="text-sm font-semibold mb-3">
          English Draft (Medical)
        </div>

        <pre
          v-if="store.reportSet?.draft_en"
          class="whitespace-pre-wrap text-sm leading-6 text-slate-800 font-mono"
        >{{ store.reportSet.draft_en }}</pre>

        <div v-else class="text-sm text-slate-500">
          No draft generated yet.
        </div>
      </div>

      <!-- Buttons -->
      <div class="mt-4 space-y-2">
        <button
          class="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"
        >
          ⬇ Export & Finalize
        </button>

        <button
          class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          @click="store.closeReportBuilder()"
        >
          ← Back to Analysis
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