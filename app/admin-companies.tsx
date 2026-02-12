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
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  // Fetch all companies and templates
  const { data: companies, isLoading } = trpc.companies.list.useQuery();
  const { data: templates } = trpc.templates.list.useQuery();
  
  // Fetch organizational hierarchy for display (passing 0 gets all items)
  const { data: allDivisions } = trpc.divisions.list.useQuery({ companyId: 0 });
  const { data: allDepartments } = trpc.departments.list.useQuery({ divisionId: 0 });
  const { data: allCompanyTeams } = trpc.companyTeams.list.useQuery({ departmentId: 0 });
  
  // Helper to count organizational entities for a company
  const getCompanyHierarchyCounts = (companyId: number) => {
    if (!allDivisions || !allDepartments || !allCompanyTeams) {
      return { divisions: 0, departments: 0, teams: 0 };
    }
    const divisions = allDivisions.filter((d: any) => d.companyId === companyId);
    const divisionIds = divisions.map((d: any) => d.id);
    const departments = allDepartments.filter((d: any) => divisionIds.includes(d.divisionId));
    const departmentIds = departments.map((d: any) => d.id);
    const teams = allCompanyTeams.filter((t: any) => departmentIds.includes(t.departmentId));
    return { divisions: divisions.length, departments: departments.length, teams: teams.length };
  };

  // Apply template mutation
  const applyTemplateMutation = trpc.templates.applyToCompany.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        utils.companies.invalidate();
        utils.divisions.invalidate();
        utils.departments.invalidate();
        utils.companyTeams.invalidate();
        Alert.alert("Success", `Company created and template applied successfully!\n\n${result.message}`);
      } else {
        Alert.alert("Warning", `Company created but template failed: ${result.message}`);
      }
      resetForm();
    },
    onError: (error) => {
      Alert.alert("Warning", `Company created but template failed: ${error.message}`);
      resetForm();
    },
  });

  // Create company mutation
  const createCompany = trpc.companies.create.useMutation({
    onSuccess: (companyId) => {
      utils.companies.invalidate();
      
      // If a template is selected, apply it to the new company
      if (selectedTemplate && companyId) {
        applyTemplateMutation.mutate({
          templateId: selectedTemplate,
          companyId: companyId,
        });
      } else {
        Alert.alert("Success", "Company created successfully");
        resetForm();
      }
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
    setSelectedTemplate(null);
    setShowTemplateSelector(false);
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
      "Delete Company",
      `Are you sure you want to delete "${name}"? This will also delete all associated divisions, departments, and teams.`,
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

  const handleSaveAsTemplate = (companyId: number, companyName: string) => {
    Alert.prompt(
      "Save as Template",
      `Enter a name for this template based on "${companyName}":`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: (templateName?: string) => {
            if (!templateName || !templateName.trim()) {
              Alert.alert("Error", "Template name is required");
              return;
            }
            saveTemplateMutation.mutate({
              companyId,
              templateName: templateName.trim(),
              templateDescription: `Template based on ${companyName}`,
            });
          },
        },
      ],
      "plain-text",
      `${companyName} Template`
    );
  };

  const saveTemplateMutation = trpc.templates.save.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        Alert.alert("Success", result.message);
        utils.templates.list.invalidate();
      } else {
        Alert.alert("Error", result.message);
      }
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to save template");
    },
  });

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
                {editingCompany ? `Edit Company (ID: ${editingCompany.id})` : "Add New Company"}
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

              {/* Apply Template Option (only when creating new company) */}
              {isAdding && !editingCompany && (
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">Apply Template (Optional)</Text>
                  <View className="bg-background border border-border rounded-xl px-4 py-3">
                    <TouchableOpacity
                      onPress={() => setShowTemplateSelector(!showTemplateSelector)}
                      className="flex-row items-center justify-between"
                    >
                      <Text className="text-base text-foreground">
                        {selectedTemplate ? templates?.find(t => t.id === selectedTemplate)?.name : "Select a template"}
                      </Text>
                      <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                    </TouchableOpacity>
                    {showTemplateSelector && templates && templates.length > 0 && (
                      <View className="mt-3 pt-3 border-t border-border gap-2">
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedTemplate(null);
                            setShowTemplateSelector(false);
                          }}
                          className="py-2"
                        >
                          <Text className="text-sm text-muted">None (create empty company)</Text>
                        </TouchableOpacity>
                        {templates.map((template: any) => (
                          <TouchableOpacity
                            key={template.id}
                            onPress={() => {
                              setSelectedTemplate(template.id);
                              setShowTemplateSelector(false);
                            }}
                            className="py-2"
                          >
                            <Text className="text-sm text-foreground font-medium">{template.name}</Text>
                            {template.description && (
                              <Text className="text-xs text-muted mt-1">{template.description}</Text>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                  {selectedTemplate && (
                    <Text className="text-xs text-success mt-1">
                      ✓ Template will be applied after company is created
                    </Text>
                  )}
                </View>
              )}

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
            companies.map((company) => {
              const counts = getCompanyHierarchyCounts(company.id);
              return (
              <View key={company.id} className="bg-surface border border-border rounded-2xl p-4">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1 mr-3">
                    <Text className="text-lg font-semibold text-foreground">{company.name}</Text>
                    <Text className="text-xs text-muted mt-1">ID: {company.id}</Text>
                    {company.address && (
                      <Text className="text-sm text-muted mt-1">{company.address}</Text>
                    )}
                    {company.phone && (
                      <Text className="text-sm text-muted mt-1">📞 {company.phone}</Text>
                    )}
                    {company.email && (
                      <Text className="text-sm text-muted mt-1">✉️ {company.email}</Text>
                    )}
                    {/* Organizational Hierarchy Summary */}
                    <View className="flex-row gap-3 mt-2 pt-2 border-t border-border">
                      <Text className="text-xs text-primary font-medium">{counts.divisions} Division{counts.divisions !== 1 ? 's' : ''}</Text>
                      <Text className="text-xs text-success font-medium">{counts.departments} Department{counts.departments !== 1 ? 's' : ''}</Text>
                      <Text className="text-xs text-warning font-medium">{counts.teams} Team{counts.teams !== 1 ? 's' : ''}</Text>
                    </View>
                  </View>
                </View>
                <View className="gap-2 pt-3 border-t border-border">
                  <View className="flex-row gap-2">
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
                  <TouchableOpacity
                    className="bg-success/10 border border-success py-2 rounded-xl items-center"
                    onPress={() => handleSaveAsTemplate(company.id, company.name)}
                  >
                    <Text className="text-sm font-medium text-success">💾 Save as Template</Text>
                  </TouchableOpacity>
                </View>
              </View>
              );
            })
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
