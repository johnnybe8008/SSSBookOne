import { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

export default function AdminStaffAddScreen() {
  const colors = useColors();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "counselor" | "viewer">("counselor");
  const [isVipRated, setIsVipRated] = useState(false);
  
  // Staff organizational assignment
  const [groupId, setGroupId] = useState<number | null>(null);
  const [staffDepartmentId, setStaffDepartmentId] = useState<number | null>(null);
  const [teamId, setTeamId] = useState<number | null>(null);

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
    ? allTeams?.filter((t: any) => t.groupId === groupId && !t.staffDepartmentId)
    : [];

  const utils = trpc.useUtils();
  const createStaff = trpc.staff.create.useMutation({
    onSuccess: () => {
      utils.staff.listAll.invalidate();
      Alert.alert("Success", "Staff member created successfully");
      router.back();
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to create staff member");
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
    if (!password.trim()) {
      Alert.alert("Error", "Please enter a password");
      return;
    }

    createStaff.mutate({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: role,
      isVipRated: isVipRated ? 1 : 0,
      isAdmin: role === "admin" ? 1 : 0, // For backward compatibility
      teamId: teamId || 1, // Staff organization team
      createdBy: 1, // Admin user
      updatedBy: 1,
    });
  };

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [newTeamName, setNewTeamName] = useState("");

  const createDepartment = trpc.staffDepartments.create.useMutation({
    onSuccess: () => {
      utils.staffDepartments.invalidate();
      setShowDeptModal(false);
      setNewDeptName("");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to create department");
    },
  });

  const createTeam = trpc.teams.create.useMutation({
    onSuccess: () => {
      utils.teams.invalidate();
      setShowTeamModal(false);
      setNewTeamName("");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to create team");
    },
  });

  const [orgSearch, setOrgSearch] = useState("");

  const filteredOrganizations = organizations?.filter((org: any) =>
    org.name.toLowerCase().includes(orgSearch.toLowerCase())
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView>
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-primary text-3xl font-bold">&lt;</Text>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text className="text-2xl font-bold text-foreground text-center">Add a New Staff Member</Text>
          </View>
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
              style={{ minHeight: 48 }}
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
              style={{ minHeight: 48 }}
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
              style={{ minHeight: 48 }}
              placeholderTextColor="#9BA1A6"
            />
          </View>

          {/* Password */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Password *</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter initial password"
              secureTextEntry
              className="bg-surface border border-border rounded-lg p-3 text-foreground"
              style={{ minHeight: 48 }}
              placeholderTextColor="#9BA1A6"
            />
            <Text className="text-xs text-muted mt-1">Admin can reset this password later if needed</Text>
          </View>

          {/* VIP Toggle */}
          <TouchableOpacity
            onPress={() => setIsVipRated(!isVipRated)}
            className="bg-surface border border-border rounded-lg flex-row items-center"
            style={{ minHeight: 48, height: 48, paddingHorizontal: 12 }}
          >
            <Text className="text-base font-semibold text-foreground" style={{ flex: 1, textAlign: 'left' }}>
              VIP Rated
            </Text>
            <Text className="text-sm text-muted ml-2" style={{ flex: 2, textAlign: 'left' }}>
              Can create cases for VIP clients
            </Text>
            <View
              className={`w-12 h-7 rounded-full p-1${isVipRated ? " bg-warning" : " bg-border"}`}
              style={{ minHeight: 32 }}
            >
              <View
                className={`w-5 h-5 rounded-full bg-background${isVipRated ? " ml-auto" : ""}`}
                style={{ minHeight: 24 }}
              />
            </View>
          </TouchableOpacity>

          {/* Role Selection */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Role *</Text>
            <View className="gap-2">
              <TouchableOpacity
                onPress={() => setRole("admin")}
                className={role === "admin" ? "border rounded-lg border-error bg-error/10 flex-row items-center" : "border rounded-lg border-border bg-surface flex-row items-center"}
                style={{ minHeight: 48, height: 48, paddingHorizontal: 12 }}
              >
                <Text className={role === "admin" ? "text-base font-semibold text-error" : "text-base font-semibold text-foreground"} style={{ flex: 1, textAlign: 'left' }}>
                  Admin
                </Text>
                <Text className="text-sm text-muted ml-2" style={{ flex: 2, textAlign: 'left' }}>
                  Full access to all admin functions and settings
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setRole("counselor")}
                className={role === "counselor" ? "border rounded-lg border-primary bg-primary/10 flex-row items-center" : "border rounded-lg border-border bg-surface flex-row items-center"}
                style={{ minHeight: 48, height: 48, paddingHorizontal: 12 }}
              >
                <Text className={role === "counselor" ? "text-base font-semibold text-primary" : "text-base font-semibold text-foreground"} style={{ flex: 1, textAlign: 'left' }}>
                  Counselor
                </Text>
                <Text className="text-sm text-muted ml-2" style={{ flex: 2, textAlign: 'left' }}>
                  Can record sessions and manage own clients
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setRole("viewer")}
                className={role === "viewer" ? "border rounded-lg border-success bg-success/10 flex-row items-center" : "border rounded-lg border-border bg-surface flex-row items-center"}
                style={{ minHeight: 48, height: 48, paddingHorizontal: 12 }}
              >
                <Text className={role === "viewer" ? "text-base font-semibold text-success" : "text-base font-semibold text-foreground"} style={{ flex: 1, textAlign: 'left' }}>
                  View Only
                </Text>
                <Text className="text-sm text-muted ml-2" style={{ flex: 2, textAlign: 'left' }}>
                  Read-only access to reports and analytics
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Staff Organization Assignment */}
          <View className="mt-6">
            <Text className="text-lg font-bold text-foreground mb-2">Staff Organization Assignment</Text>
            <Text className="text-sm text-muted mb-4">
              Assign staff to your internal organizational structure
            </Text>

            {/* Organization Picker with search filter and scrollable list */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Organization</Text>
              <TextInput
                value={orgSearch}
                onChangeText={setOrgSearch}
                placeholder="Search organizations..."
                className="bg-surface border border-border rounded-lg p-3 text-foreground mb-2"
                style={{ minHeight: 48 }}
              />
              <View className="bg-surface border border-border rounded-lg p-3" style={{ minHeight: 48 }}>
                <ScrollView style={{ maxHeight: 40 * 8 }}>
                  {(filteredOrganizations ?? []).slice(0, 50).map((org: any) => (
                    <TouchableOpacity
                      key={org.id}
                      onPress={() => {
                        setGroupId(org.id);
                        setStaffDepartmentId(null);
                        setTeamId(null);
                      }}
                      className={`rounded-lg px-3 py-2${groupId === org.id ? ' bg-primary/10 border-primary' : ''}`}
                      style={{ minHeight: 40 }}
                    >
                      <Text className="text-foreground text-base">{org.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Department Picker */}
            {groupId && (
              <View className="mb-4 flex-row items-center">
                <View style={{ flex: 1 }}>
                  <Text className="text-sm font-semibold text-foreground mb-2">Department</Text>
                  <View className="bg-surface border border-border rounded-lg p-3" style={{ minHeight: 48 }}>
                    <Picker
                      selectedValue={staffDepartmentId}
                      onValueChange={(value) => {
                        setStaffDepartmentId(value);
                        setTeamId(null);
                      }}
                      style={{ color: colors.foreground }}
                    >
                      <Picker.Item label={staffDepartments?.length === 0 ? "No departments found" : "Select Department"} value={null} />
                      {staffDepartments?.map((dept: any) => (
                        <Picker.Item key={dept.id} label={dept.name} value={dept.id} />
                      ))}
                    </Picker>
                  </View>
                  {staffDepartments?.length === 0 && (
                    <Text className="text-xs text-muted mt-2">No departments found for this organization.</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => setShowDeptModal(true)}
                  className="ml-2 bg-primary rounded-full w-10 h-10 items-center justify-center"
                >
                  <Text className="text-background text-xl font-bold">+</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Team Picker */}
            {staffDepartmentId && (
              <View className="mb-4 flex-row items-center">
                <View style={{ flex: 1 }}>
                  <Text className="text-sm font-semibold text-foreground mb-2">Team</Text>
                  <View className="bg-surface border border-border rounded-lg p-3" style={{ minHeight: 48 }}>
                    <Picker
                      selectedValue={teamId}
                      onValueChange={setTeamId}
                      style={{ color: colors.foreground }}
                    >
                      <Picker.Item label={teams?.filter((t: any) => t.staffDepartmentId === staffDepartmentId).length === 0 ? "No teams found" : "Select Team"} value={null} />
                      {teams?.filter((t: any) => t.staffDepartmentId === staffDepartmentId).map((team: any) => (
                        <Picker.Item key={team.id} label={team.name} value={team.id} />
                      ))}
                    </Picker>
                  </View>
                  {teams?.filter((t: any) => t.staffDepartmentId === staffDepartmentId).length === 0 && (
                    <Text className="text-xs text-muted mt-2">No teams found for this department.</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => setShowTeamModal(true)}
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
            disabled={createStaff.isPending}
            className={`rounded-lg p-3 ${
              createStaff.isPending ? "bg-muted" : "bg-success"
            }`}
            style={{ minHeight: 48 }}
          >
            {createStaff.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-background font-semibold text-center text-lg">
                Create Staff Member
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            disabled={createStaff.isPending}
            className="bg-surface border border-border rounded-lg p-3"
            style={{ minHeight: 48 }}
          >
            <Text className="text-foreground font-semibold text-center text-lg">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Department Modal */}
      <Modal visible={showDeptModal} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/30">
          <View className="bg-surface p-6 rounded-xl w-80">
            <Text className="text-lg font-bold mb-4">Add Department</Text>
            <TextInput
              value={newDeptName}
              onChangeText={setNewDeptName}
              placeholder="Department Name"
              className="bg-background border border-border rounded-lg p-3 mb-4"
            />
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setShowDeptModal(false)}
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

      {/* Team Modal */}
      <Modal visible={showTeamModal} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/30">
          <View className="bg-surface p-6 rounded-xl w-80">
            <Text className="text-lg font-bold mb-4">Add Team</Text>
            <TextInput
              value={newTeamName}
              onChangeText={setNewTeamName}
              placeholder="Team Name"
              className="bg-background border border-border rounded-lg p-3 mb-4"
            />
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setShowTeamModal(false)}
                className="flex-1 bg-muted rounded-lg p-3 items-center"
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (!newTeamName.trim() || !staffDepartmentId) return;
                  createTeam.mutate({
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
