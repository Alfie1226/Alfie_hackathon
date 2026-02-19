import type { PatientAnalysisBundle } from "../types/morphology";

// ---- helpers (wave generators)
function waveOUTLIER(): number[] {
  return [0, 0, 1, 4, 9, 15, 10, 3, -5, -12, -20, -12, -4, 0, 2, 4, 6, 5, 3, 2, 1, 0, 0, 0];
}
function waveAF(): number[] {
  // pretend irregular baseline + small f-waves
  return [0, 1, 0, 2, 1, 0, 1, 3, 1, 0, 1, 2, 1, 0, 1, 2, 0, 1, 0, 1, 0, 1, 0, 0];
}
function wavePAUSE(): number[] {
  // flat with small artifact
  return [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}
function wavePVC(): number[] {
  // single ectopic spike then settle
  return [0, 0, 0, 1, 2, 3, 10, 6, 2, -3, -8, -4, -1, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0];
}

// ✅ PAC 더미 파형(가볍게 변형)
function wavePAC(): number[] {
  // AF 파형을 살짝 변형(더미)
  return waveAF().map((v, i) => (i === 5 ? v + 2 : i === 6 ? v + 1 : v));
}

export const MOCK_BUNDLE: PatientAnalysisBundle = {
  patient: {
    patient_id: "PT_001",
    name: "이영희",
    sex: "F",
    age: 65,
    dob: "1958-01-01",
    duration_label: "24h 10m",
    recorded_at: "2025-02-10",
    risk_badge: "위험",

    // ✅ 9개 이벤트 카운트 (좌측 칩용)
    counts: {
      AF: 3,
      PAC: 1,
      PVC: 234,
      Pause: 2,

      Bradycardia: 4,
      Tachycardia: 6,

      Noise: 2,
      Artifact: 1,
      "Baseline Wander": 3,
    },
  },

  analyses: {
    AF: {
      event_type_id: "AF",
      title_en: "Atrial Fibrillation",
      title_ko: "형태학적 분석",
      summary: {
        total_events: 3,
        clusters_detected: 2,
        outliers: 0,
        morphology_match_pct: 91,
        ai_overview:
          "AF 의심 이벤트가 소수 감지되었습니다. RR 간격 불규칙성과 기저선의 미세한 f-wave 양상이 관찰됩니다. 이벤트 수가 적어 임상적 해석은 추가 데이터와 함께 판단이 필요합니다.",
      },
      clusters: [
        {
          cluster_id: "C1",
          title: "클러스터 1 (주요)",
          subtitle: "2개 이벤트 · AF 패턴",
          qrs_ms_mean: 96,
          qrs_ms_sd: 5,
          confidence_pct: 90,
          label: "AF 패턴",
          wave_points: waveAF(),
          ai_description:
            "RR 변동성이 크고 P파가 명확하지 않은 패턴을 보입니다. 기저선의 작은 진동이 관찰되어 AF 가능성이 있습니다. 단, 단일리드 및 이벤트 수가 적어 확정 진단은 제한적입니다.",
        },
        {
          cluster_id: "C2",
          title: "클러스터 2",
          subtitle: "1개 이벤트 · 기타",
          qrs_ms_mean: 92,
          qrs_ms_sd: 4,
          confidence_pct: 86,
          label: "기타",
          wave_points: waveAF().map((v, i) => (i % 5 === 0 ? v + 1 : v)),
          ai_description:
            "AF 의심과 유사하나 노이즈/전극 영향 가능성이 있습니다. 전후 구간 연속 파형으로 확인이 권장됩니다.",
        },
      ],
    },

    // ✅ PAC 분석 섹션 추가 (이게 있어야 PAC 클릭이 '진짜로' 전환됨)
    PAC: {
      event_type_id: "PAC",
      title_en: "Premature Atrial Contraction",
      title_ko: "형태학적 분석",
      summary: {
        total_events: 1,
        clusters_detected: 1,
        outliers: 0,
        morphology_match_pct: 87,
        ai_overview:
          "PAC 의심 이벤트가 소수 감지되었습니다. 단일 이벤트 기반이라 패턴 일반화에는 제한이 있으며 전후 구간 확인이 필요합니다.",
      },
      clusters: [
        {
          cluster_id: "C1",
          title: "클러스터 1 (주요)",
          subtitle: "1개 이벤트 · PAC 패턴",
          qrs_ms_mean: 94,
          qrs_ms_sd: 4,
          confidence_pct: 87,
          label: "PAC 패턴",
          wave_points: wavePAC(),
          ai_description:
            "PAC는 조기 심방흥분으로 인해 P파/PR 변화가 동반될 수 있으나 단일리드/더미 파형 기준으로 참고용입니다. 이벤트 주변 원시 파형 확인을 권장합니다.",
        },
      ],
    },

    Pause: {
      event_type_id: "Pause",
      title_en: "Pause",
      title_ko: "형태학적 분석",
      summary: {
        total_events: 2,
        clusters_detected: 1,
        outliers: 0,
        morphology_match_pct: 88,
        ai_overview:
          "Pause 이벤트로 분류된 구간입니다. 일정 시간 동안 유의미한 QRS가 관찰되지 않는 형태가 감지되었습니다. 노이즈/전극 탈락 가능성도 함께 확인이 필요합니다.",
      },
      clusters: [
        {
          cluster_id: "C1",
          title: "클러스터 1 (주요)",
          subtitle: "2개 이벤트 · Pause",
          qrs_ms_mean: 0,
          qrs_ms_sd: 0,
          confidence_pct: 88,
          label: "Pause",
          wave_points: wavePAUSE(),
          ai_description:
            "기저선이 평탄하며 QRS가 관찰되지 않는 구간으로 분류됩니다. 실제 pause인지 또는 전극 접촉 문제인지, 해당 시점의 원시 파형/다른 채널(가능 시) 확인을 권장합니다.",
        },
      ],
    },

    PVC: {
      event_type_id: "PVC",
      title_en: "Premature Ventricular Contraction",
      title_ko: "형태학적 분석",
      summary: {
        total_events: 234,
        clusters_detected: 3,
        outliers: 6,
        morphology_match_pct: 89,
        ai_overview:
          "PVC 이벤트가 다수 감지되었습니다. 형태가 비교적 일관된 주 클러스터가 있으며, 일부는 형태 변형/노이즈로 이상치로 분류되었습니다. 대표 형태 위주로 빠른 검토가 가능합니다.",
      },
      clusters: [
        {
          cluster_id: "C1",
          title: "클러스터 1 (주요)",
          subtitle: "180개 이벤트 · PVC",
          qrs_ms_mean: 130,
          qrs_ms_sd: 12,
          confidence_pct: 93,
          label: "PVC",
          wave_points: wavePVC(),
          ai_description:
            "대표적인 PVC 형태로 보이는 넓은 QRS와 보상성 휴지기 양상을 가정한 더미 파형입니다. 이벤트 수가 많아 대표 형태를 기준으로 일괄 검토가 가능합니다.",
        },
        {
          cluster_id: "C2",
          title: "클러스터 2",
          subtitle: "48개 이벤트 · PVC",
          qrs_ms_mean: 124,
          qrs_ms_sd: 10,
          confidence_pct: 90,
          label: "PVC",
          wave_points: wavePVC().map((v) => v * 0.8),
          ai_description:
            "진폭이 낮은 PVC 변형 형태로 분류됩니다. 전극 위치/체형/노이즈에 따라 진폭 차이가 날 수 있습니다.",
        },
        {
          cluster_id: "OUTLIER",
          title: "이상치",
          subtitle: "6개 이벤트 · 기타",
          qrs_ms_mean: 150,
          qrs_ms_sd: 22,
          confidence_pct: 72,
          label: "기타",
          wave_points: waveOUTLIER().map((v) => v * 0.7),
          ai_description:
            "비정형 또는 노이즈 영향 가능성이 있는 이벤트입니다. 이상치는 개별 확인을 권장합니다.",
          is_outlier: true,
        },
      ],
    },
  },
};
