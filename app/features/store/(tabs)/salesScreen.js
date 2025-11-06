import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../../../../src/context/storeContext";
import { shadow } from "../../../../src/styles/shadow";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../../../src/config/firebase";
import Ionicons from "@expo/vector-icons/Ionicons";

const SUMMARY_FIELDS = [
  {
    id: "orders",
    label: "Total orders",
    key: "orders",
    icon: "cart-outline",
    iconColor: "#6366F1",
  },
  {
    id: "avg-order",
    label: "Avg. order value",
    key: "avgOrderValue",
    currency: true,
    icon: "cash-outline",
    iconColor: "#F97316",
  },
  {
    id: "customers",
    label: "Returning customers",
    key: "returningCustomers",
    icon: "people-outline",
    iconColor: "#0EA5E9",
  },
  {
    id: "cancellations",
    label: "Cancellations",
    key: "cancellations",
    icon: "close-circle-outline",
    iconColor: "#EF4444",
  },
];

const toNumberOrNull = (value) => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string") {
    const normalized = value.replace(/[^\d.-]/g, "");
    if (!normalized.trim()) {
      return null;
    }
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
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
      icon: field.icon,
      iconColor: field.iconColor,
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
    <View style={styles.summaryCardHeader}>
      <View
        style={[
          styles.summaryIconBadge,
          metric.iconColor
            ? { backgroundColor: `${metric.iconColor}1A` }
            : null,
        ]}
      >
        <Ionicons
          name={metric.icon || "stats-chart-outline"}
          size={18}
          color={metric.iconColor || "#FA4A0C"}
        />
      </View>
      <Text style={styles.summaryLabel}>{metric.label}</Text>
    </View>
    <Text style={styles.summaryValue}>{formatMetricValue(metric)}</Text>
    <Text style={[styles.summaryChange, { color: changeColor(metric.change) }]}>
      {formatChange(metric.change)} vs previous period
    </Text>
  </View>
);

const TrendRow = ({ day, index }) => (
  <View style={[styles.trendRow, shadow.light]}>
    <View style={styles.trendIndexBadge}>
      <Text style={styles.trendIndexText}>
        {String(index + 1).padStart(2, "0")}
      </Text>
    </View>
    <View style={styles.trendDayColumn}>
      <Text style={styles.trendDayLabel}>{day.label}</Text>
      <Text style={styles.trendOrdersText}>{day.orders} orders</Text>
    </View>
    <View style={styles.trendValueColumn}>
      <Text style={styles.trendRevenueText}>{toCurrency(day.revenue)}</Text>
      <Text
        style={[styles.trendChangeText, { color: changeColor(day.change) }]}
      >
        {formatChange(day.change)}
      </Text>
    </View>
  </View>
);

