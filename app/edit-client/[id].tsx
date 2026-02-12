import { useState, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Picker } from "@react-native-picker/picker";

/**
 * Edit Client Screen
 * 
 * Allows editing all client information
 */
export default function EditClientScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const clientId = parseInt(id as string);
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    occupation: "",
    age: "",
    timeInService: "",
    address: "",
    mobilePhone: "",
    homePhone: "",
    workPhone: "",
    email: "",
    status: "Active",
    notificationPreference: "sms",
    notificationOptOut: 0,
    isVip: 0,
  });

  // Fetch client data
  const { data: client, isLoading } = trpc.clients.get.useQuery({ id: clientId });
  
  // Fetch organizational hierarchy data
  const { data: companies } = trpc.companies.list.useQuery();
  const { data: allDivisions } = trpc.divisions.list.useQuery({ companyId: 0 });
  const { data: allDepartments } = trpc.departments.list.useQuery({ divisionId: 0 });
  const { data: allCompanyTeams } = trpc.companyTeams.list.useQuery({ departmentId: 0 });
  
  // Get hierarchy names for display
  const getHierarchyInfo = () => {
    if (!client) return null;
    const department = allDepartments?.find((d: any) => d.id === client.departmentId);
    const division = allDivisions?.find((d: any) => d.id === department?.divisionId);
    const company = companies?.find((c: any) => c.id === division?.companyId);
    // Find company teams in this department
    const teams = allCompanyTeams?.filter((t: any) => t.departmentId === client.departmentId) || [];
    return { company, division, department, teams };
  };

  // Update client mutation
  const updateClient = trpc.clients.update.useMutation({
    onSuccess: () => {
      utils.clients.invalidate();
      Alert.alert("Success", "Client updated successfully");
      router.back();
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to update client");
    },
  });

  // Populate form when client data loads
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        title: client.title || "",
        occupation: client.occupation || "",
        age: client.age?.toString() || "",
        timeInService: client.timeInService?.toString() || "",
        address: client.address || "",
        mobilePhone: client.mobilePhone || "",
        homePhone: client.homePhone || "",
        workPhone: client.workPhone || "",
        email: client.email || "",
        status: client.status,
        notificationPreference: client.notificationPreference || "sms",
        notificationOptOut: client.notificationOptOut || 0,
        isVip: client.isVip || 0,
      });
    }
  }, [client]);

  const { data: user } = trpc.auth.me.useQuery();

  const handleUpdate = () => {
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Please enter client name");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    updateClient.mutate({
      id: clientId,
      name: formData.name.trim(),
      title: formData.title.trim() || undefined,
      occupation: formData.occupation.trim() || undefined,
      age: formData.age ? parseInt(formData.age) : undefined,
      timeInService: formData.timeInService ? parseInt(formData.timeInService) : undefined,
      address: formData.address.trim() || undefined,
      mobilePhone: formData.mobilePhone.trim() || undefined,
      homePhone: formData.homePhone.trim() || undefined,
      workPhone: formData.workPhone.trim() || undefined,
      email: formData.email.trim() || undefined,
      status: formData.status as "Active" | "Inactive" | "Referred" | "On Hold",
      notificationPreference: formData.notificationPreference as "sms" | "whatsapp",
      notificationOptOut: formData.notificationOptOut,
      isVip: formData.isVip,
      updatedBy: user.id,
    });
  };

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
        <Text className="text-lg text-muted text-center">Client not found</Text>
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-full mt-6"
          onPress={() => router.back()}
        >
          <Text className="text-background font-semibold">Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-foreground">Edit Client</Text>
            <Text className="text-xs text-muted mt-1">ID: {clientId}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Organizational Hierarchy Display */}
          {(() => {
            const hierarchy = getHierarchyInfo();
            if (hierarchy && hierarchy.company) {
              return (
                <View className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                  <Text className="text-sm font-semibold text-primary mb-3">Organizational Hierarchy</Text>
                  <View className="gap-2">
                    {hierarchy.company && (
                      <View className="flex-row items-center gap-2">
                        <Text className="text-xs text-muted w-24">Company:</Text>
                        <Text className="text-sm text-foreground font-medium flex-1">{hierarchy.company.name}</Text>
                      </View>
                    )}
                    {hierarchy.division && (
                      <View className="flex-row items-center gap-2">
                        <Text className="text-xs text-muted w-24">Division:</Text>
                        <Text className="text-sm text-foreground font-medium flex-1">{hierarchy.division.code} - {hierarchy.division.name}</Text>
                      </View>
                    )}
                    {hierarchy.department && (
                      <View className="flex-row items-center gap-2">
                        <Text className="text-xs text-muted w-24">Department:</Text>
                        <Text className="text-sm text-foreground font-medium flex-1">{hierarchy.department.code} - {hierarchy.department.name}</Text>
                      </View>
                    )}
                    {hierarchy.teams && hierarchy.teams.length > 0 && (
                      <View className="flex-row items-start gap-2">
                        <Text className="text-xs text-muted w-24">Teams:</Text>
                        <View className="flex-1 gap-1">
                          {hierarchy.teams.map((team: any) => (
                            <Text key={team.id} className="text-sm text-foreground">{team.code} - {team.name}</Text>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              );
            }
            return null;
          })()}
          
          {/* Referral Source Display */}
          {client?.referralSourceType && (
            <View className="bg-warning/10 border border-warning/30 rounded-2xl p-4">
              <View className="flex-row items-center gap-2 mb-2">
                <IconSymbol name="person.badge.plus" size={20} color={colors.warning} />
                <Text className="text-sm font-semibold text-warning">Referred By</Text>
              </View>
              <View className="flex-row items-center gap-2">
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
          
          {/* Basic Info */}
          <View className="bg-surface border border-border rounded-2xl p-4 gap-3">
            <Text className="text-base font-semibold text-foreground">Basic Information</Text>
            
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Name *</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Enter name"
                placeholderTextColor={colors.muted}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                autoCapitalize="words"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Title</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Enter title"
                placeholderTextColor={colors.muted}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                autoCapitalize="words"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Status</Text>
              <View className="bg-background border border-border rounded-xl overflow-hidden">
                <Picker
                  selectedValue={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  style={{ color: colors.foreground }}
                >
                  <Picker.Item label="Active" value="Active" />
                  <Picker.Item label="Inactive" value="Inactive" />
                  <Picker.Item label="Referred" value="Referred" />
                  <Picker.Item label="On Hold" value="On Hold" />
                </Picker>
              </View>
            </View>
          </View>

          {/* Contact Info */}
          <View className="bg-surface border border-border rounded-2xl p-4 gap-3">
            <Text className="text-base font-semibold text-foreground">Contact Information</Text>
            
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

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Mobile Phone</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Enter mobile phone"
                placeholderTextColor={colors.muted}
                value={formData.mobilePhone}
                onChangeText={(text) => setFormData({ ...formData, mobilePhone: text })}
                keyboardType="phone-pad"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Home Phone</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Enter home phone"
                placeholderTextColor={colors.muted}
                value={formData.homePhone}
                onChangeText={(text) => setFormData({ ...formData, homePhone: text })}
                keyboardType="phone-pad"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Work Phone</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Enter work phone"
                placeholderTextColor={colors.muted}
                value={formData.workPhone}
                onChangeText={(text) => setFormData({ ...formData, workPhone: text })}
                keyboardType="phone-pad"
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
          </View>

          {/* Professional Info */}
          <View className="bg-surface border border-border rounded-2xl p-4 gap-3">
            <Text className="text-base font-semibold text-foreground">Professional Information</Text>
            
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Occupation</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Enter occupation"
                placeholderTextColor={colors.muted}
                value={formData.occupation}
                onChangeText={(text) => setFormData({ ...formData, occupation: text })}
                autoCapitalize="words"
              />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground mb-2">Age</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Age"
                  placeholderTextColor={colors.muted}
                  value={formData.age}
                  onChangeText={(text) => setFormData({ ...formData, age: text })}
                  keyboardType="number-pad"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground mb-2">Time in Service (months)</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Months"
                  placeholderTextColor={colors.muted}
                  value={formData.timeInService}
                  onChangeText={(text) => setFormData({ ...formData, timeInService: text })}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          {/* Preferences */}
          <View className="bg-surface border border-border rounded-2xl p-4 gap-3 mb-6">
            <Text className="text-base font-semibold text-foreground">Preferences</Text>
            
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Notification Preference</Text>
              <View className="bg-background border border-border rounded-xl overflow-hidden">
                <Picker
                  selectedValue={formData.notificationPreference}
                  onValueChange={(value) => setFormData({ ...formData, notificationPreference: value })}
                  style={{ color: colors.foreground }}
                >
                  <Picker.Item label="SMS" value="sms" />
                  <Picker.Item label="WhatsApp" value="whatsapp" />
                </Picker>
              </View>
            </View>

            <TouchableOpacity
              className="flex-row items-center gap-3"
              onPress={() => setFormData({ ...formData, notificationOptOut: formData.notificationOptOut === 1 ? 0 : 1 })}
            >
              <View className={`w-6 h-6 rounded border-2 items-center justify-center ${formData.notificationOptOut === 1 ? "bg-primary border-primary" : "border-border"}`}>
                {formData.notificationOptOut === 1 && (
                  <IconSymbol name="checkmark" size={16} color={colors.background} />
                )}
              </View>
              <Text className="text-base text-foreground">Opt out of notifications</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center gap-3"
              onPress={() => setFormData({ ...formData, isVip: formData.isVip === 1 ? 0 : 1 })}
            >
              <View className={`w-6 h-6 rounded border-2 items-center justify-center ${formData.isVip === 1 ? "bg-warning border-warning" : "border-border"}`}>
                {formData.isVip === 1 && (
                  <IconSymbol name="star.fill" size={16} color={colors.background} />
                )}
              </View>
              <Text className="text-base text-foreground">VIP Client</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity
              className="flex-1 bg-surface border border-border py-3 rounded-full items-center"
              onPress={() => router.back()}
            >
              <Text className="text-foreground font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-primary py-3 rounded-full items-center"
              onPress={handleUpdate}
              disabled={updateClient.isPending}
            >
              {updateClient.isPending ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text className="text-background font-semibold">Update Client</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
