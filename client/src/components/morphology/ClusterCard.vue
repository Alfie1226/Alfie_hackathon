<template>
  <button
    type="button"
    class="w-full rounded-xl border p-4 text-left transition hover:shadow-sm"
    :class="[
      active ? 'border-violet-400 ring-2 ring-violet-100' : 'border-slate-200',
      cluster.is_outlier ? 'bg-amber-50/60' : 'bg-white'
    ]"
    @click="$emit('select', cluster.cluster_id)"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <div class="font-semibold text-slate-900">{{ cluster.title }}</div>
          <span
            v-if="cluster.is_outlier"
            class="text-[11px] px-2 py-0.5 rounded-full border border-amber-300 text-amber-700 bg-amber-50"
          >
            ABNORMAL
          </span>
        </div>
        <div class="text-sm text-slate-500 mt-0.5">{{ cluster.subtitle }}</div>
      </div>

      <span
        class="shrink-0 text-xs font-medium px-2.5 py-1 rounded-md"
        :class="active ? 'bg-violet-600 text-white' : 'bg-slate-700 text-white/90'"
      >
        검토
      </span>
    </div>

    <div class="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2">
      <div class="h-24">
        <WaveOverlay :points="cluster.wave_points" />
      </div>
    </div>

    <div class="mt-3 flex items-center justify-between text-sm">
      <div class="text-slate-500">
        QRS 폭:
        <span class="text-slate-900 font-medium">
          {{ cluster.qrs_ms_mean }} ± {{ cluster.qrs_ms_sd }} ms
        </span>
      </div>
      <div class="text-slate-500">
        신뢰도:
        <span
          class="font-semibold"
          :class="cluster.confidence_pct >= 90 ? 'text-emerald-600' : cluster.confidence_pct >= 75 ? 'text-amber-600' : 'text-rose-600'"
        >
          {{ cluster.confidence_pct }}%
        </span>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { MorphologyCluster } from "../../types/morphology";
import WaveOverlay from "./WaveOverlay.vue";

defineProps<{
  cluster: MorphologyCluster;
  active: boolean;
}>();

defineEmits<{
  (e: "select", clusterId: string): void;
}>();
</script>
