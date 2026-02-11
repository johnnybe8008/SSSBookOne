import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

/**
 * Clients List Screen
 * 
 * Displays all clients with:
 * - Search functionality
 * - Filter by status
 * - Navigate to client detail
 * - Add new client
 */
export default function ClientsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Search clients
  const { data: searchResults, isLoading: searchLoading } = trpc.clients.search.useQuery(
    { searchTerm },
    { enabled: searchTerm.length >= 2 }
  );

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
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xl font-bold text-foreground">Clients</Text>
          <TouchableOpacity
            className="bg-primary w-10 h-10 rounded-full items-center justify-center"
            onPress={() => router.push("/add-client" as any)}
          >
            <IconSymbol name="plus" size={24} color={colors.background} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-surface rounded-xl px-4 py-2 border border-border">
          <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
          <TextInput
            className="flex-1 ml-2 text-base text-foreground"
            placeholder="Search clients by name..."
            placeholderTextColor={colors.muted}
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoCapitalize="words"
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm("")}>
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
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
                <Text className="text-sm font-medium text-foreground">Active</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border">
                <Text className="text-sm font-medium text-foreground">Inactive</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border">
                <Text className="text-sm font-medium text-foreground">Referred</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border">
                <Text className="text-sm font-medium text-foreground">On Hold</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Client List */}
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }}>
        {searchLoading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : searchTerm.length >= 2 && searchResults && searchResults.length > 0 ? (
          <View className="gap-4">
            {searchResults.map((client: any) => (
              <TouchableOpacity
                key={client.id}
                className="bg-surface rounded-2xl p-5 border border-border"
                onPress={() => router.push(`/client/${client.id}` as any)}
              >
                {/* Header with Name and Status */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground">{client.name}</Text>
                    {client.title && (
                      <Text className="text-sm text-muted mt-1">{client.title}</Text>
                    )}
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

                {/* Contact Info */}
                {(client.email || client.mobilePhone) && (
                  <View className="gap-2 mb-3">
                    {client.email && (
                      <View className="flex-row items-center gap-2">
                        <IconSymbol name="envelope.fill" size={14} color={colors.muted} />
                        <Text className="text-sm text-muted">{client.email}</Text>
                      </View>
                    )}
                    {client.mobilePhone && (
                      <View className="flex-row items-center gap-2">
                        <IconSymbol name="phone.fill" size={14} color={colors.muted} />
                        <Text className="text-sm text-muted">{client.mobilePhone}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Additional Info */}
                <View className="flex-row items-center gap-4 pt-3 border-t border-border">
                  {client.age && (
                    <Text className="text-sm text-muted">Age: {client.age}</Text>
                  )}
                  {client.occupation && (
                    <Text className="text-sm text-muted">{client.occupation}</Text>
                  )}
                  {client.isVip === 1 && (
                    <View className="px-2 py-1 bg-warning/20 rounded">
                      <Text className="text-xs font-medium text-warning">VIP</Text>
                    </View>
                  )}
                </View>

                {/* Chevron */}
                <View className="absolute top-5 right-5">
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : searchTerm.length >= 2 && searchResults && searchResults.length === 0 ? (
          <View className="items-center justify-center py-12">
            <IconSymbol name="magnifyingglass" size={48} color={colors.muted} />
            <Text className="text-base text-muted text-center mt-4">No clients found</Text>
            <Text className="text-sm text-muted text-center mt-2">Try a different search term</Text>
          </View>
        ) : (
          <View className="items-center justify-center py-12">
            <IconSymbol name="person.2.fill" size={48} color={colors.muted} />
            <Text className="text-base text-muted text-center mt-4">Search for clients</Text>
            <Text className="text-sm text-muted text-center mt-2">Enter at least 2 characters to search</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
