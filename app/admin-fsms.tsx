import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

/**
 * Admin - Manage FSMs (Field Service Managers / Referral Sources)
 * 
 * Allows admin users to:
 * - View all FSMs
 * - Add new FSMs
 * - Edit existing FSMs
 * - Delete FSMs
 */
export default function AdminFSMsScreen() {
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: user } = trpc.auth.me.useQuery();

  const [isAdding, setIsAdding] = useState(false);
  const [editingFSM, setEditingFSM] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    email: "",
    phone: "",
    mobilePhone: "",
    address: "",
    notes: "",
  });

  // Fetch all FSMs
  const { data: fsms, isLoading } = trpc.fsms.list.useQuery();

  // Create FSM mutation
  const createFSM = trpc.fsms.create.useMutation({
    onSuccess: () => {
      utils.fsms.invalidate();
      setIsAdding(false);
      setFormData({
        name: "",
        organization: "",
        email: "",
        phone: "",
        mobilePhone: "",
        address: "",
        notes: "",
      });
      Alert.alert("Success", "FSM created successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create FSM");
    },
  });

  // Update FSM mutation
  const updateFSM = trpc.fsms.update.useMutation({
    onSuccess: () => {
      utils.fsms.invalidate();
      resetForm();
      Alert.alert("Success", "FSM updated successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to update FSM");
    },
  });

  // Delete FSM mutation
  const deleteFSM = trpc.fsms.delete.useMutation({
    onSuccess: () => {
      utils.fsms.invalidate();
      Alert.alert("Success", "FSM deleted successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to delete FSM");
    },
  });

  const resetForm = () => {
    setIsAdding(false);
    setEditingFSM(null);
    setFormData({
      name: "",
      organization: "",
      email: "",
      phone: "",
      mobilePhone: "",
      address: "",
      notes: "",
    });
  };

  const handleCreate = () => {
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Please enter FSM name");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    createFSM.mutate({
      name: formData.name.trim(),
      organization: formData.organization.trim() || undefined,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      mobilePhone: formData.mobilePhone.trim() || undefined,
      address: formData.address.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      createdBy: user.id,
      updatedBy: user.id,
    });
  };

  const handleUpdate = () => {
    if (!editingFSM) return;
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Please enter FSM name");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    updateFSM.mutate({
      id: editingFSM.id,
      name: formData.name.trim(),
      organization: formData.organization.trim() || undefined,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      mobilePhone: formData.mobilePhone.trim() || undefined,
      address: formData.address.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      updatedBy: user.id,
    });
  };

  const handleEdit = (fsm: any) => {
    setEditingFSM(fsm);
    setFormData({
      name: fsm.name,
      organization: fsm.organization || "",
      email: fsm.email || "",
      phone: fsm.phone || "",
      mobilePhone: fsm.mobilePhone || "",
      address: fsm.address || "",
      notes: fsm.notes || "",
    });
    setIsAdding(false);
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteFSM.mutate({ id }),
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
          <Text className="text-2xl font-bold text-foreground">Manage FSMs</Text>
        </View>
        <TouchableOpacity onPress={() => {
          if (isAdding || editingFSM) {
            resetForm();
          } else {
            setIsAdding(true);
          }
        }}>
          <IconSymbol name={(isAdding || editingFSM) ? "xmark.circle.fill" : "plus.circle.fill"} size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Add/Edit FSM Form */}
          {(isAdding || editingFSM) && (
            <View className="bg-surface border border-primary rounded-2xl p-4 gap-3">
              <Text className="text-lg font-semibold text-foreground">{editingFSM ? "Edit FSM" : "Add New FSM"}</Text>
              
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Name *</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Enter FSM name"
                  placeholderTextColor={colors.muted}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  autoCapitalize="words"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Organization</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Enter organization"
                  placeholderTextColor={colors.muted}
                  value={formData.organization}
                  onChangeText={(text) => setFormData({ ...formData, organization: text })}
                  autoCapitalize="words"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Email</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Enter email"
                  placeholderTextColor={colors.muted}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground mb-2">Phone</Text>
                  <TextInput
                    className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                    placeholder="Phone"
                    placeholderTextColor={colors.muted}
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    keyboardType="phone-pad"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground mb-2">Mobile</Text>
                  <TextInput
                    className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                    placeholder="Mobile"
                    placeholderTextColor={colors.muted}
                    value={formData.mobilePhone}
                    onChangeText={(text) => setFormData({ ...formData, mobilePhone: text })}
                    keyboardType="phone-pad"
                  />
                </View>
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
                <Text className="text-sm font-medium text-foreground mb-2">Notes</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Enter notes"
                  placeholderTextColor={colors.muted}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
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
                  onPress={editingFSM ? handleUpdate : handleCreate}
                  disabled={createFSM.isPending || updateFSM.isPending}
                >
                  {(createFSM.isPending || updateFSM.isPending) ? (
                    <ActivityIndicator size="small" color={colors.background} />
                  ) : (
                    <Text className="text-background font-semibold">{editingFSM ? "Update" : "Create"}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* FSMs List */}
          <Text className="text-lg font-semibold text-foreground mt-2">All FSMs ({fsms?.length || 0})</Text>
          
          {fsms && fsms.length > 0 ? (
            fsms.map((fsm: any) => (
              <View key={fsm.id} className="bg-surface border border-border rounded-2xl p-4">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1 mr-3">
                    <Text className="text-lg font-semibold text-foreground">{fsm.name}</Text>
                    {fsm.organization && (
                      <Text className="text-sm text-muted mt-1">{fsm.organization}</Text>
                    )}
                    {fsm.email && (
                      <Text className="text-sm text-foreground mt-2">{fsm.email}</Text>
                    )}
                    {(fsm.phone || fsm.mobilePhone) && (
                      <View className="flex-row gap-3 mt-1">
                        {fsm.phone && <Text className="text-sm text-muted">📞 {fsm.phone}</Text>}
                        {fsm.mobilePhone && <Text className="text-sm text-muted">📱 {fsm.mobilePhone}</Text>}
                      </View>
                    )}
                    {fsm.notes && (
                      <Text className="text-sm text-muted mt-2 italic">{fsm.notes}</Text>
                    )}
                  </View>
                </View>
                <View className="flex-row gap-2 pt-3 border-t border-border">
                  <TouchableOpacity
                    className="flex-1 bg-background border border-border py-2 rounded-xl items-center"
                    onPress={() => handleEdit(fsm)}
                  >
                    <Text className="text-sm font-medium text-foreground">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-error/10 border border-error py-2 rounded-xl items-center"
                    onPress={() => handleDelete(fsm.id, fsm.name)}
                    disabled={deleteFSM.isPending}
                  >
                    <Text className="text-sm font-medium text-error">Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View className="bg-surface border border-border rounded-2xl p-6 items-center">
              <Text className="text-base text-muted text-center">No FSMs yet. Add your first FSM above.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
