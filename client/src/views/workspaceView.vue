<template>
  <div class="h-screen w-screen bg-slate-50">
    <!-- Top Header -->
    <header class="h-14 px-4 border-b bg-white">
      <div class="h-full grid grid-cols-3 items-center">
        <div class="font-semibold">HeartScope</div>

        <div class="flex items-center justify-center gap-2">
          <div class="text-xs text-slate-500">현재 상태:</div>
          <span
            class="text-sm px-3 py-1 rounded-full border"
            :class="
              store.mode === 'DIAGNOSIS'
                ? 'bg-violet-50 text-violet-700 border-violet-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            "
          >
            {{ store.mode === "DIAGNOSIS" ? "진단모드" : "판독모드" }}
          </span>
        </div>

        <div class="flex items-center justify-end gap-2">
          <button
            v-if="store.viewMode !== 'ANALYSIS'"
            type="button"
            class="h-9 w-9 inline-flex items-center justify-center rounded-xl border bg-white hover:bg-slate-50"
            @click="store.closeReportBuilder()"
            title="분석으로"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <!-- ✅ 사용자만 유지 -->
          <button
            type="button"
            class="h-9 w-9 inline-flex items-center justify-center rounded-xl border bg-white hover:bg-slate-50"
            title="사용자"
            @click="onClickHeaderUser"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21a8 8 0 0 0-16 0" />
              <path d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- ✅ LEFT / CENTER / RIGHT -->
    <div
      class="h-[calc(100vh-56px)] grid"
      :style="{
        gridTemplateColumns: isLeftCollapsed ? '0px minmax(0,1fr) 360px' : '320px minmax(0,1fr) 360px',
      }"
    >
      <!-- Left -->
      <aside
        class="bg-white overflow-y-auto"
        :class="isLeftCollapsed ? 'w-0 overflow-hidden border-r-0 pointer-events-none select-none' : 'border-r'"
      >
        <div class="px-4 pt-4 pb-2">
          <div class="text-sm font-semibold text-slate-900">환자 대기열</div>
        </div>

        <div class="px-4 pb-4">
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 21l-4.3-4.3" />
                <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
              </svg>
            </span>
            <input
              v-model="q"
              class="w-full pl-9 pr-3 py-2.5 text-sm border rounded-xl bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
              placeholder="이름, ID, 날짜로 검색..."
            />
          </div>
        </div>

        <div class="px-4 pb-3">
          <div class="text-xs font-semibold text-slate-600 mb-2">정렬 기준</div>
          <div class="relative">
            <select
              v-model="sortKey"
              class="w-full appearance-none px-3 py-2.5 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
            >
              <option value="RISK">위험도순</option>
              <option value="NAME">이름순</option>
              <option value="DATE">날짜순</option>
            </select>
            <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </div>
        </div>

        <div class="px-2 pb-24">
          <button
            v-for="p in filteredAndSortedPatients"
            :key="p._id"
            class="w-full text-left px-3 py-3 rounded-xl border mb-2 hover:bg-slate-50"
            :class="p._id === store.selectedPatientId ? 'border-violet-600 bg-violet-50/40' : 'border-slate-200 bg-white'"
            @click="store.selectPatient(p._id)"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 w-full">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="inline-flex h-2 w-2 rounded-full" :class="riskDotClass(getRiskLevel(p))"></span>
                    <div class="font-semibold text-slate-900 truncate">
                      {{ p.name }}
                      <span class="font-medium text-slate-500">
                        ({{ genderShort(p) }}{{ ageText(p) ? "/" + ageText(p) : "" }})
                      </span>
                    </div>
                  </div>

                  <span
                    class="shrink-0 inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold border"
                    :class="riskBadgeClass(getRiskLevel(p))"
                  >
                    {{ riskLabel(getRiskLevel(p)) }}
                  </span>
                </div>

                <div class="text-xs text-slate-500 mt-1 truncate">
                  {{ patientIdText(p) }}
                </div>

                <div class="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <span class="inline-flex items-center gap-1">
                    <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 8v5l3 2" />
                      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    {{ sessionDurationText(p) }}
                  </span>
                  <span class="text-slate-300">|</span>
                  <span>{{ sessionDateText(p) }}</span>
                </div>

                <!-- ✅ 이벤트 칩: Morphology 대상 4개(AF/PAC/PVC/Pause)만 -->
                <div class="mt-2 flex flex-wrap gap-2">
                  <template v-for="chip in eventChips(p)" :key="chip.key">
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs border hover:brightness-[0.98]"
                      :class="chipClass(chip.key)"
                      @click.stop="onClickEventChip(chip.key)"
                      :disabled="store.viewMode !== 'ANALYSIS'"
                      :title="store.viewMode !== 'ANALYSIS' ? '리포트 작성 중에는 이동할 수 없습니다' : '형태학적 분석으로 보기'"
                    >
                      <span class="leading-none">{{ chip.label }}</span>
                      <span class="font-semibold">×{{ chip.count }}</span>
                    </button>
                  </template>
                </div>

                <!-- ✅ 선택된 환자만 '과거 기록 보기' 노출 -->
                <div v-if="p._id === store.selectedPatientId" class="mt-3">
                  <button
                    type="button"
                    class="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center gap-2"
                    @click.stop="openPastHistory(p)"
                  >
                    <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 8v5l3 2" />
                      <path d="M3 12a9 9 0 1 0 3-6.7" />
                      <path d="M3 4v5h5" />
                    </svg>
                    과거 기록 보기
                  </button>
                </div>
              </div>
            </div>
          </button>
        </div>

        <div class="sticky bottom-0 border-t bg-white px-4 py-3">
          <div class="flex items-center justify-between text-xs text-slate-600">
            <div>전체 환자:</div>
            <div class="font-semibold text-slate-900">{{ store.patients.length }}</div>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-600 mt-1">
            <div>검토 대기:</div>
            <div class="font-semibold text-red-600">{{ reviewPendingCount }}</div>
          </div>
        </div>
      </aside>

      <!-- Center -->
      <main class="relative overflow-y-auto bg-slate-50 pl-[18px]">
        <!-- 토글 버튼: 센터 왼쪽 경계선에 붙여서 표시 -->
        <button
          type="button"
          class="absolute top-1/2 -translate-y-1/2 left-0 translate-x-[1px] z-40
                 h-7 w-7 rounded-md border border-slate-300 bg-white shadow-sm hover:bg-slate-50"
          :title="isLeftCollapsed ? '왼쪽 패널 펼치기' : '왼쪽 패널 접기'"
          @click="toggleLeft()"
        >
          <svg v-if="isLeftCollapsed" viewBox="0 0 24 24" class="h-4 w-4 text-slate-700 mx-auto" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
          <svg v-else viewBox="0 0 24 24" class="h-4 w-4 text-slate-700 mx-auto" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <!-- ✅ 센터 스위칭 -->
        <template v-if="store.viewMode === 'ANALYSIS'">
          <template v-if="vm.viewMode === 'ANALYSIS_24H'">
            <div class="p-4">
              <div class="flex items-start justify-between">
                <div>
                  <div class="text-xl font-semibold">24시간 ECG 분석</div>
                  <div class="text-sm text-slate-500 mt-1">
                    환자: {{ store.selectedPatient?.name || "-" }}
                    · 세션: {{ store.currentSession?._id || "-" }}
                  </div>
                </div>

                <div class="text-sm text-slate-500">
                  분석 상태:
                  <span class="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    AI 처리 완료
                  </span>
                </div>
              </div>

              <!-- ✅ 1️⃣ 상단 6개 카드 -->
              <div class="mt-6 grid grid-cols-6 gap-4">
                <div class="bg-white rounded-xl border p-4 shadow-sm">
                  <div class="text-xs text-slate-500">평균 HR</div>
                  <div class="text-2xl font-semibold mt-1">72</div>
                  <div class="text-xs text-slate-400">bpm</div>
                </div>

                <div class="bg-white rounded-xl border p-4 shadow-sm">
                  <div class="text-xs text-slate-500">HR 범위</div>
                  <div class="text-2xl font-semibold mt-1">45-142</div>
                  <div class="text-xs text-slate-400">bpm</div>
                </div>

                <div class="bg-white rounded-xl border p-4 shadow-sm">
                  <div class="text-xs text-slate-500">PR 간격</div>
                  <div class="text-2xl font-semibold mt-1">168</div>
                  <div class="text-xs text-slate-400">ms</div>
                </div>

                <div class="bg-white rounded-xl border p-4 shadow-sm">
                  <div class="text-xs text-slate-500">QRS 폭</div>
                  <div class="text-2xl font-semibold mt-1">92</div>
                  <div class="text-xs text-slate-400">ms</div>
                </div>

                <div class="bg-white rounded-xl border p-4 shadow-sm">
                  <div class="text-xs text-slate-500">QTc</div>
                  <div class="text-2xl font-semibold mt-1">438</div>
                  <div class="text-xs text-slate-400">ms</div>
                </div>

                <div class="bg-white rounded-xl border p-4 shadow-sm">
                  <div class="text-xs text-slate-500">AF 부담률</div>
                  <div class="text-2xl font-semibold mt-1 text-orange-500">2.3</div>
                  <div class="text-xs text-slate-400">%</div>
                </div>
              </div>

              <!-- ✅ 2️⃣ 고위험 임상 소견 -->
              <div class="mt-6 bg-red-50 border border-red-200 rounded-xl p-5">
                <div class="font-semibold text-red-600 mb-2">⚠ 고위험 임상 소견</div>
                <div class="text-sm text-red-600 leading-relaxed">
                  비지속성 심실빈맥 18회 에피소드 감지. 최대 심박수 168 bpm 기록.
                  최장 지속 시간 8.1초. 즉각적인 임상 검토가 권장됩니다.
                </div>
              </div>

              <CompressedTimelineCard class="mt-6" />
            </div>
          </template>

          <template v-else>
            <MorphologyAnalysisView />
          </template>
        </template>

        <template v-else>
          <ReportBuilderCenter />
        </template>
      </main>

      <!-- Right -->
      <template v-if="store.viewMode === 'ANALYSIS'">
        <ClinicalRecordPanel />
      </template>
      <template v-else>
        <ReportBuilderRight />
      </template>
    </div>

    <PastHistoryModal
      :open="pastOpen"
      :patientName="store.selectedPatient?.name ?? '-'"
      :patientChartNo="store.selectedPatient?.chart_no ?? store.selectedPatient?._id ?? '-'"
      :records="pastRecordsForSelected"
      @close="pastOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useWorkspaceStore } from "../stores/workspace.store";
