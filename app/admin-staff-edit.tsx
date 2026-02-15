import { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal, FlatList } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { OrganizationalBreadcrumbs } from "@/components/organizational-breadcrumbs";

export default function AdminStaffEditScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const staffId = id ? parseInt(id) : 0;

  const { data: staff, isLoading } = trpc.staff.get.useQuery({ id: staffId });
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "counselor" | "viewer">("counselor");
  const [isVipRated, setIsVipRated] = useState(false);
  
  // Staff organizational assignment (Organizations → Departments → Teams)
  const [groupId, setGroupId] = useState<number | null>(null);
  const [staffDepartmentId, setStaffDepartmentId] = useState<number | null>(null);
  const [teamId, setTeamId] = useState<number | null>(null);

  // Client organizational assignment (optional - for client-facing work)
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [divisionId, setDivisionId] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [companyTeamId, setCompanyTeamId] = useState<number | null>(null);

  // Modal states for all selectors
  const [showOrganizationModal, setShowOrganizationModal] = useState(false);
  const [showStaffDepartmentModal, setShowStaffDepartmentModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showDivisionModal, setShowDivisionModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showCompanyTeamModal, setShowCompanyTeamModal] = useState(false);

  // Search states for modals
  const [organizationSearch, setOrganizationSearch] = useState("");
  const [staffDepartmentSearch, setStaffDepartmentSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [divisionSearch, setDivisionSearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [companyTeamSearch, setCompanyTeamSearch] = useState("");

  // Fetch staff organizational data
  const { data: organizations } = trpc.groups.list.useQuery();
  // Fetch all staff departments (0 = all)
  const { data: allStaffDepartments } = trpc.staffDepartments.list.useQuery({ organizationId: 0 });
  // Fetch all teams (0 = all)
  const { data: allTeams } = trpc.teams.list.useQuery({ groupId: 0 });
  
  // Filter departments and teams based on selected organization
  const staffDepartments = groupId 
    ? allStaffDepartments?.filter((d: any) => d.organizationId === groupId)
    : allStaffDepartments;
  const teams = groupId
    ? allTeams?.filter((t: any) => t.groupId === groupId)
    : allTeams;

  // Fetch client organizational data
  const { data: companies } = trpc.companies.list.useQuery();
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

  // Filtered lists for modal selectors
  const filteredOrganizations = useMemo(() => {
    if (!organizations) return [];
    return organizations.filter((org: any) =>
      org.name.toLowerCase().includes(organizationSearch.toLowerCase())
    );
  }, [organizations, organizationSearch]);

  const filteredStaffDepartments = useMemo(() => {
    if (!staffDepartments) return [];
    return staffDepartments.filter((dept: any) =>
      dept.name.toLowerCase().includes(staffDepartmentSearch.toLowerCase())
    );
  }, [staffDepartments, staffDepartmentSearch]);

  const filteredTeams = useMemo(() => {
    if (!teams) return [];
    return teams.filter((team: any) =>
      team.name.toLowerCase().includes(teamSearch.toLowerCase())
    );
  }, [teams, teamSearch]);

  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    return companies.filter((company: any) =>
      company.name.toLowerCase().includes(companySearch.toLowerCase())
    );
  }, [companies, companySearch]);

  const filteredDivisions = useMemo(() => {
    if (!divisions) return [];
    return divisions.filter((division: any) =>
      division.name.toLowerCase().includes(divisionSearch.toLowerCase())
    );
  }, [divisions, divisionSearch]);

  const filteredDepartments = useMemo(() => {
    if (!departments) return [];
    return departments.filter((dept: any) =>
      dept.name.toLowerCase().includes(departmentSearch.toLowerCase())
    );
  }, [departments, departmentSearch]);

  const filteredCompanyTeams = useMemo(() => {
    if (!companyTeams) return [];
    return companyTeams.filter((team: any) =>
      team.name.toLowerCase().includes(companyTeamSearch.toLowerCase())
    );
  }, [companyTeams, companyTeamSearch]);

  useEffect(() => {
    if (staff) {
      setName(staff.name);
      setEmail(staff.email || "");
      setPhone((staff as any).phone || "");
      setRole((staff as any).role || "counselor");
      setIsVipRated(staff.isVipRated === 1);
      setGroupId((staff as any).groupId || staff.teamId ? teams?.find(t => t.id === staff.teamId)?.groupId || null : null);
      setStaffDepartmentId((staff as any).staffDepartmentId || null);
      setTeamId(staff.teamId || null);
      setCompanyId((staff as any).companyId || null);
      setDivisionId((staff as any).divisionId || null);
      setDepartmentId((staff as any).departmentId || null);
      setCompanyTeamId((staff as any).companyTeamId || null);
    }
  }, [staff]);

  const utils = trpc.useUtils();
  const updateStaff = trpc.staff.update.useMutation({
    onSuccess: () => {
      utils.staff.listAll.invalidate();
      utils.staff.get.invalidate({ id: staffId });
      Alert.alert("Success", "Staff member updated successfully");
      router.back();
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to update staff member");
    },
  });

  const deleteStaff = trpc.staff.delete.useMutation({
    onSuccess: () => {
      utils.staff.listAll.invalidate();
      Alert.alert("Success", "Staff member deleted successfully");
      router.back();
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to delete staff member");
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a name");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Please enter an email");
      return;
    }

    updateStaff.mutate({
      id: staffId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: role,
      isVipRated: isVipRated ? 1 : 0,
      isAdmin: role === "admin" ? 1 : 0, // For backward compatibility
      teamId: teamId || undefined,
      companyId: companyId || undefined,
      divisionId: divisionId || undefined,
      departmentId: departmentId || undefined,
      companyTeamId: companyTeamId || undefined,
      updatedBy: 1, // Admin user
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Staff Member",
      `Are you sure you want to delete ${staff?.name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteStaff.mutate({ id: staffId }),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <ScreenContainer className="p-4">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text className="mt-4 text-muted">Loading staff...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!staff) {
    return (
      <ScreenContainer className="p-4">
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground text-lg">Staff member not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-primary rounded-lg px-6 py-3"
          >
            <Text className="text-background font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-2 mb-4"
        >
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          <Text className="text-primary text-base font-semibold">Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Edit Staff</Text>
          <Text className="text-sm text-muted mt-1">Update staff member information</Text>
          
          {/* Organizational Breadcrumbs */}
          {teamId && teams && (() => {
            const team = teams.find((t: any) => t.id === teamId);
            if (team) {
              const breadcrumbs: string[] = [];
              const org = organizations?.find((o: any) => o.id === team.groupId);
              if (org) breadcrumbs.push(org.name);
              const dept = staffDepartments?.find((d: any) => d.id === team.staffDepartmentId);
              if (dept) breadcrumbs.push(dept.name);
              breadcrumbs.push(team.name);
              return <OrganizationalBreadcrumbs items={breadcrumbs} className="mt-3" />;
            }
            return null;
          })()}
        </View>

        {/* Form */}
        <View className="gap-4">
          {/* Name */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter full name"
              className="bg-surface border border-border rounded-lg p-3 text-foreground"
              placeholderTextColor="#9BA1A6"
            />
          </View>

          {/* Email */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Email *</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-surface border border-border rounded-lg p-3 text-foreground"
              placeholderTextColor="#9BA1A6"
            />
          </View>

          {/* Phone */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Phone</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              className="bg-surface border border-border rounded-lg p-3 text-foreground"
              placeholderTextColor="#9BA1A6"
            />
          </View>

          {/* Staff ID (read-only) */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Staff ID</Text>
            <View className="bg-surface border border-border rounded-lg p-3">
              <Text className="text-muted">{staff.id}</Text>
            </View>
          </View>

          {/* Password Reset */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Reset Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Leave blank to keep current password"
              secureTextEntry
              className="bg-surface border border-border rounded-lg p-3 text-foreground"
              placeholderTextColor="#9BA1A6"
            />
            <Text className="text-xs text-muted mt-1">Only enter a new password if you want to reset it</Text>
          </View>

          {/* VIP Toggle */}
          <TouchableOpacity
            onPress={() => setIsVipRated(!isVipRated)}
            className="bg-surface border border-border rounded-lg p-4"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">VIP Rated</Text>
                <Text className="text-sm text-muted mt-1">
                  Can create cases for VIP clients
                </Text>
              </View>
              <View
                className={`w-12 h-7 rounded-full p-1 ${
                  isVipRated ? "bg-warning" : "bg-border"
                }`}
              >
                <View
                  className={`w-5 h-5 rounded-full bg-background ${
                    isVipRated ? "ml-auto" : ""
                  }`}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Role Selection */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Role *</Text>
            <View className="gap-2">
              <TouchableOpacity
                onPress={() => setRole("admin")}
                className={`border rounded-lg p-4 ${
                  role === "admin" ? "border-error bg-error/10" : "border-border bg-surface"
                }`}
              >
                <Text className={`text-base font-semibold ${
                  role === "admin" ? "text-error" : "text-foreground"
                }`}>Admin</Text>
                <Text className="text-sm text-muted mt-1">
                  Full access to all admin functions and settings
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setRole("counselor")}
                className={`border rounded-lg p-4 ${
                  role === "counselor" ? "border-primary bg-primary/10" : "border-border bg-surface"
                }`}
              >
                <Text className={`text-base font-semibold ${
                  role === "counselor" ? "text-primary" : "text-foreground"
                }`}>Counselor</Text>
                <Text className="text-sm text-muted mt-1">
                  Can record sessions and manage own clients
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setRole("viewer")}
                className={`border rounded-lg p-4 ${
                  role === "viewer" ? "border-success bg-success/10" : "border-border bg-surface"
                }`}
              >
                <Text className={`text-base font-semibold ${
                  role === "viewer" ? "text-success" : "text-foreground"
                }`}>View Only</Text>
                <Text className="text-sm text-muted mt-1">
                  Read-only access to reports and analytics
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Staff Organizational Assignment */}
          <View className="mt-6">
            <Text className="text-lg font-bold text-foreground mb-2">Staff Organization Assignment</Text>
            <Text className="text-sm text-muted mb-4">
              Assign staff to an organization, department, and team
            </Text>

            {/* Organization Selector */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Organization</Text>
              <TouchableOpacity
                onPress={() => setShowOrganizationModal(true)}
                className="bg-surface border border-border rounded-lg p-4 flex-row justify-between items-center"
              >
                <Text className="text-base" style={{ color: colors.foreground }}>
                  {groupId ? organizations?.find((o: any) => o.id === groupId)?.name : "None"}
                </Text>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {/* Staff Department Selector */}
            {groupId && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">Department</Text>
                <TouchableOpacity
                  onPress={() => setShowStaffDepartmentModal(true)}
                  className="bg-surface border border-border rounded-lg p-4 flex-row justify-between items-center"
                >
                  <Text className="text-base" style={{ color: colors.foreground }}>
                    {staffDepartmentId ? staffDepartments?.find((d: any) => d.id === staffDepartmentId)?.name : "Select Department"}
                  </Text>
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </TouchableOpacity>
              </View>
            )}

            {/* Team Selector */}
            {groupId && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">Team</Text>
                <TouchableOpacity
                  onPress={() => setShowTeamModal(true)}
                  className="bg-surface border border-border rounded-lg p-4 flex-row justify-between items-center"
                >
                  <Text className="text-base" style={{ color: colors.foreground }}>
                    {teamId ? teams?.find((t: any) => t.id === teamId)?.name : "Select Team"}
                  </Text>
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Client Organization Assignment (Optional) */}
          <View className="mt-6">
            <Text className="text-lg font-bold text-foreground mb-2">Client Organization Assignment (Optional)</Text>
            <Text className="text-sm text-muted mb-4">
              Optionally assign staff to a client company for client-facing work
            </Text>

            {/* Company Selector */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Company</Text>
              <TouchableOpacity
                onPress={() => setShowCompanyModal(true)}
                className="bg-surface border border-border rounded-lg p-4 flex-row justify-between items-center"
              >
                <Text className="text-base" style={{ color: colors.foreground }}>
                  {companyId ? companies?.find((c: any) => c.id === companyId)?.name : "None"}
                </Text>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {/* Division Selector */}
            {companyId && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">Division</Text>
                <TouchableOpacity
                  onPress={() => setShowDivisionModal(true)}
                  className="bg-surface border border-border rounded-lg p-4 flex-row justify-between items-center"
                >
                  <Text className="text-base" style={{ color: colors.foreground }}>
                    {divisionId ? divisions?.find((d: any) => d.id === divisionId)?.name : "Select Division"}
                  </Text>
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </TouchableOpacity>
              </View>
            )}

            {/* Department Selector */}
            {divisionId && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">Department</Text>
                <TouchableOpacity
                  onPress={() => setShowDepartmentModal(true)}
                  className="bg-surface border border-border rounded-lg p-4 flex-row justify-between items-center"
                >
                  <Text className="text-base" style={{ color: colors.foreground }}>
                    {departmentId ? departments?.find((d: any) => d.id === departmentId)?.name : "Select Department"}
                  </Text>
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </TouchableOpacity>
              </View>
            )}

            {/* Company Team Selector */}
            {departmentId && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">Team</Text>
                <TouchableOpacity
                  onPress={() => setShowCompanyTeamModal(true)}
                  className="bg-surface border border-border rounded-lg p-4 flex-row justify-between items-center"
                >
                  <Text className="text-base" style={{ color: colors.foreground }}>
                    {companyTeamId ? companyTeams?.find((t: any) => t.id === companyTeamId)?.name : "Select Team"}
                  </Text>
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-3 mt-8 mb-8">
          <TouchableOpacity
            onPress={handleSave}
            disabled={updateStaff.isPending}
            className={`rounded-lg p-4 ${
              updateStaff.isPending ? "bg-muted" : "bg-success"
            }`}
          >
            {updateStaff.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-background font-semibold text-center text-lg">
                Save Changes
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            disabled={updateStaff.isPending || deleteStaff.isPending}
            className="bg-surface border border-border rounded-lg p-4"
          >
            <Text className="text-foreground font-semibold text-center text-lg">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            disabled={updateStaff.isPending || deleteStaff.isPending}
            className={`rounded-lg p-4 ${
              deleteStaff.isPending ? "bg-muted" : "bg-error"
            }`}
          >
            {deleteStaff.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-background font-semibold text-center text-lg">
                Delete Staff Member
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Organization Selection Modal */}
      <Modal visible={showOrganizationModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl" style={{ maxHeight: '80%' }}>
            <View className="p-6 border-b border-border flex-row justify-between items-center">
              <Text className="text-xl font-bold text-foreground">Select Organization</Text>
              <TouchableOpacity onPress={() => { setShowOrganizationModal(false); setOrganizationSearch(""); }}>
                <Text className="text-primary font-semibold text-lg">Done</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Search organizations..."
              value={organizationSearch}
              onChangeText={setOrganizationSearch}
              className="mx-6 mt-4 p-4 bg-surface border border-border rounded-lg text-foreground"
              placeholderTextColor={colors.muted}
            />
            <FlatList
              data={filteredOrganizations}
              keyExtractor={(item: any) => item.id.toString()}
              renderItem={({ item }: any) => (
                <TouchableOpacity
                  onPress={() => {
                    setGroupId(item.id);
                    setStaffDepartmentId(null);
                    setTeamId(null);
                    setShowOrganizationModal(false);
                    setOrganizationSearch("");
                  }}
                  className="p-4 border-b border-border mx-6"
                >
                  <Text className="text-base font-semibold text-foreground">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Staff Department Selection Modal */}
      <Modal visible={showStaffDepartmentModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl" style={{ maxHeight: '80%' }}>
            <View className="p-6 border-b border-border flex-row justify-between items-center">
              <Text className="text-xl font-bold text-foreground">Select Department</Text>
              <TouchableOpacity onPress={() => { setShowStaffDepartmentModal(false); setStaffDepartmentSearch(""); }}>
                <Text className="text-primary font-semibold text-lg">Done</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Search departments..."
              value={staffDepartmentSearch}
              onChangeText={setStaffDepartmentSearch}
              className="mx-6 mt-4 p-4 bg-surface border border-border rounded-lg text-foreground"
              placeholderTextColor={colors.muted}
            />
            <FlatList
              data={filteredStaffDepartments}
              keyExtractor={(item: any) => item.id.toString()}
              renderItem={({ item }: any) => (
                <TouchableOpacity
                  onPress={() => {
                    setStaffDepartmentId(item.id);
                    setTeamId(null);
                    setShowStaffDepartmentModal(false);
                    setStaffDepartmentSearch("");
                  }}
                  className="p-4 border-b border-border mx-6"
                >
                  <Text className="text-base font-semibold text-foreground">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Team Selection Modal */}
      <Modal visible={showTeamModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl" style={{ maxHeight: '80%' }}>
            <View className="p-6 border-b border-border flex-row justify-between items-center">
              <Text className="text-xl font-bold text-foreground">Select Team</Text>
              <TouchableOpacity onPress={() => { setShowTeamModal(false); setTeamSearch(""); }}>
                <Text className="text-primary font-semibold text-lg">Done</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Search teams..."
              value={teamSearch}
              onChangeText={setTeamSearch}
              className="mx-6 mt-4 p-4 bg-surface border border-border rounded-lg text-foreground"
              placeholderTextColor={colors.muted}
            />
            <FlatList
              data={filteredTeams}
              keyExtractor={(item: any) => item.id.toString()}
              renderItem={({ item }: any) => (
                <TouchableOpacity
                  onPress={() => {
                    setTeamId(item.id);
                    setShowTeamModal(false);
                    setTeamSearch("");
                  }}
                  className="p-4 border-b border-border mx-6"
                >
                  <Text className="text-base font-semibold text-foreground">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Company Selection Modal */}
      <Modal visible={showCompanyModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl" style={{ maxHeight: '80%' }}>
            <View className="p-6 border-b border-border flex-row justify-between items-center">
              <Text className="text-xl font-bold text-foreground">Select Company</Text>
              <TouchableOpacity onPress={() => { setShowCompanyModal(false); setCompanySearch(""); }}>
                <Text className="text-primary font-semibold text-lg">Done</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Search companies..."
              value={companySearch}
              onChangeText={setCompanySearch}
              className="mx-6 mt-4 p-4 bg-surface border border-border rounded-lg text-foreground"
              placeholderTextColor={colors.muted}
            />
            <FlatList
              data={filteredCompanies}
              keyExtractor={(item: any) => item.id.toString()}
              renderItem={({ item }: any) => (
                <TouchableOpacity
                  onPress={() => {
                    setCompanyId(item.id);
                    setDivisionId(null);
                    setDepartmentId(null);
                    setCompanyTeamId(null);
                    setShowCompanyModal(false);
                    setCompanySearch("");
                  }}
                  className="p-4 border-b border-border mx-6"
                >
                  <Text className="text-base font-semibold text-foreground">{item.name}</Text>
                  {item.contactPerson && (
                    <Text className="text-sm text-muted mt-1">{item.contactPerson}</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Division Selection Modal */}
      <Modal visible={showDivisionModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl" style={{ maxHeight: '80%' }}>
            <View className="p-6 border-b border-border flex-row justify-between items-center">
              <Text className="text-xl font-bold text-foreground">Select Division</Text>
              <TouchableOpacity onPress={() => { setShowDivisionModal(false); setDivisionSearch(""); }}>
                <Text className="text-primary font-semibold text-lg">Done</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Search divisions..."
              value={divisionSearch}
              onChangeText={setDivisionSearch}
              className="mx-6 mt-4 p-4 bg-surface border border-border rounded-lg text-foreground"
              placeholderTextColor={colors.muted}
            />
            <FlatList
              data={filteredDivisions}
              keyExtractor={(item: any) => item.id.toString()}
              renderItem={({ item }: any) => (
                <TouchableOpacity
                  onPress={() => {
                    setDivisionId(item.id);
                    setDepartmentId(null);
                    setCompanyTeamId(null);
                    setShowDivisionModal(false);
                    setDivisionSearch("");
                  }}
                  className="p-4 border-b border-border mx-6"
                >
                  <Text className="text-base font-semibold text-foreground">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Department Selection Modal */}
      <Modal visible={showDepartmentModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl" style={{ maxHeight: '80%' }}>
            <View className="p-6 border-b border-border flex-row justify-between items-center">
              <Text className="text-xl font-bold text-foreground">Select Department</Text>
              <TouchableOpacity onPress={() => { setShowDepartmentModal(false); setDepartmentSearch(""); }}>
                <Text className="text-primary font-semibold text-lg">Done</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Search departments..."
              value={departmentSearch}
              onChangeText={setDepartmentSearch}
              className="mx-6 mt-4 p-4 bg-surface border border-border rounded-lg text-foreground"
              placeholderTextColor={colors.muted}
            />
            <FlatList
              data={filteredDepartments}
              keyExtractor={(item: any) => item.id.toString()}
              renderItem={({ item }: any) => (
                <TouchableOpacity
                  onPress={() => {
                    setDepartmentId(item.id);
                    setCompanyTeamId(null);
                    setShowDepartmentModal(false);
                    setDepartmentSearch("");
                  }}
                  className="p-4 border-b border-border mx-6"
                >
                  <Text className="text-base font-semibold text-foreground">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Company Team Selection Modal */}
      <Modal visible={showCompanyTeamModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl" style={{ maxHeight: '80%' }}>
            <View className="p-6 border-b border-border flex-row justify-between items-center">
              <Text className="text-xl font-bold text-foreground">Select Team</Text>
              <TouchableOpacity onPress={() => { setShowCompanyTeamModal(false); setCompanyTeamSearch(""); }}>
                <Text className="text-primary font-semibold text-lg">Done</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Search teams..."
              value={companyTeamSearch}
              onChangeText={setCompanyTeamSearch}
              className="mx-6 mt-4 p-4 bg-surface border border-border rounded-lg text-foreground"
              placeholderTextColor={colors.muted}
            />
            <FlatList
              data={filteredCompanyTeams}
              keyExtractor={(item: any) => item.id.toString()}
              renderItem={({ item }: any) => (
                <TouchableOpacity
                  onPress={() => {
                    setCompanyTeamId(item.id);
                    setShowCompanyTeamModal(false);
                    setCompanyTeamSearch("");
                  }}
                  className="p-4 border-b border-border mx-6"
                >
                  <Text className="text-base font-semibold text-foreground">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
