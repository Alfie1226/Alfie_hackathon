<template>
  <Teleport to="body">
    <!-- 🔥 핵심: 전체 레이어는 클릭을 아래로 통과 -->
    <div v-if="open" class="fixed inset-0 z-50 pt-14 pointer-events-none">
      <div class="h-[calc(100vh-56px)] grid grid-cols-[320px_minmax(0,1fr)_360px]">
        <!-- LEFT: 아무것도 안 깔기(클릭은 아래 앱으로 통과됨) -->
        <div></div>

        <!-- CENTER: 여기만 클릭 가능 -->
        <div
          class="h-full overflow-y-auto bg-slate-50 p-6 pointer-events-auto"
          @click.self="emitClose"
        >
          <div class="w-full rounded-2xl bg-white shadow-xl border border-slate-200">
            <!-- Header -->
            <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-200">
              <div>
                <div class="text-xl font-semibold text-slate-900">과거 검사 기록</div>
                <div class="mt-1 text-sm text-slate-500">
                  환자:
                  <span class="text-slate-900 font-medium">{{ patientName }}</span>
                  · <span>{{ patientChartNo }}</span>
                </div>
              </div>

              <button
                type="button"
                class="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
                @click="emitClose"
                title="닫기"
              >
                <svg viewBox="0 0 24 24" class="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div class="px-6 py-6 space-y-5">
              <!-- Select -->
              <div class="rounded-2xl border border-slate-200 bg-white p-5">
                <div class="text-sm font-semibold text-slate-900 mb-3">검사 기록 선택</div>
                <div class="relative">
                  <select
                    v-model="selectedId"
                    class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
                  >
                    <option v-for="r in records" :key="r.id" :value="r.id">
                      {{ r.display_text }}
                    </option>
                  </select>
                  <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </div>
              </div>

              <!-- Top cards -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="rounded-2xl border border-slate-200 bg-white p-5">
                  <div class="text-sm text-slate-600">총 이벤트 수</div>
                  <div class="mt-2 text-4xl font-semibold text-slate-900">
                    {{ current?.total_events ?? "-" }}
                  </div>
                  <div class="mt-1 text-sm text-slate-500">개</div>
                </div>

                <div class="rounded-2xl border border-slate-200 bg-white p-5">
                  <div class="text-sm text-slate-600">위급 이벤트</div>
                  <div class="mt-2 text-4xl font-semibold text-red-600">
                    {{ current?.high_risk_events ?? "-" }}
                  </div>
                  <div class="mt-1 text-sm text-slate-500">개</div>
                </div>

                <div class="rounded-2xl border border-slate-200 bg-white p-5">
                  <div class="text-sm text-slate-600 mb-2">주요 리듬</div>
                  <div class="space-y-2 text-sm">
                    <div class="flex items-center justify-between">
                      <div class="text-slate-700">AF</div>
                      <div class="font-semibold text-slate-900">
                        {{ current?.rhythm_counts?.AF ?? 0 }}회
                      </div>
                    </div>
                    <div class="flex items-center justify-between">
                      <div class="text-slate-700">PVC</div>
                      <div class="font-semibold text-slate-900">
                        {{ current?.rhythm_counts?.PVC ?? 0 }}회
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Time distribution -->
              <div class="rounded-2xl border border-slate-200 bg-white p-5">
                <div class="text-sm font-semibold text-slate-900 mb-4">이벤트 시간대별 분포</div>

                <div class="space-y-3">
                  <div
                    v-for="row in current?.time_distribution ?? []"
                    :key="row.label"
                    class="grid grid-cols-[100px_1fr_40px] items-center gap-3"
                  >
                    <div class="text-xs text-slate-600">{{ row.label }}</div>

                    <div class="h-8 rounded-lg bg-slate-100 overflow-hidden">
                      <div
                        class="h-full rounded-lg"
                        :class="barColor(row.label)"
                        :style="{ width: barWidth(row.count) }"
                      />
                    </div>

                    <div class="text-xs text-slate-600 text-right">{{ row.count }}개</div>
                  </div>
                </div>

                <div class="mt-5 border-t pt-4">
                  <div class="text-sm font-semibold text-slate-900 mb-3">위험도 레벨 분포</div>

                  <div class="h-10 rounded-lg bg-slate-100 overflow-hidden flex">
                    <div class="h-full bg-red-400/80" :style="{ width: riskWidth('HIGH') }" />
                    <div class="h-full bg-orange-400/80" :style="{ width: riskWidth('MID') }" />
                    <div class="h-full bg-slate-400/60" :style="{ width: riskWidth('LOW') }" />
                  </div>

                  <div class="mt-2 text-xs text-slate-600 grid grid-cols-3">
                    <div class="text-left">위급 {{ current?.risk_distribution?.HIGH ?? 0 }}</div>
                    <div class="text-center">주의 {{ current?.risk_distribution?.MID ?? 0 }}</div>
                    <div class="text-right">일반 {{ current?.risk_distribution?.LOW ?? 0 }}</div>
                  </div>
                </div>
              </div>

              <!-- Top events (VT 제거) -->
              <div class="rounded-2xl border border-slate-200 bg-white">
                <div class="px-5 py-4 border-b">
                  <div class="text-sm font-semibold text-slate-900">주요 이벤트 요약</div>
                </div>

                <div class="divide-y">
                  <div
                    v-for="e in topEventsNoVT"
                    :key="e.type + e.time_range"
                    class="px-5 py-4"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="inline-flex px-2 py-1 rounded-md text-xs font-semibold" :class="badgeTypeClass(e.type)">
                          {{ e.type }}
                        </span>
                        <span class="inline-flex px-2 py-1 rounded-md text-xs font-semibold" :class="badgeRiskClass(e.risk)">
                          {{ riskLabel(e.risk) }}
                        </span>
                        <span class="text-xs text-slate-500 inline-flex items-center gap-1">
                          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 8v5l3 2" />
                            <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                          {{ e.time_range }}
                        </span>
                      </div>

                      <div class="text-xs text-slate-500">{{ e.count }}회 발생</div>
                    </div>

                    <div class="mt-2 text-sm text-slate-800">
                      {{ e.description }}
                    </div>
                  </div>

                  <div v-if="topEventsNoVT.length === 0" class="px-5 py-6 text-sm text-slate-500">
                    표시할 주요 이벤트가 없습니다.
                  </div>
                </div>
              </div>

              <!-- AI compare (VT 문장 제거) -->
              <div class="rounded-2xl border border-violet-200 bg-violet-50 p-5">
                <div class="flex items-center gap-2 text-sm font-semibold text-violet-900">
                  <span class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100">∿</span>
                  AI 비교 분석
                </div>

                <ul class="mt-3 space-y-2 text-sm text-slate-800">
                  <li v-for="(t, idx) in aiBulletsNoVT" :key="idx" class="leading-6">
                    • {{ t }}
                  </li>
                </ul>

                <div v-if="aiBulletsNoVT.length === 0" class="mt-3 text-sm text-slate-500">
                  표시할 비교 분석 내용이 없습니다.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: 희미하게만(시각효과), 클릭은 아래로 통과시키려면 pointer-events-none 유지 -->
        <div class="relative pointer-events-none select-none">
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { PastExamRecord, RiskLevel, EventType } from "../mocks/pastHistory";

