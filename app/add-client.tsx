import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

/**
 * Add Client Screen
 * 
 * Form to create a new client with:
 * - Name, email, phone
 * - Company, division, department selection
 * - FSM (referral source) selection
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
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [divisionId, setDivisionId] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [companyTeamId, setCompanyTeamId] = useState<number | null>(null);
  const [fsmId, setFsmId] = useState<number | null>(null);
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
  const { data: fsms } = trpc.fsms.list.useQuery();

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
    if (!departmentId) {
      Alert.alert("Validation Error", "Please select a department");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    createClient.mutate({
      departmentId: departmentId!,
      referralSourceId: fsmId || undefined,
      referralSourceType: fsmId ? "fsm" : undefined,
      name: name.trim(),
      address: address.trim() || undefined,
      mobilePhone: phone.trim() || undefined,
      email: email.trim() || undefined,
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
          {/* Name Input */}
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Name *</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
              placeholder="Enter client name"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Email Input */}
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Email *</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
              placeholder="Enter email address"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Phone Input */}
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Phone</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
              placeholder="Enter phone number"
              placeholderTextColor={colors.muted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Company Selection */}
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Company *</Text>
            {companies && companies.length > 0 ? (
              <View className="gap-2">
                {companies.map((company) => (
                  <TouchableOpacity
                    key={company.id}
                    className={`bg-surface border rounded-xl px-4 py-3 ${
                      companyId === company.id ? "border-primary" : "border-border"
                    }`}
                    onPress={() => {
                      setCompanyId(company.id);
                      setDivisionId(null);
                      setDepartmentId(null);
                    }}
                  >
                    <Text className={`text-base ${companyId === company.id ? "text-primary font-semibold" : "text-foreground"}`}>
                      {company.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text className="text-sm text-muted italic">No companies available. Please add companies in Admin section first.</Text>
            )}
          </View>

          {/* Division Selection */}
          {companyId && divisions && divisions.length > 0 && (
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Division (Optional)</Text>
              <View className="gap-2">
                {divisions.map((division) => (
                  <TouchableOpacity
                    key={division.id}
                    className={`bg-surface border rounded-xl px-4 py-3 ${
                      divisionId === division.id ? "border-primary" : "border-border"
                    }`}
                    onPress={() => {
                      setDivisionId(division.id);
                      setDepartmentId(null);
                      setCompanyTeamId(null);
                    }}
                  >
                    <Text className={`text-base ${divisionId === division.id ? "text-primary font-semibold" : "text-foreground"}`}>
                      {division.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Department Selection */}
          {divisionId && departments && departments.length > 0 && (
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Department (Optional)</Text>
              <View className="gap-2">
                {departments.map((department) => (
                  <TouchableOpacity
                    key={department.id}
                    className={`bg-surface border rounded-xl px-4 py-3 ${
                      departmentId === department.id ? "border-primary" : "border-border"
                    }`}
                    onPress={() => {
                      setDepartmentId(department.id);
                      setCompanyTeamId(null);
                    }}
                  >
                    <Text className={`text-base ${departmentId === department.id ? "text-primary font-semibold" : "text-foreground"}`}>
                      {department.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Company Team Selection */}
          {departmentId && companyTeams && companyTeams.length > 0 && (
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Company Team (Optional)</Text>
              <View className="gap-2">
                {companyTeams.map((team) => (
                  <TouchableOpacity
                    key={team.id}
                    className={`bg-surface border rounded-xl px-4 py-3 ${
                      companyTeamId === team.id ? "border-primary" : "border-border"
                    }`}
                    onPress={() => setCompanyTeamId(team.id)}
                  >
                    <View className="flex-row items-center gap-2">
                      <Text className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">{team.code}</Text>
                      <Text className={`text-base flex-1 ${companyTeamId === team.id ? "text-primary font-semibold" : "text-foreground"}`}>
                        {team.name}
                      </Text>
                    </View>
                    {team.description && (
                      <Text className="text-sm text-muted mt-1">{team.description}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* FSM Selection */}
          {fsms && fsms.length > 0 && (
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Referral Source (FSM)</Text>
              <View className="gap-2">
                {fsms.map((fsm) => (
                  <TouchableOpacity
                    key={fsm.id}
                    className={`bg-surface border rounded-xl px-4 py-3 ${
                      fsmId === fsm.id ? "border-primary" : "border-border"
                    }`}
                    onPress={() => setFsmId(fsm.id)}
                  >
                    <Text className={`text-base ${fsmId === fsm.id ? "text-primary font-semibold" : "text-foreground"}`}>
                      {fsm.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* VIP Toggle */}
          <View className="flex-row items-center justify-between bg-surface border border-border rounded-xl px-4 py-3">
            <View>
              <Text className="text-base font-medium text-foreground">VIP Client</Text>
              <Text className="text-sm text-muted">Requires VIP access for edits</Text>
            </View>
            <TouchableOpacity
              className={`w-14 h-8 rounded-full justify-center ${isVip ? "bg-primary" : "bg-border"}`}
              onPress={() => setIsVip(!isVip)}
            >
              <View className={`w-6 h-6 rounded-full bg-background ${isVip ? "self-end mr-1" : "self-start ml-1"}`} />
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-primary py-4 rounded-full items-center mt-4"
            onPress={handleSubmit}
            disabled={createClient.isPending}
          >
            {createClient.isPending ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Text className="text-background text-lg font-semibold">Create Client</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
