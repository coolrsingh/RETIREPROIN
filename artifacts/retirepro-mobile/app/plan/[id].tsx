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
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Line, Text as SvgText } from "react-native-svg";
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
  if (abs >= 1_00_00_000) return `₹${(val / 1_00_00_000).toFixed(1)}Cr`;
  if (abs >= 1_00_000) return `₹${(val / 1_00_000).toFixed(1)}L`;
  if (abs >= 1_000) return `₹${(val / 1_000).toFixed(1)}K`;
  return `₹${val.toFixed(0)}`;
}

interface KpiCardProps {
  label: string;
  value: string;
  icon: string;
  color: string;
  bgColor: string;
  sub?: string;
}

function KpiCard({ label, value, icon, color, bgColor, sub }: KpiCardProps) {
  const colors = useColors();
  return (
    <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.kpiIconBg, { backgroundColor: bgColor }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
      {sub && <Text style={[styles.kpiSub, { color: colors.mutedForeground }]}>{sub}</Text>}
    </View>
  );
}

const CHART_HEIGHT = 180;
const CHART_PADDING = { top: 16, bottom: 24, left: 8, right: 8 };

function NetWorthChart({ data, colors }: { data: YearData[]; colors: ReturnType<typeof useColors> }) {
  const { width } = Dimensions.get("window");
  const chartWidth = width - 32;

  const values = data.map((d) => d.netWorth);
  const minVal = Math.min(0, ...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const toX = (i: number) =>
    CHART_PADDING.left + (i / (data.length - 1)) * (chartWidth - CHART_PADDING.left - CHART_PADDING.right);

  const toY = (v: number) =>
    CHART_PADDING.top + (1 - (v - minVal) / range) * (CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom);

  const points = data.map((d, i) => `${toX(i)},${toY(d.netWorth)}`).join(" L ");
  const linePath = `M ${points}`;

  const areaPath = `M ${toX(0)},${toY(data[0]?.netWorth ?? 0)} L ${points} L ${toX(data.length - 1)},${CHART_HEIGHT - CHART_PADDING.bottom} L ${toX(0)},${CHART_HEIGHT - CHART_PADDING.bottom} Z`;

  const labelStride = Math.max(1, Math.floor(data.length / 5));
  const labelPoints = data.filter((_, i) => i % labelStride === 0 || i === data.length - 1);

  return (
    <View style={styles.chartContainer}>
      <Svg width={chartWidth} height={CHART_HEIGHT}>
        <Defs>
          <SvgGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.25" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.02" />
          </SvgGradient>
        </Defs>
        <Path d={areaPath} fill="url(#grad)" />
        <Path d={linePath} stroke={colors.primary} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {labelPoints.map((d, i) => {
          const idx = data.indexOf(d);
          return (
            <SvgText
              key={i}
              x={toX(idx)}
              y={CHART_HEIGHT - 4}
              textAnchor="middle"
              fontSize={10}
              fill={colors.mutedForeground}
              fontFamily="Inter_400Regular"
            >
              {d.age ?? d.year}
            </SvgText>
          );
        })}
      </Svg>
      <Text style={[styles.chartXLabel, { color: colors.mutedForeground }]}>Age</Text>
    </View>
  );
}

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: scenario, isLoading: scenarioLoading } = useQuery<Scenario>({
    queryKey: ["scenario", id],
    queryFn: () => apiFetch<Scenario>(`/api/scenarios/${id}`),
    enabled: !!id,
  });

  const { data: calc, isLoading: calcLoading } = useQuery<Calculations>({
    queryKey: ["calc", id],
    queryFn: () => apiFetch<Calculations>(`/api/calc/${id}`, { method: "POST", body: JSON.stringify({}) }),
    enabled: !!scenario,
  });

  const isLoading = scenarioLoading || calcLoading;

  const corpus = calc?.corpusBuildupAtRetirement ?? calc?.summary?.corpusBuildupAtRetirement;
  const required = calc?.corpusRequired ?? calc?.summary?.corpusRequired;
  const gap = calc?.corpusGap ?? calc?.summary?.corpusGap;
  const sip = calc?.sipRequired ?? calc?.summary?.sipRequired;
  const isSurplus = gap != null && gap < 0;

  const chartData = useMemo(() => {
    const raw = calc?.yearByYear ?? [];
    if (raw.length > 100) {
      return raw.filter((_, i) => i % 2 === 0);
    }
    return raw;
  }, [calc]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          {scenario?.name ?? "Plan Details"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Calculating projections…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.summaryBanner, { backgroundColor: isSurplus ? colors.successLight : "#fff7ed", borderColor: isSurplus ? colors.success : colors.warning }]}>
            <Ionicons
              name={isSurplus ? "checkmark-circle" : "alert-circle-outline"}
              size={22}
              color={isSurplus ? colors.success : colors.warning}
            />
            <Text style={[styles.summaryText, { color: isSurplus ? "#166534" : "#92400e" }]}>
              {isSurplus
                ? `On track! Projected surplus of ${formatInr(Math.abs(gap ?? 0))}`
                : gap != null
                ? `Corpus gap of ${formatInr(gap)}. Boost your SIP to stay on track.`
                : "Retirement projections loaded."}
            </Text>
          </View>

          <View style={styles.kpiGrid}>
            <KpiCard
              label="Corpus Required"
              value={formatInr(required)}
              icon="flag-outline"
              color={colors.primary}
              bgColor={colors.secondary}
            />
            <KpiCard
              label="Projected Corpus"
              value={formatInr(corpus)}
              icon="trending-up-outline"
              color={colors.success}
              bgColor={colors.successLight}
            />
            <KpiCard
              label={isSurplus ? "Surplus" : "Corpus Gap"}
              value={formatInr(Math.abs(gap ?? 0))}
              icon={isSurplus ? "happy-outline" : "warning-outline"}
              color={isSurplus ? colors.success : colors.warning}
              bgColor={isSurplus ? colors.successLight : colors.warningLight}
              sub={isSurplus ? "You're on track" : "Top-up needed"}
            />
            <KpiCard
              label="Monthly SIP"
              value={formatInr(sip)}
              icon="cash-outline"
              color={colors.primary}
              bgColor={colors.secondary}
              sub="Recommended"
            />
          </View>

          {chartData.length > 1 && (
            <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.chartTitle, { color: colors.foreground }]}>Net Worth Projection</Text>
              <Text style={[styles.chartSubtitle, { color: colors.mutedForeground }]}>
                Corpus growth over time (₹ in Cr/L)
              </Text>
              <NetWorthChart data={chartData} colors={colors} />
            </View>
          )}

          {scenario?.assumptions && (
            <View style={[styles.assumptionsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.assumptionsTitle, { color: colors.foreground }]}>Assumptions</Text>
              {Object.entries(scenario.assumptions).map(([k, v]) => (
                <View key={k} style={[styles.assumRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.assumKey, { color: colors.mutedForeground }]}>
                    {k.replace(/([A-Z])/g, " $1").trim()}
                  </Text>
                  <Text style={[styles.assumVal, { color: colors.foreground }]}>
                    {typeof v === "number" && v < 1 ? `${(v * 100).toFixed(1)}%` : String(v)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  scroll: { padding: 16, gap: 16 },
  summaryBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  summaryText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", lineHeight: 20 },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  kpiCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  kpiIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  kpiLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  kpiValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  kpiSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  chartCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  chartTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  chartSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 12 },
  chartContainer: { gap: 4 },
  chartXLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 2 },
  assumptionsCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  assumptionsTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  assumRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  assumKey: { fontSize: 13, fontFamily: "Inter_400Regular", textTransform: "capitalize" },
  assumVal: { fontSize: 13, fontFamily: "Inter_500Medium" },
});