import { useViewModeStore } from "../stores/viewMode.store";

import CompressedTimelineCard from "../components/CompressedTimelineCard.vue";
import ReportBuilderCenter from "../components/ReportBuilderCenter.vue";
import ReportBuilderRight from "../components/ReportBuilderRight.vue";
import ClinicalRecordPanel from "../components/ClinicalRecordPanel.vue";

import MorphologyAnalysisView from "../pages/MorphologyAnalysisView.vue";

import PastHistoryModal from "../components/PastHistoryModal.vue";
import { PAST_HISTORY } from "../mocks/pastHistory";

const store = useWorkspaceStore();
const vm = useViewModeStore();

const q = ref("");
const sortKey = ref<"RISK" | "NAME" | "DATE">("RISK");

/** ✅ LEFT 접기/펼치기 (애니메이션 없음) */
const isLeftCollapsed = ref(false);
function toggleLeft() {
  isLeftCollapsed.value = !isLeftCollapsed.value;
}

type Risk = "HIGH" | "MID" | "LOW";

function getRiskLevel(p: any): Risk {
  const v = (p?.risk_level || p?.risk || p?.severity) as any;
  if (v === "HIGH" || v === "MID" || v === "LOW") return v;

  const c = p?.counts || p?.events || {};
  const score =
    (Number(c?.VT) || 0) * 3 +
    (Number(c?.AF) || 0) * 2 +
    (Number(c?.Pause) || 0) * 2 +
    (Number(c?.PVC) || 0) * 1;

  if (score >= 20) return "HIGH";
  if (score >= 5) return "MID";
  return "LOW";
}

