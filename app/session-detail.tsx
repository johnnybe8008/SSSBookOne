import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = id ? parseInt(id) : 0;
  const colors = useColors();

  const { data: session, isLoading } = trpc.sessions.get.useQuery({ id: sessionId });
  const { data: client } = trpc.clients.get.useQuery(
    { id: session?.clientId || 0 },
    { enabled: !!session?.clientId }
  );
  const { data: staff } = trpc.staff.get.useQuery(
    { id: session?.staffId || 0 },
    { enabled: !!session?.staffId }
  );

  if (isLoading) {
    return (
      <ScreenContainer className="p-4">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text className="mt-4 text-muted">Loading session...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!session) {
    return (
      <ScreenContainer className="p-4">
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground text-lg">Session not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-primary rounded-lg px-6 py-3"
          >
            <Text className="text-background font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Session Details</Text>
          <Text className="text-sm text-muted mt-1">Session ID: {session.id}</Text>
        </View>

        {/* Session Info Cards */}
        <View className="gap-4">
          {/* Client Info */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-sm font-semibold text-muted mb-3">Client Information</Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Client Name:</Text>
                <Text className="text-sm font-medium text-foreground">{client?.name || `Client #${session.clientId}`}</Text>
              </View>
              {client?.email && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Email:</Text>
                  <Text className="text-sm font-medium text-foreground">{client.email}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Staff Info */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-sm font-semibold text-muted mb-3">Staff Information</Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Staff Name:</Text>
                <Text className="text-sm font-medium text-foreground">{staff?.name || `Staff #${session.staffId}`}</Text>
              </View>
            </View>
          </View>

          {/* Session Details */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-sm font-semibold text-muted mb-3">Session Details</Text>
            <View className="gap-2">
              {session.scheduledDate && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Scheduled:</Text>
                  <Text className="text-sm font-medium text-foreground">
                    {new Date(session.scheduledDate).toLocaleString()}
                  </Text>
                </View>
              )}
              {session.sessionStartTime && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Start Time:</Text>
                  <Text className="text-sm font-medium text-foreground">
                    {new Date(session.sessionStartTime).toLocaleTimeString()}
                  </Text>
                </View>
              )}
              {session.sessionEndTime && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">End Time:</Text>
                  <Text className="text-sm font-medium text-foreground">
                    {new Date(session.sessionEndTime).toLocaleTimeString()}
                  </Text>
                </View>
              )}
              {session.billableHours !== null && session.billableHours !== undefined && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Billable Hours:</Text>
                  <Text className="text-sm font-medium text-primary">{session.billableHours} hrs</Text>
                </View>
              )}
              {session.completedAt && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Completed:</Text>
                  <Text className="text-sm font-medium text-success">
                    {new Date(session.completedAt).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Notes */}
          {session.notes && (
            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-sm font-semibold text-muted mb-3">Session Notes</Text>
              <Text className="text-sm text-foreground leading-relaxed">{session.notes}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="gap-3 mt-8 mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary rounded-lg p-4"
          >
            <Text className="text-background font-semibold text-center text-lg">Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
