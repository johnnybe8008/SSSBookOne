import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";

/**
 * Dashboard Screen (Home Tab)
 * 
 * Displays:
 * - Welcome message with staff name
 * - Upcoming sessions (next 7 days)
 * - Recent sessions (last 7 days)
 * - Monthly billable hours summary
 * - Sync status indicator
 */
export default function DashboardScreen() {
  const colors = useColors();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // Get staff record for current user
  const { data: staffRecord, isLoading: staffLoading } = trpc.staff.getByUserId.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  // Get upcoming sessions (next 7 days)
  const { data: upcomingSessions, isLoading: upcomingLoading } = trpc.sessions.upcoming.useQuery(
    { staffId: staffRecord?.id || 0, days: 7 },
    { enabled: !!staffRecord?.id }
  );

  // Get recent sessions (last 7 days)
  const { data: recentSessions, isLoading: recentLoading } = trpc.sessions.recent.useQuery(
    { staffId: staffRecord?.id || 0, days: 7 },
    { enabled: !!staffRecord?.id }
  );

  // Get monthly billable hours
  const currentDate = new Date();
  const { data: monthlyHours, isLoading: hoursLoading } = trpc.reports.monthlyBillableHours.useQuery(
    {
      staffId: staffRecord?.id || 0,
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
    },
    { enabled: !!staffRecord?.id }
  );

  if (authLoading || staffLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <Text className="text-xl font-semibold text-foreground mb-4">Welcome to DoH Book One</Text>
        <Text className="text-base text-muted text-center mb-6">
          Please log in to access your counseling sessions and client information.
        </Text>
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-full"
          onPress={() => router.push("/login" as any)}
        >
          <Text className="text-background font-semibold">Log In</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const currentMonth = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Welcome Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">Welcome back,</Text>
            <Text className="text-2xl font-semibold text-primary">{staffRecord?.name || user?.name || "Staff"}</Text>
            <Text className="text-sm text-muted mt-1">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</Text>
          </View>

          {/* Monthly Billable Hours Summary */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-foreground">{currentMonth} Hours</Text>
              <IconSymbol name="clock.fill" size={24} color={colors.primary} />
            </View>
            {hoursLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Text className="text-4xl font-bold text-primary">{monthlyHours?.toFixed(2) || "0.00"}</Text>
                <Text className="text-sm text-muted mt-1">Billable hours this month</Text>
              </>
            )}
          </View>

          {/* Upcoming Sessions */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-foreground">Upcoming Sessions</Text>
              <Text className="text-sm text-muted">Next 7 days</Text>
            </View>
            {upcomingLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : upcomingSessions && upcomingSessions.length > 0 ? (
              <View className="gap-3">
                {upcomingSessions.slice(0, 5).map((session) => (
                  <TouchableOpacity
                    key={session.id}
                    className="flex-row items-center justify-between py-3 border-b border-border"
                    onPress={() => {
                      // Navigate to session detail
                    }}
                  >
                    <View className="flex-1">
                      <Text className="text-base font-medium text-foreground">Client #{session.clientId}</Text>
                      <Text className="text-sm text-muted">
                        {session.scheduledDate ? new Date(session.scheduledDate).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Not scheduled"}
                      </Text>
                    </View>
                    <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text className="text-sm text-muted text-center py-4">No upcoming sessions</Text>
            )}
          </View>

          {/* Recent Sessions */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-foreground">Recent Sessions</Text>
              <Text className="text-sm text-muted">Last 7 days</Text>
            </View>
            {recentLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : recentSessions && recentSessions.length > 0 ? (
              <View className="gap-3">
                {recentSessions.slice(0, 5).map((session) => (
                  <TouchableOpacity
                    key={session.id}
                    className="flex-row items-center justify-between py-3 border-b border-border"
                    onPress={() => {
                      // Navigate to session detail
                    }}
                  >
                    <View className="flex-1">
                      <Text className="text-base font-medium text-foreground">Client #{session.clientId}</Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <Text className="text-sm text-muted">
                          {session.completedAt ? new Date(session.completedAt).toLocaleDateString() : "In progress"}
                        </Text>
                        {session.billableHours && (
                          <Text className="text-sm font-medium text-primary">{session.billableHours} hrs</Text>
                        )}
                      </View>
                    </View>
                    <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text className="text-sm text-muted text-center py-4">No recent sessions</Text>
            )}
          </View>

          {/* Quick Action Button */}
          <TouchableOpacity
            className="bg-primary py-4 rounded-full items-center"
            style={{ shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
            onPress={() => {
              // Navigate to session recording screen
              router.push("/record-session" as any);
            }}
          >
            <View className="flex-row items-center gap-2">
              <IconSymbol name="plus.circle.fill" size={24} color={colors.background} />
              <Text className="text-background text-lg font-semibold">Record New Session</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