function riskLabel(r: Risk) {
  if (r === "HIGH") return "위험";
  if (r === "MID") return "주의";
  return "정상";
}

function riskDotClass(r: Risk) {
  if (r === "HIGH") return "bg-red-500";
  if (r === "MID") return "bg-orange-500";
  return "bg-emerald-500";
}

function riskBadgeClass(r: Risk) {
  if (r === "HIGH") return "bg-red-50 text-red-700 border-red-200";
  if (r === "MID") return "bg-orange-50 text-orange-700 border-orange-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

function genderShort(p: any) {
  const g = (p?.gender || "").toString().toLowerCase();
  if (g.startsWith("m") || g.includes("남")) return "M";
  if (g.startsWith("f") || g.includes("여")) return "F";
  return "-";
}

/** ✅ 만 나이 계산(생년월일 기반) */
function ageText(p: any) {
  if (typeof p?.age === "number") return String(p.age);

  const birth = p?.birth_date ?? p?.birth ?? p?.dob ?? p?.birthDate ?? p?.birthdate;
  if (!birth) return "";

  const s = String(birth).trim();
  let y: number, m: number, d: number;

  const m1 = s.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/);
  const m2 = s.match(/^(\d{4})(\d{2})(\d{2})$/);

  if (m1) {
    y = Number(m1[1]);
    m = Number(m1[2]);
    d = Number(m1[3]);
  } else if (m2) {
    y = Number(m2[1]);
    m = Number(m2[2]);
    d = Number(m2[3]);
  } else {
    return "";
  }

  const today = new Date();
  let age = today.getFullYear() - y;

  const curM = today.getMonth() + 1;
  const curD = today.getDate();
  if (curM < m || (curM === m && curD < d)) age -= 1;

  if (age < 0 || age > 130) return "";
  return String(age);
}

