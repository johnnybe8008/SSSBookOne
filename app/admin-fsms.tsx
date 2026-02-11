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
        <TouchableOpacity onPress={() => setIsAdding(!isAdding)}>
          <IconSymbol name={isAdding ? "xmark.circle.fill" : "plus.circle.fill"} size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Add New FSM Form */}
          {isAdding && (
            <View className="bg-surface border border-primary rounded-2xl p-4 gap-3">
              <Text className="text-lg font-semibold text-foreground">Add New FSM</Text>
              
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

              <TouchableOpacity
                className="bg-primary py-3 rounded-full items-center"
                onPress={handleCreate}
                disabled={createFSM.isPending}
              >
                {createFSM.isPending ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Text className="text-background font-semibold">Create FSM</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* FSMs List */}
          <Text className="text-lg font-semibold text-foreground mt-2">All FSMs ({fsms?.length || 0})</Text>
          
          {fsms && fsms.length > 0 ? (
            fsms.map((fsm: any) => (
              <View key={fsm.id} className="bg-surface border border-border rounded-2xl p-4">
                <View className="flex-row items-start justify-between">
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
                  <TouchableOpacity
                    onPress={() => handleDelete(fsm.id, fsm.name)}
                    disabled={deleteFSM.isPending}
                  >
                    <IconSymbol name="trash" size={22} color={colors.error} />
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
