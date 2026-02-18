import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter, useLocalSearchParams } from "expo-router";

/**
 * Client Detail Screen
 * 
 * Displays:
 * - Client profile information
 * - Contact details
 * - Session history
 * - Quick actions (edit, record session)
 */
export default function ClientDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const clientId = parseInt(id as string);

  // Fetch client data
  const { data: client, isLoading } = trpc.clients.get.useQuery({ id: clientId });

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!client) {
    return (
      <ScreenContainer className="items-center justify-center px-6">
        <IconSymbol name="person.fill.xmark" size={64} color={colors.muted} />
        <Text className="text-lg text-muted text-center mt-4">Client not found</Text>
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-full mt-6"
          onPress={() => router.back()}
        >
          <Text className="text-background font-semibold">Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      Active: colors.success,
      Inactive: colors.muted,
      Referred: colors.warning,
      "On Hold": colors.error,
    };
    return statusColors[status] || colors.muted;
  };

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">{client.name}</Text>
              {client.title && (
                <Text className="text-sm text-muted mt-1">{client.title}</Text>
              )}
            </View>
          </View>
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: `${getStatusColor(client.status)}20` }}
          >
            <Text
              className="text-xs font-medium"
              style={{ color: getStatusColor(client.status) }}
            >
              {client.status}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Quick Actions */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-primary py-3 rounded-xl items-center"
              onPress={() => router.push({
                pathname: "/record-session" as any,
                params: {
                  clientId: client.id,
                  clientName: client.name,
                  clientEmail: client.email || '',
                }
              })}
            >
              <Text className="text-background font-semibold">Record Session</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-surface border border-border py-3 rounded-xl items-center"
              onPress={() => router.push(`/edit-client/${client.id}` as any)}
            >
              <Text className="text-foreground font-semibold">Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Referral Source */}
          {client.referralSourceType && (
            <View className="bg-warning/10 border border-warning/30 rounded-2xl p-4">
              <View className="flex-row items-center gap-2">
                <IconSymbol name="person.badge.plus" size={20} color={colors.warning} />
                <Text className="text-sm font-semibold text-warning">Referred By</Text>
              </View>
              <View className="mt-2 flex-row items-center gap-2">
                <View
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: `${colors.primary}20` }}
                >
                  <Text className="text-xs font-medium text-primary">
                    {client.referralSourceType === 'fsm' ? 'FSM' : 
                     client.referralSourceType === 'staff' ? 'Staff' : 
                     client.referralSourceType === 'client' ? 'Client' : 'Unknown'}
                  </Text>
                </View>
                {client.referralSourceId && (
                  <Text className="text-sm text-foreground">ID: {client.referralSourceId}</Text>
                )}
              </View>
            </View>
          )}

          {/* Contact Information */}
          <View className="bg-surface border border-border rounded-2xl p-4">
            <Text className="text-base font-semibold text-foreground mb-3">Contact Information</Text>
            <View className="gap-3">
              {client.email && (
                <View className="flex-row items-center gap-3">
                  <IconSymbol name="envelope.fill" size={20} color={colors.primary} />
                  <Text className="text-base text-foreground flex-1">{client.email}</Text>
                </View>
              )}
              {client.mobilePhone && (
                <View className="flex-row items-center gap-3">
                  <IconSymbol name="phone.fill" size={20} color={colors.primary} />
                  <Text className="text-base text-foreground flex-1">{client.mobilePhone}</Text>
                </View>
              )}
              {client.homePhone && (
                <View className="flex-row items-center gap-3">
                  <IconSymbol name="phone.fill" size={20} color={colors.muted} />
                  <View className="flex-1">
                    <Text className="text-sm text-muted">Home</Text>
                    <Text className="text-base text-foreground">{client.homePhone}</Text>
                  </View>
                </View>
              )}
              {client.workPhone && (
                <View className="flex-row items-center gap-3">
                  <IconSymbol name="phone.fill" size={20} color={colors.muted} />
                  <View className="flex-1">
                    <Text className="text-sm text-muted">Work</Text>
                    <Text className="text-base text-foreground">{client.workPhone}</Text>
                  </View>
                </View>
              )}
              {client.address && (
                <View className="flex-row items-start gap-3 pt-2 border-t border-border">
                  <IconSymbol name="mappin.circle.fill" size={20} color={colors.primary} />
                  <Text className="text-base text-foreground flex-1">{client.address}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Professional Information */}
          <View className="bg-surface border border-border rounded-2xl p-4">
            <Text className="text-base font-semibold text-foreground mb-3">Professional Information</Text>
            <View className="gap-3">
              {client.occupation && (
                <View>
                  <Text className="text-sm text-muted">Occupation</Text>
                  <Text className="text-base text-foreground mt-1">{client.occupation}</Text>
                </View>
              )}
              {client.dateOfBirth && (
                <View>
                  <Text className="text-sm text-muted">Date of Birth</Text>
                  <Text className="text-base text-foreground mt-1">
                    {new Date(client.dateOfBirth).toLocaleDateString()} (Age: {Math.floor((Date.now() - new Date(client.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))})
                  </Text>
                </View>
              )}
              {client.timeInService && (
                <View>
                  <Text className="text-sm text-muted">Time in Service</Text>
                  <Text className="text-base text-foreground mt-1">{client.timeInService} months</Text>
                </View>
              )}
            </View>
          </View>

          {/* Preferences */}
          <View className="bg-surface border border-border rounded-2xl p-4">
            <Text className="text-base font-semibold text-foreground mb-3">Preferences</Text>
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Notification Preference</Text>
                <Text className="text-base text-foreground font-medium">
                  {client.notificationPreference === "sms" ? "SMS" : "WhatsApp"}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Notifications</Text>
                <Text className="text-base text-foreground font-medium">
                  {client.notificationOptOut === 1 ? "Opted Out" : "Enabled"}
                </Text>
              </View>
              {client.isVip === 1 && (
                <View className="flex-row items-center gap-2 pt-2 border-t border-border">
                  <View className="px-3 py-1 bg-warning/20 rounded-full">
                    <Text className="text-xs font-medium text-warning">VIP CLIENT</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Session History */}
          <View className="bg-surface border border-border rounded-2xl p-4">
            <Text className="text-base font-semibold text-foreground mb-3">Session History</Text>
            <View className="items-center py-6">
              <IconSymbol name="calendar" size={48} color={colors.muted} />
              <Text className="text-base text-muted text-center mt-4">No sessions recorded yet</Text>
              <Text className="text-sm text-muted text-center mt-2">Record your first session with this client</Text>
            </View>
          </View>

          {/* Metadata */}
          <View className="bg-surface border border-border rounded-2xl p-4 mb-6">
            <Text className="text-base font-semibold text-foreground mb-3">Record Information</Text>
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Created</Text>
                <Text className="text-sm text-foreground">
                  {new Date(client.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Last Updated</Text>
                <Text className="text-sm text-foreground">
                  {new Date(client.updatedAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
