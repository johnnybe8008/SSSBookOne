import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useStaffRole } from "@/hooks/use-staff-role";
import { useRouter } from "expo-router";

/**
 * Sessions Screen (Sessions Tab)
 * 
 * Displays:
 * - Filter bar for date range, status, type
 * - Scrollable list of session cards
 * - Edit indicators for sessions within 48-hour window
 */
export default function SessionsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { staff } = useAuth();
  const { isAdmin } = useStaffRole();
  const [showFilters, setShowFilters] = useState(false);

  // Debug: log staffRecord and staffId
  if (!isAdmin) {
    // eslint-disable-next-line no-console
    console.log('Staff user:', staff, 'staffId used:', staff?.id);
  }

  // Get sessions: all for admin, only own for staff
  const { data: sessions, isLoading: sessionsLoading } = isAdmin
    ? trpc.sessions.listAll.useQuery()
    : trpc.sessions.listByStaff.useQuery(
        { staffId: staff?.id || 0 },
        { enabled: !!staff?.id }
      );

  // Get session types and statuses for filtering
  const { data: sessionTypes } = trpc.sessionTypes.list.useQuery();
  const { data: sessionStatuses } = trpc.sessionStatuses.list.useQuery();

  const getSessionTypeLabel = (session: any) => {
    if (session?.sessionTypeName) return session.sessionTypeName;
    return sessionTypes?.find((t) => t.id === session.sessionTypeId)?.name || `Type #${session.sessionTypeId}`;
  };

  const getSessionStatusLabel = (session: any) => {
    if (session?.sessionStatusName) return session.sessionStatusName;
    return sessionStatuses?.find((s) => s.id === session.sessionStatusId)?.name || `Status #${session.sessionStatusId}`;
  };

  const getFolderLabel = (session: any) => {
    const folderNumber = session?.folderNumber || session?.folderId;
    const description = (session?.folderDescription || "").trim();
    if (description) {
      return `Folder #${folderNumber} ${description}`;
    }
    return `Folder #${folderNumber}`;
  };

  const getStatusColor = (statusId: number) => {
    // This is a simplified version - in production, map statusId to actual status name
    const statusColors: { [key: number]: string } = {
      1: colors.primary, // Scheduled
      2: colors.warning, // In Progress
      3: colors.success, // Completed
      4: colors.muted, // Cancelled
      5: colors.error, // No-show
    };
    return statusColors[statusId] || colors.muted;
  };

  return (
    <ScreenContainer className="flex-1">
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-foreground">Sessions</Text>
          <TouchableOpacity
            className="flex-row items-center gap-2 px-4 py-2 bg-surface rounded-full border border-border"
            onPress={() => setShowFilters(!showFilters)}
          >
            <IconSymbol name="line.3.horizontal.decrease" size={18} color={colors.foreground} />
            <Text className="text-sm font-medium text-foreground">Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Panel (collapsed by default) */}
      {showFilters && (
        <View className="px-6 py-4 bg-surface border-b border-border">
          <Text className="text-sm font-semibold text-foreground mb-3">Filter by Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border">
                <Text className="text-sm font-medium text-foreground">All</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border">
                <Text className="text-sm font-medium text-foreground">Scheduled</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border">
                <Text className="text-sm font-medium text-foreground">Completed</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border">
                <Text className="text-sm font-medium text-foreground">In Progress</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Add Session Button at Top */}
      <View className="px-6 pt-4 pb-2 flex-row justify-end">
        <TouchableOpacity
          className="bg-primary w-12 h-12 rounded-full items-center justify-center shadow-lg"
          onPress={() => router.push("/record-session" as any)}
          style={{ elevation: 8 }}
        >
          <IconSymbol name="plus.circle.fill" size={28} color={colors.background} />
        </TouchableOpacity>
      </View>

      {/* Session List */}
      <View className="flex-1">
        <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }}>
          {sessionsLoading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : sessions && sessions.length > 0 ? (
            <View className="gap-4">
              {[...sessions]
                .sort((a, b) => new Date(b.sessionStartTime || b.createdAt).getTime() - new Date(a.sessionStartTime || a.createdAt).getTime())
                .map((session) => {
                const canEdit = session.completedAt
                  ? (new Date().getTime() - new Date(session.completedAt).getTime()) / (1000 * 60 * 60) <= 48
                  : true;

                return (
                  <TouchableOpacity
                    key={session.id}
                    className="bg-surface rounded-2xl p-5 border border-border"
                    activeOpacity={1}
                  >
                    {/* Header with Client and Edit Indicator */}
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-foreground">
                          {session.clientName || `Client #${session.clientId}`}
                        </Text>
                        <Text className="text-sm text-muted mt-1">{getFolderLabel(session)}</Text>
                      </View>
                      <View className="items-end">
                        {canEdit ? (
                          <TouchableOpacity
                            onPress={() =>
                              router.push({
                                pathname: `/edit-session/${session.id}` as any,
                                params: { returnTo: "/(tabs)/sessions" },
                              } as any)
                            }
                          >
                            <Text className="text-sm font-semibold text-primary">Edit</Text>
                          </TouchableOpacity>
                        ) : (
                          <Text className="text-xs font-medium text-muted">Locked</Text>
                        )}
                      </View>
                    </View>

                    {/* Session Type and Status */}
                    <View className="flex-row items-center gap-2 mb-3">
                      <View className="px-3 py-1 bg-background rounded-full border border-border">
                        <Text className="text-xs font-medium text-foreground">{getSessionTypeLabel(session)}</Text>
                      </View>
                      <View
                        className="px-3 py-1 rounded-full"
                        style={{ backgroundColor: `${getStatusColor(session.sessionStatusId)}20` }}
                      >
                        <Text
                          className="text-xs font-medium"
                          style={{ color: getStatusColor(session.sessionStatusId) }}
                        >
                          {getSessionStatusLabel(session)}
                        </Text>
                      </View>
                    </View>

                    {/* Date and Duration */}
                    <View className="flex-row items-center gap-4 mb-3">
                      <View className="flex-row items-center gap-2">
                        <IconSymbol name="calendar" size={14} color={colors.muted} />
                        <Text className="text-sm text-muted">
                          {session.completedAt
                            ? new Date(session.completedAt).toLocaleDateString()
                            : session.scheduledDate
                            ? new Date(session.scheduledDate).toLocaleDateString()
                            : "Not scheduled"}
                        </Text>
                      </View>
                      {session.sessionDuration && (
                        <View className="flex-row items-center gap-2">
                          <IconSymbol name="clock.fill" size={14} color={colors.muted} />
                          <Text className="text-sm text-muted">{session.sessionDuration} min</Text>
                        </View>
                      )}
                    </View>

                    {/* Billable Hours */}
                    {session.billableHours && (
                      <View className="pt-3 border-t border-border">
                        <Text className="text-sm text-muted">
                          Billable Hours: <Text className="font-semibold text-primary">{session.billableHours} hrs</Text>
                        </Text>
                      </View>
                    )}

                    {/* Notes Preview */}
                    {session.notes && (
                      <View className="pt-3 border-t border-border mt-3">
                        <Text className="text-sm text-muted" numberOfLines={2}>
                          {session.notes}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View className="items-center justify-center py-12">
              <IconSymbol name="calendar" size={48} color={colors.muted} />
              <Text className="text-base text-muted text-center mt-4">
                {isAdmin ? "No sessions recorded yet" : "No sessions found for your account"}
              </Text>
              <Text className="text-sm text-muted text-center mt-2">
                {isAdmin
                  ? "Start by recording your first session"
                  : "Only sessions assigned to your staff ID appear here."}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
