import { useMemo, useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

/**
 * Reports Screen (Reports Tab)
 * 
 * Displays:
 * - Report type selector
 * - Date range picker with presets
 * - Summary metrics cards
 * - Data visualization (charts)
 * - Export options
 */
export default function ReportsScreen() {
  const colors = useColors();
  const { staff } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");
  const staffId = staff?.id || 0;

  // Calculate date range based on selected period
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();

    switch (selectedPeriod) {
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  // Get billable hours report
  const { data: reportData, isLoading: reportLoading } = trpc.reports.billableHoursByStaff.useQuery(
    {
      staffId,
      startDate,
      endDate,
    },
    { enabled: !!staffId }
  );

  const { data: allSessions, isLoading: sessionsLoading } = trpc.sessions.listAll.useQuery(undefined, {
    enabled: !!staffId,
  });

  // Get monthly billable hours for current month
  const currentDate = new Date();
  const { data: currentMonthHours } = trpc.reports.monthlyBillableHours.useQuery(
    {
      staffId,
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
    },
    { enabled: !!staffId }
  );

  const getEffectiveSessionDate = (session: any): Date | null => {
    const candidate = session.sessionStartTime || session.completedAt || session.scheduledDate || session.createdAt;
    if (!candidate) return null;
    const dt = new Date(candidate);
    return Number.isNaN(dt.getTime()) ? null : dt;
  };

  const getSessionDurationMinutes = (session: any): number => {
    if (typeof session.sessionDuration === "number" && Number.isFinite(session.sessionDuration)) {
      return session.sessionDuration;
    }
    if (session.sessionStartTime && session.sessionEndTime) {
      const start = new Date(session.sessionStartTime).getTime();
      const end = new Date(session.sessionEndTime).getTime();
      if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
        return Math.round((end - start) / (1000 * 60));
      }
    }
    return 0;
  };

  const filteredSessions = useMemo(() => {
    if (!allSessions || !staffId) return [];
    return allSessions
      .filter((s: any) => Number(s.staffId) === Number(staffId))
      .filter((s: any) => {
        const dt = getEffectiveSessionDate(s);
        return !!dt && dt >= startDate && dt <= endDate;
      })
      .sort((a: any, b: any) => {
        const aTime = getEffectiveSessionDate(a)?.getTime() || 0;
        const bTime = getEffectiveSessionDate(b)?.getTime() || 0;
        return bTime - aTime;
      });
  }, [allSessions, staffId, startDate, endDate]);

  const averageSessionDuration = filteredSessions.length
    ? filteredSessions.reduce((sum: number, s: any) => sum + getSessionDurationMinutes(s), 0) / filteredSessions.length
    : 0;

  const reportHours = typeof reportData === "number" ? reportData : 0;
  const isLoading = reportLoading || sessionsLoading;

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <Text className="text-2xl font-bold text-foreground">Reports</Text>
        <Text className="text-sm text-muted mt-1">Billable hours and activity summary</Text>
      </View>

      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }}>
        {/* Period Selector */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-3">Time Period</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl border ${
                selectedPeriod === "week" ? "bg-primary border-primary" : "bg-surface border-border"
              }`}
              onPress={() => setSelectedPeriod("week")}
            >
              <Text
                className={`text-center font-medium ${
                  selectedPeriod === "week" ? "text-background" : "text-foreground"
                }`}
              >
                This Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl border ${
                selectedPeriod === "month" ? "bg-primary border-primary" : "bg-surface border-border"
              }`}
              onPress={() => setSelectedPeriod("month")}
            >
              <Text
                className={`text-center font-medium ${
                  selectedPeriod === "month" ? "text-background" : "text-foreground"
                }`}
              >
                This Month
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl border ${
                selectedPeriod === "year" ? "bg-primary border-primary" : "bg-surface border-border"
              }`}
              onPress={() => setSelectedPeriod("year")}
            >
              <Text
                className={`text-center font-medium ${
                  selectedPeriod === "year" ? "text-background" : "text-foreground"
                }`}
              >
                This Year
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* Summary Metrics */}
            <View className="gap-4 mb-6">
              {/* Total Sessions */}
              <View className="bg-surface rounded-2xl p-6 border border-border">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-medium text-muted">Total Sessions</Text>
                  <IconSymbol name="calendar" size={20} color={colors.primary} />
                </View>
                <Text className="text-3xl font-bold text-foreground">{filteredSessions.length}</Text>
                <Text className="text-xs text-muted mt-1">
                  {selectedPeriod === "week" ? "Last 7 days" : selectedPeriod === "month" ? "Last 30 days" : "Last 365 days"}
                </Text>
              </View>

              {/* Total Billable Hours */}
              <View className="bg-surface rounded-2xl p-6 border border-border">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-medium text-muted">Total Billable Hours</Text>
                  <IconSymbol name="clock.fill" size={20} color={colors.success} />
                </View>
                <Text className="text-3xl font-bold text-foreground">
                  {reportHours.toFixed(2)}
                </Text>
                <Text className="text-xs text-muted mt-1">Hours billed in selected period</Text>
              </View>

              {/* Average Session Duration */}
              <View className="bg-surface rounded-2xl p-6 border border-border">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-medium text-muted">Average Duration</Text>
                  <IconSymbol name="chart.bar.fill" size={20} color={colors.warning} />
                </View>
                <Text className="text-3xl font-bold text-foreground">{averageSessionDuration.toFixed(0)}</Text>
                <Text className="text-xs text-muted mt-1">Minutes per session</Text>
              </View>
            </View>

            {/* Current Month Summary */}
            <View className="bg-primary/10 rounded-2xl p-6 border border-primary/30 mb-6">
              <Text className="text-sm font-semibold text-primary mb-2">Current Month Progress</Text>
              <Text className="text-2xl font-bold text-foreground">{currentMonthHours?.toFixed(2) || "0.00"} hrs</Text>
              <Text className="text-sm text-muted mt-1">
                {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </Text>
            </View>

            {/* Recent Sessions List */}
            {filteredSessions.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-foreground mb-4">Recent Sessions</Text>
                <View className="gap-3">
                  {filteredSessions.slice(0, 10).map((session: any) => (
                    <View
                      key={session.id}
                      className="bg-surface rounded-xl p-4 border border-border flex-row items-center justify-between"
                    >
                      <View className="flex-1">
                        <Text className="text-base font-medium text-foreground">Client #{session.clientId}</Text>
                        <Text className="text-sm text-muted mt-1">
                          {session.completedAt ? new Date(session.completedAt).toLocaleDateString() : "Not completed"}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-lg font-bold text-primary">{String(session.billableHours || "0.00")}</Text>
                        <Text className="text-xs text-muted">hours</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Export Button */}
            <TouchableOpacity
              className="bg-surface py-4 rounded-xl border border-border items-center flex-row justify-center gap-2"
              onPress={() => {
                // Export report functionality
                alert("Export functionality will be implemented");
              }}
            >
              <IconSymbol name="paperplane.fill" size={20} color={colors.foreground} />
              <Text className="text-base font-semibold text-foreground">Export Report</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
