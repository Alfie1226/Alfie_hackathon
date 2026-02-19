import { defineStore } from "pinia";
import { ref } from "vue";
import type { EventTypeId } from "../types/morphology";
import { useMorphologyStore } from "./useMorphologyStore";

export type ViewMode = "ANALYSIS_24H" | "MORPHOLOGY";

export const useViewModeStore = defineStore("viewMode", () => {
  const viewMode = ref<ViewMode>("ANALYSIS_24H");

  function openMorphology(eventTypeId?: EventTypeId) {
    viewMode.value = "MORPHOLOGY";

    // (옵션) VT/AF/PVC/Pause 눌렀던 타입 그대로 morphology에서도 반영
    if (eventTypeId) {
      const morph = useMorphologyStore();
      morph.selectEventType(eventTypeId);
    }
  }

  function backTo24h() {
    viewMode.value = "ANALYSIS_24H";
  }

  return { viewMode, openMorphology, backTo24h };
});