const props = defineProps<{
  open: boolean;
  patientName: string;
  patientChartNo: string;
  records: PastExamRecord[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const selectedId = ref<string>("");

watch(
  () => props.records,
  (arr) => {
    selectedId.value = arr?.[0]?.id ?? "";
  },
  { immediate: true }
);

watch(
  () => props.open,
  (v) => {
    document.body.style.overflow = v ? "hidden" : "";
  },
  { immediate: true }
);

const current = computed(() => props.records.find((r) => r.id === selectedId.value));

/** ✅ VT 숨김: 주요 이벤트 요약에서 VT 타입 제거 */
const topEventsNoVT = computed(() =>
  (current.value?.top_events ?? []).filter((e) => e.type !== "VT")
);

/** ✅ VT 숨김: AI 비교 분석에서 VT 언급 문장 제거 */
const aiBulletsNoVT = computed(() =>
  (current.value?.ai_compare_bullets ?? []).filter((t) => !t.includes("VT"))
);

const maxTimeCount = computed(() => {
  const arr = current.value?.time_distribution ?? [];
  return Math.max(1, ...arr.map((x) => x.count));
});

function barWidth(count: number) {
  return `${Math.round((count / maxTimeCount.value) * 100)}%`;
}

function barColor(label: string) {
  if (label.startsWith("00:00")) return "bg-red-400/80";
  if (label.startsWith("06:00")) return "bg-orange-400/80";
  if (label.startsWith("12:00")) return "bg-amber-400/80";
  return "bg-slate-500/60";
}

function riskWidth(level: RiskLevel) {
  const d = current.value?.risk_distribution;
  if (!d) return "0%";
  const total = Math.max(1, d.HIGH + d.MID + d.LOW);
  return `${Math.round((d[level] / total) * 100)}%`;
}

function badgeRiskClass(r: RiskLevel) {
  if (r === "HIGH") return "bg-red-50 text-red-700 border border-red-200";
  if (r === "MID") return "bg-orange-50 text-orange-700 border border-orange-200";
  return "bg-slate-50 text-slate-700 border border-slate-200";
}

function riskLabel(r: RiskLevel) {
  if (r === "HIGH") return "위급";
  if (r === "MID") return "주의";
  return "일반";
}

function badgeTypeClass(t: EventType) {
  // VT는 렌더링에서 제외되지만, 타입 안정성/확장성을 위해 분기는 남겨둠
  if (t === "VT") return "bg-violet-50 text-violet-700 border border-violet-200";
  if (t === "AF") return "bg-orange-50 text-orange-700 border border-orange-200";
  if (t === "Pause") return "bg-amber-50 text-amber-800 border border-amber-200";
  return "bg-sky-50 text-sky-700 border border-sky-200";
}

function emitClose() {
  emit("close");
}
</script>
