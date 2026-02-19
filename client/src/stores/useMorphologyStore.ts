// src/stores/useMorphologyStore.ts
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import type {
  MorphologyEventTypeId,
  PatientAnalysisBundle,
  MorphologyCluster,
} from "../types/morphology";
import { MOCK_BUNDLE } from "../mocks/morphology.mock";

// ✅ Morphology 화면에서 "분석 탭"으로 쓸 순서(있으면만 노출)
const FALLBACK_ORDER: MorphologyEventTypeId[] = ["AF", "PAC", "PVC", "Pause"];

export const useMorphologyStore = defineStore("morphology", () => {
  // mock bundle (later: replace with API response)
  const bundle = ref<PatientAnalysisBundle>(MOCK_BUNDLE);

  // UI state
  const selectedEventTypeId = ref<MorphologyEventTypeId>("AF");
  const selectedClusterId = ref<string>("C1");

  // derived
  const patient = computed(() => bundle.value.patient);

  // ✅ analyses에 "실제로 존재하는 타입"만 탭으로 노출
  const availableEventTypes = computed<MorphologyEventTypeId[]>(() => {
    const a = bundle.value.analyses ?? {};
    return FALLBACK_ORDER.filter((t) => !!a[t]);
  });

  // ✅ 현재 선택된 타입의 analysis (없으면 null)
  const analysis = computed(() => {
    const a = bundle.value.analyses ?? {};
    return a[selectedEventTypeId.value] ?? null;
  });

  const clusters = computed(() => analysis.value?.clusters ?? []);

  // ✅ null/undefined 방어 + 타입 안전
  const selectedCluster = computed<MorphologyCluster | null>(() => {
    const list = clusters.value;
    if (!list.length) return null;

    const found = list.find((c) => c.cluster_id === selectedClusterId.value);
    return found ?? list[0] ?? null;
  });

  /** ✅ 핵심: 현재 bundle/analyses 기준으로 "타입/클러스터" 기본값 보정 */
  function ensureDefaults() {
    const avail = availableEventTypes.value;

    const firstType = avail[0];
    if (firstType) {
      if (!avail.some((t) => t === selectedEventTypeId.value)) {
        selectedEventTypeId.value = firstType;
      }
    } else {
      selectedEventTypeId.value = "AF";
    }

    const firstCluster =
      (bundle.value.analyses?.[selectedEventTypeId.value]?.clusters ?? [])[0];
    selectedClusterId.value = firstCluster?.cluster_id ?? "C1";
  }

  watch(
    () => bundle.value.analyses,
    () => ensureDefaults(),
    { immediate: true, deep: true }
  );

  /** ✅ 탭 클릭 */
  function selectEventType(eventTypeId: MorphologyEventTypeId) {
    const avail = availableEventTypes.value;

    const next: MorphologyEventTypeId =
      bundle.value.analyses?.[eventTypeId] ? eventTypeId : (avail[0] ?? "AF");

    selectedEventTypeId.value = next;

    const firstCluster = bundle.value.analyses?.[next]?.clusters?.[0];
    selectedClusterId.value = firstCluster?.cluster_id ?? "C1";
  }

  /** ✅ 클러스터 클릭 */
  function selectCluster(clusterId: string) {
    selectedClusterId.value = clusterId;
  }

  // ----------------------------
  // ✅ 아래 3개: 빨간줄 해결용 액션 최종본
  // ----------------------------

  /** ✅ 모든 클러스터 일괄 승인 */
  function approveAllClusters() {
    const a = bundle.value.analyses?.[selectedEventTypeId.value];
    if (!a) return;

    a.clusters = (a.clusters ?? []).map((c) => ({
      ...c,
      // ⬇️ 너 타입에 approved 필드 없으면 types/morphology.ts에 추가하거나 키를 맞춰줘
      approved: true,
    })) as any;
  }

  /** ✅ 선택 클러스터 수동 검토 대상으로 표시 */
  function markForManualReview() {
    const a = bundle.value.analyses?.[selectedEventTypeId.value];
    if (!a) return;

    const targetId = selectedClusterId.value;

    a.clusters = (a.clusters ?? []).map((c) => {
      if (c.cluster_id !== targetId) return c;
      return {
        ...c,
        // ⬇️ 너 타입에 manual_review(또는 manualReview 등) 없으면 키만 맞춰줘
        manual_review: true,
      };
    }) as any;
  }

  /** ✅ 현재 선택된 타입의 분석/세그먼트 데이터 JSON으로 내보내기 */
  function exportSegmentData() {
    const a = bundle.value.analyses?.[selectedEventTypeId.value];
    if (!a) return;

    const payload = {
      patient: bundle.value.patient,
      eventTypeId: selectedEventTypeId.value,
      analysis: a,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `morphology_${selectedEventTypeId.value}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return {
    // data
    bundle,
    patient,

    // tabs/state
    availableEventTypes,
    selectedEventTypeId,
    selectedClusterId,

    // derived
    analysis,
    clusters,
    selectedCluster,

    // actions
    ensureDefaults,
    selectEventType,
    selectCluster,

    // ✅ 추가(빨간줄 해결)
    approveAllClusters,
    exportSegmentData,
    markForManualReview,
  };
});
