import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

interface EditingCompany {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

/**
 * Admin - Manage Companies
 * 
 * Allows admin users to:
 * - View all companies
 * - Add new companies with full contact info
 * - Edit existing companies
 * - Delete companies
 */
export default function AdminCompaniesScreen() {
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: user } = trpc.auth.me.useQuery();

  const [isAdding, setIsAdding] = useState(false);
  const [editingCompany, setEditingCompany] = useState<EditingCompany | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  // Fetch all companies
  const { data: companies, isLoading } = trpc.companies.list.useQuery();

  // Create company mutation
  const createCompany = trpc.companies.create.useMutation({
    onSuccess: () => {
      utils.companies.invalidate();
      resetForm();
      Alert.alert("Success", "Company created successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create company");
    },
  });

  // Update company mutation
  const updateCompany = trpc.companies.update.useMutation({
    onSuccess: () => {
      utils.companies.invalidate();
      resetForm();
      Alert.alert("Success", "Company updated successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to update company");
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

  const resetForm = () => {
    setIsAdding(false);
    setEditingCompany(null);
    setFormData({ name: "", address: "", phone: "", email: "" });
  };

  const handleCreate = () => {
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Please enter company name");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    createCompany.mutate({
      name: formData.name.trim(),
      address: formData.address.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      email: formData.email.trim() || undefined,
      createdBy: user.id,
      updatedBy: user.id,
    });
  };

  const handleUpdate = () => {
    if (!editingCompany) return;
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Please enter company name");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    updateCompany.mutate({
      id: editingCompany.id,
      name: formData.name.trim(),
      address: formData.address.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      email: formData.email.trim() || undefined,
      updatedBy: user.id,
    });
  };

  const handleEdit = (company: any) => {
    setEditingCompany({
      id: company.id,
      name: company.name,
      address: company.address,
      phone: company.phone,
      email: company.email,
    });
    setFormData({
      name: company.name,
      address: company.address || "",
      phone: company.phone || "",
      email: company.email || "",
    });
    setIsAdding(false);
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

  const isPending = createCompany.isPending || updateCompany.isPending;

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
        <TouchableOpacity onPress={() => {
          if (isAdding || editingCompany) {
            resetForm();
          } else {
            setIsAdding(true);
          }
        }}>
          <IconSymbol name={(isAdding || editingCompany) ? "xmark.circle.fill" : "plus.circle.fill"} size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Add/Edit Company Form */}
          {(isAdding || editingCompany) && (
            <View className="bg-surface border border-primary rounded-2xl p-4 gap-3">
              <Text className="text-lg font-semibold text-foreground">
                {editingCompany ? "Edit Company" : "Add New Company"}
              </Text>
              
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Company Name *</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Enter company name"
                  placeholderTextColor={colors.muted}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  autoCapitalize="words"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Address</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Enter address"
                  placeholderTextColor={colors.muted}
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Phone</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Enter phone number"
                  placeholderTextColor={colors.muted}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Email</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Enter email address"
                  placeholderTextColor={colors.muted}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-1 bg-surface border border-border py-3 rounded-full items-center"
                  onPress={resetForm}
                >
                  <Text className="text-foreground font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-primary py-3 rounded-full items-center"
                  onPress={editingCompany ? handleUpdate : handleCreate}
                  disabled={isPending}
                >
                  {isPending ? (
                    <ActivityIndicator size="small" color={colors.background} />
                  ) : (
                    <Text className="text-background font-semibold">{editingCompany ? "Update" : "Create"}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Companies List */}
          <Text className="text-lg font-semibold text-foreground mt-2">All Companies ({companies?.length || 0})</Text>
          
          {companies && companies.length > 0 ? (
            companies.map((company) => (
              <View key={company.id} className="bg-surface border border-border rounded-2xl p-4">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1 mr-3">
                    <Text className="text-lg font-semibold text-foreground">{company.name}</Text>
                    {company.address && (
                      <Text className="text-sm text-muted mt-1">{company.address}</Text>
                    )}
                    {company.phone && (
                      <Text className="text-sm text-muted mt-1">📞 {company.phone}</Text>
                    )}
                    {company.email && (
                      <Text className="text-sm text-muted mt-1">✉️ {company.email}</Text>
                    )}
                  </View>
                </View>
                <View className="flex-row gap-2 pt-3 border-t border-border">
                  <TouchableOpacity
                    className="flex-1 bg-background border border-border py-2 rounded-xl items-center"
                    onPress={() => handleEdit(company)}
                  >
                    <Text className="text-sm font-medium text-foreground">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-primary/10 border border-primary py-2 rounded-xl items-center"
                    onPress={() => router.push(`/admin-divisions?companyId=${company.id}&companyName=${encodeURIComponent(company.name)}` as any)}
                  >
                    <Text className="text-sm font-medium text-primary">Divisions</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-error/10 border border-error py-2 rounded-xl items-center"
                    onPress={() => handleDelete(company.id, company.name)}
                    disabled={deleteCompany.isPending}
                  >
                    <Text className="text-sm font-medium text-error">Delete</Text>
                  </TouchableOpacity>
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
