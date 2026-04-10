import DateTimePicker from "@/components/ui/DateTimePicker";
import { useState, useEffect, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, Modal, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";

/**
 * Add Client Screen
 * 
 * Form to create a new client with:
 * - Name, email, phone, date of birth
 * - Company, department, company team selection (dropdowns)
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
  const [mobileCountryIso, setMobileCountryIso] = useState<"US" | "ZA">("ZA");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [title, setTitle] = useState("");
  const [occupation, setOccupation] = useState("");
  const [timeInServiceYears, setTimeInServiceYears] = useState("");
  const [timeInServiceMonths, setTimeInServiceMonths] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [companyTeamId, setCompanyTeamId] = useState<number | null>(null);
  
  // Referral source state
  const [referralSourceType, setReferralSourceType] = useState<"client" | "staff" | "fsm" | null>(null);
  const [referralSourceId, setReferralSourceId] = useState<number | null>(null);
  const [notificationPreference, setNotificationPreference] = useState<"sms" | "whatsapp" | null>(null);
  const [notificationOptOut, setNotificationOptOut] = useState(1);
  
  const [isVip, setIsVip] = useState(false);
  
  // Modal states for all selectors
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyAddress, setNewCompanyAddress] = useState("");
  const [newCompanyPhone, setNewCompanyPhone] = useState("");
  const [newCompanyEmail, setNewCompanyEmail] = useState("");
  const [newCompanyContact, setNewCompanyContact] = useState("");
  const [recentCompanyIds, setRecentCompanyIds] = useState<number[]>([]);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [departmentSearchQuery, setDepartmentSearchQuery] = useState("");
  const [showCreateDepartment, setShowCreateDepartment] = useState(false);
  const [newDepartmentCode, setNewDepartmentCode] = useState("");
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamCode, setNewTeamCode] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [showClientReferralModal, setShowClientReferralModal] = useState(false);
  const [clientReferralSearchQuery, setClientReferralSearchQuery] = useState("");
  const [showStaffReferralModal, setShowStaffReferralModal] = useState(false);
  const [staffReferralSearchQuery, setStaffReferralSearchQuery] = useState("");
  const [showFsmModal, setShowFsmModal] = useState(false);
  const [fsmSearchQuery, setFsmSearchQuery] = useState("");

  const formatDateOnly = (date: Date): string => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const parseDateOnlyString = (value: string): Date | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split("-").map((part) => parseInt(part, 10));
      const parsed = new Date(y, m - 1, d);
      if (parsed.getFullYear() === y && parsed.getMonth() === m - 1 && parsed.getDate() === d) {
        return parsed;
      }
      return null;
    }

    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
      const [m, d, y] = trimmed.split("/").map((part) => parseInt(part, 10));
      const parsed = new Date(y, m - 1, d);
      if (parsed.getFullYear() === y && parsed.getMonth() === m - 1 && parsed.getDate() === d) {
        return parsed;
      }
      return null;
    }

    return null;
  };

  // Local-first draft entities (persisted only when Save is clicked)
  const [localCompanies, setLocalCompanies] = useState<Array<{
    id: number;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    contactPerson?: string;
  }>>([]);
  const [localDepartments, setLocalDepartments] = useState<Array<{
    id: number;
    companyId: number;
    name: string;
    description?: string;
  }>>([]);
  
  const { data: user } = trpc.auth.me.useQuery();

  // Load recent company selections from AsyncStorage
  useEffect(() => {
    const loadRecentCompanies = async () => {
      try {
        const stored = await AsyncStorage.getItem('recentCompanyIds');
        if (stored) {
          setRecentCompanyIds(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load recent companies:', error);
      }
    };
    loadRecentCompanies();
  }, []);

  // Fetch dropdown data
  const { data: companies, isLoading: companiesLoading } = trpc.companies.list.useQuery();
  
  // Save recent company selection
  const saveRecentCompany = async (id: number) => {
    try {
      const updated = [id, ...recentCompanyIds.filter(cid => cid !== id)].slice(0, 5); // Keep last 5
      setRecentCompanyIds(updated);
      await AsyncStorage.setItem('recentCompanyIds', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent company:', error);
    }
  };

  // Filtered companies for search, with recent ones at top
  const mergedCompanies = useMemo(() => {
    return [...(companies || []), ...localCompanies];
  }, [companies, localCompanies]);

  const filteredCompanies = useMemo(() => {
    if (!mergedCompanies.length) return [];

    let filtered = mergedCompanies;
    if (companySearchQuery.trim()) {
      const query = companySearchQuery.toLowerCase();
      filtered = mergedCompanies.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.address?.toLowerCase().includes(query) ||
        c.contactPerson?.toLowerCase().includes(query)
      );
    }
    
    // Sort: recent companies first, then alphabetically
    return filtered.sort((a, b) => {
      const aRecent = recentCompanyIds.indexOf(a.id);
      const bRecent = recentCompanyIds.indexOf(b.id);
      
      if (aRecent !== -1 && bRecent !== -1) return aRecent - bRecent; // Both recent: sort by recency
      if (aRecent !== -1) return -1; // Only a is recent
      if (bRecent !== -1) return 1; // Only b is recent
      return a.name.localeCompare(b.name); // Neither recent: alphabetical
    });
  }, [mergedCompanies, companySearchQuery, recentCompanyIds]);
  
  const { data: departments } = trpc.coDepartments.list.useQuery(
    { companyId: companyId || 0 },
    { enabled: !!companyId && companyId > 0 }
  );

  const localDepartmentsForCompany = useMemo(() => {
    if (!companyId) return [];
    return localDepartments.filter((d) => d.companyId === companyId);
  }, [companyId, localDepartments]);
  
  // Filtered departments for search
  const filteredDepartments = useMemo(() => {
    const mergedDepartments = [...(departments || []), ...localDepartmentsForCompany];
    if (!mergedDepartments.length) return [];
    if (!departmentSearchQuery.trim()) return mergedDepartments;
    const query = departmentSearchQuery.toLowerCase();
    return mergedDepartments.filter((d: any) => 
      d.name.toLowerCase().includes(query) ||
      d.description?.toLowerCase().includes(query)
    );
  }, [departments, localDepartmentsForCompany, departmentSearchQuery]);
  
  const { data: companyTeams } = trpc.companyTeams.list.useQuery(
    { coDepartmentId: departmentId || 0 },
    { enabled: !!departmentId }
  );
  
  // Filtered teams for search
  const filteredTeams = useMemo(() => {
    if (!companyTeams) return [];
    if (!teamSearchQuery.trim()) return companyTeams;
    const query = teamSearchQuery.toLowerCase();
    return companyTeams.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query)
    );
  }, [companyTeams, teamSearchQuery]);
  
  // Fetch referral source options based on type
  const { data: allClients } = trpc.clients.listAll.useQuery(undefined, { enabled: referralSourceType === "client" });
  const { data: allStaff } = trpc.staff.listAll.useQuery(undefined, { enabled: referralSourceType === "staff" });
  const { data: fsms } = trpc.fsms.list.useQuery(undefined, { enabled: referralSourceType === "fsm" });

  // Filtered referral sources for search
  const filteredClientReferrals = useMemo(() => {
    if (!allClients) return [];
    let filtered = allClients;
    if (clientReferralSearchQuery.trim()) {
      const query = clientReferralSearchQuery.toLowerCase();
      filtered = allClients.filter(c => c.name.toLowerCase().includes(query));
    }
    return filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [allClients, clientReferralSearchQuery]);

  const filteredStaffReferrals = useMemo(() => {
    if (!allStaff) return [];
    let filtered = allStaff;
    if (staffReferralSearchQuery.trim()) {
      const query = staffReferralSearchQuery.toLowerCase();
      filtered = allStaff.filter(s => s.name.toLowerCase().includes(query));
    }
    return filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [allStaff, staffReferralSearchQuery]);

  const filteredFsms = useMemo(() => {
    if (!fsms) return [];
    if (!fsmSearchQuery.trim()) return fsms;
    const query = fsmSearchQuery.toLowerCase();
    return fsms.filter(f => f.name.toLowerCase().includes(query));
  }, [fsms, fsmSearchQuery]);

  // Reset downstream selections when parent changes
  useEffect(() => {
    setDepartmentId(null);
    setCompanyTeamId(null);
  }, [companyId]);

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

  // Persisted only during final submit
  const createCompany = trpc.companies.create.useMutation();

  // Persisted only during final submit
  const createDepartment = trpc.coDepartments.create.useMutation();

  // Create team mutation
  const createTeam = trpc.companyTeams.create.useMutation({
    onSuccess: (newTeamId) => {
      utils.companyTeams.invalidate();
      setCompanyTeamId(newTeamId);
      setShowCreateTeam(false);
      setShowTeamModal(false);
      // Clear form
      setNewTeamCode("");
      setNewTeamName("");
      Alert.alert("Success", "Team created successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create team");
    },
  });

  const handleSubmit = async () => {
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
    if (!departmentId) {
      Alert.alert("Validation Error", "Please select a department");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    try {
      let finalCompanyId = companyId!;
      if (finalCompanyId < 0) {
        const draftCompany = localCompanies.find((c) => c.id === finalCompanyId);
        if (!draftCompany) {
          Alert.alert("Error", "Selected company draft not found");
          return;
        }
        finalCompanyId = await createCompany.mutateAsync({
          name: draftCompany.name,
          address: draftCompany.address || undefined,
          phone: draftCompany.phone || undefined,
          email: draftCompany.email || undefined,
          contactPerson: draftCompany.contactPerson || undefined,
          createdBy: user.id,
          updatedBy: user.id,
        });
      }

      let finalDepartmentId = departmentId!;
      if (finalDepartmentId < 0) {
        const draftDepartment = localDepartments.find((d) => d.id === finalDepartmentId);
        if (!draftDepartment) {
          Alert.alert("Error", "Selected department draft not found");
          return;
        }
        finalDepartmentId = await createDepartment.mutateAsync({
          companyId: finalCompanyId,
          name: draftDepartment.name,
          createdBy: user.id,
          updatedBy: user.id,
        });
      }

      await createClient.mutateAsync({
      companyId: finalCompanyId,
      coDepartmentId: finalDepartmentId,
      companyTeamId: companyTeamId || undefined,
      referralSourceId: referralSourceId || undefined,
      referralSourceType: referralSourceType || undefined,
      name: name.trim(),
      addressLine1: addressLine1.trim() || undefined,
      city: city.trim() || undefined,
      stateProvince: stateProvince.trim() || undefined,
      postalCode: postalCode.trim() || undefined,
      mobilePhone: phone.trim() || undefined,
      mobileCountryIso,
      email: email.trim() || undefined,
      title: title.trim() || undefined,
      occupation: occupation.trim() || undefined,
      dateOfBirth: dateOfBirth ? formatDateOnly(dateOfBirth) : undefined,
      timeInServiceYears: timeInServiceYears ? parseInt(timeInServiceYears, 10) : undefined,
      timeInServiceMonths: timeInServiceMonths ? parseInt(timeInServiceMonths, 10) : undefined,
      timeInService:
        (timeInServiceYears ? parseInt(timeInServiceYears, 10) * 12 : 0) +
        (timeInServiceMonths ? parseInt(timeInServiceMonths, 10) : 0) || undefined,
      status: "Active",
      isVip: isVip ? 1 : 0,
      notificationPreference: phone.trim() ? notificationPreference || undefined : undefined,
      notificationOptOut,
      createdBy: user.id,
      updatedBy: user.id,
      });
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to save client");
    }
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
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="relative min-h-[48px] items-center justify-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute left-0 z-20"
          >
            <Text className="text-3xl font-bold text-foreground">&lt;</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground text-center">Add New Client</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Basic Information Section */}
          <View className="bg-surface border border-border rounded-2xl p-4 gap-3">
            <Text className="text-base font-semibold text-foreground">Basic Information</Text>
            
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
              <Text className="text-sm font-medium text-foreground mb-2">Mobile Country</Text>
              <View className="bg-background border border-border rounded-xl overflow-hidden">
                <Picker
                  selectedValue={mobileCountryIso}
                  onValueChange={(value) => setMobileCountryIso(value)}
                  style={{ color: colors.foreground }}
                >
                  <Picker.Item label="South Africa (+27)" value="ZA" />
                  <Picker.Item label="United States (+1)" value="US" />
                </Picker>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Phone</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Enter phone number"
                placeholderTextColor={colors.muted}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (!text.trim()) {
                    setNotificationPreference(null);
                  }
                }}
                keyboardType="phone-pad"
              />
            </View>

            {/* Address Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Address Line 1</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Enter address line 1"
                placeholderTextColor={colors.muted}
                value={addressLine1}
                onChangeText={setAddressLine1}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">City</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Enter city"
                placeholderTextColor={colors.muted}
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground mb-2">State/Province</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Enter state/province"
                  placeholderTextColor={colors.muted}
                  value={stateProvince}
                  onChangeText={setStateProvince}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground mb-2">Zip/Postal Code</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                  placeholder="Enter zip/postal"
                  placeholderTextColor={colors.muted}
                  value={postalCode}
                  onChangeText={setPostalCode}
                />
              </View>
            </View>

            {/* Date of Birth Input */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Date of Birth</Text>
              {Platform.OS === "web" ? (
                <DateTimePicker
                  value={dateOfBirth ? formatDateOnly(dateOfBirth) : ""}
                  mode="date"
                  onChange={val => {
                    if (val && typeof val === "string") {
                      const parsed = parseDateOnlyString(val);
                      if (parsed) setDateOfBirth(parsed);
                    }
                  }}
                  disabled={false}
                />
              ) : (
                <TouchableOpacity
                  className="bg-background border border-border rounded-xl px-4 py-3"
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text className={`text-base ${dateOfBirth ? "text-foreground" : "text-muted"}`}>
                    {dateOfBirth ? dateOfBirth.toLocaleDateString() : "Select date of birth"}
                  </Text>
                </TouchableOpacity>
              )}
              {dateOfBirth && (
                <Text className="text-xs text-muted mt-1">
                  Age: {Math.floor((Date.now() - dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))}
                </Text>
              )}
              {Platform.OS !== "web" && showDatePicker && (
                <DateTimePicker
                  value={dateOfBirth || new Date()}
                  mode="date"
                  onChange={(value) => {
                    setShowDatePicker(Platform.OS === "ios");
                    const selectedDate = value instanceof Date ? value : new Date(value);
                    if (!Number.isNaN(selectedDate.getTime())) {
                      setDateOfBirth(selectedDate);
                    }
                  }}
                />
              )}
            </View>
          </View>

          {/* Professional Information */}
          <View className="bg-surface border border-border rounded-2xl p-4 gap-3">
            <Text className="text-base font-semibold text-foreground">Professional Information</Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Title</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Enter title"
                placeholderTextColor={colors.muted}
                value={title}
                onChangeText={setTitle}
                autoCapitalize="words"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Occupation</Text>
              <TextInput
                className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                placeholder="Enter occupation"
                placeholderTextColor={colors.muted}
                value={occupation}
                onChangeText={setOccupation}
                autoCapitalize="words"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Time in Service</Text>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-xs text-muted mb-1">Years</Text>
                  <TextInput
                    className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                    placeholder="0"
                    placeholderTextColor={colors.muted}
                    value={timeInServiceYears}
                    onChangeText={setTimeInServiceYears}
                    keyboardType="number-pad"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-muted mb-1">Months</Text>
                  <TextInput
                    className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
                    placeholder="0-11"
                    placeholderTextColor={colors.muted}
                    value={timeInServiceMonths}
                    onChangeText={setTimeInServiceMonths}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Organizational Assignment Section */}
          <View className="bg-surface border border-border rounded-2xl p-4 gap-3">
            <Text className="text-base font-semibold text-foreground">Organizational Assignment</Text>
            
            {/* Company Selection */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Company *</Text>
              <TouchableOpacity
                onPress={() => setShowCompanyModal(true)}
                style={{ backgroundColor: colors.background, borderColor: colors.border }}
                className="border rounded-xl px-4 py-3"
              >
                <Text style={{ color: companyId ? colors.foreground : colors.muted }}>
                  {companyId ? mergedCompanies.find(c => c.id === companyId)?.name : "Select a company..."}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Department Selection */}
            {companyId && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-foreground mb-2">Department *</Text>
                <TouchableOpacity
                  onPress={() => setShowDepartmentModal(true)}
                  style={{ backgroundColor: colors.background, borderColor: colors.border }}
                  className="border rounded-xl px-4 py-3"
                >
                  <Text style={{ color: departmentId ? colors.foreground : colors.muted }}>
                    {departmentId ? departments?.find(d => d.id === departmentId)?.name : "Select a department..."}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Company Team Selection */}
            {departmentId && companyTeams && companyTeams.length > 0 && (
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Company Team</Text>
                <TouchableOpacity
                  onPress={() => setShowTeamModal(true)}
                  style={{ backgroundColor: colors.background, borderColor: colors.border }}
                  className="border rounded-xl px-4 py-3"
                >
                  <Text style={{ color: companyTeamId ? colors.foreground : colors.muted }}>
                    {companyTeamId ? companyTeams?.find(t => t.id === companyTeamId)?.name : "Select a team..."}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Referral Source Section */}
          <View className="bg-surface border border-border rounded-2xl p-4 gap-3">
            <Text className="text-base font-semibold text-foreground">Referral Source</Text>
            
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
                <TouchableOpacity
                  onPress={() => setShowClientReferralModal(true)}
                  style={{ borderColor: colors.border, backgroundColor: colors.background }}
                  className="border rounded-xl px-4 py-3 flex-row items-center justify-between"
                >
                  <Text style={{ color: referralSourceId ? colors.foreground : colors.muted }}>
                    {referralSourceId ? allClients.find(c => c.id === referralSourceId)?.name : "Select a client..."}
                  </Text>
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </TouchableOpacity>
              </View>
            )}

            {referralSourceType === "staff" && allStaff && (
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Select Staff</Text>
                <TouchableOpacity
                  onPress={() => setShowStaffReferralModal(true)}
                  style={{ borderColor: colors.border, backgroundColor: colors.background }}
                  className="border rounded-xl px-4 py-3 flex-row items-center justify-between"
                >
                  <Text style={{ color: referralSourceId ? colors.foreground : colors.muted }}>
                    {referralSourceId ? allStaff.find(s => s.id === referralSourceId)?.name : "Select a staff member..."}
                  </Text>
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </TouchableOpacity>
              </View>
            )}

            {referralSourceType === "fsm" && fsms && (
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Select FSM</Text>
                <TouchableOpacity
                  onPress={() => setShowFsmModal(true)}
                  style={{ borderColor: colors.border, backgroundColor: colors.background }}
                  className="border rounded-xl px-4 py-3 flex-row items-center justify-between"
                >
                  <Text style={{ color: referralSourceId ? colors.foreground : colors.muted }}>
                    {referralSourceId ? fsms.find(f => f.id === referralSourceId)?.name : "Select an FSM..."}
                  </Text>
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Preferences */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <Text className="text-base font-semibold text-foreground">Preferences</Text>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Notification Preference</Text>
              <View className={`bg-background border rounded-xl overflow-hidden ${phone.trim() ? "border-border" : "border-border opacity-50"}`}>
                <Picker
                  selectedValue={notificationPreference}
                  onValueChange={(value) => setNotificationPreference(value || null)}
                  style={{ color: colors.foreground }}
                  enabled={!!phone.trim()}
                >
                  <Picker.Item label="Select with mobile number" value={null} />
                  <Picker.Item label="SMS" value="sms" />
                  <Picker.Item label="WhatsApp" value="whatsapp" />
                </Picker>
              </View>
              {!phone.trim() && <Text className="text-xs text-muted mt-2">Enter a mobile phone number to enable notifications.</Text>}
            </View>

            <TouchableOpacity
              className="flex-row items-center gap-3"
              onPress={() => setNotificationOptOut(notificationOptOut === 1 ? 0 : 1)}
            >
              <View className={`w-6 h-6 rounded border-2 items-center justify-center ${notificationOptOut === 1 ? "bg-primary border-primary" : "border-border"}`}>
                {notificationOptOut === 1 && (
                  <IconSymbol name="checkmark" size={16} color={colors.background} />
                )}
              </View>
              <Text className="text-base text-foreground">Opt out of notifications</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center gap-3"
              onPress={() => setIsVip(!isVip)}
            >
              <View className={`w-6 h-6 rounded border-2 items-center justify-center ${isVip ? "bg-warning border-warning" : "border-border"}`}>
                {isVip && (
                  <IconSymbol name="star.fill" size={16} color={colors.background} />
                )}
              </View>
              <Text className="text-base text-foreground">VIP Client</Text>
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

      {/* Company Selection Modal */}
      <Modal
        visible={showCompanyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCompanyModal(false)}
      >
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <View 
            style={{ backgroundColor: colors.background, maxHeight: '82%' }} 
            className="w-[92%] rounded-2xl p-5"
          >
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity
                onPress={() => {
                  setShowCompanyModal(false);
                  setCompanySearchQuery("");
                }}
                className="absolute left-0"
              >
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Company</Text>
            </View>
            
            {!showCreateCompany ? (
              <>

            <TouchableOpacity
              onPress={() => {
                setShowCompanyModal(false);
                setCompanySearchQuery("");
              }}
              className="mt-4"
            >
              <Text className="text-primary font-semibold text-center">Done</Text>
            </TouchableOpacity>
                <TextInput
                  value={companySearchQuery}
                  onChangeText={setCompanySearchQuery}
                  placeholder="Search companies..."
                  placeholderTextColor={colors.muted}
                  style={{ backgroundColor: colors.surface, color: colors.foreground }}
                  className="px-4 py-3 rounded-lg mb-4"
                />
                
                <TouchableOpacity
                  onPress={() => setShowCreateCompany(true)}
                  style={{ backgroundColor: colors.primary }}
                  className="rounded-lg py-3 mb-4 flex-row items-center justify-center"
                >
                  <Text className="text-white font-semibold">+ Create New Company</Text>
                </TouchableOpacity>
                
                <FlatList
                  data={filteredCompanies}
                  keyExtractor={(item) => `company-modal-${item.id}`}
                  style={{ maxHeight: 400 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setCompanyId(item.id);
                        saveRecentCompany(item.id);
                        setShowCompanyModal(false);
                        setCompanySearchQuery("");
                      }}
                      style={{ 
                        backgroundColor: companyId === item.id ? colors.primary + '20' : 'transparent',
                        borderBottomColor: colors.border 
                      }}
                      className="py-3 px-2 border-b"
                    >
                      <View className="flex-row items-center">
                        <Text 
                          style={{ color: colors.foreground }} 
                          className="font-medium flex-1"
                        >
                          {item.name}
                        </Text>
                        {recentCompanyIds.includes(item.id) && (
                          <View style={{ backgroundColor: colors.primary + '30' }} className="px-2 py-1 rounded">
                            <Text style={{ color: colors.primary }} className="text-xs font-semibold">Recent</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <Text style={{ color: colors.muted }} className="text-center py-8">
                      No companies found
                    </Text>
                  }
                />
              </>
            ) : (
              <View className="mb-4">
                <Text className="text-sm font-medium text-foreground mb-2">Company Name *</Text>
                <TextInput
                  value={newCompanyName}
                  onChangeText={setNewCompanyName}
                  placeholder="Enter company name"
                  placeholderTextColor={colors.muted}
                  style={{ backgroundColor: colors.surface, color: colors.foreground }}
                  className="px-4 py-3 rounded-lg mb-3"
                />
                
                <Text className="text-sm font-medium text-foreground mb-2">Address</Text>
                <TextInput
                  value={newCompanyAddress}
                  onChangeText={setNewCompanyAddress}
                  placeholder="Enter address"
                  placeholderTextColor={colors.muted}
                  style={{ backgroundColor: colors.surface, color: colors.foreground }}
                  className="px-4 py-3 rounded-lg mb-3"
                />
                
                <Text className="text-sm font-medium text-foreground mb-2">Phone</Text>
                <TextInput
                  value={newCompanyPhone}
                  onChangeText={setNewCompanyPhone}
                  placeholder="Enter phone number"
                  placeholderTextColor={colors.muted}
                  style={{ backgroundColor: colors.surface, color: colors.foreground }}
                  className="px-4 py-3 rounded-lg mb-3"
                />
                
                <Text className="text-sm font-medium text-foreground mb-2">Email</Text>
                <TextInput
                  value={newCompanyEmail}
                  onChangeText={setNewCompanyEmail}
                  placeholder="Enter email"
                  placeholderTextColor={colors.muted}
                  style={{ backgroundColor: colors.surface, color: colors.foreground }}
                  className="px-4 py-3 rounded-lg mb-3"
                />
                
                <Text className="text-sm font-medium text-foreground mb-2">Contact Person</Text>
                <TextInput
                  value={newCompanyContact}
                  onChangeText={setNewCompanyContact}
                  placeholder="Enter contact person name"
                  placeholderTextColor={colors.muted}
                  style={{ backgroundColor: colors.surface, color: colors.foreground }}
                  className="px-4 py-3 rounded-lg mb-4"
                />
                
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => {
                      setShowCreateCompany(false);
                      setNewCompanyName("");
                      setNewCompanyAddress("");
                      setNewCompanyPhone("");
                      setNewCompanyEmail("");
                      setNewCompanyContact("");
                    }}
                    style={{ backgroundColor: colors.border }}
                    className="flex-1 rounded-lg py-3 items-center"
                  >
                    <Text style={{ color: colors.foreground }} className="font-semibold">Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => {
                      if (!newCompanyName.trim()) {
                        Alert.alert("Validation Error", "Please enter company name");
                        return;
                      }
                      const tempId = -Date.now();
                      setLocalCompanies((prev) => [
                        ...prev,
                        {
                          id: tempId,
                          name: newCompanyName.trim(),
                          address: newCompanyAddress.trim() || undefined,
                          phone: newCompanyPhone.trim() || undefined,
                          email: newCompanyEmail.trim() || undefined,
                          contactPerson: newCompanyContact.trim() || undefined,
                        },
                      ]);
                      setCompanyId(tempId);
                      setShowCreateCompany(false);
                      setShowCompanyModal(false);
                      setNewCompanyName("");
                      setNewCompanyAddress("");
                      setNewCompanyPhone("");
                      setNewCompanyEmail("");
                      setNewCompanyContact("");
                      Alert.alert("Saved Locally", "Company will be created when you save the client.");
                    }}
                    style={{ backgroundColor: colors.primary }}
                    className="flex-1 rounded-lg py-3 items-center"
                    disabled={false}
                  >
                    <Text className="text-white font-semibold">Save Locally</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Department Selection Modal */}
      <Modal
        visible={showDepartmentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDepartmentModal(false)}
      >
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <View style={{ backgroundColor: colors.background, maxHeight: '82%' }} className="w-[92%] rounded-2xl p-5">
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity
                onPress={() => {
                  setShowDepartmentModal(false);
                  setDepartmentSearchQuery("");
                }}
                className="absolute left-0"
              >
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Department</Text>
            </View>
            <TextInput
              value={departmentSearchQuery}
              onChangeText={setDepartmentSearchQuery}
              placeholder="Search departments..."
              placeholderTextColor={colors.muted}
              style={{ backgroundColor: colors.surface, color: colors.foreground }}
              className="px-4 py-3 rounded-lg mb-4"
            />
            {!showCreateDepartment && (
              <TouchableOpacity
                onPress={() => setShowCreateDepartment(true)}
                style={{ backgroundColor: colors.primary }}
                className="py-3 px-4 rounded-xl mb-4 flex-row items-center justify-center gap-2"
              >
                <Text className="text-background font-semibold">+ Create New Department</Text>
              </TouchableOpacity>
            )}
            {showCreateDepartment ? (
              <View className="gap-3 mb-4">
                <Text className="text-lg font-semibold text-foreground">Create New Department</Text>
                <TextInput
                  value={newDepartmentName}
                  onChangeText={setNewDepartmentName}
                  placeholder="Department Name *"
                  placeholderTextColor={colors.muted}
                  style={{ backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }}
                  className="px-4 py-3 rounded-xl border"
                />
                <TextInput
                  value={newDepartmentCode}
                  onChangeText={setNewDepartmentCode}
                  placeholder="Description"
                  placeholderTextColor={colors.muted}
                  style={{ backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }}
                  className="px-4 py-3 rounded-xl border"
                />
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => {
                      if (!newDepartmentName.trim()) {
                        Alert.alert("Validation Error", "Please enter department name");
                        return;
                      }
                      if (!companyId) {
                        Alert.alert("Validation Error", "Please select a company first");
                        return;
                      }
                      const tempId = -(Date.now() + 2);
                      setLocalDepartments((prev) => [
                        ...prev,
                        {
                          id: tempId,
                          companyId,
                          name: newDepartmentName.trim(),
                          description: newDepartmentCode.trim() || undefined,
                        },
                      ]);
                      setDepartmentId(tempId);
                      setShowCreateDepartment(false);
                      setShowDepartmentModal(false);
                      setNewDepartmentName("");
                      setNewDepartmentCode("");
                      Alert.alert("Saved Locally", "Department will be created when you save the client.");
                    }}
                    style={{ backgroundColor: colors.primary }}
                    className="flex-1 py-3 rounded-xl"
                  >
                    <Text className="text-background font-semibold text-center">Save Locally</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setShowCreateDepartment(false);
                      setNewDepartmentName("");
                      setNewDepartmentCode("");
                    }}
                    style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                    className="flex-1 py-3 rounded-xl border"
                  >
                    <Text style={{ color: colors.foreground }} className="font-semibold text-center">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
            <FlatList
              data={filteredDepartments}
              keyExtractor={(item) => `department-modal-${item.id}`}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setDepartmentId(item.id);
                    setShowDepartmentModal(false);
                    setDepartmentSearchQuery("");
                  }}
                  style={{ 
                    backgroundColor: departmentId === item.id ? colors.primary + '20' : 'transparent',
                    borderBottomColor: colors.border 
                  }}
                  className="py-3 px-2 border-b"
                >
                  <Text style={{ color: colors.foreground }} className="font-medium">{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ color: colors.muted }} className="text-center py-8">No departments found</Text>
              }
            />
            )}
            <TouchableOpacity
              onPress={() => {
                setShowDepartmentModal(false);
                setDepartmentSearchQuery("");
              }}
              className="mt-4"
            >
              <Text className="text-primary font-semibold text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Team Selection Modal */}
      <Modal
        visible={showTeamModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTeamModal(false)}
      >
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <View style={{ backgroundColor: colors.background, maxHeight: '82%' }} className="w-[92%] rounded-2xl p-5">
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity
                onPress={() => {
                  setShowTeamModal(false);
                  setTeamSearchQuery("");
                }}
                className="absolute left-0"
              >
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Team</Text>
            </View>
            <TextInput
              value={teamSearchQuery}
              onChangeText={setTeamSearchQuery}
              placeholder="Search teams..."
              placeholderTextColor={colors.muted}
              style={{ backgroundColor: colors.surface, color: colors.foreground }}
              className="px-4 py-3 rounded-lg mb-4"
            />
            <FlatList
              data={filteredTeams}
              keyExtractor={(item) => `team-modal-${item.id}`}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setCompanyTeamId(item.id);
                    setShowTeamModal(false);
                    setTeamSearchQuery("");
                  }}
                  style={{ 
                    backgroundColor: companyTeamId === item.id ? colors.primary + '20' : 'transparent',
                    borderBottomColor: colors.border 
                  }}
                  className="py-3 px-2 border-b"
                >
                  <Text style={{ color: colors.foreground }} className="font-medium">{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ color: colors.muted }} className="text-center py-8">No teams found</Text>
              }
            />
            <TouchableOpacity
              onPress={() => {
                setShowTeamModal(false);
                setTeamSearchQuery("");
              }}
              className="mt-4"
            >
              <Text className="text-primary font-semibold text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Client Referral Modal */}
      <Modal
        visible={showClientReferralModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClientReferralModal(false)}
      >
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <View style={{ backgroundColor: colors.background, maxHeight: '82%' }} className="w-[92%] rounded-2xl p-5">
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity
                onPress={() => {
                  setShowClientReferralModal(false);
                  setClientReferralSearchQuery("");
                }}
                className="absolute left-0"
              >
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Client Referral</Text>
            </View>
            <TextInput
              value={clientReferralSearchQuery}
              onChangeText={setClientReferralSearchQuery}
              placeholder="Search clients..."
              placeholderTextColor={colors.muted}
              style={{ borderColor: colors.border, color: colors.foreground, backgroundColor: colors.surface }}
              className="border rounded-xl px-4 py-3 mb-4"
            />
            <FlatList
              data={filteredClientReferrals}
              keyExtractor={(item) => `client-referral-${item.id}`}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setReferralSourceId(item.id);
                    setShowClientReferralModal(false);
                    setClientReferralSearchQuery("");
                  }}
                  style={{ 
                    backgroundColor: referralSourceId === item.id ? colors.primary + '20' : 'transparent',
                    borderBottomColor: colors.border 
                  }}
                  className="py-3 px-2 border-b"
                >
                  <Text style={{ color: colors.foreground }} className="font-medium">{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ color: colors.muted }} className="text-center py-8">No clients found</Text>
              }
            />
            <TouchableOpacity
              onPress={() => {
                setShowClientReferralModal(false);
                setClientReferralSearchQuery("");
              }}
              className="mt-4"
            >
              <Text className="text-primary font-semibold text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Staff Referral Modal */}
      <Modal
        visible={showStaffReferralModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStaffReferralModal(false)}
      >
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <View style={{ backgroundColor: colors.background, maxHeight: '82%' }} className="w-[92%] rounded-2xl p-5">
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity
                onPress={() => {
                  setShowStaffReferralModal(false);
                  setStaffReferralSearchQuery("");
                }}
                className="absolute left-0"
              >
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Staff Referral</Text>
            </View>
            <TextInput
              value={staffReferralSearchQuery}
              onChangeText={setStaffReferralSearchQuery}
              placeholder="Search staff..."
              placeholderTextColor={colors.muted}
              style={{ borderColor: colors.border, color: colors.foreground, backgroundColor: colors.surface }}
              className="border rounded-xl px-4 py-3 mb-4"
            />
            <FlatList
              data={filteredStaffReferrals}
              keyExtractor={(item) => `staff-referral-${item.id}`}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setReferralSourceId(item.id);
                    setShowStaffReferralModal(false);
                    setStaffReferralSearchQuery("");
                  }}
                  style={{ 
                    backgroundColor: referralSourceId === item.id ? colors.primary + '20' : 'transparent',
                    borderBottomColor: colors.border 
                  }}
                  className="py-3 px-2 border-b"
                >
                  <Text style={{ color: colors.foreground }} className="font-medium">{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ color: colors.muted }} className="text-center py-8">No staff found</Text>
              }
            />
            <TouchableOpacity
              onPress={() => {
                setShowStaffReferralModal(false);
                setStaffReferralSearchQuery("");
              }}
              className="mt-4"
            >
              <Text className="text-primary font-semibold text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* FSM Modal */}
      <Modal
        visible={showFsmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFsmModal(false)}
      >
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <View style={{ backgroundColor: colors.background, maxHeight: '82%' }} className="w-[92%] rounded-2xl p-5">
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity
                onPress={() => {
                  setShowFsmModal(false);
                  setFsmSearchQuery("");
                }}
                className="absolute left-0"
              >
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select FSM</Text>
            </View>
            <TextInput
              value={fsmSearchQuery}
              onChangeText={setFsmSearchQuery}
              placeholder="Search FSMs..."
              placeholderTextColor={colors.muted}
              style={{ borderColor: colors.border, color: colors.foreground, backgroundColor: colors.surface }}
              className="border rounded-xl px-4 py-3 mb-4"
            />
            <FlatList
              data={filteredFsms}
              keyExtractor={(item) => `fsm-${item.id}`}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setReferralSourceId(item.id);
                    setShowFsmModal(false);
                    setFsmSearchQuery("");
                  }}
                  style={{ 
                    backgroundColor: referralSourceId === item.id ? colors.primary + '20' : 'transparent',
                    borderBottomColor: colors.border 
                  }}
                  className="py-3 px-2 border-b"
                >
                  <Text style={{ color: colors.foreground }} className="font-medium">{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ color: colors.muted }} className="text-center py-8">No FSMs found</Text>
              }
            />
            <TouchableOpacity
              onPress={() => {
                setShowFsmModal(false);
                setFsmSearchQuery("");
              }}
              className="mt-4"
            >
              <Text className="text-primary font-semibold text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
