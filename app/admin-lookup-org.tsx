import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";

/**
 * Admin - Organizational Lookup Tables
 * 
 * Submenu for managing organizational entities with global search:
 * - Divisions
 * - Departments  
 * - Company Teams
 */
export default function AdminLookupOrgScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all organizational data for search
  const { data: divisions, isLoading: divisionsLoading } = trpc.divisions.list.useQuery({ companyId: 0 });
  const { data: departments, isLoading: departmentsLoading } = trpc.departments.list.useQuery({ divisionId: 0 });
  const { data: companyTeams, isLoading: companyTeamsLoading } = trpc.companyTeams.list.useQuery({ departmentId: 0 });
  const { data: companies } = trpc.companies.list.useQuery();

  const isLoading = divisionsLoading || departmentsLoading || companyTeamsLoading;

  // Filter results based on search query
  const searchResults = searchQuery.trim() ? {
    divisions: divisions?.filter((div: any) =>
      div.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      div.code?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [],
    departments: departments?.filter((dept: any) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [],
  } : null;

  const menuItems = [
    {
      title: "Divisions",
      description: "Manage all divisions across companies",
      icon: "building.2.fill" as const,
      route: "/admin-divisions" as any,
      color: colors.primary,
      count: divisions?.length || 0,
    },
    {
      title: "Departments",
      description: "Manage all departments across divisions",
      icon: "square.grid.2x2.fill" as const,
      route: "/admin-departments" as any,
      color: colors.success,
      count: departments?.length || 0,
    },
    {
      title: "Company Teams",
      description: "View all company teams across departments",
      icon: "person.3.fill" as const,
      route: "/admin-hierarchy" as any,
      color: colors.warning,
      count: companyTeams?.length || 0,
    },
  ];

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">Organizational Lookup Tables</Text>
        </View>

        {/* Global Search Bar */}
        <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-2">
          <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
          <TextInput
            className="flex-1 ml-2 text-base text-foreground"
            placeholder="Search divisions or departments..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        {searchResults ? (
          /* Search Results View */
          <View className="gap-4">
            {isLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <>
                {/* Divisions Results */}
                {searchResults.divisions.length > 0 && (
                  <View>
                    <Text className="text-lg font-semibold text-foreground mb-2">
                      Divisions ({searchResults.divisions.length})
                    </Text>
                    {searchResults.divisions.map((division: any) => {
                      const company = companies?.find((c: any) => c.id === division.companyId);
                      return (
                        <TouchableOpacity
                          key={`div-${division.id}`}
                          className="bg-surface border border-border rounded-2xl p-4 mb-2"
                          onPress={() => router.push(`/admin-divisions?companyId=${division.companyId}&companyName=${encodeURIComponent(company?.name || '')}` as any)}
                        >
                          <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                              <Text className="text-base font-semibold text-foreground">{division.name}</Text>
                              {company && (
                                <Text className="text-sm text-primary mt-1">Company: {company.name}</Text>
                              )}
                              <Text className="text-xs text-muted mt-1">
                                ID: {division.id} | Code: {division.code}
                              </Text>
                            </View>
                            <IconSymbol name="chevron.right" size={24} color={colors.primary} />
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* Departments Results */}
                {searchResults.departments.length > 0 && (
                  <View>
                    <Text className="text-lg font-semibold text-foreground mb-2">
                      Departments ({searchResults.departments.length})
                    </Text>
                    {searchResults.departments.map((department: any) => {
                      const division = divisions?.find((d: any) => d.id === department.divisionId);
                      const company = companies?.find((c: any) => c.id === division?.companyId);
                      return (
                        <TouchableOpacity
                          key={`dept-${department.id}`}
                          className="bg-surface border border-border rounded-2xl p-4 mb-2"
                          onPress={() => router.push(`/admin-departments?divisionId=${department.divisionId}&divisionName=${encodeURIComponent(division?.name || '')}` as any)}
                        >
                          <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                              <Text className="text-base font-semibold text-foreground">{department.name}</Text>
                              {company && division && (
                                <Text className="text-sm text-success mt-1">
                                  {company.name} → {division.name}
                                </Text>
                              )}
                              <Text className="text-xs text-muted mt-1">
                                ID: {department.id} | Code: {department.code}
                              </Text>
                            </View>
                            <IconSymbol name="chevron.right" size={24} color={colors.success} />
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* No Results */}
                {searchResults.divisions.length === 0 && searchResults.departments.length === 0 && (
                  <View className="bg-surface border border-border rounded-2xl p-6 items-center">
                    <IconSymbol name="magnifyingglass" size={48} color={colors.muted} />
                    <Text className="text-base text-muted text-center mt-3">
                      No divisions or departments found matching "{searchQuery}"
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        ) : (
          /* Menu View */
          <View className="gap-4">
            <Text className="text-sm text-muted">
              Manage organizational entities across the entire system. Use the search bar above to find specific divisions or departments.
            </Text>

            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="bg-surface border border-border rounded-2xl p-5"
                onPress={() => router.push(item.route)}
              >
                <View className="flex-row items-center gap-4">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <IconSymbol name={item.icon} size={24} color={item.color} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-lg font-semibold text-foreground">{item.title}</Text>
                      <View
                        className="px-2 py-1 rounded-full"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <Text className="text-xs font-semibold" style={{ color: item.color }}>
                          {item.count}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-sm text-muted mt-1">{item.description}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={24} color={colors.muted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
