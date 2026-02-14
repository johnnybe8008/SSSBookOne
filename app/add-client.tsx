import { useState, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

/**
 * Add Client Screen
 * 
 * Form to create a new client with:
 * - Name, email, phone, date of birth
 * - Company, division, department, company team selection (dropdowns)
 * - Referral source selection with radio buttons
 * - VIP status toggle
 */
export default function AddClientScreen() {
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [divisionId, setDivisionId] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [companyTeamId, setCompanyTeamId] = useState<number | null>(null);
  
  // Referral source state
  const [referralSourceType, setReferralSourceType] = useState<"client" | "staff" | "fsm" | null>(null);
  const [referralSourceId, setReferralSourceId] = useState<number | null>(null);
  
  const [isVip, setIsVip] = useState(false);
  const { data: user } = trpc.auth.me.useQuery();

  // Fetch dropdown data
  const { data: companies, isLoading: companiesLoading } = trpc.companies.list.useQuery();
  const { data: divisions } = trpc.divisions.list.useQuery(
    { companyId: companyId || 0 },
    { enabled: !!companyId }
  );
  const { data: departments } = trpc.departments.list.useQuery(
    { divisionId: divisionId || 0 },
    { enabled: !!divisionId }
  );
  const { data: companyTeams } = trpc.companyTeams.list.useQuery(
    { departmentId: departmentId || 0 },
    { enabled: !!departmentId }
  );
  
  // Fetch referral source options based on type
  const { data: allClients } = trpc.clients.list.useQuery({ departmentId: 0 }, { enabled: referralSourceType === "client" });
  const { data: allStaff } = trpc.staff.list.useQuery({ teamId: 0 }, { enabled: referralSourceType === "staff" });
  const { data: fsms } = trpc.fsms.list.useQuery(undefined, { enabled: referralSourceType === "fsm" });

  // Reset downstream selections when parent changes
  useEffect(() => {
    setDivisionId(null);
    setDepartmentId(null);
    setCompanyTeamId(null);
  }, [companyId]);

  useEffect(() => {
    setDepartmentId(null);
    setCompanyTeamId(null);
  }, [divisionId]);

  useEffect(() => {
    setCompanyTeamId(null);
  }, [departmentId]);

  // Reset referral source ID when type changes
  useEffect(() => {
    setReferralSourceId(null);
  }, [referralSourceType]);

  // Create client mutation
  const createClient = trpc.clients.create.useMutation({
    onSuccess: () => {
      utils.clients.invalidate();
      Alert.alert("Success", "Client created successfully");
      router.back();
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create client");
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter client name");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Validation Error", "Please enter client email");
      return;
    }
    if (!companyId) {
      Alert.alert("Validation Error", "Please select a company");
      return;
    }
    if (!divisionId) {
      Alert.alert("Validation Error", "Please select a division");
      return;
    }
    if (!departmentId) {
      Alert.alert("Validation Error", "Please select a department");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    createClient.mutate({
      companyId: companyId!,
      divisionId: divisionId!,
      departmentId: departmentId!,
      companyTeamId: companyTeamId || undefined,
      referralSourceId: referralSourceId || undefined,
      referralSourceType: referralSourceType || undefined,
      name: name.trim(),
      address: address.trim() || undefined,
      mobilePhone: phone.trim() || undefined,
      email: email.trim() || undefined,
      dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : undefined,
      status: "Active",
      isVip: isVip ? 1 : 0,
      notificationPreference: "sms",
      notificationOptOut: 0,
      createdBy: user.id,
      updatedBy: user.id,
    });
  };

  if (companiesLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-foreground">Add New Client</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Basic Information Section */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">Basic Information</Text>
            
            {/* Name Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Name *</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Enter client name"
                placeholderTextColor={colors.muted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Email *</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Enter email address"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Phone Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Phone</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Enter phone number"
                placeholderTextColor={colors.muted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Address Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Address</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Enter address"
                placeholderTextColor={colors.muted}
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Date of Birth Input */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Date of Birth</Text>
              <TouchableOpacity
                className="bg-background border border-border rounded-xl px-4 py-3"
                onPress={() => setShowDatePicker(true)}
              >
                <Text className={`text-base ${dateOfBirth ? "text-foreground" : "text-muted"}`}>
                  {dateOfBirth ? dateOfBirth.toLocaleDateString() : "Select date of birth"}
                </Text>
              </TouchableOpacity>
              {dateOfBirth && (
                <Text className="text-xs text-muted mt-1">
                  Age: {Math.floor((Date.now() - dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))}
                </Text>
              )}
              {showDatePicker && (
                <DateTimePicker
                  value={dateOfBirth || new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === "ios");
                    if (selectedDate) {
                      setDateOfBirth(selectedDate);
                    }
                  }}
                  maximumDate={new Date()}
                />
              )}
            </View>
          </View>

          {/* Organizational Assignment Section */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">Organizational Assignment</Text>
            
            {/* Company Selection */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Company *</Text>
              <View className="bg-background border border-border rounded-xl overflow-hidden">
                <Picker
                  selectedValue={companyId}
                  onValueChange={(value) => setCompanyId(value)}
                  style={{ color: colors.foreground }}
                >
                  <Picker.Item label="Select a company..." value={null} />
                  {companies?.map((company: any) => (
                    <Picker.Item key={company.id} label={company.name} value={company.id} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Division Selection */}
            {companyId && divisions && divisions.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-foreground mb-2">Division</Text>
                <View className="bg-background border border-border rounded-xl overflow-hidden">
                  <Picker
                    selectedValue={divisionId}
                    onValueChange={(value) => setDivisionId(value)}
                    style={{ color: colors.foreground }}
                  >
                    <Picker.Item label="Select a division..." value={null} />
                    {divisions.map((division: any) => (
                      <Picker.Item key={division.id} label={division.name} value={division.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            {/* Department Selection */}
            {divisionId && departments && departments.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-foreground mb-2">Department *</Text>
                <View className="bg-background border border-border rounded-xl overflow-hidden">
                  <Picker
                    selectedValue={departmentId}
                    onValueChange={(value) => setDepartmentId(value)}
                    style={{ color: colors.foreground }}
                  >
                    <Picker.Item label="Select a department..." value={null} />
                    {departments.map((department: any) => (
                      <Picker.Item key={department.id} label={department.name} value={department.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            {/* Company Team Selection */}
            {departmentId && companyTeams && companyTeams.length > 0 && (
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Company Team</Text>
                <View className="bg-background border border-border rounded-xl overflow-hidden">
                  <Picker
                    selectedValue={companyTeamId}
                    onValueChange={(value) => setCompanyTeamId(value)}
                    style={{ color: colors.foreground }}
                  >
                    <Picker.Item label="Select a team..." value={null} />
                    {companyTeams.map((team: any) => (
                      <Picker.Item key={team.id} label={team.name} value={team.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
          </View>

          {/* Referral Source Section */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">Referral Source</Text>
            
            {/* Referral Type Radio Buttons */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Referral Type</Text>
              <View className="gap-2">
                {[
                  { value: "client", label: "Client" },
                  { value: "staff", label: "Staff" },
                  { value: "fsm", label: "FSM" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    className="flex-row items-center py-2"
                    onPress={() => setReferralSourceType(option.value as any)}
                  >
                    <View
                      className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                        referralSourceType === option.value ? "border-primary" : "border-border"
                      }`}
                    >
                      {referralSourceType === option.value && (
                        <View className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </View>
                    <Text className="text-base text-foreground">{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Referral Source Dropdown */}
            {referralSourceType === "client" && allClients && (
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Select Client</Text>
                <View className="bg-background border border-border rounded-xl overflow-hidden">
                  <Picker
                    selectedValue={referralSourceId}
                    onValueChange={(value) => setReferralSourceId(value)}
                    style={{ color: colors.foreground }}
                  >
                    <Picker.Item label="Select a client..." value={null} />
                    {allClients.map((client: any) => (
                      <Picker.Item key={client.id} label={client.name} value={client.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            {referralSourceType === "staff" && allStaff && (
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Select Staff</Text>
                <View className="bg-background border border-border rounded-xl overflow-hidden">
                  <Picker
                    selectedValue={referralSourceId}
                    onValueChange={(value) => setReferralSourceId(value)}
                    style={{ color: colors.foreground }}
                  >
                    <Picker.Item label="Select a staff member..." value={null} />
                    {allStaff.map((staff: any) => (
                      <Picker.Item key={staff.id} label={staff.name} value={staff.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            {referralSourceType === "fsm" && fsms && (
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Select FSM</Text>
                <View className="bg-background border border-border rounded-xl overflow-hidden">
                  <Picker
                    selectedValue={referralSourceId}
                    onValueChange={(value) => setReferralSourceId(value)}
                    style={{ color: colors.foreground }}
                  >
                    <Picker.Item label="Select an FSM..." value={null} />
                    {fsms.map((fsm: any) => (
                      <Picker.Item key={fsm.id} label={fsm.name} value={fsm.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
          </View>

          {/* VIP Status */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <TouchableOpacity
              className="flex-row items-center justify-between"
              onPress={() => setIsVip(!isVip)}
            >
              <View>
                <Text className="text-base font-semibold text-foreground">VIP Client</Text>
                <Text className="text-sm text-muted mt-1">Mark this client as VIP for priority handling</Text>
              </View>
              <View
                className={`w-12 h-7 rounded-full p-1 ${
                  isVip ? "bg-primary" : "bg-border"
                }`}
              >
                <View
                  className={`w-5 h-5 rounded-full bg-background ${
                    isVip ? "ml-auto" : ""
                  }`}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-primary rounded-xl py-4 items-center mb-8"
            onPress={handleSubmit}
            disabled={createClient.isPending}
          >
            {createClient.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-base font-semibold text-white">Create Client</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
