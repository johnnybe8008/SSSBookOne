import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

type ProviderType = "twilio" | "clickatell";
type CountryIso = "US" | "ZA";

const emptyForm = {
  name: "",
  providerType: "clickatell" as ProviderType,
  isActive: 1,
  isDefault: 0,
  defaultCountryIso: "ZA" as CountryIso,
  accountSid: "",
  authToken: "",
  fromNumber: "",
  whatsappFrom: "",
  apiKey: "",
  whatsappTemplateNameStaff: "",
  whatsappTemplateNameClient: "",
  whatsappTemplateLanguage: "en",
};

export default function AdminSmsProvidersScreen() {
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { staff } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const { data: providers, isLoading } = trpc.messagingProviders.list.useQuery();

  const resetForm = () => {
    setIsAdding(false);
    setEditingProvider(null);
    setFormData(emptyForm);
  };

  const createProvider = trpc.messagingProviders.create.useMutation({
    onSuccess: async () => {
      await utils.messagingProviders.invalidate();
      resetForm();
      Alert.alert("Success", "Messaging provider created successfully");
    },
    onError: (error) => Alert.alert("Error", error.message || "Failed to create messaging provider"),
  });

  const updateProvider = trpc.messagingProviders.update.useMutation({
    onSuccess: async () => {
      await utils.messagingProviders.invalidate();
      resetForm();
      Alert.alert("Success", "Messaging provider updated successfully");
    },
    onError: (error) => Alert.alert("Error", error.message || "Failed to update messaging provider"),
  });

  const deleteProvider = trpc.messagingProviders.delete.useMutation({
    onSuccess: async () => {
      await utils.messagingProviders.invalidate();
      Alert.alert("Success", "Messaging provider deleted successfully");
    },
    onError: (error) => Alert.alert("Error", error.message || "Failed to delete messaging provider"),
  });

  const setDefaultProvider = trpc.messagingProviders.setDefault.useMutation({
    onSuccess: async () => {
      await utils.messagingProviders.invalidate();
      Alert.alert("Success", "Default messaging provider updated");
    },
    onError: (error) => Alert.alert("Error", error.message || "Failed to set default provider"),
  });

  const handleEdit = (provider: any) => {
    const credentials = provider.credentials || {};
    const settings = provider.settings || {};
    setEditingProvider(provider);
    setIsAdding(false);
    setFormData({
      name: provider.name || "",
      providerType: provider.providerType || "clickatell",
      isActive: provider.isActive ?? 1,
      isDefault: provider.isDefault ?? 0,
      defaultCountryIso: settings.defaultCountryIso || "ZA",
      accountSid: credentials.accountSid || "",
      authToken: credentials.authToken || "",
      fromNumber: credentials.fromNumber || "",
      whatsappFrom: credentials.whatsappFrom || "",
      apiKey: credentials.apiKey || "",
      whatsappTemplateNameStaff: settings.whatsappTemplateNameStaff || "",
      whatsappTemplateNameClient: settings.whatsappTemplateNameClient || "",
      whatsappTemplateLanguage: settings.whatsappTemplateLanguage || "en",
    });
  };

  const buildPayload = () => ({
    name: formData.name.trim(),
    providerType: formData.providerType,
    isActive: formData.isActive,
    isDefault: formData.isDefault,
    credentials: {
      accountSid: formData.accountSid.trim() || undefined,
      authToken: formData.authToken.trim() || undefined,
      fromNumber: formData.fromNumber.trim() || undefined,
      whatsappFrom: formData.whatsappFrom.trim() || undefined,
      apiKey: formData.apiKey.trim() || undefined,
    },
    settings: {
      defaultCountryIso: formData.defaultCountryIso,
      whatsappTemplateNameStaff: formData.whatsappTemplateNameStaff.trim() || undefined,
      whatsappTemplateNameClient: formData.whatsappTemplateNameClient.trim() || undefined,
      whatsappTemplateLanguage: formData.whatsappTemplateLanguage.trim() || undefined,
    },
  });

  const handleSave = () => {
    if (!staff?.id) {
      Alert.alert("Error", "Staff not authenticated");
      return;
    }
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Please enter a provider name");
      return;
    }
    if (formData.providerType === "twilio" && (!formData.accountSid.trim() || !formData.authToken.trim() || !formData.fromNumber.trim())) {
      Alert.alert("Validation Error", "Twilio requires Account SID, Auth Token, and From Number");
      return;
    }
    if (formData.providerType === "clickatell" && !formData.apiKey.trim()) {
      Alert.alert("Validation Error", "Clickatell requires an API key");
      return;
    }

    const payload = buildPayload();
    if (editingProvider) {
      updateProvider.mutate({
        id: editingProvider.id,
        ...payload,
        updatedBy: staff.id,
      });
      return;
    }

    createProvider.mutate({
      ...payload,
      createdBy: staff.id,
      updatedBy: staff.id,
    });
  };

  const confirmDelete = (provider: any) => {
    Alert.alert("Delete Provider", `Delete "${provider.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteProvider.mutate({ id: provider.id }) },
    ]);
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
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Text className="text-3xl font-bold text-foreground">&lt;</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Manage SMS Providers</Text>
        </View>
        <TouchableOpacity onPress={() => ((isAdding || editingProvider) ? resetForm() : setIsAdding(true))}>
          <IconSymbol name={(isAdding || editingProvider) ? "xmark.circle.fill" : "plus.circle.fill"} size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {(isAdding || editingProvider) && (
            <View className="bg-surface border border-primary rounded-2xl p-4 gap-3">
              <Text className="text-lg font-semibold text-foreground">
                {editingProvider ? `Edit Provider (ID: ${editingProvider.id})` : "Add Messaging Provider"}
              </Text>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Provider Name *</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Production Clickatell"
                  placeholderTextColor={colors.muted}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Provider Type</Text>
                <View className="bg-background border border-border rounded-xl overflow-hidden">
                  <Picker
                    selectedValue={formData.providerType}
                    onValueChange={(value) => setFormData({ ...formData, providerType: value })}
                    style={{ color: colors.foreground }}
                  >
                    <Picker.Item label="Clickatell" value="clickatell" />
                    <Picker.Item label="Twilio" value="twilio" />
                  </Picker>
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Default Mobile Country</Text>
                <View className="bg-background border border-border rounded-xl overflow-hidden">
                  <Picker
                    selectedValue={formData.defaultCountryIso}
                    onValueChange={(value) => setFormData({ ...formData, defaultCountryIso: value })}
                    style={{ color: colors.foreground }}
                  >
                    <Picker.Item label="South Africa (+27)" value="ZA" />
                    <Picker.Item label="United States (+1)" value="US" />
                  </Picker>
                </View>
              </View>

              {formData.providerType === "twilio" ? (
                <>
                  <TextInput
                    className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                    placeholder="Account SID"
                    placeholderTextColor={colors.muted}
                    value={formData.accountSid}
                    onChangeText={(text) => setFormData({ ...formData, accountSid: text })}
                  />
                  <TextInput
                    className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                    placeholder="Auth Token"
                    placeholderTextColor={colors.muted}
                    value={formData.authToken}
                    onChangeText={(text) => setFormData({ ...formData, authToken: text })}
                  />
                  <TextInput
                    className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                    placeholder="SMS From Number"
                    placeholderTextColor={colors.muted}
                    value={formData.fromNumber}
                    onChangeText={(text) => setFormData({ ...formData, fromNumber: text })}
                  />
                  <TextInput
                    className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                    placeholder="WhatsApp From"
                    placeholderTextColor={colors.muted}
                    value={formData.whatsappFrom}
                    onChangeText={(text) => setFormData({ ...formData, whatsappFrom: text })}
                  />
                </>
              ) : (
                <>
                  <TextInput
                    className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                    placeholder="API Key"
                    placeholderTextColor={colors.muted}
                    value={formData.apiKey}
                    onChangeText={(text) => setFormData({ ...formData, apiKey: text })}
                  />
                  <TextInput
                    className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                    placeholder="Optional SMS From Number"
                    placeholderTextColor={colors.muted}
                    value={formData.fromNumber}
                    onChangeText={(text) => setFormData({ ...formData, fromNumber: text })}
                  />
                  <TextInput
                    className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                    placeholder="WhatsApp Staff Template Name"
                    placeholderTextColor={colors.muted}
                    value={formData.whatsappTemplateNameStaff}
                    onChangeText={(text) => setFormData({ ...formData, whatsappTemplateNameStaff: text })}
                  />
                  <TextInput
                    className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                    placeholder="WhatsApp Client Template Name"
                    placeholderTextColor={colors.muted}
                    value={formData.whatsappTemplateNameClient}
                    onChangeText={(text) => setFormData({ ...formData, whatsappTemplateNameClient: text })}
                  />
                  <TextInput
                    className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                    placeholder="WhatsApp Template Language"
                    placeholderTextColor={colors.muted}
                    value={formData.whatsappTemplateLanguage}
                    onChangeText={(text) => setFormData({ ...formData, whatsappTemplateLanguage: text })}
                  />
                </>
              )}

              <TouchableOpacity
                className="flex-row items-center gap-3"
                onPress={() => setFormData({ ...formData, isActive: formData.isActive === 1 ? 0 : 1 })}
              >
                <View className={`w-6 h-6 rounded border-2 items-center justify-center ${formData.isActive ? "bg-primary border-primary" : "border-border"}`}>
                  {formData.isActive === 1 && <IconSymbol name="checkmark" size={16} color={colors.background} />}
                </View>
                <Text className="text-base text-foreground">Provider is active</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center gap-3"
                onPress={() => setFormData({ ...formData, isDefault: formData.isDefault === 1 ? 0 : 1 })}
              >
                <View className={`w-6 h-6 rounded border-2 items-center justify-center ${formData.isDefault ? "bg-primary border-primary" : "border-border"}`}>
                  {formData.isDefault === 1 && <IconSymbol name="checkmark" size={16} color={colors.background} />}
                </View>
                <Text className="text-base text-foreground">Set as default provider</Text>
              </TouchableOpacity>

              <View className="flex-row gap-2">
                <TouchableOpacity className="flex-1 bg-surface border border-border py-3 rounded-full items-center" onPress={resetForm}>
                  <Text className="text-foreground font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-primary py-3 rounded-full items-center"
                  onPress={handleSave}
                  disabled={createProvider.isPending || updateProvider.isPending}
                >
                  {(createProvider.isPending || updateProvider.isPending) ? (
                    <ActivityIndicator size="small" color={colors.background} />
                  ) : (
                    <Text className="text-background font-semibold">{editingProvider ? "Update" : "Create"}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <Text className="text-lg font-semibold text-foreground mt-2">Configured Providers ({providers?.length || 0})</Text>

          {providers?.length ? providers.map((provider: any) => (
            <View key={provider.id} className="bg-surface border border-border rounded-2xl p-4">
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1 mr-3">
                  <Text className="text-lg font-semibold text-foreground">{provider.name}</Text>
                  <Text className="text-xs text-muted mt-1">ID: {provider.id}</Text>
                  <Text className="text-sm text-muted mt-1">
                    {provider.providerType === "clickatell" ? "Clickatell" : "Twilio"}{provider.isDefault ? " • Default" : ""}{provider.isActive ? " • Active" : " • Inactive"}
                  </Text>
                  {provider.settings?.defaultCountryIso && (
                    <Text className="text-sm text-muted mt-1">Default country: {provider.settings.defaultCountryIso}</Text>
                  )}
                </View>
              </View>

              <View className="flex-row gap-2 pt-3 border-t border-border">
                <TouchableOpacity
                  className="flex-1 bg-background border border-border py-2 rounded-xl items-center"
                  onPress={() => handleEdit(provider)}
                >
                  <Text className="text-sm font-medium text-foreground">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-primary/10 border border-primary py-2 rounded-xl items-center"
                  onPress={() => staff?.id && setDefaultProvider.mutate({ id: provider.id, updatedBy: staff.id })}
                >
                  <Text className="text-sm font-medium text-primary">Set Default</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-error/10 border border-error py-2 rounded-xl items-center"
                  onPress={() => confirmDelete(provider)}
                >
                  <Text className="text-sm font-medium text-error">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )) : (
            <View className="bg-surface border border-border rounded-2xl p-6 items-center">
              <Text className="text-base text-muted text-center">No messaging providers configured yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
