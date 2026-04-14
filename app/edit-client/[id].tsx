import DateTimePicker from "@/components/ui/DateTimePicker";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, Modal, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Picker } from "@react-native-picker/picker";

export default function EditClientScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const clientId = parseInt(id as string, 10);
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    occupation: "",
    dateOfBirth: "",
    timeInServiceYears: "",
    timeInServiceMonths: "",
    addressLine1: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    mobilePhone: "",
    mobileCountryIso: "ZA" as "US" | "ZA",
    homePhone: "",
    workPhone: "",
    email: "",
    status: "Active",
    notificationPreference: null as "sms" | "whatsapp" | null,
    notificationOptOut: 0,
    isVip: 0,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [companyId, setCompanyId] = useState<number | null>(null);
  const [coDepartmentId, setCoDepartmentId] = useState<number | null>(null);
  const [companyTeamId, setCompanyTeamId] = useState<number | null>(null);

  const [referralSourceType, setReferralSourceType] = useState<"client" | "staff" | "fsm" | null>(null);
  const [referralSourceId, setReferralSourceId] = useState<number | null>(null);

  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showClientReferralModal, setShowClientReferralModal] = useState(false);
  const [showStaffReferralModal, setShowStaffReferralModal] = useState(false);
  const [showFsmReferralModal, setShowFsmReferralModal] = useState(false);

  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [departmentSearchQuery, setDepartmentSearchQuery] = useState("");
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const [clientReferralSearchQuery, setClientReferralSearchQuery] = useState("");
  const [staffReferralSearchQuery, setStaffReferralSearchQuery] = useState("");
  const [fsmReferralSearchQuery, setFsmReferralSearchQuery] = useState("");

  const formatDateOnly = (date: Date): string => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateOnlyUtc = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
    const day = `${date.getUTCDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const parseIsoDateString = (value: string): Date | null => {
    const [year, month, day] = value.split("-").map((part) => parseInt(part, 10));
    if (!year || !month || !day) return null;
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const normalizeDateOnly = (value?: string | Date | null): string => {
    if (!value) return "";

    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) return "";
      // DB DATE values often arrive as UTC midnight Date objects on web;
      // using UTC components prevents timezone-based day drift.
      return formatDateOnlyUtc(value);
    }

    if (typeof value !== "string") return "";

    const trimmed = value.trim();
    if (!trimmed) return "";

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }

    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
      const [month, day, year] = trimmed.split("/").map((part) => parseInt(part, 10));
      const parsed = new Date(year, month - 1, day);
      if (
        parsed.getFullYear() === year &&
        parsed.getMonth() === month - 1 &&
        parsed.getDate() === day
      ) {
        return formatDateOnly(parsed);
      }
    }

    return "";
  };

  const { data: user } = trpc.auth.me.useQuery();
  const { data: client, isLoading } = trpc.clients.get.useQuery({ id: clientId });

  const { data: companies } = trpc.companies.list.useQuery();
  const { data: coDepartments } = trpc.coDepartments.list.useQuery(
    { companyId: companyId || 0 },
    { enabled: !!companyId }
  );
  const { data: companyTeams } = trpc.companyTeams.list.useQuery(
    { coDepartmentId: coDepartmentId || 0 },
    { enabled: !!coDepartmentId }
  );

  const { data: allClients } = trpc.clients.listAll.useQuery();
  const { data: allStaff } = trpc.staff.listAll.useQuery();
  const { data: allFsms } = trpc.fsms.list.useQuery();

  const selectedCompany = useMemo(() => companies?.find((c: any) => c.id === companyId) || null, [companies, companyId]);
  const selectedDepartment = useMemo(() => coDepartments?.find((d: any) => d.id === coDepartmentId) || null, [coDepartments, coDepartmentId]);
  const selectedTeam = useMemo(() => companyTeams?.find((t: any) => t.id === companyTeamId) || null, [companyTeams, companyTeamId]);

  const filteredCompanies = useMemo(() => {
    const query = companySearchQuery.trim().toLowerCase();
    if (!query) return companies || [];
    return (companies || []).filter((c: any) => c.name.toLowerCase().includes(query));
  }, [companies, companySearchQuery]);

  const filteredDepartments = useMemo(() => {
    const query = departmentSearchQuery.trim().toLowerCase();
    if (!query) return coDepartments || [];
    return (coDepartments || []).filter((d: any) => d.name.toLowerCase().includes(query));
  }, [coDepartments, departmentSearchQuery]);

  const filteredTeams = useMemo(() => {
    const query = teamSearchQuery.trim().toLowerCase();
    if (!query) return companyTeams || [];
    return (companyTeams || []).filter((t: any) => t.name.toLowerCase().includes(query));
  }, [companyTeams, teamSearchQuery]);

  const filteredClientReferrals = useMemo(() => {
    const query = clientReferralSearchQuery.trim().toLowerCase();
    if (!query) return allClients || [];
    return (allClients || []).filter((c: any) => c.name.toLowerCase().includes(query));
  }, [allClients, clientReferralSearchQuery]);

  const filteredStaffReferrals = useMemo(() => {
    const query = staffReferralSearchQuery.trim().toLowerCase();
    if (!query) return allStaff || [];
    return (allStaff || []).filter((s: any) => s.name.toLowerCase().includes(query));
  }, [allStaff, staffReferralSearchQuery]);

  const filteredFsmReferrals = useMemo(() => {
    const query = fsmReferralSearchQuery.trim().toLowerCase();
    if (!query) return allFsms || [];
    return (allFsms || []).filter((f: any) => f.name.toLowerCase().includes(query));
  }, [allFsms, fsmReferralSearchQuery]);

  const referralDisplayName = useMemo(() => {
    if (!referralSourceType || !referralSourceId) return null;
    if (referralSourceType === "staff") {
      return allStaff?.find((s: any) => s.id === referralSourceId)?.name || `#${referralSourceId}`;
    }
    if (referralSourceType === "fsm") {
      return allFsms?.find((f: any) => f.id === referralSourceId)?.name || `#${referralSourceId}`;
    }
    return allClients?.find((c: any) => c.id === referralSourceId)?.name || `#${referralSourceId}`;
  }, [referralSourceType, referralSourceId, allStaff, allFsms, allClients]);

  useEffect(() => {
    if (!client) return;

    setFormData({
      name: client.name,
      title: client.title || "",
      occupation: client.occupation || "",
      dateOfBirth: normalizeDateOnly(client.dateOfBirth),
      timeInServiceYears:
        client.timeInServiceYears?.toString() ||
        (client.timeInService ? Math.floor(client.timeInService / 12).toString() : ""),
      timeInServiceMonths:
        client.timeInServiceMonths?.toString() ||
        (client.timeInService ? (client.timeInService % 12).toString() : ""),
      addressLine1: (client as any).addressLine1 || client.address || "",
      city: (client as any).city || "",
      stateProvince: (client as any).stateProvince || "",
      postalCode: (client as any).postalCode || "",
      mobilePhone: client.mobilePhone || "",
      mobileCountryIso: (client as any).mobileCountryIso === "US" ? "US" : "ZA",
      homePhone: client.homePhone || "",
      workPhone: client.workPhone || "",
      email: client.email || "",
      status: client.status,
      notificationPreference: client.notificationPreference || null,
      notificationOptOut: client.notificationOptOut || 0,
      isVip: client.isVip || 0,
    });

    setCompanyId(client.companyId || null);
    setCoDepartmentId(client.coDepartmentId || null);
    setCompanyTeamId(client.companyTeamId || null);
    setReferralSourceType(client.referralSourceType || null);
    setReferralSourceId(client.referralSourceId || null);
  }, [client]);

  useEffect(() => {
    setCoDepartmentId(null);
    setCompanyTeamId(null);
  }, [companyId]);

  useEffect(() => {
    setCompanyTeamId(null);
  }, [coDepartmentId]);

  useEffect(() => {
    setReferralSourceId(null);
  }, [referralSourceType]);

  const updateClient = trpc.clients.update.useMutation({
    onSuccess: async () => {
      await utils.clients.invalidate();
      Alert.alert("Success", "Client updated successfully");
      router.back();
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to update client");
    },
  });

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
      companyId: companyId || undefined,
      coDepartmentId: coDepartmentId || undefined,
      companyTeamId: companyTeamId || undefined,
      referralSourceType: referralSourceType || undefined,
      referralSourceId: referralSourceId || undefined,
      name: formData.name.trim(),
      title: formData.title.trim() || undefined,
      occupation: formData.occupation.trim() || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      timeInServiceYears: formData.timeInServiceYears ? parseInt(formData.timeInServiceYears, 10) : undefined,
      timeInServiceMonths: formData.timeInServiceMonths ? parseInt(formData.timeInServiceMonths, 10) : undefined,
      timeInService:
        (formData.timeInServiceYears ? parseInt(formData.timeInServiceYears, 10) * 12 : 0) +
        (formData.timeInServiceMonths ? parseInt(formData.timeInServiceMonths, 10) : 0) || undefined,
      addressLine1: formData.addressLine1.trim() || undefined,
      city: formData.city.trim() || undefined,
      stateProvince: formData.stateProvince.trim() || undefined,
      postalCode: formData.postalCode.trim() || undefined,
      mobilePhone: formData.mobilePhone.trim() || undefined,
      mobileCountryIso: formData.mobileCountryIso,
      homePhone: formData.homePhone.trim() || undefined,
      workPhone: formData.workPhone.trim() || undefined,
      email: formData.email.trim() || undefined,
      status: formData.status as "Active" | "Inactive" | "Referred" | "On Hold",
      notificationPreference: formData.mobilePhone.trim() ? formData.notificationPreference || undefined : undefined,
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
        <TouchableOpacity className="bg-primary px-6 py-3 rounded-full mt-6" onPress={() => router.back()}>
          <Text className="text-background font-semibold">Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="relative min-h-[48px] items-center justify-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute left-0 z-20"
          >
            <Text className="text-3xl font-bold text-foreground">&lt;</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground text-center">Edit Client</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
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
              <Text className="text-sm font-medium text-foreground mb-2">Mobile Country</Text>
              <View className="bg-background border border-border rounded-xl overflow-hidden">
                <Picker
                  selectedValue={formData.mobileCountryIso}
                  onValueChange={(value) => setFormData({ ...formData, mobileCountryIso: value })}
                  style={{ color: colors.foreground }}
                >
                  <Picker.Item label="South Africa (+27)" value="ZA" />
                  <Picker.Item label="United States (+1)" value="US" />
                </Picker>
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Mobile Phone</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Enter mobile phone"
                placeholderTextColor={colors.muted}
                value={formData.mobilePhone}
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    mobilePhone: text,
                    notificationPreference: text.trim() ? formData.notificationPreference : null,
                  })
                }
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
              <Text className="text-sm font-medium text-foreground mb-2">Address Line 1</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Enter address line 1"
                placeholderTextColor={colors.muted}
                value={formData.addressLine1}
                onChangeText={(text) => setFormData({ ...formData, addressLine1: text })}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">City</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Enter city"
                placeholderTextColor={colors.muted}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
              />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground mb-2">State/Province</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Enter state/province"
                  placeholderTextColor={colors.muted}
                  value={formData.stateProvince}
                  onChangeText={(text) => setFormData({ ...formData, stateProvince: text })}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground mb-2">Zip/Postal Code</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Enter zip/postal"
                  placeholderTextColor={colors.muted}
                  value={formData.postalCode}
                  onChangeText={(text) => setFormData({ ...formData, postalCode: text })}
                />
              </View>
            </View>
          </View>

          <View className="bg-surface border border-border rounded-2xl p-4 gap-3">
            <Text className="text-base font-semibold text-foreground">Professional Information</Text>

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
                <Text className="text-sm font-medium text-foreground mb-2">Date of Birth</Text>
                {formData.dateOfBirth && (
                  <Text className="text-sm text-muted mb-1">
                    Age: {(() => {
                      const dob = parseIsoDateString(formData.dateOfBirth);
                      if (!dob) return "-";
                      return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                    })()}
                  </Text>
                )}
                <TouchableOpacity
                  className="bg-background border border-border rounded-xl px-4 py-3"
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text className={`text-base ${formData.dateOfBirth ? "text-foreground" : "text-muted"}`}>
                    {formData.dateOfBirth ? (parseIsoDateString(formData.dateOfBirth)?.toLocaleDateString() || "Select date") : "Select date"}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={parseIsoDateString(formData.dateOfBirth) || new Date()}
                    mode="date"
                    onChange={(value) => {
                      if (typeof value === "string") {
                        const normalized = normalizeDateOnly(value);
                        if (normalized) {
                          setFormData({ ...formData, dateOfBirth: normalized });
                          if (Platform.OS === "web" && typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                          }
                          setShowDatePicker(false);
                        }
                        return;
                      }
                      if (value instanceof Date && !Number.isNaN(value.getTime())) {
                        setFormData({ ...formData, dateOfBirth: formatDateOnly(value) });
                        if (Platform.OS === "web" && typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
                          document.activeElement.blur();
                        }
                        setShowDatePicker(false);
                      }
                    }}
                  />
                )}
              </View>

              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground mb-2">Time in Service</Text>
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Text className="text-xs text-muted mb-1">Years</Text>
                    <TextInput
                      className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                      placeholder="0"
                      placeholderTextColor={colors.muted}
                      value={formData.timeInServiceYears}
                      onChangeText={(text) => setFormData({ ...formData, timeInServiceYears: text })}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-muted mb-1">Months</Text>
                    <TextInput
                      className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                      placeholder="0-11"
                      placeholderTextColor={colors.muted}
                      value={formData.timeInServiceMonths}
                      onChangeText={(text) => setFormData({ ...formData, timeInServiceMonths: text })}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className="bg-surface border border-border rounded-2xl p-4 gap-3">
            <Text className="text-base font-semibold text-foreground">Organizational Assignment</Text>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Company</Text>
              <TouchableOpacity
                className="bg-background border border-border rounded-xl px-4 py-3"
                onPress={() => setShowCompanyModal(true)}
              >
                <Text className="text-base text-foreground">
                  {selectedCompany ? selectedCompany.name : "Select company"}
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Department</Text>
              <TouchableOpacity
                className="bg-background border border-border rounded-xl px-4 py-3"
                onPress={() => setShowDepartmentModal(true)}
                disabled={!companyId}
              >
                <Text className={`text-base ${companyId ? "text-foreground" : "text-muted"}`}>
                  {selectedDepartment ? selectedDepartment.name : companyId ? "Select department" : "Select company first"}
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Team</Text>
              <TouchableOpacity
                className="bg-background border border-border rounded-xl px-4 py-3"
                onPress={() => setShowTeamModal(true)}
                disabled={!coDepartmentId}
              >
                <Text className={`text-base ${coDepartmentId ? "text-foreground" : "text-muted"}`}>
                  {selectedTeam ? selectedTeam.name : coDepartmentId ? "Select team" : "Select department first"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="bg-surface border border-border rounded-2xl p-4 gap-3">
            <Text className="text-base font-semibold text-foreground">Referral Source</Text>

            <View className="flex-row gap-2">
              <TouchableOpacity
                className={`flex-1 py-2 rounded-xl items-center ${referralSourceType === "client" ? "bg-primary" : "bg-background border border-border"}`}
                onPress={() => setReferralSourceType("client")}
              >
                <Text className={`${referralSourceType === "client" ? "text-background" : "text-foreground"}`}>Client</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-xl items-center ${referralSourceType === "staff" ? "bg-primary" : "bg-background border border-border"}`}
                onPress={() => setReferralSourceType("staff")}
              >
                <Text className={`${referralSourceType === "staff" ? "text-background" : "text-foreground"}`}>Staff</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-xl items-center ${referralSourceType === "fsm" ? "bg-primary" : "bg-background border border-border"}`}
                onPress={() => setReferralSourceType("fsm")}
              >
                <Text className={`${referralSourceType === "fsm" ? "text-background" : "text-foreground"}`}>FSM</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-background border border-border rounded-xl px-4 py-3"
              onPress={() => {
                if (referralSourceType === "client") setShowClientReferralModal(true);
                if (referralSourceType === "staff") setShowStaffReferralModal(true);
                if (referralSourceType === "fsm") setShowFsmReferralModal(true);
              }}
              disabled={!referralSourceType}
            >
              <Text className={`text-base ${referralSourceType ? "text-foreground" : "text-muted"}`}>
                {referralDisplayName || (referralSourceType ? `Select ${referralSourceType}` : "Choose a referral type first")}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-surface border border-border rounded-2xl p-4 gap-3 mb-6">
            <Text className="text-base font-semibold text-foreground">Preferences</Text>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Notification Preference</Text>
              <View className={`bg-background border rounded-xl overflow-hidden ${formData.mobilePhone.trim() ? "border-border" : "border-border opacity-50"}`}>
                <Picker
                  selectedValue={formData.notificationPreference}
                  onValueChange={(value) => setFormData({ ...formData, notificationPreference: value })}
                  style={{ color: colors.foreground }}
                  enabled={!!formData.mobilePhone.trim()}
                >
                  <Picker.Item label="Select with mobile number" value={null} />
                  <Picker.Item label="SMS" value="sms" />
                  <Picker.Item label="WhatsApp" value="whatsapp" />
                </Picker>
              </View>
              {!formData.mobilePhone.trim() && <Text className="text-xs text-muted mt-2">Enter a mobile phone number to enable notifications.</Text>}
            </View>

            <TouchableOpacity
              className="flex-row items-center gap-3"
              onPress={() => setFormData({ ...formData, notificationOptOut: formData.notificationOptOut === 1 ? 0 : 1 })}
            >
              <View className={`w-6 h-6 rounded border-2 items-center justify-center ${formData.notificationOptOut === 1 ? "bg-primary border-primary" : "border-border"}`}>
                {formData.notificationOptOut === 1 && <IconSymbol name="checkmark" size={16} color={colors.background} />}
              </View>
              <Text className="text-base text-foreground">Opt in for notifications</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center gap-3"
              onPress={() => setFormData({ ...formData, isVip: formData.isVip === 1 ? 0 : 1 })}
            >
              <View className={`w-6 h-6 rounded border-2 items-center justify-center ${formData.isVip === 1 ? "bg-warning border-warning" : "border-border"}`}>
                {formData.isVip === 1 && <IconSymbol name="star.fill" size={16} color={colors.background} />}
              </View>
              <Text className="text-base text-foreground">VIP Client</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <TouchableOpacity
              className="bg-primary py-3 rounded-full items-center"
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

      <Modal visible={showCompanyModal} animationType="fade" transparent onRequestClose={() => setShowCompanyModal(false)}>
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <View className="w-[92%] bg-background rounded-2xl p-5" style={{ maxHeight: "82%" }}>
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity
                onPress={() => setShowCompanyModal(false)}
                className="absolute left-0"
              >
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Company</Text>
            </View>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground mb-3"
              placeholder="Search company..."
              placeholderTextColor={colors.muted}
              value={companySearchQuery}
              onChangeText={setCompanySearchQuery}
            />
            <FlatList
              data={filteredCompanies}
              keyExtractor={(item) => item.id.toString()}
              style={{ maxHeight: 420 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="px-4 py-3 border-b border-border"
                  onPress={() => {
                    setCompanyId(item.id);
                    setShowCompanyModal(false);
                  }}
                >
                  <Text className="text-base text-foreground">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowCompanyModal(false)} className="mt-4">
              <Text className="text-primary font-semibold text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showDepartmentModal} animationType="fade" transparent onRequestClose={() => setShowDepartmentModal(false)}>
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <View className="w-[92%] bg-background rounded-2xl p-5" style={{ maxHeight: "82%" }}>
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity
                onPress={() => setShowDepartmentModal(false)}
                className="absolute left-0"
              >
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Department</Text>
            </View>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground mb-3"
              placeholder="Search department..."
              placeholderTextColor={colors.muted}
              value={departmentSearchQuery}
              onChangeText={setDepartmentSearchQuery}
            />
            <FlatList
              data={filteredDepartments}
              keyExtractor={(item) => item.id.toString()}
              style={{ maxHeight: 420 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="px-4 py-3 border-b border-border"
                  onPress={() => {
                    setCoDepartmentId(item.id);
                    setShowDepartmentModal(false);
                  }}
                >
                  <Text className="text-base text-foreground">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowDepartmentModal(false)} className="mt-4">
              <Text className="text-primary font-semibold text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showTeamModal} animationType="fade" transparent onRequestClose={() => setShowTeamModal(false)}>
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <View className="w-[92%] bg-background rounded-2xl p-5" style={{ maxHeight: "82%" }}>
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity
                onPress={() => setShowTeamModal(false)}
                className="absolute left-0"
              >
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Team</Text>
            </View>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground mb-3"
              placeholder="Search team..."
              placeholderTextColor={colors.muted}
              value={teamSearchQuery}
              onChangeText={setTeamSearchQuery}
            />
            <FlatList
              data={filteredTeams}
              keyExtractor={(item) => item.id.toString()}
              style={{ maxHeight: 420 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="px-4 py-3 border-b border-border"
                  onPress={() => {
                    setCompanyTeamId(item.id);
                    setShowTeamModal(false);
                  }}
                >
                  <Text className="text-base text-foreground">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowTeamModal(false)} className="mt-4">
              <Text className="text-primary font-semibold text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showClientReferralModal} animationType="fade" transparent onRequestClose={() => setShowClientReferralModal(false)}>
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <View className="w-[92%] bg-background rounded-2xl p-5" style={{ maxHeight: "82%" }}>
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity
                onPress={() => setShowClientReferralModal(false)}
                className="absolute left-0"
              >
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Referring Client</Text>
            </View>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground mb-3"
              placeholder="Search client..."
              placeholderTextColor={colors.muted}
              value={clientReferralSearchQuery}
              onChangeText={setClientReferralSearchQuery}
            />
            <FlatList
              data={filteredClientReferrals}
              keyExtractor={(item: any) => item.id.toString()}
              style={{ maxHeight: 420 }}
              renderItem={({ item }: { item: any }) => (
                <TouchableOpacity
                  className="px-4 py-3 border-b border-border"
                  onPress={() => {
                    setReferralSourceId(item.id);
                    setShowClientReferralModal(false);
                  }}
                >
                  <Text className="text-base text-foreground">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowClientReferralModal(false)} className="mt-4">
              <Text className="text-primary font-semibold text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showStaffReferralModal} animationType="fade" transparent onRequestClose={() => setShowStaffReferralModal(false)}>
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <View className="w-[92%] bg-background rounded-2xl p-5" style={{ maxHeight: "82%" }}>
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity
                onPress={() => setShowStaffReferralModal(false)}
                className="absolute left-0"
              >
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Referring Staff</Text>
            </View>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground mb-3"
              placeholder="Search staff..."
              placeholderTextColor={colors.muted}
              value={staffReferralSearchQuery}
              onChangeText={setStaffReferralSearchQuery}
            />
            <FlatList
              data={filteredStaffReferrals}
              keyExtractor={(item: any) => item.id.toString()}
              style={{ maxHeight: 420 }}
              renderItem={({ item }: { item: any }) => (
                <TouchableOpacity
                  className="px-4 py-3 border-b border-border"
                  onPress={() => {
                    setReferralSourceId(item.id);
                    setShowStaffReferralModal(false);
                  }}
                >
                  <Text className="text-base text-foreground">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowStaffReferralModal(false)} className="mt-4">
              <Text className="text-primary font-semibold text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showFsmReferralModal} animationType="fade" transparent onRequestClose={() => setShowFsmReferralModal(false)}>
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <View className="w-[92%] bg-background rounded-2xl p-5" style={{ maxHeight: "82%" }}>
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity
                onPress={() => setShowFsmReferralModal(false)}
                className="absolute left-0"
              >
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Referring FSM</Text>
            </View>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground mb-3"
              placeholder="Search fsm..."
              placeholderTextColor={colors.muted}
              value={fsmReferralSearchQuery}
              onChangeText={setFsmReferralSearchQuery}
            />
            <FlatList
              data={filteredFsmReferrals}
              keyExtractor={(item: any) => item.id.toString()}
              style={{ maxHeight: 420 }}
              renderItem={({ item }: { item: any }) => (
                <TouchableOpacity
                  className="px-4 py-3 border-b border-border"
                  onPress={() => {
                    setReferralSourceId(item.id);
                    setShowFsmReferralModal(false);
                  }}
                >
                  <Text className="text-base text-foreground">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowFsmReferralModal(false)} className="mt-4">
              <Text className="text-primary font-semibold text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
