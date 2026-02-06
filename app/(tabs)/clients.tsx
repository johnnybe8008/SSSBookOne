import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

/**
 * Clients Screen (Clients Tab)
 * 
 * Displays:
 * - Search bar for client lookup
 * - Filter chips for company/division/department
 * - Scrollable list of client cards
 * - Floating action button to add new client
 */
export default function ClientsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // Search clients
  const { data: searchResults, isLoading: searchLoading } = trpc.clients.search.useQuery(
    { searchTerm },
    { enabled: searchTerm.length >= 2 }
  );

  // Get all companies for filtering
  const { data: companies } = trpc.companies.list.useQuery();

  return (
    <ScreenContainer className="flex-1">
      {/* Search Bar */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center bg-surface rounded-xl px-4 py-3 border border-border">
          <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
          <TextInput
            className="flex-1 ml-3 text-base text-foreground"
            placeholder="Search clients by name or email..."
            placeholderTextColor={colors.muted}
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm("")}>
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View className="px-6 py-3 bg-background">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            <TouchableOpacity className="px-4 py-2 bg-surface rounded-full border border-border flex-row items-center gap-2">
              <IconSymbol name="line.3.horizontal.decrease" size={16} color={colors.foreground} />
              <Text className="text-sm font-medium text-foreground">All Companies</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-4 py-2 bg-surface rounded-full border border-border flex-row items-center gap-2">
              <IconSymbol name="star.fill" size={16} color={colors.warning} />
              <Text className="text-sm font-medium text-foreground">VIP Only</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-4 py-2 bg-surface rounded-full border border-border">
              <Text className="text-sm font-medium text-foreground">Active</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Client List */}
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 100 }}>
        {searchLoading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : searchTerm.length >= 2 && searchResults ? (
          searchResults.length > 0 ? (
            <View className="gap-4 py-4">
              {searchResults.map((client) => (
                <TouchableOpacity
                  key={client.id}
                  className="bg-surface rounded-2xl p-5 border border-border"
                  onPress={() => {
                    // Navigate to client detail
                    router.push(`/client/${client.id}` as any);
                  }}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-lg font-semibold text-foreground">{client.name}</Text>
                        {client.isVip === 1 && (
                          <IconSymbol name="star.fill" size={18} color={colors.warning} />
                        )}
                      </View>
                      <Text className="text-sm text-muted mt-1">
                        {client.title || "No title"} • {client.occupation || "No occupation"}
                      </Text>
                    </View>
                    <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                  </View>

                  {/* Contact Information */}
                  <View className="gap-2 mb-3">
                    {client.mobilePhone && (
                      <View className="flex-row items-center gap-2">
                        <IconSymbol name="phone.fill" size={14} color={colors.muted} />
                        <Text className="text-sm text-muted">{client.mobilePhone}</Text>
                      </View>
                    )}
                    {client.email && (
                      <View className="flex-row items-center gap-2">
                        <IconSymbol name="envelope.fill" size={14} color={colors.muted} />
                        <Text className="text-sm text-muted">{client.email}</Text>
                      </View>
                    )}
                  </View>

                  {/* Status Badge */}
                  <View className="flex-row items-center gap-2">
                    <View className={`px-3 py-1 rounded-full ${client.status === "Active" ? "bg-success/20" : "bg-muted/20"}`}>
                      <Text className={`text-xs font-medium ${client.status === "Active" ? "text-success" : "text-muted"}`}>
                        {client.status}
                      </Text>
                    </View>
                    {client.notificationOptOut === 1 && (
                      <View className="px-3 py-1 rounded-full bg-warning/20">
                        <Text className="text-xs font-medium text-warning">Opted Out</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="items-center justify-center py-12">
              <Text className="text-base text-muted text-center">No clients found matching "{searchTerm}"</Text>
              <Text className="text-sm text-muted text-center mt-2">Try a different search term</Text>
            </View>
          )
        ) : (
          <View className="items-center justify-center py-12">
            <IconSymbol name="magnifyingglass" size={48} color={colors.muted} />
            <Text className="text-base text-muted text-center mt-4">Search for clients by name or email</Text>
            <Text className="text-sm text-muted text-center mt-2">Enter at least 2 characters to search</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <View className="absolute bottom-6 right-6">
        <TouchableOpacity
          className="bg-primary w-16 h-16 rounded-full items-center justify-center"
          style={{ shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
          onPress={() => {
            // Navigate to add client screen
            router.push("/add-client" as any);
          }}
        >
          <IconSymbol name="plus.circle.fill" size={32} color={colors.background} />
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
