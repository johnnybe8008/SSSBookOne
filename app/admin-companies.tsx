import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

/**
 * Admin - Manage Companies
 * 
 * Allows admin users to:
 * - View all companies
 * - Add new companies
 * - Edit existing companies
 * - Delete companies
 */
export default function AdminCompaniesScreen() {
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: user } = trpc.auth.me.useQuery();

  const [isAdding, setIsAdding] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");


  // Fetch all companies
  const { data: companies, isLoading } = trpc.companies.list.useQuery();

  // Create company mutation
  const createCompany = trpc.companies.create.useMutation({
    onSuccess: () => {
      utils.companies.invalidate();
      setIsAdding(false);
      setNewCompanyName("");

      Alert.alert("Success", "Company created successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create company");
    },
  });

  // Delete company mutation
  const deleteCompany = trpc.companies.delete.useMutation({
    onSuccess: () => {
      utils.companies.invalidate();
      Alert.alert("Success", "Company deleted successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to delete company");
    },
  });

  const handleCreate = () => {
    if (!newCompanyName.trim()) {
      Alert.alert("Validation Error", "Please enter company name");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    createCompany.mutate({
      name: newCompanyName.trim(),
      createdBy: user.id,
      updatedBy: user.id,
    });
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete "${name}"? This will also delete all associated divisions, departments, and clients.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteCompany.mutate({ id }),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">Manage Companies</Text>
        </View>
        <TouchableOpacity onPress={() => setIsAdding(!isAdding)}>
          <IconSymbol name={isAdding ? "xmark.circle.fill" : "plus.circle.fill"} size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Add New Company Form */}
          {isAdding && (
            <View className="bg-surface border border-primary rounded-2xl p-4 gap-3">
              <Text className="text-lg font-semibold text-foreground">Add New Company</Text>
              
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Company Name *</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Enter company name"
                  placeholderTextColor={colors.muted}
                  value={newCompanyName}
                  onChangeText={setNewCompanyName}
                  autoCapitalize="words"
                />
              </View>



              <TouchableOpacity
                className="bg-primary py-3 rounded-full items-center"
                onPress={handleCreate}
                disabled={createCompany.isPending}
              >
                {createCompany.isPending ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Text className="text-background font-semibold">Create Company</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Companies List */}
          <Text className="text-lg font-semibold text-foreground mt-2">All Companies ({companies?.length || 0})</Text>
          
          {companies && companies.length > 0 ? (
            companies.map((company) => (
              <View key={company.id} className="bg-surface border border-border rounded-2xl p-4">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <Text className="text-lg font-semibold text-foreground">{company.name}</Text>

                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => router.push(`/admin-divisions?companyId=${company.id}&companyName=${encodeURIComponent(company.name)}` as any)}
                    >
                      <IconSymbol name="chevron.right" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(company.id, company.name)}
                      disabled={deleteCompany.isPending}
                    >
                      <IconSymbol name="trash" size={22} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="bg-surface border border-border rounded-2xl p-6 items-center">
              <Text className="text-base text-muted text-center">No companies yet. Add your first company above.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
