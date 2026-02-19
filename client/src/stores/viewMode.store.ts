import { defineStore } from "pinia";
import { ref } from "vue";
import type { EventTypeId, MorphologyEventTypeId } from "../types/morphology";
import { useMorphologyStore } from "./useMorphologyStore";

export type ViewMode = "ANALYSIS_24H" | "MORPHOLOGY" | "EVENT_DETAIL";

function isMorphType(t: EventTypeId): t is MorphologyEventTypeId {
  return t === "AF" || t === "PAC" || t === "PVC" || t === "Pause";
}

export const useViewModeStore = defineStore("viewMode", () => {
  const viewMode = ref<ViewMode>("ANALYSIS_24H");

  // ✅ 9개 클릭했을 때 어떤 타입이 선택됐는지 기억(24h/상세 공용)
  const focusEventTypeId = ref<EventTypeId | null>(null);

  function openMorphology(eventTypeId?: EventTypeId) {
    viewMode.value = "MORPHOLOGY";
    focusEventTypeId.value = eventTypeId ?? null;

    const morph = useMorphologyStore();

    if (eventTypeId && isMorphType(eventTypeId)) {
      morph.selectEventType(eventTypeId);
    } else {
      morph.ensureDefaults();
    }
  }

  // ✅ Morphology 대상 아닌 타입 클릭 시(Brady/Tachy/Noise/Artifact/Baseline)
  function openEventDetail(eventTypeId: EventTypeId) {
    focusEventTypeId.value = eventTypeId;
    viewMode.value = "EVENT_DETAIL";
  }

  function backTo24h() {
    viewMode.value = "ANALYSIS_24H";
  }

  return { viewMode, focusEventTypeId, openMorphology, openEventDetail, backTo24h };
});
