import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Text as SvgText,
  Line,
} from "react-native-svg";
import { useColors } from "@/hooks/useColors";
import { apiFetch } from "@/hooks/useApi";

interface Scenario {
  id: number;
  name: string;
  mode: string;
  assumptions?: Record<string, number>;
}

interface YearData {
  year: number;
  age: number;
  netWorth: number;
  savings?: number;
  income?: number;
  expenses?: number;
}

interface Calculations {
  corpusRequired?: number;
  corpusBuildupAtRetirement?: number;
  corpusGap?: number;
  sipRequired?: number;
  yearByYear?: YearData[];
  summary?: {
    corpusRequired?: number;
    corpusBuildupAtRetirement?: number;
    corpusGap?: number;
    sipRequired?: number;
  };
}

function formatInr(val?: number | null): string {
  if (val == null) return "—";
  const abs = Math.abs(val);
  if (abs >= 1_00_00_000) return `₹${(val / 1_00_00_000).toFixed(2)}Cr`;
  if (abs >= 1_00_000) return `₹${(val / 1_00_000).toFixed(1)}L`;
  if (abs >= 1_000) return `₹${(val / 1_000).toFixed(1)}K`;
  return `₹${val.toFixed(0)}`;
}

const CHART_HEIGHT = 190;
const PAD = { top: 12, bottom: 28, left: 8, right: 8 };

