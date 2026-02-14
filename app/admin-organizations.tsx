import { useState, useMemo } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

/**
 * Admin - Manage Organizations (Staff Structure)
 * 
 * Three-level hierarchy: Organizations → Departments → Teams
 */
export default function AdminOrganizationsScreen() {
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: user } = trpc.auth.me.useQuery();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Organization state
  const [isAddingOrganization, setIsAddingOrganization] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgDescription, setNewOrgDescription] = useState("");
  const [expandedOrgId, setExpandedOrgId] = useState<number | null>(null);

  // Department state
  const [isAddingDepartment, setIsAddingDepartment] = useState<number | null>(null);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptDescription, setNewDeptDescription] = useState("");
  const [expandedDeptId, setExpandedDeptId] = useState<number | null>(null);

  // Team state
  const [isAddingTeam, setIsAddingTeam] = useState<number | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");

  // Queries
  const { data: organizations, isLoading } = trpc.groups.list.useQuery();

  // Filtered organizations based on search query
  const filteredOrganizations = useMemo(() => {
    if (!organizations) return [];
    if (!searchQuery.trim()) return organizations;
    
    const query = searchQuery.toLowerCase();
    return organizations.filter(org => 
      org.name.toLowerCase().includes(query) ||
      org.description?.toLowerCase().includes(query) ||
      org.address?.toLowerCase().includes(query) ||
      org.phone?.toLowerCase().includes(query) ||
      org.email?.toLowerCase().includes(query)
    );
  }, [organizations, searchQuery]);
  const { data: departments } = trpc.staffDepartments.list.useQuery(
    { organizationId: expandedOrgId || 0 },
    { enabled: expandedOrgId !== null }
  );
  const { data: teams } = trpc.teams.list.useQuery(
    { groupId: expandedOrgId || 0 },
    { enabled: expandedOrgId !== null }
  );

  // Mutations
  const createOrg = trpc.groups.create.useMutation({
    onSuccess: () => {
      utils.groups.invalidate();
      setIsAddingOrganization(false);
      setNewOrgName("");
      setNewOrgDescription("");
      Alert.alert("Success", "Organization created");
    },
    onError: (error) => Alert.alert("Error", error.message),
  });

  const createDept = trpc.staffDepartments.create.useMutation({
    onSuccess: () => {
      utils.staffDepartments.invalidate();
      setIsAddingDepartment(null);
      setNewDeptName("");
      setNewDeptDescription("");
      Alert.alert("Success", "Department created");
    },
    onError: (error) => Alert.alert("Error", error.message),
  });

  const createTeam = trpc.teams.create.useMutation({
    onSuccess: () => {
      utils.teams.invalidate();
      setIsAddingTeam(null);
      setNewTeamName("");
      setNewTeamDescription("");
      Alert.alert("Success", "Team created");
    },
    onError: (error) => Alert.alert("Error", error.message),
  });

  const deleteOrg = trpc.groups.delete.useMutation({
    onSuccess: () => {
      utils.groups.invalidate();
      Alert.alert("Success", "Organization deleted");
    },
    onError: (error) => Alert.alert("Error", error.message),
  });

  const deleteDept = trpc.staffDepartments.delete.useMutation({
    onSuccess: () => {
      utils.staffDepartments.invalidate();
      Alert.alert("Success", "Department deleted");
    },
    onError: (error) => Alert.alert("Error", error.message),
  });

  const deleteTeam = trpc.teams.delete.useMutation({
    onSuccess: () => {
      utils.teams.invalidate();
      Alert.alert("Success", "Team deleted");
    },
    onError: (error) => Alert.alert("Error", error.message),
  });

  // Handlers
  const handleCreateOrg = () => {
    if (!newOrgName.trim() || !user?.id) return;
    createOrg.mutate({
      name: newOrgName,
      description: newOrgDescription,
      createdBy: user.id,
      updatedBy: user.id,
    });
  };

  const handleCreateDept = (orgId: number) => {
    if (!newDeptName.trim() || !user?.id) return;
    createDept.mutate({
      organizationId: orgId,
      name: newDeptName,
      description: newDeptDescription,
      createdBy: user.id,
      updatedBy: user.id,
    });
  };

  const handleCreateTeam = (deptId: number) => {
    if (!newTeamName.trim() || !user?.id) return;
    createTeam.mutate({
      groupId: expandedOrgId!,
      staffDepartmentId: deptId,
      name: newTeamName,
      description: newTeamDescription,
      createdBy: user.id,
      updatedBy: user.id,
    });
  };

  const handleDeleteOrg = (id: number) => {
    Alert.alert("Confirm Delete", "Delete this organization and all its departments/teams?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteOrg.mutate({ id }) },
    ]);
  };

  const handleDeleteDept = (id: number) => {
    Alert.alert("Confirm Delete", "Delete this department and all its teams?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteDept.mutate({ id }) },
    ]);
  };

  const handleDeleteTeam = (id: number) => {
    Alert.alert("Confirm Delete", "Delete this team?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTeam.mutate({ id }) },
    ]);
  };

  const filteredTeams = teams?.filter((t) => t.staffDepartmentId === expandedDeptId) || [];

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">Manage Staff Organizations</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Search Bar */}
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search organizations, addresses, contacts..."
          placeholderTextColor={colors.muted}
          style={{ backgroundColor: colors.surface, color: colors.foreground }}
          className="px-4 py-3 rounded-lg mb-4"
        />

        {/* Add Organization */}
        {!isAddingOrganization ? (
          <TouchableOpacity
            onPress={() => setIsAddingOrganization(true)}
            style={{ backgroundColor: colors.primary }}
            className="px-4 py-3 rounded-lg mb-4"
          >
            <Text className="text-background font-semibold text-center">+ Add Organization</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ backgroundColor: colors.surface }} className="p-4 rounded-lg mb-4">
            <Text className="text-foreground font-semibold mb-2">New Organization</Text>
            <TextInput
              value={newOrgName}
              onChangeText={setNewOrgName}
              placeholder="Organization Name"
              placeholderTextColor={colors.muted}
              style={{ backgroundColor: colors.background, color: colors.foreground }}
              className="px-3 py-2 rounded mb-2"
            />
            <TextInput
              value={newOrgDescription}
              onChangeText={setNewOrgDescription}
              placeholder="Description (optional)"
              placeholderTextColor={colors.muted}
              style={{ backgroundColor: colors.background, color: colors.foreground }}
              className="px-3 py-2 rounded mb-3"
              multiline
            />
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleCreateOrg}
                style={{ backgroundColor: colors.primary }}
                className="flex-1 px-4 py-2 rounded"
              >
                <Text className="text-background font-semibold text-center">Create</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setIsAddingOrganization(false);
                  setNewOrgName("");
                  setNewOrgDescription("");
                }}
                style={{ backgroundColor: colors.border }}
                className="flex-1 px-4 py-2 rounded"
              >
                <Text className="text-foreground font-semibold text-center">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Organizations List */}
        {filteredOrganizations?.map((org) => (
          <View key={org.id} style={{ backgroundColor: colors.surface }} className="rounded-lg mb-3 p-4">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => setExpandedOrgId(expandedOrgId === org.id ? null : org.id)}
                className="flex-1"
              >
                <Text className="text-foreground font-bold text-lg">{org.name}</Text>
                {org.description && <Text className="text-muted text-sm mt-1">{org.description}</Text>}
                {(org.address || org.phone || org.email) && (
                  <View className="mt-2 gap-1">
                    {org.address && <Text className="text-muted text-xs">📍 {org.address}</Text>}
                    {org.phone && <Text className="text-muted text-xs">📞 {org.phone}</Text>}
                    {org.email && <Text className="text-muted text-xs">✉️ {org.email}</Text>}
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteOrg(org.id)} className="ml-2">
                <Text className="text-error">Delete</Text>
              </TouchableOpacity>
            </View>

            {/* Departments */}
            {expandedOrgId === org.id && (
              <View className="mt-4 ml-4">
                <TouchableOpacity
                  onPress={() => setIsAddingDepartment(org.id)}
                  style={{ backgroundColor: colors.primary }}
                  className="px-3 py-2 rounded mb-3"
                >
                  <Text className="text-background font-semibold text-center">+ Add Department</Text>
                </TouchableOpacity>

                {isAddingDepartment === org.id && (
                  <View style={{ backgroundColor: colors.background }} className="p-3 rounded mb-3">
                    <TextInput
                      value={newDeptName}
                      onChangeText={setNewDeptName}
                      placeholder="Department Name"
                      placeholderTextColor={colors.muted}
                      style={{ backgroundColor: colors.surface, color: colors.foreground }}
                      className="px-3 py-2 rounded mb-2"
                    />
                    <TextInput
                      value={newDeptDescription}
                      onChangeText={setNewDeptDescription}
                      placeholder="Description (optional)"
                      placeholderTextColor={colors.muted}
                      style={{ backgroundColor: colors.surface, color: colors.foreground }}
                      className="px-3 py-2 rounded mb-2"
                      multiline
                    />
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => handleCreateDept(org.id)}
                        style={{ backgroundColor: colors.primary }}
                        className="flex-1 px-3 py-2 rounded"
                      >
                        <Text className="text-background font-semibold text-center">Create</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setIsAddingDepartment(null);
                          setNewDeptName("");
                          setNewDeptDescription("");
                        }}
                        style={{ backgroundColor: colors.border }}
                        className="flex-1 px-3 py-2 rounded"
                      >
                        <Text className="text-foreground font-semibold text-center">Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {departments?.map((dept) => (
                  <View key={dept.id} style={{ backgroundColor: colors.background }} className="rounded p-3 mb-2">
                    <View className="flex-row items-center justify-between">
                      <TouchableOpacity
                        onPress={() => setExpandedDeptId(expandedDeptId === dept.id ? null : dept.id)}
                        className="flex-1"
                      >
                        <Text className="text-foreground font-semibold">{dept.name}</Text>
                        {dept.description && <Text className="text-muted text-xs mt-1">{dept.description}</Text>}
                        {(dept.address || dept.phone || dept.email) && (
                          <View className="mt-1 gap-0.5">
                            {dept.address && <Text className="text-muted text-xs">📍 {dept.address}</Text>}
                            {dept.phone && <Text className="text-muted text-xs">📞 {dept.phone}</Text>}
                            {dept.email && <Text className="text-muted text-xs">✉️ {dept.email}</Text>}
                          </View>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteDept(dept.id)} className="ml-2">
                        <Text className="text-error text-sm">Delete</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Teams */}
                    {expandedDeptId === dept.id && (
                      <View className="mt-3 ml-3">
                        <TouchableOpacity
                          onPress={() => setIsAddingTeam(dept.id)}
                          style={{ backgroundColor: colors.primary }}
                          className="px-3 py-2 rounded mb-2"
                        >
                          <Text className="text-background font-semibold text-center text-sm">+ Add Team</Text>
                        </TouchableOpacity>

                        {isAddingTeam === dept.id && (
                          <View style={{ backgroundColor: colors.surface }} className="p-3 rounded mb-2">
                            <TextInput
                              value={newTeamName}
                              onChangeText={setNewTeamName}
                              placeholder="Team Name"
                              placeholderTextColor={colors.muted}
                              style={{ backgroundColor: colors.background, color: colors.foreground }}
                              className="px-3 py-2 rounded mb-2"
                            />
                            <TextInput
                              value={newTeamDescription}
                              onChangeText={setNewTeamDescription}
                              placeholder="Description (optional)"
                              placeholderTextColor={colors.muted}
                              style={{ backgroundColor: colors.background, color: colors.foreground }}
                              className="px-3 py-2 rounded mb-2"
                              multiline
                            />
                            <View className="flex-row gap-2">
                              <TouchableOpacity
                                onPress={() => handleCreateTeam(dept.id)}
                                style={{ backgroundColor: colors.primary }}
                                className="flex-1 px-3 py-2 rounded"
                              >
                                <Text className="text-background font-semibold text-center text-sm">Create</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => {
                                  setIsAddingTeam(null);
                                  setNewTeamName("");
                                  setNewTeamDescription("");
                                }}
                                style={{ backgroundColor: colors.border }}
                                className="flex-1 px-3 py-2 rounded"
                              >
                                <Text className="text-foreground font-semibold text-center text-sm">Cancel</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}

                        {filteredTeams.map((team) => (
                          <View
                            key={team.id}
                            style={{ backgroundColor: colors.surface }}
                            className="rounded p-2 mb-2 flex-row items-center justify-between"
                          >
                            <View className="flex-1">
                              <Text className="text-foreground">{team.name}</Text>
                              {team.description && <Text className="text-muted text-xs">{team.description}</Text>}
                              {(team.address || team.phone || team.email) && (
                                <View className="mt-0.5 gap-0.5">
                                  {team.address && <Text className="text-muted text-xs">📍 {team.address}</Text>}
                                  {team.phone && <Text className="text-muted text-xs">📞 {team.phone}</Text>}
                                  {team.email && <Text className="text-muted text-xs">✉️ {team.email}</Text>}
                                </View>
                              )}
                            </View>
                            <TouchableOpacity onPress={() => handleDeleteTeam(team.id)}>
                              <Text className="text-error text-xs">Delete</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
