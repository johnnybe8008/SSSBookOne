import { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
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

  // Client organizational assignment (optional - for client-facing work)
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [divisionId, setDivisionId] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [companyTeamId, setCompanyTeamId] = useState<number | null>(null);

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
      companyId: companyId || undefined,
      divisionId: divisionId || undefined,
      departmentId: departmentId || undefined,
      companyTeamId: companyTeamId || undefined,
      createdBy: 1, // Admin user
      updatedBy: 1,
    });
  };

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
          <Text className="text-3xl font-bold text-foreground">Add New Staff</Text>
          <Text className="text-sm text-muted mt-1">Create a new staff member account</Text>
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

          {/* Password */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Password *</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter initial password"
              secureTextEntry
              className="bg-surface border border-border rounded-lg p-3 text-foreground"
              placeholderTextColor="#9BA1A6"
            />
            <Text className="text-xs text-muted mt-1">Admin can reset this password later if needed</Text>
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

          {/* Staff Organization Assignment */}
          <View className="mt-6">
            <Text className="text-lg font-bold text-foreground mb-2">Staff Organization Assignment</Text>
            <Text className="text-sm text-muted mb-4">
              Assign staff to your internal organizational structure
            </Text>

            {/* Organization Picker */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Organization</Text>
              <View className="bg-surface border border-border rounded-lg">
                <Picker
                  selectedValue={groupId}
                  onValueChange={(value) => {
                    setGroupId(value);
                    setStaffDepartmentId(null);
                    setTeamId(null);
                  }}
                  style={{ color: colors.foreground }}
                >
                  <Picker.Item label="Select Organization" value={null} />
                  {organizations?.map((org: any) => (
                    <Picker.Item key={org.id} label={org.name} value={org.id} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Department Picker */}
            {groupId && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">Department</Text>
                <View className="bg-surface border border-border rounded-lg">
                  <Picker
                    selectedValue={staffDepartmentId}
                    onValueChange={(value) => {
                      setStaffDepartmentId(value);
                      setTeamId(null);
                    }}
                    style={{ color: colors.foreground }}
                  >
                    <Picker.Item label="Select Department" value={null} />
                    {staffDepartments?.map((dept: any) => (
                      <Picker.Item key={dept.id} label={dept.name} value={dept.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            {/* Team Picker */}
            {staffDepartmentId && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">Team</Text>
                <View className="bg-surface border border-border rounded-lg">
                  <Picker
                    selectedValue={teamId}
                    onValueChange={setTeamId}
                    style={{ color: colors.foreground }}
                  >
                    <Picker.Item label="Select Team" value={null} />
                    {teams?.filter((t: any) => t.staffDepartmentId === staffDepartmentId).map((team: any) => (
                      <Picker.Item key={team.id} label={team.name} value={team.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
          </View>

          {/* Client Organization Assignment (Optional) */}
          <View className="mt-6">
            <Text className="text-lg font-bold text-foreground mb-2">Client Organization Assignment (Optional)</Text>
            <Text className="text-sm text-muted mb-4">
              Optionally assign staff to a client company for client-facing work
            </Text>

            {/* Company Picker */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Company</Text>
              <View className="bg-surface border border-border rounded-lg">
                <Picker
                  selectedValue={companyId}
                  onValueChange={(value) => {
                    setCompanyId(value);
                    setDivisionId(null);
                    setDepartmentId(null);
                    setCompanyTeamId(null);
                  }}
                  style={{ color: colors.foreground }}
                >
                  <Picker.Item label="None" value={null} />
                  {companies?.map((company: any) => (
                    <Picker.Item key={company.id} label={company.name} value={company.id} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Division Picker */}
            {companyId && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">Division</Text>
                <View className="bg-surface border border-border rounded-lg">
                  <Picker
                    selectedValue={divisionId}
                    onValueChange={(value) => {
                      setDivisionId(value);
                      setDepartmentId(null);
                      setCompanyTeamId(null);
                    }}
                    style={{ color: colors.foreground }}
                  >
                    <Picker.Item label="Select Division" value={null} />
                    {divisions?.map((division: any) => (
                      <Picker.Item key={division.id} label={division.name} value={division.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            {/* Department Picker */}
            {divisionId && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">Department</Text>
                <View className="bg-surface border border-border rounded-lg">
                  <Picker
                    selectedValue={departmentId}
                    onValueChange={(value) => {
                      setDepartmentId(value);
                      setCompanyTeamId(null);
                    }}
                    style={{ color: colors.foreground }}
                  >
                    <Picker.Item label="Select Department" value={null} />
                    {departments?.map((dept: any) => (
                      <Picker.Item key={dept.id} label={dept.name} value={dept.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            {/* Team Picker */}
            {departmentId && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">Team</Text>
                <View className="bg-surface border border-border rounded-lg">
                  <Picker
                    selectedValue={companyTeamId}
                    onValueChange={setCompanyTeamId}
                    style={{ color: colors.foreground }}
                  >
                    <Picker.Item label="Select Team" value={null} />
                    {companyTeams?.map((team: any) => (
                      <Picker.Item key={team.id} label={team.name} value={team.id} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-3 mt-8 mb-8">
          <TouchableOpacity
            onPress={handleSave}
            disabled={createStaff.isPending}
            className={`rounded-lg p-4 ${
              createStaff.isPending ? "bg-muted" : "bg-success"
            }`}
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
            className="bg-surface border border-border rounded-lg p-4"
          >
            <Text className="text-foreground font-semibold text-center text-lg">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
