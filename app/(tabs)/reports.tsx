import { useState } from "react";
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
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");

  // Get staff record for current user
  const { data: staffRecord } = trpc.staff.getByUserId.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

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
      staffId: staffRecord?.id || 0,
      startDate,
      endDate,
    },
    { enabled: !!staffRecord?.id }
  );

  // Get monthly billable hours for current month
  const currentDate = new Date();
  const { data: currentMonthHours } = trpc.reports.monthlyBillableHours.useQuery(
    {
      staffId: staffRecord?.id || 0,
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
    },
    { enabled: !!staffRecord?.id }
  );

  const averageSessionDuration = reportData?.sessions.length
    ? reportData.sessions.reduce((sum, s) => sum + (s.sessionDuration || 0), 0) / reportData.sessions.length
    : 0;

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

        {reportLoading ? (
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
                <Text className="text-3xl font-bold text-foreground">{reportData?.totalSessions || 0}</Text>
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
                  {reportData?.totalBillableHours.toFixed(2) || "0.00"}
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
            {reportData && reportData.sessions.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-foreground mb-4">Recent Sessions</Text>
                <View className="gap-3">
                  {reportData.sessions.slice(0, 10).map((session) => (
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
                        <Text className="text-lg font-bold text-primary">{session.billableHours || "0.00"}</Text>
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
