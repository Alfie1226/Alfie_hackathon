import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { EventTypeId, PatientAnalysisBundle, MorphologyCluster } from "../types/morphology";
import { MOCK_BUNDLE } from "../mocks/morphology.mock";

export const useMorphologyStore = defineStore("morphology", () => {
  // mock bundle (later: replace with API response)
  const bundle = ref<PatientAnalysisBundle>(MOCK_BUNDLE);

  // ✅ VT 제거 완료 전제: EventTypeId = "AF" | "PAUSE" | "PVC"
  const selectedEventTypeId = ref<EventTypeId>("AF");
  const selectedClusterId = ref<string>("C1");

  // derived
  const patient = computed(() => bundle.value.patient);

  // ✅ 방어: analyses 키가 바뀌거나 비어도 터지지 않게
  const analysis = computed(() => bundle.value.analyses[selectedEventTypeId.value]);
  const clusters = computed(() => analysis.value?.clusters ?? []);

  // ✅ null 가능 처리 (빈 배열 방어)
  const selectedCluster = computed<MorphologyCluster | null>(() => {
    const list = clusters.value;
    const found = list.find((c) => c.cluster_id === selectedClusterId.value);
    return found ?? list[0] ?? null;
  });

  const modeLabel = computed(() => "패턴 오버레이 스캐너");

  function selectEventType(eventTypeId: EventTypeId) {
    selectedEventTypeId.value = eventTypeId;

    const next = bundle.value.analyses[eventTypeId]?.clusters?.[0];
    selectedClusterId.value = next?.cluster_id ?? "C1";
  }

  function selectCluster(clusterId: string) {
    selectedClusterId.value = clusterId;
  }

  // actions (mock)
  function approveAllClusters() {
    console.log("[mock] approve all clusters:", selectedEventTypeId.value);
  }

  function exportSegmentData() {
    console.log("[mock] export segments:", selectedEventTypeId.value, selectedClusterId.value);
  }

  function markForManualReview() {
    console.log("[mock] mark manual review:", selectedEventTypeId.value, selectedClusterId.value);
  }

  return {
    bundle,
    patient,
    selectedEventTypeId,
    selectedClusterId,
    analysis,
    clusters,
    selectedCluster,
    modeLabel,
    selectEventType,
    selectCluster,
    approveAllClusters,
    exportSegmentData,
    markForManualReview,
  };
});
