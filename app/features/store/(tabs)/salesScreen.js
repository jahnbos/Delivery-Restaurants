import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../../../src/context/storeContext";
import { shadow } from "../../../../src/styles/shadow";

const SUMMARY_FIELDS = [
  { id: "orders", label: "Total orders", key: "orders" },
  {
    id: "avg-order",
    label: "Avg. order value",
    key: "avgOrderValue",
    currency: true,
  },
  {
    id: "customers",
    label: "Returning customers",
    key: "returningCustomers",
  },
  {
    id: "cancellations",
    label: "Cancellations",
    key: "cancellations",
  },
];

const toNumberOrNull = (value) => {
  if (value === null || value === undefined) {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const toCurrency = (value) => {
  const amount = toNumberOrNull(value) ?? 0;
  return `THB ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatMetricValue = (metric) => {
  const numericValue = toNumberOrNull(metric.value) ?? 0;
  if (metric.currency) {
    return toCurrency(numericValue);
  }
  return numericValue.toLocaleString();
};

const formatChange = (value) => {
  const numeric = toNumberOrNull(value);
  if (numeric === null) {
    return "0.0%";
  }
  const rounded = Math.abs(numeric).toFixed(1);
  return `${numeric >= 0 ? "+" : "-"}${rounded}%`;
};

const changeColor = (value) => {
  const numeric = toNumberOrNull(value);
  if (numeric === null || numeric === 0) {
    return "#ffffffff";
  }
  return numeric > 0 ? "#16A34A" : "#DC2626";
};

const resolveChangeKey = (summary, field) => {
  if (!summary || typeof summary !== "object") {
    return null;
  }

  if (field.changeKey && summary[field.changeKey] !== undefined) {
    return toNumberOrNull(summary[field.changeKey]);
  }

  const derivedKey = `${field.key}Change`;
  if (summary[derivedKey] !== undefined) {
    return toNumberOrNull(summary[derivedKey]);
  }

  return null;
};

const buildSummaryMetrics = (store) => {
  const summary = store?.salesSummary;
  if (!summary || typeof summary !== "object") {
    return [];
  }

  return SUMMARY_FIELDS.map((field) => {
    const value = toNumberOrNull(summary[field.key]);
    if (value === null) {
      return null;
    }

    return {
      id: field.id,
      label: field.label,
      value,
      currency: Boolean(field.currency),
      change: resolveChangeKey(summary, field) ?? 0,
    };
  }).filter(Boolean);
};

const extractDailySource = (store) => {
  if (Array.isArray(store?.dailySales)) {
    return store.dailySales;
  }
  if (Array.isArray(store?.salesDaily)) {
    return store.salesDaily;
  }
  if (Array.isArray(store?.salesTrend)) {
    return store.salesTrend;
  }
  if (Array.isArray(store?.sales?.daily)) {
    return store.sales.daily;
  }
  if (Array.isArray(store?.salesTimeline)) {
    return store.salesTimeline;
  }
  return [];
};

const buildDailyBreakdown = (store) =>
  extractDailySource(store)
    .map((entry, index) => {
      const revenue = toNumberOrNull(entry?.revenue);
      const orders = toNumberOrNull(entry?.orders);

      if (revenue === null && orders === null) {
        return null;
      }

      return {
        id: entry?.id ?? entry?.label ?? entry?.day ?? `day-${index}`,
        label: entry?.label ?? entry?.day ?? `Day ${index + 1}`,
        orders: orders ?? 0,
        revenue: revenue ?? 0,
        change: toNumberOrNull(entry?.change) ?? 0,
      };
    })
    .filter(Boolean);

const extractTopItemsSource = (store) => {
  if (Array.isArray(store?.topItems)) {
    return store.topItems;
  }
  if (Array.isArray(store?.bestSellers)) {
    return store.bestSellers;
  }
  if (Array.isArray(store?.sales?.topItems)) {
    return store.sales.topItems;
  }
  return [];
};

const buildTopItems = (store) =>
  extractTopItemsSource(store)
    .map((entry, index) => {
      const revenue = toNumberOrNull(entry?.revenue);
      const orders = toNumberOrNull(entry?.orders);

      if (revenue === null && orders === null) {
        return null;
      }

      return {
        id: entry?.id ?? entry?.sku ?? `item-${index}`,
        name: entry?.name ?? entry?.title ?? "Unnamed item",
        orders: orders ?? 0,
        revenue: revenue ?? 0,
      };
    })
    .filter(Boolean);

const SummaryCard = ({ metric }) => (
  <View style={[styles.summaryCard, shadow.medium]}>
    <Text style={styles.summaryLabel}>{metric.label}</Text>
    <Text style={styles.summaryValue}>{formatMetricValue(metric)}</Text>
    <Text style={[styles.summaryChange, { color: changeColor(metric.change) }]}>
      {formatChange(metric.change)} vs previous period
    </Text>
  </View>
);

const TrendRow = ({ day, index }) => (
  <View style={[styles.trendRow, shadow.light]}>
    <View style={styles.trendDayColumn}>
      <Text style={styles.trendDayLabel}>{day.label}</Text>
      <Text style={styles.trendOrdersText}>{day.orders} orders</Text>
    </View>
    <View style={styles.trendValueColumn}>
      <Text style={styles.trendRevenueText}>{toCurrency(day.revenue)}</Text>
      <Text style={[styles.trendChangeText, { color: changeColor(day.change) }]}>
        {formatChange(day.change)}
      </Text>
    </View>
    <View style={styles.trendRankBadge}>
      <Text style={styles.trendRankText}>#{index + 1}</Text>
    </View>
  </View>
);

const TopItemCard = ({ item, index }) => (
  <View style={[styles.topItemCard, shadow.medium]}>
    <View style={styles.topItemHeader}>
      <View style={styles.topItemBadge}>
        <Text style={styles.topItemBadgeText}>#{index + 1}</Text>
      </View>
      <View style={styles.topItemBody}>
        <Text style={styles.topItemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.topItemOrders}>{item.orders} orders</Text>
      </View>
    </View>
    <Text style={styles.topItemRevenue}>{toCurrency(item.revenue)}</Text>
  </View>
);

export default function SalesScreen() {
  const { store, status, error } = useStore();

  const summaryMetrics = useMemo(() => buildSummaryMetrics(store), [store]);
  const dailyBreakdown = useMemo(() => buildDailyBreakdown(store), [store]);
  const topItems = useMemo(() => buildTopItems(store), [store]);

  const totalRevenueValue = useMemo(() => {
    const directValue = toNumberOrNull(store?.sales);
    if (directValue !== null) {
      return directValue;
    }

    if (!dailyBreakdown.length) {
      return 0;
    }

    return dailyBreakdown.reduce((sum, day) => sum + day.revenue, 0);
  }, [store, dailyBreakdown]);

  const trendChange = useMemo(() => {
    if (!dailyBreakdown.length) {
      return 0;
    }

    const totalChange = dailyBreakdown.reduce(
      (sum, day) => sum + (toNumberOrNull(day.change) ?? 0),
      0
    );
    return totalChange / dailyBreakdown.length;
  }, [dailyBreakdown]);

  if (status === "loading") {
    return (
      <SafeAreaView style={styles.stateContainer}>
        <ActivityIndicator size="large" color="#FA4A0C" />
        <Text style={styles.stateMessage}>กำลังโหลดข้อมูลยอดขายจาก Firestore…</Text>
      </SafeAreaView>
    );
  }

  if (status === "error") {
    return (
      <SafeAreaView style={styles.stateContainer}>
        <Text style={[styles.stateMessage, styles.stateError]}>
          ไม่สามารถดึงข้อมูลยอดขายได้: {error?.message ?? "unknown error"}
        </Text>
      </SafeAreaView>
    );
  }

  if (!store) {
    return (
      <SafeAreaView style={styles.stateContainer}>
        <Text style={styles.stateMessage}>
          ยังไม่มีข้อมูลร้านใน Firestore collection `info` กรุณาเพิ่มข้อมูลก่อน
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brandText}>
          {store?.name ? `${store.name} sales overview` : "Sales overview"}
        </Text>
        <Text style={styles.headerSubtitle}>ข้อมูลสรุปยอดขายจาก Firestore</Text>

        <View style={[styles.totalCard, shadow.strong]}>
          <Text style={styles.totalLabel}>Total revenue</Text>
          <Text style={styles.totalValue}>{toCurrency(totalRevenueValue)}</Text>
          <Text style={[styles.totalChange, { color: changeColor(trendChange) }]}>
            {formatChange(trendChange)} vs previous period
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          {summaryMetrics.length ? (
            <View style={styles.summaryGrid}>
              {summaryMetrics.map((metric) => (
                <SummaryCard key={metric.id} metric={metric} />
              ))}
            </View>
          ) : (
            <Text style={styles.sectionPlaceholder}>
              ยังไม่มีข้อมูลสรุปยอดขายสำหรับร้านนี้
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sales trend</Text>
          {dailyBreakdown.length ? (
            <View style={styles.trendList}>
              {dailyBreakdown.map((day, index) => (
                <TrendRow key={day.id ?? index} day={day} index={index} />
              ))}
            </View>
          ) : (
            <Text style={styles.sectionPlaceholder}>
              ยังไม่มีข้อมูลยอดขายรายวัน
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top items</Text>
          {topItems.length ? (
            <View style={styles.topItemsList}>
              {topItems.map((item, index) => (
                <TopItemCard key={item.id ?? index} item={item} index={index} />
              ))}
            </View>
          ) : (
            <Text style={styles.sectionPlaceholder}>
              ยังไม่มีข้อมูลเมนูขายดี
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 24,
    gap: 12,
  },
  stateMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  stateError: {
    color: "#B91C1C",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    gap: 14,
  },
  brandText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  totalCard: {
    borderRadius: 24,
    backgroundColor: "#FA4A0C",
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 10,
  },
  totalLabel: {
    fontSize: 14,
    color: "#FEE2E2",
  },
  totalValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#ffffff",
  },
  totalChange: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 28,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  sectionPlaceholder: {
    fontSize: 13,
    color: "#6B7280",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  summaryCard: {
    flexBasis: "47%",
    borderRadius: 18,
    backgroundColor: "#fff",
    padding: 18,
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  summaryChange: {
    fontSize: 13,
    fontWeight: "600",
  },
  trendList: {
    gap: 12,
  },
  trendRow: {
    borderRadius: 18,
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  trendDayColumn: {
    flex: 1,
    gap: 4,
  },
  trendDayLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  trendOrdersText: {
    fontSize: 13,
    color: "#6B7280",
  },
  trendValueColumn: {
    alignItems: "flex-end",
    gap: 4,
  },
  trendRevenueText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FA4A0C",
  },
  trendChangeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  trendRankBadge: {
    marginLeft: 16,
    borderRadius: 999,
    backgroundColor: "#FEE4E2",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  trendRankText: {
    color: "#B42318",
    fontWeight: "600",
    fontSize: 12,
  },
  topItemsList: {
    gap: 12,
  },
  topItemCard: {
    borderRadius: 18,
    backgroundColor: "#fff",
    padding: 18,
    gap: 12,
  },
  topItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  topItemBadge: {
    borderRadius: 12,
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  topItemBadgeText: {
    color: "#EA580C",
    fontWeight: "700",
    fontSize: 12,
  },
  topItemBody: {
    flex: 1,
    gap: 4,
  },
  topItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  topItemOrders: {
    fontSize: 13,
    color: "#6B7280",
  },
  topItemRevenue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FA4A0C",
  },
});
