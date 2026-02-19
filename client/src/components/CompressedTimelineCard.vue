<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-5">
    <!-- ===== Header ===== -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <div class="text-[15px] font-semibold text-slate-900">압축 24시간 ECG 타임라인</div>
      </div>

      <!-- Legend (Figma 느낌) -->
      <div class="flex flex-wrap items-center gap-4 text-xs text-slate-700">
        <div class="flex items-center gap-2">
          <span class="h-3 w-3 rounded-[4px] border-2 border-orange-400 bg-white"></span>
          <span>AF 에피소드 (중위험)</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="h-3 w-3 rounded-[4px] border-2 border-blue-500 bg-white"></span>
          <span>PVC 군집 (저위험)</span>
        </div>
      </div>
    </div>

    <!-- ===== Timeline ===== -->
    <div class="mt-4">
      <div class="relative h-44 w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
        <!-- Grid (굵은) -->
        <div
          class="absolute inset-0 pointer-events-none"
          style="
            background-image: linear-gradient(#e5e7eb 1px, transparent 1px),
              linear-gradient(90deg, #e5e7eb 1px, transparent 1px);
            background-size: 18px 18px;
            opacity: 0.35;
          "
        ></div>

        <!-- Grid (잔) -->
        <div
          class="absolute inset-0 pointer-events-none"
          style="
            background-image: linear-gradient(#f1f5f9 1px, transparent 1px),
              linear-gradient(90deg, #f1f5f9 1px, transparent 1px);
            background-size: 6px 6px;
            opacity: 0.55;
          "
        ></div>

        <!-- Speed/Scale (우측 상단) -->
        <div class="absolute right-3 top-2 z-30 text-[10px] text-slate-400 text-right">
          <div>Speed 25 mm/s</div>
          <div>Scale 10 mm/mV</div>
        </div>

        <!-- Segments -->
        <div class="absolute inset-0 z-10">
          <div
            v-for="seg in timelineSegments"
            :key="seg.key"
            class="absolute bottom-0 top-0"
            :style="{ left: seg.leftPct + '%', width: seg.widthPct + '%' }"
            :class="[
              seg.fillClass,
              'border-l border-r',
              seg.borderClass,
              isActive(seg.key) ? seg.activeClass : '',
            ]"
            :title="seg.tooltip"
          ></div>
        </div>

        <!-- ECG line (선 위 hover) -->
        <svg
          class="absolute inset-0 z-20 h-full w-full"
          viewBox="0 0 1000 200"
          preserveAspectRatio="none"
          @mousemove="onMove"
          @mouseleave="onLeave"
        >
          <!-- hit area -->
          <path :d="ECG_PATH" fill="none" stroke="transparent" stroke-width="16" />
          <!-- visible -->
          <path :d="ECG_PATH" fill="none" stroke="#111827" stroke-width="2" />
        </svg>

        <!-- X ticks -->
        <div
          class="absolute bottom-2 left-3 right-3 z-30 flex justify-between text-[10px] text-slate-500 pointer-events-none"
        >
          <span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>24:00</span>
        </div>
      </div>

      <!-- Event summary (Figma) -->
      <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div class="text-sm font-semibold text-slate-900">이벤트 요약</div>
        <div class="mt-1 text-sm text-slate-700">
          <template v-if="activeEvent">
            {{ activeEvent.summary_text || activeEvent.fallback_summary }}
          </template>
          <template v-else>
            타임라인의 선(ECG) 위에 마우스를 올리면 해당 구간의 이벤트 요약이 표시됩니다.
          </template>
        </div>
      </div>
    </div>

    <!-- ===== AI priority list (Figma 왼쪽 스타일) ===== -->
    <section class="mt-6 rounded-2xl border border-slate-200 bg-white">
      <div class="px-5 pt-5">
        <div class="text-base font-semibold text-slate-900">AI 우선순위별 이벤트 목록</div>
        <div class="mt-1 text-sm text-slate-500">이벤트를 클릭하여 상세 파형 분석 보기</div>
      </div>

      <div class="mt-4 divide-y divide-slate-200">
        <button
          v-for="row in priorityRows"
          :key="row.key"
          type="button"
          class="w-full px-5 py-4 text-left transition"
          :class="isSelected(row.key) ? 'bg-slate-50' : 'bg-white hover:bg-slate-50/60'"
          @click="selectEvent(row.key)"
        >
          <div class="flex items-center justify-between gap-4">
            <!-- Left main -->
            <div class="min-w-0">
              <div class="flex items-center gap-3">
                <div class="text-sm font-semibold text-slate-900 tabular-nums">
                  {{ row.timeText }}
                </div>

                <span
                  class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold"
                  :class="row.badgeClass"
                >
                  {{ row.shortLabel }}
                </span>

                <div class="text-sm text-slate-600 tabular-nums">
                  {{ row.durationText }}
                  <span v-if="row.hrText"> · {{ row.hrText }}</span>
                </div>
              </div>

              <div class="mt-1 text-sm text-slate-600 line-clamp-1">
                {{ row.subtitle }}
              </div>
            </div>

            <!-- Right action -->
            <div class="shrink-0 text-sm font-medium text-violet-600">
              파형 보기 →
            </div>
          </div>
        </button>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useWorkspaceStore } from "../stores/workspace.store";

const store = useWorkspaceStore();
const TOTAL_SEC = 24 * 60 * 60;

/** 임시 ECG path (표시용) — 실제 데이터 붙이면 교체 */
const ECG_PATH =
  "M0,120 L80,120 " +
  "L110,118 L130,115 L150,120 " +
  "L175,120 L185,95 L195,150 L210,120 " +
  "L240,120 L270,112 L310,120 " +
  "L380,120 " +
  "L410,118 L430,115 L450,120 " +
  "L475,120 L485,95 L495,150 L510,120 " +
  "L540,120 L570,112 L610,120 " +
  "L680,120 " +
  "L710,118 L730,115 L750,120 " +
  "L775,120 L785,95 L795,150 L810,120 " +
  "L840,120 L870,112 L910,120 " +
  "L1000,120";

type EventLike = {
  _id?: string;
  event_type_id: string;
  start_sec: number;
  end_sec: number;
  duration_sec?: number;

  start_at?: string; // ISO or text
  summary_text?: string; // 서버/AI가 만든 문장(권장)

  // 옵션 필드(있으면 피그마처럼 풍부하게)
  hr_bpm?: number;
  hr_min?: number;
  hr_max?: number;
  run_beats?: number;
  qrs_ms?: number;
  morphology?: string;
};

type Seg = {
  key: string;
  leftPct: number;
  widthPct: number;
  startPct: number;
  endPct: number;
  fillClass: string;
  borderClass: string;
  activeClass: string;
  tooltip: string;
  eventRef: EventLike;
};

type ActiveEvent = EventLike & { fallback_summary: string };

type Row = {
  key: string;
  timeText: string;
  shortLabel: string;
  badgeClass: string;
  durationText: string;
  hrText: string;
  subtitle: string;
  riskRank: number;
  start_sec: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function secToHHMM(sec: number) {
  const s = Math.max(0, Math.min(TOTAL_SEC, Math.floor(sec)));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(hh)}:${pad(mm)}`;
}

function secToHHMMSS(sec: number) {
  const s = Math.max(0, Math.min(TOTAL_SEC, Math.floor(sec)));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
}

/** ✅ VT 완전 제거용: 이벤트가 VT인지 판별 */
function isVT(e: EventLike) {
  const id = (e.event_type_id || "").toUpperCase();
  // ET_VT / VT / ... 등 어떤 형태든 포함되면 제거
  return id.includes("VT");
}

function styleByType(eventTypeId: string) {
  const id = (eventTypeId || "").toUpperCase();

  // PAUSE (고위험)
  if (id.includes("PAUSE")) {
    return {
      label: "PAUSE",
      fill: "bg-red-100/55",
      border: "border-red-200/80",
      active: "bg-red-200/70",
      badge: "bg-red-50 text-red-700 ring-1 ring-red-200",
      riskRank: 3,
    };
  }

  // ✅ VT 분기 제거 (이 컴포넌트에서는 VT 자체를 안 씀)

  if (id.includes("AF")) {
    return {
      label: "AF",
      fill: "bg-orange-100/55",
      border: "border-orange-200/80",
      active: "bg-orange-200/70",
      badge: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
      riskRank: 2,
    };
  }
  if (id.includes("PVC")) {
    return {
      label: "PVC",
      fill: "bg-blue-100/45",
      border: "border-blue-200/80",
      active: "bg-blue-200/65",
      badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
      riskRank: 1,
    };
  }
  return {
    label: "EVENT",
    fill: "bg-slate-100/50",
    border: "border-slate-200/80",
    active: "bg-slate-200/60",
    badge: "bg-slate-50 text-slate-700 ring-1 ring-slate-200",
    riskRank: 0,
  };
}

function buildFallbackSummary(e: EventLike) {
  const st = styleByType(e.event_type_id);
  const t = secToHHMM(e.start_sec);
  const dur = Math.max(0, (e.end_sec ?? e.start_sec) - e.start_sec);
  const d = Math.round(e.duration_sec ?? dur);

  // AF
  if (e.event_type_id === "ET_AF") {
    const avgHr = (e as any)?.metrics?.avg_hr;
    return `AI 분석 결과, ${t}부터 ${d}초간 심방세동(AF) 에피소드가 관찰되었습니다.${
      avgHr ? ` 평균 심박수 ${avgHr} bpm.` : ""
    } 임상적 상관관계 평가 및 항응고 치료 적응증 검토가 권장됩니다.`;
  }

  // PVC
  if (e.event_type_id === "ET_PVC") {
    const beats = (e as any)?.metrics?.beats;
    return `AI 분석 결과, ${t}에 조기 심실수축(PVC)이 감지되었습니다.${
      beats ? ` ${beats}회 발생.` : ""
    } 단발성 소견으로 현재 위험도는 낮게 평가됩니다.`;
  }

  // PAUSE
  if (e.event_type_id === "ET_PAUSE") {
    return `AI 분석 결과, ${t}에 ${d}초간 R-R 간격 지연(Pause)이 관찰되었습니다. 고위험 이벤트로 분류되며 즉각적인 전문의 검토가 필요합니다.`;
  }

  return `${st.label} 에피소드: ${t}에 감지됨. 지속시간 ${d}s.`;
}

function durationText(e: EventLike) {
  const dur = Math.max(0, e.duration_sec ?? (e.end_sec - e.start_sec));
  if (dur >= 60) {
    const m = Math.floor(dur / 60);
    const s = Math.floor(dur % 60);
    return `${m}분 ${s}초`;
  }
  return `${Math.round(dur)}초`;
}

function hrText(e: EventLike) {
  if (Number.isFinite(e.hr_bpm)) return `${Math.round(e.hr_bpm as number)} bpm`;
  const min = e.hr_min,
    max = e.hr_max;
  if (Number.isFinite(min) && Number.isFinite(max)) return `${Math.round(min!)}–${Math.round(max!)} bpm`;
  return "";
}

function subtitleText(e: EventLike) {
  const parts: string[] = [];
  const id = (e.event_type_id || "").toUpperCase();

  // ✅ VT 분기 제거 (이 컴포넌트에서는 VT 자체를 안 씀)

  if (id.includes("AF")) {
    parts.push("발작성 AF");
    if (e.hr_min != null && e.hr_max != null) parts.push("빠른 심실 반응");
    return parts.join(", ");
  }

  if (id.includes("PVC")) {
    parts.push("이단맥 패턴");
    if (Number.isFinite(e.run_beats)) parts.push(`${Math.round(e.run_beats as number)}회 연속 PVC`);
    return parts.join(", ");
  }

  if (id.includes("PAUSE")) {
    parts.push("동정지");
    parts.push("회피 리듬 없음");
    return parts.join(", ");
  }

  return e.summary_text || "이벤트";
}

/** ===== Timeline segments ===== */
const timelineSegments = computed<Seg[]>(() => {
  const events = (store.currentEvents ?? []) as EventLike[];

  // ✅ 핵심: VT는 이 컴포넌트에서 완전히 제거
  return events
    .filter((e) => typeof e.start_sec === "number" && typeof e.end_sec === "number")
    .filter((e) => !isVT(e))
    .map((e) => {
      const start = clamp(e.start_sec, 0, TOTAL_SEC);
      const end = clamp(e.end_sec, 0, TOTAL_SEC);
      const dur = Math.max(0, end - start);

      const leftPct = (start / TOTAL_SEC) * 100;
      const rawWidth = (dur / TOTAL_SEC) * 100;
      const widthPct = Math.max(rawWidth, 1.2);

      const st = styleByType(e.event_type_id);
      const key = e._id ?? `${e.event_type_id}-${e.start_sec}-${e.end_sec}`;

      return {
        key,
        leftPct,
        widthPct,
        startPct: leftPct,
        endPct: leftPct + widthPct,
        fillClass: st.fill,
        borderClass: st.border,
        activeClass: st.active,
        tooltip: `${st.label} · ${durationText(e)} · ${e.start_at ?? secToHHMM(start)}`,
        eventRef: e,
      };
    })
    .sort((a, b) => a.leftPct - b.leftPct);
});

/** ===== Active selection (hover or click) ===== */
const hoveredKey = ref<string | null>(null);
const selectedKey = ref<string | null>(null);

function isSelected(key: string) {
  return selectedKey.value === key;
}
function isActive(key: string) {
  return hoveredKey.value === key || selectedKey.value === key;
}

const activeEvent = computed<ActiveEvent | null>(() => {
  const key = selectedKey.value || hoveredKey.value;
  if (!key) return null;
  const seg = timelineSegments.value.find((s) => s.key === key);
  if (!seg) return null;

  const e = seg.eventRef;
  return { ...e, fallback_summary: buildFallbackSummary(e) };
});

/** ===== Hover on ECG line ===== */
function onMove(ev: MouseEvent) {
  const svg = ev.currentTarget as SVGElement;
  const rect = svg.getBoundingClientRect();

  const x = clamp(ev.clientX - rect.left, 0, rect.width);
  const pct = rect.width ? x / rect.width : 0;
  const nowPct = pct * 100;

  const seg = timelineSegments.value.find((s) => nowPct >= s.startPct && nowPct <= s.endPct);
  hoveredKey.value = seg ? seg.key : null;
}
function onLeave() {
  hoveredKey.value = null;
}

/** ===== Priority list rows ===== */
const priorityRows = computed<Row[]>(() => {
  const segs = timelineSegments.value;

  return segs
    .map((s) => {
      const e = s.eventRef;
      const st = styleByType(e.event_type_id);
      return {
        key: s.key,
        timeText: secToHHMMSS(e.start_sec),
        shortLabel: st.label,
        badgeClass: st.badge,
        durationText: durationText(e),
        hrText: hrText(e),
        subtitle: subtitleText(e),
        riskRank: st.riskRank,
        start_sec: e.start_sec,
      };
    })
    .sort((a, b) => b.riskRank - a.riskRank || a.start_sec - b.start_sec);
});

/** 리스트 클릭 = 선택(고정) */
function selectEvent(key: string) {
  selectedKey.value = key;
}
</script>
