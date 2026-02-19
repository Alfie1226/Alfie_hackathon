import type { EventType } from "../types/event_types";

export const EVENT_TYPES: EventType[] = [
  {
    _id: "ET_AF",
    event_name: "AF",
    default_risk: "mid",
    description: "Atrial Fibrillation",
    created_at: "2026-02-10T00:00:00Z",
  },
  {
    _id: "ET_PVC",
    event_name: "PVC",
    default_risk: "low",
    description: "Premature Ventricular Contraction",
    created_at: "2026-02-10T00:00:00Z",
  },
  {
    _id: "ET_PAUSE",
    event_name: "PAUSE",
    default_risk: "high",
    description: "Pause / Asystole-like episode",
    created_at: "2026-02-10T00:00:00Z",
  },
];