const TopItemCard = ({ item, index }) => (
  <View style={[styles.topItemCard, shadow.medium]}>
    <View style={styles.topItemHeader}>
      <View style={styles.topItemBadge}>
        <Ionicons name="star-outline" size={16} color="#EA580C" />
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

const InsightCard = ({ iconName, iconColor, title, value, caption }) => (
  <View style={[styles.insightCard, shadow.light]}>
    <View style={styles.insightHeader}>
      <View
        style={[
          styles.insightIcon,
          iconColor ? { backgroundColor: `${iconColor}1A` } : null,
        ]}
      >
        <Ionicons
          name={iconName || "information-circle-outline"}
          size={18}
          color={iconColor || "#FA4A0C"}
        />
      </View>
      <Text style={styles.insightTitle}>{title}</Text>
    </View>
    <Text style={styles.insightValue}>{value}</Text>
    {caption ? <Text style={styles.insightCaption}>{caption}</Text> : null}
  </View>
);

const DailySummaryList = ({ data }) => (
  <View style={[styles.dailyCard, shadow.medium]}>
    <View style={styles.dailyHeader}>
      <Text style={styles.dailyTitle}>Daily breakdown</Text>
      <Text style={styles.dailySubtitle}>ยอดขายและจำนวนออเดอร์ต่อวัน</Text>
    </View>
    <View style={styles.dailyList}>
      {data.map((day, index) => (
        <View key={day.id ?? index} style={styles.dailyRow}>
          <View style={styles.dailyBadge}>
            <Text style={styles.dailyBadgeText}>
              {String(index + 1).padStart(2, "0")}
            </Text>
          </View>
          <View style={styles.dailyMeta}>
            <Text style={styles.dailyLabel}>{day.label}</Text>
            <Text style={styles.dailyOrders}>{day.orders} orders</Text>
          </View>
          <View style={styles.dailyTotals}>
            <Text style={styles.dailyRevenue}>{toCurrency(day.revenue)}</Text>
            <Text
              style={[
                styles.dailyChange,
                { color: changeColor(day.change) },
              ]}
            >
              {formatChange(day.change)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  </View>
);

const resolveOrderTotal = (order) => {
  if (!order || typeof order !== "object") {
    return 0;
  }

  const candidates = [
    order.total,
    order.totalAmount,
    order.amount,
    order.grandTotal,
    order?.summary?.total,
  ];

  for (const candidate of candidates) {
    const numeric = toNumberOrNull(candidate);
    if (numeric !== null) {
      return numeric;
    }
  }

  return 0;
};

export default function SalesScreen() {
  const { store, status, error } = useStore();
  const [ordersRevenue, setOrdersRevenue] = useState({
    loading: true,
    total: 0,
    orderCount: 0,
  });
  const [ordersError, setOrdersError] = useState(null);

  useEffect(() => {
    const storeId = store?.id;

    if (!storeId) {
      setOrdersRevenue({ loading: false, total: 0, orderCount: 0 });
      setOrdersError(null);
      return undefined;
    }

    let isActive = true;
    let activeOrders = [];
    let historyOrders = [];

    setOrdersRevenue((prev) => ({ ...prev, loading: true }));
    setOrdersError(null);

    const updateAggregates = () => {
      if (!isActive) {
        return;
      }

      const combined = [...activeOrders, ...historyOrders];
      const completedOrders = combined.filter(
        (order) => order.status === "completed"
      );
      const total = completedOrders.reduce(
        (sum, order) => sum + resolveOrderTotal(order),
        0
      );

      setOrdersRevenue({
        loading: false,
        total,
        orderCount: completedOrders.length,
      });
    };

    const handleError = (err) => {
      if (!isActive) {
        return;
      }
      setOrdersError(err);
      setOrdersRevenue((prev) => ({ ...prev, loading: false }));
    };

    const subscribeToCollection = (collectionName, target) => {
      const ordersQuery = query(
        collection(db, collectionName),
        where("shopId", "==", String(storeId))
      );

      return onSnapshot(
        ordersQuery,
        (snapshot) => {
          target.length = 0;
          snapshot.forEach((docSnapshot) => {
            target.push({ id: docSnapshot.id, ...docSnapshot.data() });
          });
          updateAggregates();
        },
        handleError
      );
    };

    const unsubscribeOrders = subscribeToCollection("orders", activeOrders);
    const unsubscribeHistory = subscribeToCollection(
      "historyorders",
      historyOrders
    );

    return () => {
      isActive = false;
      unsubscribeOrders();
      unsubscribeHistory();
    };
  }, [store?.id]);

  const summaryMetrics = useMemo(() => buildSummaryMetrics(store), [store]);
  const dailyBreakdown = useMemo(() => buildDailyBreakdown(store), [store]);
  const topItems = useMemo(() => buildTopItems(store), [store]);

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

  const totalRevenueValue = ordersRevenue.total;
  const averageOrderValue = ordersRevenue.orderCount
    ? totalRevenueValue / ordersRevenue.orderCount
    : null;
  const ordersBadgeLabel = ordersRevenue.loading
    ? "Counting..."
    : ordersError
    ? "Unavailable"
    : ordersRevenue.orderCount === 0
    ? "No orders yet"
    : `${ordersRevenue.orderCount} orders`;
  const revenueFooterText = ordersError
    ? "Live revenue data unavailable"
    : `${formatChange(trendChange)} vs previous period`;
  const revenueFooterColor = ordersError ? "#FECACA" : changeColor(trendChange);

  const weeklyInsights = useMemo(() => {
    if (!dailyBreakdown.length) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        bestRevenueDay: null,
        bestOrdersDay: null,
        bestChangeDay: null,
      };
    }

    let totalRevenue = 0;
    let totalOrders = 0;
    let bestRevenueDay = dailyBreakdown[0];
    let bestOrdersDay = dailyBreakdown[0];
    let bestChangeDay = dailyBreakdown[0];

    dailyBreakdown.forEach((day) => {
      totalRevenue += day.revenue ?? 0;
      totalOrders += day.orders ?? 0;
      if ((day.revenue ?? 0) > (bestRevenueDay?.revenue ?? -Infinity)) {
        bestRevenueDay = day;
      }
      if ((day.orders ?? 0) > (bestOrdersDay?.orders ?? -Infinity)) {
        bestOrdersDay = day;
      }
      if ((day.change ?? -Infinity) > (bestChangeDay?.change ?? -Infinity)) {
        bestChangeDay = day;
      }
    });

    return {
      totalRevenue,
      totalOrders,
      bestRevenueDay,
      bestOrdersDay,
      bestChangeDay,
    };
  }, [dailyBreakdown]);

  const chartData = useMemo(
    () => dailyBreakdown.slice(0, 7),
    [dailyBreakdown]
  );

  if (status === "loading") {
    return (
      <SafeAreaView style={styles.stateContainer}>
        <ActivityIndicator size="large" color="#FA4A0C" />
        <Text style={styles.stateMessage}>
          กำลังโหลดข้อมูลยอดขายจาก Firestore…
        </Text>
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
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.brandText}>
              {store?.name ? `${store.name}` : "Sales overview"}
            </Text>
          </View>
          <View style={styles.headerBadge}>
            <Ionicons name="receipt-outline" size={16} color="#FA4A0C" />
            <Text style={styles.headerBadgeText}>{ordersBadgeLabel}</Text>
          </View>
        </View>

        <View style={[styles.overviewCard, shadow.strong]}>
          <View style={styles.overviewHeader}>
            <View style={styles.overviewIcon}>
              <Ionicons name="pulse-outline" size={24} color="#FA4A0C" />
            </View>
            <View style={styles.overviewHeaderText}>
              <Text style={styles.overviewTitle}>Live revenue</Text>
              <Text style={styles.overviewSubtitle}>Updated from incoming orders in real time</Text>
            </View>
          </View>

          <View style={styles.overviewMetricsRow}>
            <View style={[styles.metricCard, shadow.light]}>
              <View style={styles.metricCardHeader}>
                <View style={[styles.metricIcon, { backgroundColor: "#FEECEB" }]}>
                  <Ionicons name="cash-outline" size={18} color="#FA4A0C" />
                </View>
                <Text style={styles.metricLabel}>Total revenue</Text>
              </View>
              {ordersRevenue.loading ? (
                <ActivityIndicator color="#FA4A0C" />
              ) : (
                <Text style={styles.metricValueLarge}>
                  {ordersError ? "--" : toCurrency(totalRevenueValue)}
                </Text>
              )}
            </View>

            <View style={[styles.metricCard, shadow.light]}>
              <View style={styles.metricCardHeader}>
                <View style={[styles.metricIcon, { backgroundColor: "#E8F5FF" }]}>
                  <Ionicons name="calculator-outline" size={18} color="#0EA5E9" />
                </View>
                <Text style={styles.metricLabel}>Avg. order value</Text>
              </View>
              <Text style={styles.metricValue}>
                {ordersRevenue.loading || ordersError
                  ? "--"
                  : toCurrency(averageOrderValue ?? 0)}
              </Text>
            </View>

      
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly snapshot</Text>
          {dailyBreakdown.length ? (
            <>
              <View style={styles.insightsRow}>
                <InsightCard
                  iconName="wallet-outline"
                  iconColor="#FA4A0C"
                  title="Revenue (week)"
                  value={toCurrency(weeklyInsights.totalRevenue)}
                  caption="รวมยอดจากทุกวันที่บันทึกไว้"
                />
                <InsightCard
                  iconName="pricetag-outline"
                  iconColor="#6366F1"
                  title="Orders (week)"
                  value={weeklyInsights.totalOrders.toLocaleString()}
                  caption="จำนวนออเดอร์ทั้งหมด"
                />
                <InsightCard
                  iconName="flame-outline"
                  iconColor="#0EA5E9"
                  title="Best day"
                  value={
                    weeklyInsights.bestRevenueDay?.label ?? "ยังไม่มีข้อมูล"
                  }
                  caption={
                    weeklyInsights.bestRevenueDay
                      ? toCurrency(weeklyInsights.bestRevenueDay.revenue)
                      : undefined
                  }
                />
              </View>

              <DailySummaryList data={chartData} />
            </>
          ) : (
            <Text style={styles.sectionPlaceholder}>
              ยังไม่มีข้อมูลสัปดาห์ล่าสุด
            </Text>
          )}
        </View>

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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4EF",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
  },
  headerBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FA4A0C",
  },
  overviewCard: {
    marginTop: 10,
    borderRadius: 26,
    backgroundColor: "#ffffff",
    padding: 22,
    gap: 18,
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  overviewIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#FFF4EF",
    alignItems: "center",
    justifyContent: "center",
  },
  overviewHeaderText: {
    flex: 1,
    gap: 4,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  overviewSubtitle: {
    marginTop: 2,
    fontSize: 14,
    color: "#6B7280",
  },
  overviewMetricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  metricCard: {
    flexBasis: "31%",
    flexGrow: 1,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    padding: 16,
    gap: 12,
    minWidth: 160,
  },
  metricCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  metricValueLarge: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  metricValueTrend: {
    fontSize: 18,
    fontWeight: "700",
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
  insightsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  insightCard: {
    flexBasis: "31%",
    flexGrow: 1,
    minWidth: 160,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    padding: 18,
    gap: 10,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF4EF",
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  insightValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  insightCaption: {
    fontSize: 13,
    color: "#6B7280",
  },
  dailyCard: {
    marginTop: 18,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    padding: 18,
    gap: 18,
  },
  dailyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  dailyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  dailySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  dailyList: {
    gap: 14,
  },
  dailyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  dailyBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  dailyBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4B5563",
  },
  dailyMeta: {
    flex: 1,
    gap: 4,
  },
  dailyLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  dailyOrders: {
    fontSize: 12,
    color: "#6B7280",
  },
  dailyTotals: {
    alignItems: "flex-end",
    gap: 4,
  },
  dailyRevenue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  dailyChange: {
    fontSize: 12,
    fontWeight: "600",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  summaryCard: {
    flexBasis: "47%",
    borderRadius: 20,
    backgroundColor: "#ffffff",
    padding: 18,
    gap: 12,
  },
  summaryCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  summaryIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1EB",
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
  trendIndexBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F4F4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  trendIndexText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4F46E5",
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
  topItemsList: {
    gap: 12,
  },
  topItemCard: {
    borderRadius: 18,
    backgroundColor: "#ffffff",
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
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
