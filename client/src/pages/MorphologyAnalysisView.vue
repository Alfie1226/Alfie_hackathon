<template>
  <div class="h-screen w-screen bg-slate-50">
    <!-- Top Header -->
    <header class="h-14 px-4 border-b bg-white">
      <div class="h-full flex items-center justify-between">
        <button
          type="button"
          class="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2"
          @click="vm.backTo24h()"
        >
          <span class="text-lg leading-none">←</span>
          24시간 분석으로 돌아가기
        </button>

        <div class="flex items-center gap-2">
          <div class="text-xs text-slate-500">분석 모드:</div>
          <span class="text-sm px-3 py-1 rounded-full border bg-violet-50 text-violet-700 border-violet-200">
            {{ modeLabel }}
          </span>
        </div>
      </div>
    </header>

    <div class="h-[calc(100vh-56px)] grid grid-cols-[320px_1fr]">
      <!-- Left Panel -->
      <aside class="border-r bg-white p-4 overflow-auto">
        <div class="font-semibold text-slate-900 mb-3">환자 대기열</div>

        <div class="relative">
          <input
            type="text"
            placeholder="이름, ID, 날짜로 검색..."
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-300"
          />
        </div>

        <div class="mt-4">
          <div class="text-xs text-slate-500 mb-2">정렬 기준</div>
          <div class="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <span class="text-slate-700">위험도순</span>
            <span class="text-slate-400">▾</span>
          </div>
        </div>

        <!-- Patient Card -->
        <div class="mt-4 rounded-xl border border-slate-200 p-4">
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-2">
                <span class="h-2 w-2 rounded-full bg-rose-500"></span>
                <div class="font-semibold text-slate-900">
                  {{ store.patient.name }}
                  <span class="text-slate-500 font-normal">
                    ({{ store.patient.sex }}/{{ store.patient.age }})
                  </span>
                </div>
              </div>

              <div class="text-xs text-slate-500 mt-1">
                {{ store.patient.dob }}
              </div>

              <div class="mt-2 flex items-center gap-2 text-xs text-slate-600">
                <span class="inline-flex items-center gap-1">🕒 {{ store.patient.duration_label }}</span>
                <span>·</span>
                <span>{{ store.patient.recorded_at }}</span>
              </div>
            </div>

            <span
              class="text-xs px-2 py-1 rounded-md border"
              :class="
                store.patient.risk_badge === '위험'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : store.patient.risk_badge === '주의'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              "
            >
              {{ store.patient.risk_badge }}
            </span>
          </div>

          <!-- ✅ Event type badges (Morphology 대상 4개만: count 있는 것만 노출) -->
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="key in MORPH_EVENT_TYPES"
              :key="key"
              v-show="(store.patient.counts?.[key] ?? 0) > 0"
              type="button"
              class="text-xs px-2.5 py-1.5 rounded-lg border transition"
              :class="
                store.selectedEventTypeId === key
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              "
              @click="handleMorphChipClick(key)"
            >
              〰 {{ key }} ×{{ store.patient.counts?.[key] ?? 0 }}
            </button>

            <div v-if="!hasAnyMorphChips" class="text-xs text-slate-500">
              표시할 이벤트가 없습니다.
            </div>
          </div>
        </div>

        <div class="mt-6 text-xs text-slate-500">
          <div class="flex justify-between">
            <span>전체 환자:</span><span>3</span>
          </div>
          <div class="flex justify-between mt-1">
            <span>검토 대기:</span><span class="text-rose-600 font-semibold">1</span>
          </div>
        </div>
      </aside>

      <!-- Main -->
      <main class="p-6 overflow-auto">
        <!-- ✅ 분석 데이터가 있을 때만 렌더 -->
        <template v-if="store.analysis">
          <!-- Title -->
          <div class="flex items-start justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-slate-900">
                {{ store.analysis.title_en }} -
                <span class="font-extrabold">{{ store.analysis.title_ko }}</span>
              </h1>
              <div class="text-sm text-slate-500 mt-1">
                환자: {{ store.patient.name }} ({{ store.patient.sex }}/{{ store.patient.age }})
                · 전체 이벤트: {{ store.analysis.summary.total_events }}회 · AI 클러스터링 완료
              </div>
            </div>
          </div>

          <!-- Summary cards -->
          <div class="grid grid-cols-4 gap-4 mt-6">
            <div class="rounded-xl border bg-white p-4">
              <div class="text-xs text-slate-500">전체 이벤트</div>
              <div class="text-3xl font-bold mt-1">
                {{ store.analysis.summary.total_events }}
              </div>
            </div>
            <div class="rounded-xl border bg-white p-4">
              <div class="text-xs text-slate-500">식별된 클러스터</div>
              <div class="text-3xl font-bold mt-1 text-violet-600">
                {{ store.analysis.summary.clusters_detected }}
              </div>
            </div>
            <div class="rounded-xl border bg-white p-4">
              <div class="text-xs text-slate-500">이상치</div>
              <div class="text-3xl font-bold mt-1 text-amber-600">
                {{ store.analysis.summary.outliers }}
              </div>
            </div>
            <div class="rounded-xl border bg-white p-4">
              <div class="text-xs text-slate-500">형태 일치도</div>
              <div class="text-3xl font-bold mt-1 text-emerald-600">
                {{ store.analysis.summary.morphology_match_pct }}%
              </div>
            </div>
          </div>

          <!-- AI overview -->
          <div class="mt-5 rounded-xl border border-violet-200 bg-violet-50/60 p-4">
            <div class="flex items-start gap-3">
              <div class="text-violet-700 text-lg leading-none">⚠</div>
              <div>
                <div class="font-semibold text-violet-800">AI 형태학적 분석</div>
                <p class="text-sm text-slate-700 mt-1 leading-relaxed">
                  {{ store.analysis.summary.ai_overview }}
                </p>
              </div>
            </div>
          </div>

          <!-- Cluster cards -->
          <div class="mt-6 grid grid-cols-3 gap-4">
            <ClusterCard
              v-for="c in store.clusters"
              :key="c.cluster_id"
              :cluster="c"
              :active="store.selectedClusterId === c.cluster_id"
              @select="store.selectCluster"
            />
          </div>

          <!-- Overlay section -->
          <section v-if="store.selectedCluster" class="mt-8 rounded-2xl border bg-white p-6">
            <div class="text-xl font-bold text-slate-900">
              오버레이 파형 비교 - {{ store.selectedCluster.title }}
            </div>
            <div class="text-sm text-slate-500 mt-1">
              중심값(굵은선)과 개별 이벤트 인스턴스(반투명) 오버레이. 파형에 마우스를 올려 AI 형태 설명을 확인하세요.
            </div>

            <div class="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div class="h-48">
                <WaveOverlay :points="store.selectedCluster.wave_points" />
              </div>

              <div class="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                <div class="font-semibold text-slate-900">AI 형태학적 설명</div>
                <p class="text-sm text-slate-700 mt-2 leading-relaxed">
                  {{ store.selectedCluster.ai_description }}
                </p>
              </div>
            </div>

            <div class="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
                @click="store.approveAllClusters()"
              >
                ✓ 모든 클러스터 일괄 승인
              </button>

              <button
                type="button"
                class="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition flex items-center gap-2"
                @click="store.exportSegmentData()"
              >
                ⤓ 세그먼트 데이터 내보내기
              </button>

              <button
                type="button"
                class="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold hover:bg-slate-50 transition"
                @click="store.markForManualReview()"
              >
                수동 검토 표시
              </button>
            </div>
          </section>

          <section v-else class="mt-8 rounded-2xl border bg-white p-6">
            <div class="text-slate-500">클러스터 데이터가 없습니다.</div>
          </section>
        </template>

        <!-- ✅ 분석 데이터가 없을 때 -->
        <section v-else class="rounded-2xl border bg-white p-6">
          <div class="text-slate-900 font-semibold">분석 데이터가 없습니다.</div>
          <div class="mt-1 text-sm text-slate-500">
            mock의 analyses에 해당 타입(AF/PAC/PVC/Pause)을 추가하세요.
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useMorphologyStore } from "../stores/useMorphologyStore";
import { useViewModeStore } from "../stores/viewMode.store";
import ClusterCard from "../components/morphology/ClusterCard.vue";
import WaveOverlay from "../components/morphology/WaveOverlay.vue";
import type { MorphologyEventTypeId } from "../types/morphology";

