<template>
  <svg
    class="w-full h-full"
    viewBox="0 0 300 100"
    preserveAspectRatio="none"
  >
    <!-- grid -->
    <g opacity="0.35">
      <path
        v-for="x in 10"
        :key="'vx'+x"
        :d="`M ${x * 30} 0 L ${x * 30} 100`"
        stroke="currentColor"
        stroke-width="0.5"
        class="text-slate-300"
      />
      <path
        v-for="y in 5"
        :key="'hy'+y"
        :d="`M 0 ${y * 20} L 300 ${y * 20}`"
        stroke="currentColor"
        stroke-width="0.5"
        class="text-slate-300"
      />
    </g>

    <!-- waveform -->
    <path
      :d="pathD"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      class="text-slate-800"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- baseline -->
    <path d="M 0 70 L 300 70" stroke="currentColor" stroke-width="1" class="text-slate-400" opacity="0.5" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  points: number[];
}>();

const pathD = computed(() => {
  const pts = props.points?.length ? props.points : [0, 0, 0, 0];
  const w = 300;
  const h = 100;

  const maxAbs = Math.max(...pts.map((p) => Math.abs(p)), 1);
  const xStep = w / (pts.length - 1);

  // baseline around 70 (like ECG strip baseline)
  const baselineY = 70;
  const amp = 45; // vertical amplitude scale

  const xy = pts.map((v, i) => {
    const x = i * xStep;
    const y = baselineY - (v / maxAbs) * amp;
    return { x, y };
  });

  // simple polyline path
  return xy
    .map((p, i) => (i === 0 ? `M ${p.x.toFixed(2)} ${p.y.toFixed(2)}` : `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`))
    .join(" ");
});
</script>
