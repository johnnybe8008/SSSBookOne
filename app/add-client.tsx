import { useState, useEffect, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, Modal, FlatList } from "react-native";
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
  const [showDivisionModal, setShowDivisionModal] = useState(false);
  const [divisionSearchQuery, setDivisionSearchQuery] = useState("");
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [departmentSearchQuery, setDepartmentSearchQuery] = useState("");
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  
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
  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    
    let filtered = companies;
    if (companySearchQuery.trim()) {
      const query = companySearchQuery.toLowerCase();
      filtered = companies.filter(c => 
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
  }, [companies, companySearchQuery, recentCompanyIds]);
  
  const { data: divisions } = trpc.divisions.list.useQuery(
    { companyId: companyId || 0 },
    { enabled: !!companyId }
  );
  
  // Filtered divisions for search
  const filteredDivisions = useMemo(() => {
    if (!divisions) return [];
    if (!divisionSearchQuery.trim()) return divisions;
    const query = divisionSearchQuery.toLowerCase();
    return divisions.filter(d => 
      d.name.toLowerCase().includes(query) ||
      d.description?.toLowerCase().includes(query)
    );
  }, [divisions, divisionSearchQuery]);
  
  const { data: departments } = trpc.departments.list.useQuery(
    { divisionId: divisionId || 0 },
    { enabled: !!divisionId }
  );
  
  // Filtered departments for search
  const filteredDepartments = useMemo(() => {
    if (!departments) return [];
    if (!departmentSearchQuery.trim()) return departments;
    const query = departmentSearchQuery.toLowerCase();
    return departments.filter(d => 
      d.name.toLowerCase().includes(query) ||
      d.description?.toLowerCase().includes(query)
    );
  }, [departments, departmentSearchQuery]);
  
  const { data: companyTeams } = trpc.companyTeams.list.useQuery(
    { departmentId: departmentId || 0 },
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

  // Create company mutation
  const createCompany = trpc.companies.create.useMutation({
    onSuccess: (newCompanyId) => {
      utils.companies.invalidate();
      setCompanyId(newCompanyId);
      setShowCreateCompany(false);
      setShowCompanyModal(false);
      // Clear form
      setNewCompanyName("");
      setNewCompanyAddress("");
      setNewCompanyPhone("");
      setNewCompanyEmail("");
      setNewCompanyContact("");
      Alert.alert("Success", "Company created successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create company");
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
              <TouchableOpacity
                onPress={() => setShowCompanyModal(true)}
                style={{ backgroundColor: colors.background, borderColor: colors.border }}
                className="border rounded-xl px-4 py-3"
              >
                <Text style={{ color: companyId ? colors.foreground : colors.muted }}>
                  {companyId ? companies?.find(c => c.id === companyId)?.name : "Select a company..."}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Division Selection */}
            {companyId && divisions && divisions.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-foreground mb-2">Division</Text>
                <TouchableOpacity
                  onPress={() => setShowDivisionModal(true)}
                  style={{ backgroundColor: colors.background, borderColor: colors.border }}
                  className="border rounded-xl px-4 py-3"
                >
                  <Text style={{ color: divisionId ? colors.foreground : colors.muted }}>
                    {divisionId ? divisions?.find(d => d.id === divisionId)?.name : "Select a division..."}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Department Selection */}
            {divisionId && departments && departments.length > 0 && (
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

      {/* Company Selection Modal */}
      <Modal
        visible={showCompanyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCompanyModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View 
            style={{ backgroundColor: colors.background }} 
            className="rounded-t-3xl p-6"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-foreground">Select Company</Text>
              <TouchableOpacity onPress={() => {
                setShowCompanyModal(false);
                setCompanySearchQuery("");
              }}>
                <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            
            {!showCreateCompany ? (
              <>
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
                      {item.contactPerson && (
                        <Text style={{ color: colors.muted }} className="text-sm mt-1">
                          {item.contactPerson}
                        </Text>
                      )}
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
                      createCompany.mutate({
                        name: newCompanyName,
                        address: newCompanyAddress || undefined,
                        phone: newCompanyPhone || undefined,
                        email: newCompanyEmail || undefined,
                        contactPerson: newCompanyContact || undefined,
                        createdBy: user?.id || 0,
                        updatedBy: user?.id || 0,
                      });
                    }}
                    style={{ backgroundColor: colors.primary }}
                    className="flex-1 rounded-lg py-3 items-center"
                    disabled={createCompany.isPending}
                  >
                    {createCompany.isPending ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text className="text-white font-semibold">Create</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Division Selection Modal */}
      <Modal
        visible={showDivisionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDivisionModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: colors.background }} className="rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-foreground">Select Division</Text>
              <TouchableOpacity onPress={() => {
                setShowDivisionModal(false);
                setDivisionSearchQuery("");
              }}>
                <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <TextInput
              value={divisionSearchQuery}
              onChangeText={setDivisionSearchQuery}
              placeholder="Search divisions..."
              placeholderTextColor={colors.muted}
              style={{ backgroundColor: colors.surface, color: colors.foreground }}
              className="px-4 py-3 rounded-lg mb-4"
            />
            <FlatList
              data={filteredDivisions}
              keyExtractor={(item) => `division-modal-${item.id}`}
              style={{ maxHeight: 400 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setDivisionId(item.id);
                    setShowDivisionModal(false);
                    setDivisionSearchQuery("");
                  }}
                  style={{ 
                    backgroundColor: divisionId === item.id ? colors.primary + '20' : 'transparent',
                    borderBottomColor: colors.border 
                  }}
                  className="py-3 px-2 border-b"
                >
                  <Text style={{ color: colors.foreground }} className="font-medium">{item.name}</Text>
                  {item.description && (
                    <Text style={{ color: colors.muted }} className="text-sm mt-1">{item.description}</Text>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ color: colors.muted }} className="text-center py-8">No divisions found</Text>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Department Selection Modal */}
      <Modal
        visible={showDepartmentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDepartmentModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: colors.background }} className="rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-foreground">Select Department</Text>
              <TouchableOpacity onPress={() => {
                setShowDepartmentModal(false);
                setDepartmentSearchQuery("");
              }}>
                <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <TextInput
              value={departmentSearchQuery}
              onChangeText={setDepartmentSearchQuery}
              placeholder="Search departments..."
              placeholderTextColor={colors.muted}
              style={{ backgroundColor: colors.surface, color: colors.foreground }}
              className="px-4 py-3 rounded-lg mb-4"
            />
            <FlatList
              data={filteredDepartments}
              keyExtractor={(item) => `department-modal-${item.id}`}
              style={{ maxHeight: 400 }}
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
                  {item.description && (
                    <Text style={{ color: colors.muted }} className="text-sm mt-1">{item.description}</Text>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ color: colors.muted }} className="text-center py-8">No departments found</Text>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Team Selection Modal */}
      <Modal
        visible={showTeamModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTeamModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: colors.background }} className="rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-foreground">Select Team</Text>
              <TouchableOpacity onPress={() => {
                setShowTeamModal(false);
                setTeamSearchQuery("");
              }}>
                <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
              </TouchableOpacity>
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
              style={{ maxHeight: 400 }}
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
                  {item.description && (
                    <Text style={{ color: colors.muted }} className="text-sm mt-1">{item.description}</Text>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ color: colors.muted }} className="text-center py-8">No teams found</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