function WealthChart({ data }: { data: YearData[] }) {
  const { width } = Dimensions.get("window");
  const chartWidth = width - 32;

  const values = data.map((d) => d.netWorth);
  const minVal = Math.min(0, ...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const toX = (i: number) =>
    PAD.left + (i / Math.max(data.length - 1, 1)) * (chartWidth - PAD.left - PAD.right);
  const toY = (v: number) =>
    PAD.top + (1 - (v - minVal) / range) * (CHART_HEIGHT - PAD.top - PAD.bottom);

  const pts = data.map((d, i) => `${toX(i)},${toY(d.netWorth)}`).join(" L ");
  const linePath = `M ${pts}`;
  const areaPath = `M ${toX(0)},${toY(data[0]?.netWorth ?? 0)} L ${pts} L ${toX(data.length - 1)},${CHART_HEIGHT - PAD.bottom} L ${toX(0)},${CHART_HEIGHT - PAD.bottom} Z`;

  const stride = Math.max(1, Math.floor(data.length / 5));
  const labels = data.filter((_, i) => i === 0 || i % stride === 0 || i === data.length - 1);

  return (
    <Svg width={chartWidth} height={CHART_HEIGHT}>
      <Defs>
        <SvgGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
          <Stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
        </SvgGradient>
      </Defs>
      <Line
        x1={PAD.left}
        y1={CHART_HEIGHT - PAD.bottom}
        x2={chartWidth - PAD.right}
        y2={CHART_HEIGHT - PAD.bottom}
        stroke="#e2e8f0"
        strokeWidth={1}
      />
      <Path d={areaPath} fill="url(#areaGrad)" />
      <Path
        d={linePath}
        stroke="#2563eb"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {labels.map((d, i) => {
        const idx = data.indexOf(d);
        return (
          <SvgText
            key={i}
            x={toX(idx)}
            y={CHART_HEIGHT - 6}
            textAnchor="middle"
            fontSize={10}
            fill="#94a3b8"
            fontFamily="Inter_400Regular"
          >
            {d.age ?? d.year}
          </SvgText>
        );
      })}
    </Svg>
  );
}

function StatRow({
  label,
  value,
  color,
  highlight,
}: {
  label: string;
  value: string;
  color?: string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.statRow, highlight && styles.statRowHighlight]}>
      <Text style={styles.statRowLabel}>{label}</Text>
      <Text style={[styles.statRowValue, color ? { color } : {}]}>{value}</Text>
    </View>
  );
}

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: scenario, isLoading: scenarioLoading, isError: scenarioError, error: scenarioErr } = useQuery<Scenario>({
    queryKey: ["scenario", id],
    queryFn: () => apiFetch<Scenario>(`/api/scenarios/${id}`),
    enabled: !!id,
    retry: false,
  });

  const { data: calc, isLoading: calcLoading, isError: calcError, error: calcErr } = useQuery<Calculations>({
    queryKey: ["calc", id],
    queryFn: () =>
      apiFetch<Calculations>(`/api/calc/${id}`, { method: "POST", body: JSON.stringify({}) }),
    enabled: !!scenario,
    retry: false,
  });

  const isLoading = scenarioLoading || calcLoading;
  const isError = scenarioError || calcError;
  const errorMessage =
    (scenarioErr instanceof Error ? scenarioErr.message : null) ??
    (calcErr instanceof Error ? calcErr.message : null) ??
    "Failed to load plan details.";

  const corpus = calc?.corpusBuildupAtRetirement ?? calc?.summary?.corpusBuildupAtRetirement;
  const required = calc?.corpusRequired ?? calc?.summary?.corpusRequired;
  const gap = calc?.corpusGap ?? calc?.summary?.corpusGap;
  const sip = calc?.sipRequired ?? calc?.summary?.sipRequired;
  const isSurplus = gap != null && gap < 0;

  const chartData = useMemo(() => {
    const raw = calc?.yearByYear ?? [];
    return raw.length > 100 ? raw.filter((_, i) => i % 2 === 0) : raw;
  }, [calc]);

  const heroBgColors: [string, string] = isSurplus
    ? ["#064e3b", "#065f46"]
    : gap != null
    ? ["#0f172a", "#1e3a5f"]
    : ["#0f172a", "#1e3a5f"];

  return (
    <View style={[styles.fill, { backgroundColor: "#f1f5f9" }]}>
      <LinearGradient colors={heroBgColors} style={[styles.hero, { paddingTop: topPad + 8 }]}>
        <View style={styles.heroNav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#f8fafc" />
          </TouchableOpacity>
          <Text style={styles.heroNavTitle} numberOfLines={1}>
            {scenario?.name ?? "Plan Details"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {!isLoading && (
          <View style={styles.heroContent}>
            <View style={styles.heroBadgeRow}>
              <View
                style={[
                  styles.heroBadge,
                  { backgroundColor: isSurplus ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)" },
                ]}
              >
                <Ionicons
                  name={isSurplus ? "checkmark-circle" : "alert-circle"}
                  size={13}
                  color={isSurplus ? "#34d399" : "#fbbf24"}
                />
                <Text
                  style={[
                    styles.heroBadgeText,
                    { color: isSurplus ? "#34d399" : "#fbbf24" },
                  ]}
                >
                  {isSurplus ? "On Track" : "Action Needed"}
                </Text>
              </View>
            </View>

            <Text style={styles.heroMetricLabel}>Projected Corpus at Retirement</Text>
            <Text style={styles.heroMetricValue}>{formatInr(corpus)}</Text>

            <View style={styles.heroChipRow}>
              <View style={styles.heroChip}>
                <Text style={styles.heroChipLabel}>Required</Text>
                <Text style={styles.heroChipValue}>{formatInr(required)}</Text>
              </View>
              <View style={styles.heroChipDivider} />
              <View style={styles.heroChip}>
                <Text style={styles.heroChipLabel}>{isSurplus ? "Surplus" : "Gap"}</Text>
                <Text
                  style={[
                    styles.heroChipValue,
                    { color: isSurplus ? "#34d399" : "#fbbf24" },
                  ]}
                >
                  {formatInr(Math.abs(gap ?? 0))}
                </Text>
              </View>
              <View style={styles.heroChipDivider} />
              <View style={styles.heroChip}>
                <Text style={styles.heroChipLabel}>Monthly SIP</Text>
                <Text style={styles.heroChipValue}>{formatInr(sip)}</Text>
              </View>
            </View>
          </View>
        )}
      </LinearGradient>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Calculating projections…</Text>
        </View>
      ) : isError ? (
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorBody}>{errorMessage}</Text>
          <TouchableOpacity style={styles.errorRetryBtn} onPress={() => router.back()}>
            <Text style={styles.errorRetryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: Platform.OS === "web" ? 40 : insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionCard}>
            <Text style={styles.sectionCardTitle}>CORPUS BREAKDOWN</Text>
            <StatRow label="Corpus Required" value={formatInr(required)} />
            <StatRow
              label="Projected Corpus"
              value={formatInr(corpus)}
              color="#2563eb"
              highlight
            />
            <StatRow
              label={isSurplus ? "Surplus" : "Shortfall"}
              value={formatInr(Math.abs(gap ?? 0))}
              color={isSurplus ? "#10b981" : "#f59e0b"}
            />
            <StatRow
              label="Recommended Monthly SIP"
              value={formatInr(sip)}
              color="#2563eb"
            />
          </View>

          {chartData.length > 1 && (
            <View style={styles.chartCard}>
              <View style={styles.chartCardHeader}>
                <View>
                  <Text style={styles.chartCardTitle}>Wealth Projection</Text>
                  <Text style={styles.chartCardSub}>
                    Net worth growth by age — ₹ in Cr / L
                  </Text>
                </View>
                <View style={styles.chartLegendDot} />
              </View>
              <WealthChart data={chartData} />
              <Text style={styles.chartXAxisLabel}>Age →</Text>
            </View>
          )}

          {scenario?.assumptions && Object.keys(scenario.assumptions).length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionCardTitle}>PLAN ASSUMPTIONS</Text>
              {Object.entries(scenario.assumptions).map(([k, v]) => (
                <StatRow
                  key={k}
                  label={k.replace(/([A-Z])/g, " $1").trim()}
                  value={typeof v === "number" && v < 1 ? `${(v * 100).toFixed(1)}%` : String(v)}
                />
              ))}
            </View>
          )}

          <View style={[styles.tipCard]}>
            <View style={styles.tipIconBox}>
              <Ionicons name="bulb-outline" size={18} color="#f59e0b" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Smart Retirement Tip</Text>
              <Text style={styles.tipBody}>
                {isSurplus
                  ? "You're ahead of schedule. Consider increasing equity allocation to maximise long-term growth."
                  : "Increasing your monthly SIP by even ₹2,000 today could close the gap significantly over time."}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },

  hero: { paddingHorizontal: 20, paddingBottom: 28, gap: 14 },
  heroNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroNavTitle: {
    flex: 1,
    textAlign: "center",
    color: "#f8fafc",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },

  heroContent: { gap: 10 },
  heroBadgeRow: {},
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  heroMetricLabel: { color: "#94a3b8", fontSize: 12, fontFamily: "Inter_400Regular" },
  heroMetricValue: { color: "#f8fafc", fontSize: 34, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },

  heroChipRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
    marginTop: 4,
  },
  heroChip: { flex: 1, alignItems: "center", gap: 2 },
  heroChipLabel: { color: "#94a3b8", fontSize: 10, fontFamily: "Inter_400Regular" },
  heroChipValue: { color: "#f8fafc", fontSize: 14, fontFamily: "Inter_700Bold" },
  heroChipDivider: { width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.12)" },

  loadingState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#64748b" },

  errorState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 32 },
  errorTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#0f172a" },
  errorBody: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#64748b", textAlign: "center", lineHeight: 20 },
  errorRetryBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: "#2563eb",
  },
  errorRetryText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },

  scroll: { padding: 16, gap: 14 },

  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionCardTitle: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#94a3b8",
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#f1f5f9",
  },
  statRowHighlight: { backgroundColor: "#f8fafc", marginHorizontal: -16, paddingHorizontal: 16 },
  statRowLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#64748b" },
  statRowValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#0f172a" },

  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  chartCardHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  chartCardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#0f172a" },
  chartCardSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#94a3b8", marginTop: 2 },
  chartLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563eb",
    marginTop: 4,
  },
  chartXAxisLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "#94a3b8",
    textAlign: "center",
  },

  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#fffbeb",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  tipIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
  },
  tipContent: { flex: 1, gap: 4 },
  tipTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#92400e" },
  tipBody: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#78350f", lineHeight: 19 },
});