const store = useMorphologyStore();
const vm = useViewModeStore();

/** ✅ Morphology 대상 4개만 (좌측 칩용) */
const MORPH_EVENT_TYPES: MorphologyEventTypeId[] = ["AF", "PAC", "PVC", "Pause"];

const hasAnyMorphChips = computed(() => {
  const counts = store.patient.counts ?? {};
  return MORPH_EVENT_TYPES.some((t) => (counts as any)[t] > 0);
});

function handleMorphChipClick(t: MorphologyEventTypeId) {
  vm.openMorphology(t as any);
}

/**
 * ✅ 상단 modeLabel (viewMode.store의 값이 ANALYSIS_24H/MORPHOLOGY 라는 가정)
 * - 네 store 구현이 다르면 여기만 네 enum에 맞춰 바꾸면 됨
 */
type HeaderMode = "ANALYSIS_24H" | "MORPHOLOGY";
function isHeaderMode(v: unknown): v is HeaderMode {
  return v === "ANALYSIS_24H" || v === "MORPHOLOGY";
}

const modeLabel = computed(() => {
  const raw = (vm as any).viewMode;
  const mode: HeaderMode = isHeaderMode(raw) ? raw : "ANALYSIS_24H";
  return mode === "MORPHOLOGY" ? "형태학 분석" : "24시간 분석";
});
</script>