function patientIdText(p: any) {
  return p?.chart_no || p?._id || "-";
}

function sessionDurationText(p: any) {
  return p?.session?.duration_text || p?.duration_text || "24h 00m";
}

function sessionDateText(p: any) {
  return p?.session?.date || p?.date || "";
}

/** ✅ 칩 컬러: Morphology 대상 4개만 */
function chipClass(key: string) {
  if (key === "AF") return "bg-orange-50 text-orange-700 border-orange-200";
  if (key === "PAC") return "bg-violet-50 text-violet-700 border-violet-200";
  if (key === "Pause") return "bg-amber-50 text-amber-800 border-amber-200";
  if (key === "PVC") return "bg-sky-50 text-sky-700 border-sky-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

/** ✅ 이벤트 칩: Morphology 대상 4개(AF/PAC/PVC/Pause)만 만들고, 0이면 숨김 */
function eventChips(p: any) {
  const c = p?.counts || p?.events || p?.stats || {};
  const chips = [
    { key: "AF" as const, label: "AF", count: Number(c?.AF) || 0 },
    { key: "PAC" as const, label: "PAC", count: Number(c?.PAC) || 0 },
    { key: "PVC" as const, label: "PVC", count: Number(c?.PVC) || 0 },
    { key: "Pause" as const, label: "Pause", count: Number(c?.Pause) || 0 },
  ];
  return chips.filter((x) => x.count > 0);
}

/** ✅ 이벤트 칩 클릭 → morphology로 이동(센터만) + 타입 선택 */
function onClickEventChip(key: "AF" | "PAC" | "PVC" | "Pause") {
  if (store.viewMode !== "ANALYSIS") return;
  vm.openMorphology(key as any);
}

const filteredAndSortedPatients = computed(() => {
  const keyword = q.value.trim().toLowerCase();
  let arr = [...store.patients];

  if (keyword) {
    arr = arr.filter((p: any) => {
      const hay = [p?.name, p?.chart_no, p?._id, p?.birth_date, p?.session?.date, p?.date]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(keyword);
    });
  }

  if (sortKey.value === "NAME") {
    arr.sort((a: any, b: any) => (a?.name || "").localeCompare(b?.name || ""));
  } else if (sortKey.value === "DATE") {
    arr.sort((a: any, b: any) =>
      (b?.session?.date || b?.date || "").localeCompare(a?.session?.date || a?.date || "")
    );
  } else {
    const rank = (r: Risk) => (r === "HIGH" ? 3 : r === "MID" ? 2 : 1);
    arr.sort((a: any, b: any) => rank(getRiskLevel(b)) - rank(getRiskLevel(a)));
  }

  return arr;
});

/** ✅ 검토대기: reviewed=false인 환자 수 */
const reviewPendingCount = computed(() => {
  return store.patients.filter((p: any) => !p?.reviewed).length;
});

function onClickHeaderUser() {
  console.log("헤더 사용자 클릭");
}

/** ✅ 과거 기록 모달 */
const pastOpen = ref(false);

const pastRecordsForSelected = computed(() => {
  const pid = store.selectedPatientId;
  return PAST_HISTORY.filter((x: any) => x.patient_id === pid);
});

function openPastHistory(p: any) {
  store.selectPatient(p._id);
  pastOpen.value = true;
}
</script>
