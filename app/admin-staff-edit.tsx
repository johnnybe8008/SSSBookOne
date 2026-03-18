// @ts-nocheck
import { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal, FlatList } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { OrganizationalBreadcrumbs } from "@/components/organizational-breadcrumbs";

export default function AdminStaffEditScreen() {
    // Modal and input state for department/team creation
    const [showDeptAddModal, setShowDeptAddModal] = useState(false);
    const [showTeamAddModal, setShowTeamAddModal] = useState(false);
    const [newDeptName, setNewDeptName] = useState("");
    const [newTeamName, setNewTeamName] = useState("");
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

  // Modal states for staff organizational selectors
  const [showOrganizationModal, setShowOrganizationModal] = useState(false);
  const [showStaffDepartmentModal, setShowStaffDepartmentModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  // Search states for modals
  const [organizationSearch, setOrganizationSearch] = useState("");
  const [staffDepartmentSearch, setStaffDepartmentSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");

  // Fetch staff organizational data
  const { data: organizations } = trpc.organizations.list.useQuery();
  // Fetch all staff departments (0 = all)
  const { data: allStaffDepartments } = trpc.staffDepartments.list.useQuery({ organizationId: 0 });
  // Fetch all teams (0 = all)
  const { data: allTeams } = trpc.teams.list.useQuery({ groupId: 0 });
  
  // Filter departments based on selected organization
  const staffDepartments = groupId 
    ? allStaffDepartments?.filter((d: any) => d.organizationId === groupId)
    : [];
  
  // Filter teams based on selected department OR organization (for legacy data)
  // New structure: Org → Dept → Team (filter by staffDepartmentId)
  // Legacy structure: Org → Team (filter by groupId when no dept selected)
  const teams = staffDepartmentId
    ? allTeams?.filter((t: any) => t.staffDepartmentId === staffDepartmentId)
    : groupId
    ? allTeams?.filter((t: any) => t.organizationId === groupId && !t.staffDepartmentId)
    : [];

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

  useEffect(() => {
    if (staff) {
      setName(staff.name);
      setEmail(staff.email || "");
      setPhone((staff as any).phone || "");
      setRole((staff as any).role || "counselor");
      setIsVipRated(staff.isVipRated === 1);
      setStaffDepartmentId((staff as any).staffDepartmentId || null);
      setTeamId(staff.teamId || null);
      // Set groupId (organizationId) from staff data or look it up from team
      if ((staff as any).organizationId) {
        setGroupId((staff as any).organizationId);
      } else if (staff.teamId && allTeams) {
        const team = allTeams.find((t: any) => t.id === staff.teamId);
        setGroupId(team?.organizationId || null);
      } else {
        setGroupId(null);
      }
    }
  }, [staff, allTeams]);

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

  const createDepartment = trpc.staffDepartments.create.useMutation({
    onSuccess: () => {
      utils.staffDepartments.invalidate();
      setShowDeptAddModal(false);
      setNewDeptName("");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to create department");
    },
  });

  const createTeam = trpc.teams.create.useMutation({
    onSuccess: () => {
      utils.teams.invalidate();
      setShowTeamAddModal(false);
      setNewTeamName("");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to create team");
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
      password: password.trim() || undefined, // Only send if not empty
      role: role,
      isVipRated: isVipRated ? 1 : 0,
      isAdmin: role === "admin" ? 1 : 0, // For backward compatibility
      groupId: groupId || undefined,
      staffDepartmentId: staffDepartmentId || undefined,
      teamId: teamId || undefined,
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

  // ...existing code...

  const handleAddDepartment = () => {
    if (!newDeptName.trim() || !groupId) return;
    createDepartment.mutate({
      organizationId: groupId,
      name: newDeptName.trim(),
      createdBy: 1,
      updatedBy: 1,
    });
  };

  const handleAddTeam = () => {
    if (!newTeamName.trim() || !staffDepartmentId || !groupId) return;
    createTeam.mutate({
      organizationId: groupId, // <-- ensure this is set
      staffDepartmentId: staffDepartmentId,
      name: newTeamName.trim(),
      createdBy: 1,
      updatedBy: 1,
    });
  };

  // ...existing code...

  return (
    <ScreenContainer className="p-4">
      <ScrollView>
        {/* Header (chevron, single line title) */}
        <View className="mb-2 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2">
            <Text className="text-3xl font-bold text-foreground">&lt;</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text className="text-xl font-bold text-foreground text-center">Update Staff Member</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>
        {/* Org-Dept-Team breadcrumbs under header */}
        {staff && organizations && allStaffDepartments && allTeams && (
          <OrganizationalBreadcrumbs items={getStaffBreadcrumbs(staff, organizations, allStaffDepartments, allTeams)} className="mb-4" />
        )}

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
                  Can create folders for VIP clients
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
              <View className="mb-4 flex-row items-center">
                <View style={{ flex: 1 }}>
                  <Text className="text-sm font-semibold text-foreground mb-2">Department</Text>
                  <TouchableOpacity
                    onPress={() => setShowStaffDepartmentModal(true)}
                    className="bg-surface border border-border rounded-lg p-4 flex-row justify-between items-center"
                  >
                    <Text className="text-base" style={{ color: colors.foreground }}>
                      {staffDepartmentId ? staffDepartments?.find((d: any) => d.id === staffDepartmentId)?.name : (staffDepartments?.length === 0 ? "No departments found" : "Select Department")}
                    </Text>
                    <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                  </TouchableOpacity>
                  {staffDepartments?.length === 0 && (
                    <Text className="text-xs text-muted mt-2">No departments found for this organization.</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => setShowDeptAddModal(true)}
                  className="ml-2 bg-primary rounded-full w-10 h-10 items-center justify-center"
                >
                  <Text className="text-background text-xl font-bold">+</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Team Selector */}
            {groupId && (
              <View className="mb-4 flex-row items-center">
                <View style={{ flex: 1 }}>
                  <Text className="text-sm font-semibold text-foreground mb-2">Team</Text>
                  <TouchableOpacity
                    onPress={() => setShowTeamModal(true)}
                    className="bg-surface border border-border rounded-lg p-4 flex-row justify-between items-center"
                  >
                    <Text className="text-base" style={{ color: colors.foreground }}>
                      {teamId ? teams?.find((t: any) => t.id === teamId)?.name : (teams?.filter((t: any) => t.staffDepartmentId === staffDepartmentId).length === 0 ? "No teams found" : "Select Team")}
                    </Text>
                    <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                  </TouchableOpacity>
                  {teams?.filter((t: any) => t.staffDepartmentId === staffDepartmentId).length === 0 && (
                    <Text className="text-xs text-muted mt-2">No teams found for this department.</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => setShowTeamAddModal(true)}
                  className="ml-2 bg-primary rounded-full w-10 h-10 items-center justify-center"
                >
                  <Text className="text-background text-xl font-bold">+</Text>
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
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <View className="bg-background rounded-2xl p-5 w-[92%]" style={{ maxHeight: '82%' }}>
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity
                onPress={() => { setShowOrganizationModal(false); setOrganizationSearch(""); }}
                className="absolute left-0"
              >
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Organization</Text>
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
              style={{ maxHeight: 420 }}
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
            <TouchableOpacity onPress={() => { setShowOrganizationModal(false); setOrganizationSearch(""); }} className="mt-4">
              <Text className="text-primary font-semibold text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Staff Department Selection Modal */}
      <Modal visible={showStaffDepartmentModal} animationType="slide" transparent>
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <View className="bg-background rounded-2xl p-5 w-[92%]" style={{ maxHeight: '82%' }}>
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity
                onPress={() => { setShowStaffDepartmentModal(false); setStaffDepartmentSearch(""); }}
                className="absolute left-0"
              >
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Department</Text>
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
              style={{ maxHeight: 420 }}
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
            <TouchableOpacity onPress={() => { setShowStaffDepartmentModal(false); setStaffDepartmentSearch(""); }} className="mt-4">
              <Text className="text-primary font-semibold text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Team Selection Modal */}
      <Modal visible={showTeamModal} animationType="slide" transparent>
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <View className="bg-background rounded-2xl p-5 w-[92%]" style={{ maxHeight: '82%' }}>
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity
                onPress={() => { setShowTeamModal(false); setTeamSearch(""); }}
                className="absolute left-0"
              >
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Team</Text>
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
              style={{ maxHeight: 420 }}
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
            <TouchableOpacity onPress={() => { setShowTeamModal(false); setTeamSearch(""); }} className="mt-4">
              <Text className="text-primary font-semibold text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Department Add Modal */}
      <Modal visible={showDeptAddModal} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/30">
          <View className="bg-surface p-6 rounded-xl w-80">
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity
                onPress={() => setShowDeptAddModal(false)}
                className="absolute left-0"
              >
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-center">Add Department</Text>
            </View>
            <TextInput
              value={newDeptName}
              onChangeText={setNewDeptName}
              placeholder="Department Name"
              className="bg-background border border-border rounded-lg p-3 mb-4"
            />
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setShowDeptAddModal(false)}
                className="flex-1 bg-muted rounded-lg p-3 items-center"
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (!newDeptName.trim() || !groupId) return;
                  createDepartment.mutate({
                    organizationId: groupId,
                    name: newDeptName.trim(),
                    createdBy: 1,
                    updatedBy: 1,
                  });
                }}
                className="flex-1 bg-success rounded-lg p-3 items-center"
              >
                <Text className="text-background font-semibold">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Team Add Modal */}
      <Modal visible={showTeamAddModal} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/30">
          <View className="bg-surface p-6 rounded-xl w-80">
            <View className="relative min-h-[44px] items-center justify-center mb-4">
              <TouchableOpacity
                onPress={() => setShowTeamAddModal(false)}
                className="absolute left-0"
              >
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-center">Add Team</Text>
            </View>
            <TextInput
              value={newTeamName}
              onChangeText={setNewTeamName}
              placeholder="Team Name"
              className="bg-background border border-border rounded-lg p-3 mb-4"
            />
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setShowTeamAddModal(false)}
                className="flex-1 bg-muted rounded-lg p-3 items-center"
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (!newTeamName.trim() || !staffDepartmentId || !groupId) return;
                  createTeam.mutate({
                    organizationId: groupId,
                    staffDepartmentId: staffDepartmentId,
                    name: newTeamName.trim(),
                    createdBy: 1,
                    updatedBy: 1,
                  });
                }}
                className="flex-1 bg-success rounded-lg p-3 items-center"
              >
                <Text className="text-background font-semibold">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


    </ScreenContainer>
  );
}

// Add getStaffBreadcrumbs helper from admin-staff.tsx
function getStaffBreadcrumbs(staff: any, organizations: any, allStaffDepartments: any, allTeams: any) {
  const breadcrumbs: string[] = [];
  // Find organization name
  if (staff.organizationId && organizations) {
    const org = organizations.find((o: any) => o.id === staff.organizationId);
    if (org) breadcrumbs.push(org.name);
  } else if (staff.teamId && allTeams && organizations) {
    // Fallback: get org from team if staff.organizationId is missing
    const team = allTeams.find((t: any) => t.id === staff.teamId);
    if (team) {
      const org = organizations.find((o: any) => o.id === team.organizationId || o.id === team.groupId);
      if (org) breadcrumbs.push(org.name);
    }
  }
  // Find department name
  if (staff.staffDepartmentId && allStaffDepartments) {
    const dept = allStaffDepartments.find((d: any) => d.id === staff.staffDepartmentId);
    if (dept) breadcrumbs.push(dept.name);
  }
  // Find team name
  if (staff.teamId && allTeams) {
    const team = allTeams.find((t: any) => t.id === staff.teamId);
    if (team) breadcrumbs.push(team.name);
  }
  return breadcrumbs;
}
