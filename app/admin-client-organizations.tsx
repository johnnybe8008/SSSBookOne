import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

/**
 * Admin - Manage Client Organizations
 * 
 * Four-level hierarchy: Companies → Divisions → Departments → Teams
 */
export default function AdminClientOrganizationsScreen() {
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: user } = trpc.auth.me.useQuery();

  // Company state
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyDescription, setNewCompanyDescription] = useState("");
  const [newCompanyAddress, setNewCompanyAddress] = useState("");
  const [newCompanyPhone, setNewCompanyPhone] = useState("");
  const [newCompanyEmail, setNewCompanyEmail] = useState("");
  const [expandedCompanyId, setExpandedCompanyId] = useState<number | null>(null);

  // Division state
  const [isAddingDivision, setIsAddingDivision] = useState<number | null>(null);
  const [newDivisionName, setNewDivisionName] = useState("");
  const [newDivisionDescription, setNewDivisionDescription] = useState("");
  const [newDivisionAddress, setNewDivisionAddress] = useState("");
  const [newDivisionPhone, setNewDivisionPhone] = useState("");
  const [newDivisionEmail, setNewDivisionEmail] = useState("");
  const [expandedDivisionId, setExpandedDivisionId] = useState<number | null>(null);

  // Department state
  const [isAddingDepartment, setIsAddingDepartment] = useState<number | null>(null);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptDescription, setNewDeptDescription] = useState("");
  const [newDeptAddress, setNewDeptAddress] = useState("");
  const [newDeptPhone, setNewDeptPhone] = useState("");
  const [newDeptEmail, setNewDeptEmail] = useState("");
  const [expandedDeptId, setExpandedDeptId] = useState<number | null>(null);

  // Team state
  const [isAddingTeam, setIsAddingTeam] = useState<number | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [newTeamAddress, setNewTeamAddress] = useState("");
  const [newTeamPhone, setNewTeamPhone] = useState("");
  const [newTeamEmail, setNewTeamEmail] = useState("");

  // Queries
  const { data: companies, isLoading } = trpc.companies.list.useQuery();
  const { data: divisions } = trpc.divisions.list.useQuery(
    { companyId: expandedCompanyId || 0 },
    { enabled: expandedCompanyId !== null }
  );
  const { data: departments } = trpc.departments.list.useQuery(
    { divisionId: expandedDivisionId || 0 },
    { enabled: expandedDivisionId !== null }
  );
  const { data: teams } = trpc.companyTeams.list.useQuery(
    { departmentId: expandedDeptId || 0 },
    { enabled: expandedDeptId !== null }
  );

  // Mutations
  const createCompany = trpc.companies.create.useMutation({
    onSuccess: () => {
      utils.companies.invalidate();
      setIsAddingCompany(false);
      setNewCompanyName("");
      setNewCompanyDescription("");
      setNewCompanyAddress("");
      setNewCompanyPhone("");
      setNewCompanyEmail("");
      Alert.alert("Success", "Company created");
    },
    onError: (error) => Alert.alert("Error", error.message),
  });

  const createDivision = trpc.divisions.create.useMutation({
    onSuccess: () => {
      utils.divisions.invalidate();
      setIsAddingDivision(null);
      setNewDivisionName("");
      setNewDivisionDescription("");
      setNewDivisionAddress("");
      setNewDivisionPhone("");
      setNewDivisionEmail("");
      Alert.alert("Success", "Division created");
    },
    onError: (error) => Alert.alert("Error", error.message),
  });

  const createDept = trpc.departments.create.useMutation({
    onSuccess: () => {
      utils.departments.invalidate();
      setIsAddingDepartment(null);
      setNewDeptName("");
      setNewDeptDescription("");
      setNewDeptAddress("");
      setNewDeptPhone("");
      setNewDeptEmail("");
      Alert.alert("Success", "Department created");
    },
    onError: (error) => Alert.alert("Error", error.message),
  });

  const createTeam = trpc.companyTeams.create.useMutation({
    onSuccess: () => {
      utils.companyTeams.invalidate();
      setIsAddingTeam(null);
      setNewTeamName("");
      setNewTeamDescription("");
      setNewTeamAddress("");
      setNewTeamPhone("");
      setNewTeamEmail("");
      Alert.alert("Success", "Team created");
    },
    onError: (error) => Alert.alert("Error", error.message),
  });

  const deleteCompany = trpc.companies.delete.useMutation({
    onSuccess: () => {
      utils.companies.invalidate();
      Alert.alert("Success", "Company deleted");
    },
    onError: (error) => Alert.alert("Error", error.message),
  });

  const deleteDivision = trpc.divisions.delete.useMutation({
    onSuccess: () => {
      utils.divisions.invalidate();
      Alert.alert("Success", "Division deleted");
    },
    onError: (error) => Alert.alert("Error", error.message),
  });

  const deleteDept = trpc.departments.delete.useMutation({
    onSuccess: () => {
      utils.departments.invalidate();
      Alert.alert("Success", "Department deleted");
    },
    onError: (error) => Alert.alert("Error", error.message),
  });

  const deleteTeam = trpc.companyTeams.delete.useMutation({
    onSuccess: () => {
      utils.companyTeams.invalidate();
      Alert.alert("Success", "Team deleted");
    },
    onError: (error) => Alert.alert("Error", error.message),
  });

  // Handlers
  const handleCreateCompany = () => {
    if (!newCompanyName.trim() || !user?.id) return;
    createCompany.mutate({
      name: newCompanyName,
      address: newCompanyAddress || undefined,
      phone: newCompanyPhone || undefined,
      email: newCompanyEmail || undefined,
      createdBy: user.id,
      updatedBy: user.id,
    });
  };

  const handleCreateDivision = (companyId: number) => {
    if (!newDivisionName.trim() || !user?.id) return;
    createDivision.mutate({
      companyId,
      name: newDivisionName,
      description: newDivisionDescription,
      address: newDivisionAddress || undefined,
      phone: newDivisionPhone || undefined,
      email: newDivisionEmail || undefined,
      createdBy: user.id,
      updatedBy: user.id,
    });
  };

  const handleCreateDept = (divisionId: number) => {
    if (!newDeptName.trim() || !user?.id) return;
    createDept.mutate({
      divisionId,
      name: newDeptName,
      description: newDeptDescription,
      address: newDeptAddress || undefined,
      phone: newDeptPhone || undefined,
      email: newDeptEmail || undefined,
      createdBy: user.id,
      updatedBy: user.id,
    });
  };

  const handleCreateTeam = (deptId: number) => {
    if (!newTeamName.trim() || !user?.id) return;
    createTeam.mutate({
      departmentId: deptId,
      name: newTeamName,
      description: newTeamDescription,
      address: newTeamAddress || undefined,
      phone: newTeamPhone || undefined,
      email: newTeamEmail || undefined,
      createdBy: user.id,
      updatedBy: user.id,
    });
  };

  const handleDeleteCompany = (id: number) => {
    Alert.alert("Confirm Delete", "Delete this company and all its divisions/departments/teams?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteCompany.mutate({ id }) },
    ]);
  };

  const handleDeleteDivision = (id: number) => {
    Alert.alert("Confirm Delete", "Delete this division and all its departments/teams?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteDivision.mutate({ id }) },
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
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">Manage Client Organizations</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Add Company */}
        {!isAddingCompany ? (
          <TouchableOpacity
            onPress={() => setIsAddingCompany(true)}
            style={{ backgroundColor: colors.primary }}
            className="px-4 py-3 rounded-lg mb-4"
          >
            <Text className="text-background font-semibold text-center">+ Add Company</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ backgroundColor: colors.surface }} className="p-4 rounded-lg mb-4">
            <Text className="text-foreground font-semibold mb-2">New Company</Text>
            <TextInput
              value={newCompanyName}
              onChangeText={setNewCompanyName}
              placeholder="Company Name"
              placeholderTextColor={colors.muted}
              style={{ backgroundColor: colors.background, color: colors.foreground }}
              className="px-3 py-2 rounded mb-2"
            />
            <TextInput
              value={newCompanyDescription}
              onChangeText={setNewCompanyDescription}
              placeholder="Description (optional)"
              placeholderTextColor={colors.muted}
              style={{ backgroundColor: colors.background, color: colors.foreground }}
              className="px-3 py-2 rounded mb-2"
              multiline
            />
            <TextInput
              value={newCompanyAddress}
              onChangeText={setNewCompanyAddress}
              placeholder="Address (optional)"
              placeholderTextColor={colors.muted}
              style={{ backgroundColor: colors.background, color: colors.foreground }}
              className="px-3 py-2 rounded mb-2"
            />
            <TextInput
              value={newCompanyPhone}
              onChangeText={setNewCompanyPhone}
              placeholder="Phone (optional)"
              placeholderTextColor={colors.muted}
              style={{ backgroundColor: colors.background, color: colors.foreground }}
              className="px-3 py-2 rounded mb-2"
            />
            <TextInput
              value={newCompanyEmail}
              onChangeText={setNewCompanyEmail}
              placeholder="Email (optional)"
              placeholderTextColor={colors.muted}
              style={{ backgroundColor: colors.background, color: colors.foreground }}
              className="px-3 py-2 rounded mb-3"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleCreateCompany}
                style={{ backgroundColor: colors.primary }}
                className="flex-1 px-4 py-2 rounded"
              >
                <Text className="text-background font-semibold text-center">Create</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setIsAddingCompany(false);
                  setNewCompanyName("");
                  setNewCompanyDescription("");
                  setNewCompanyAddress("");
                  setNewCompanyPhone("");
                  setNewCompanyEmail("");
                }}
                style={{ backgroundColor: colors.border }}
                className="flex-1 px-4 py-2 rounded"
              >
                <Text className="text-foreground font-semibold text-center">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Companies List */}
        {companies?.map((company) => (
          <View key={company.id} style={{ backgroundColor: colors.surface }} className="rounded-lg mb-3 p-4">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => setExpandedCompanyId(expandedCompanyId === company.id ? null : company.id)}
                className="flex-1"
              >
                <Text className="text-foreground font-bold text-lg">{company.name}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteCompany(company.id)} className="ml-2">
                <Text className="text-error">Delete</Text>
              </TouchableOpacity>
            </View>

            {/* Divisions */}
            {expandedCompanyId === company.id && (
              <View className="mt-4 ml-4">
                <TouchableOpacity
                  onPress={() => setIsAddingDivision(company.id)}
                  style={{ backgroundColor: colors.primary }}
                  className="px-3 py-2 rounded mb-3"
                >
                  <Text className="text-background font-semibold text-center">+ Add Division</Text>
                </TouchableOpacity>

                {isAddingDivision === company.id && (
                  <View style={{ backgroundColor: colors.background }} className="p-3 rounded mb-3">
                    <TextInput
                      value={newDivisionName}
                      onChangeText={setNewDivisionName}
                      placeholder="Division Name"
                      placeholderTextColor={colors.muted}
                      style={{ backgroundColor: colors.surface, color: colors.foreground }}
                      className="px-3 py-2 rounded mb-2"
                    />
                    <TextInput
                      value={newDivisionDescription}
                      onChangeText={setNewDivisionDescription}
                      placeholder="Description (optional)"
                      placeholderTextColor={colors.muted}
                      style={{ backgroundColor: colors.surface, color: colors.foreground }}
                      className="px-3 py-2 rounded mb-2"
                      multiline
                    />
                    <TextInput
                      value={newDivisionAddress}
                      onChangeText={setNewDivisionAddress}
                      placeholder="Address (optional)"
                      placeholderTextColor={colors.muted}
                      style={{ backgroundColor: colors.surface, color: colors.foreground }}
                      className="px-3 py-2 rounded mb-2"
                    />
                    <TextInput
                      value={newDivisionPhone}
                      onChangeText={setNewDivisionPhone}
                      placeholder="Phone (optional)"
                      placeholderTextColor={colors.muted}
                      style={{ backgroundColor: colors.surface, color: colors.foreground }}
                      className="px-3 py-2 rounded mb-2"
                    />
                    <TextInput
                      value={newDivisionEmail}
                      onChangeText={setNewDivisionEmail}
                      placeholder="Email (optional)"
                      placeholderTextColor={colors.muted}
                      style={{ backgroundColor: colors.surface, color: colors.foreground }}
                      className="px-3 py-2 rounded mb-2"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => handleCreateDivision(company.id)}
                        style={{ backgroundColor: colors.primary }}
                        className="flex-1 px-3 py-2 rounded"
                      >
                        <Text className="text-background font-semibold text-center">Create</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setIsAddingDivision(null);
                          setNewDivisionName("");
                          setNewDivisionDescription("");
                          setNewDivisionAddress("");
                          setNewDivisionPhone("");
                          setNewDivisionEmail("");
                        }}
                        style={{ backgroundColor: colors.border }}
                        className="flex-1 px-3 py-2 rounded"
                      >
                        <Text className="text-foreground font-semibold text-center">Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {divisions?.map((division) => (
                  <View key={division.id} style={{ backgroundColor: colors.background }} className="rounded p-3 mb-2">
                    <View className="flex-row items-center justify-between">
                      <TouchableOpacity
                        onPress={() => setExpandedDivisionId(expandedDivisionId === division.id ? null : division.id)}
                        className="flex-1"
                      >
                        <Text className="text-foreground font-semibold">{division.name}</Text>
                        {division.description && <Text className="text-muted text-xs mt-1">{division.description}</Text>}
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteDivision(division.id)} className="ml-2">
                        <Text className="text-error text-sm">Delete</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Departments */}
                    {expandedDivisionId === division.id && (
                      <View className="mt-3 ml-3">
                        <TouchableOpacity
                          onPress={() => setIsAddingDepartment(division.id)}
                          style={{ backgroundColor: colors.primary }}
                          className="px-3 py-2 rounded mb-2"
                        >
                          <Text className="text-background font-semibold text-center text-sm">+ Add Department</Text>
                        </TouchableOpacity>

                        {isAddingDepartment === division.id && (
                          <View style={{ backgroundColor: colors.surface }} className="p-3 rounded mb-2">
                            <TextInput
                              value={newDeptName}
                              onChangeText={setNewDeptName}
                              placeholder="Department Name"
                              placeholderTextColor={colors.muted}
                              style={{ backgroundColor: colors.background, color: colors.foreground }}
                              className="px-3 py-2 rounded mb-2"
                            />
                            <TextInput
                              value={newDeptDescription}
                              onChangeText={setNewDeptDescription}
                              placeholder="Description (optional)"
                              placeholderTextColor={colors.muted}
                              style={{ backgroundColor: colors.background, color: colors.foreground }}
                              className="px-3 py-2 rounded mb-2"
                              multiline
                            />
                            <TextInput
                              value={newDeptAddress}
                              onChangeText={setNewDeptAddress}
                              placeholder="Address (optional)"
                              placeholderTextColor={colors.muted}
                              style={{ backgroundColor: colors.background, color: colors.foreground }}
                              className="px-3 py-2 rounded mb-2"
                            />
                            <TextInput
                              value={newDeptPhone}
                              onChangeText={setNewDeptPhone}
                              placeholder="Phone (optional)"
                              placeholderTextColor={colors.muted}
                              style={{ backgroundColor: colors.background, color: colors.foreground }}
                              className="px-3 py-2 rounded mb-2"
                            />
                            <TextInput
                              value={newDeptEmail}
                              onChangeText={setNewDeptEmail}
                              placeholder="Email (optional)"
                              placeholderTextColor={colors.muted}
                              style={{ backgroundColor: colors.background, color: colors.foreground }}
                              className="px-3 py-2 rounded mb-2"
                              keyboardType="email-address"
                              autoCapitalize="none"
                            />
                            <View className="flex-row gap-2">
                              <TouchableOpacity
                                onPress={() => handleCreateDept(division.id)}
                                style={{ backgroundColor: colors.primary }}
                                className="flex-1 px-3 py-2 rounded"
                              >
                                <Text className="text-background font-semibold text-center text-sm">Create</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => {
                                  setIsAddingDepartment(null);
                                  setNewDeptName("");
                                  setNewDeptDescription("");
                                  setNewDeptAddress("");
                                  setNewDeptPhone("");
                                  setNewDeptEmail("");
                                }}
                                style={{ backgroundColor: colors.border }}
                                className="flex-1 px-3 py-2 rounded"
                              >
                                <Text className="text-foreground font-semibold text-center text-sm">Cancel</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}

                        {departments?.map((dept) => (
                          <View key={dept.id} style={{ backgroundColor: colors.surface }} className="rounded p-2 mb-2">
                            <View className="flex-row items-center justify-between">
                              <TouchableOpacity
                                onPress={() => setExpandedDeptId(expandedDeptId === dept.id ? null : dept.id)}
                                className="flex-1"
                              >
                                <Text className="text-foreground text-sm font-medium">{dept.name}</Text>
                                {dept.description && <Text className="text-muted text-xs">{dept.description}</Text>}
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => handleDeleteDept(dept.id)} className="ml-2">
                                <Text className="text-error text-xs">Delete</Text>
                              </TouchableOpacity>
                            </View>

                            {/* Teams */}
                            {expandedDeptId === dept.id && (
                              <View className="mt-2 ml-2">
                                <TouchableOpacity
                                  onPress={() => setIsAddingTeam(dept.id)}
                                  style={{ backgroundColor: colors.primary }}
                                  className="px-2 py-1 rounded mb-2"
                                >
                                  <Text className="text-background font-semibold text-center text-xs">+ Add Team</Text>
                                </TouchableOpacity>

                                {isAddingTeam === dept.id && (
                                  <View style={{ backgroundColor: colors.background }} className="p-2 rounded mb-2">
                                    <TextInput
                                      value={newTeamName}
                                      onChangeText={setNewTeamName}
                                      placeholder="Team Name"
                                      placeholderTextColor={colors.muted}
                                      style={{ backgroundColor: colors.surface, color: colors.foreground }}
                                      className="px-2 py-1 rounded mb-2 text-xs"
                                    />
                                    <TextInput
                                      value={newTeamDescription}
                                      onChangeText={setNewTeamDescription}
                                      placeholder="Description (optional)"
                                      placeholderTextColor={colors.muted}
                                      style={{ backgroundColor: colors.surface, color: colors.foreground }}
                                      className="px-2 py-1 rounded mb-2 text-xs"
                                      multiline
                                    />
                                    <TextInput
                                      value={newTeamAddress}
                                      onChangeText={setNewTeamAddress}
                                      placeholder="Address (optional)"
                                      placeholderTextColor={colors.muted}
                                      style={{ backgroundColor: colors.surface, color: colors.foreground }}
                                      className="px-2 py-1 rounded mb-2 text-xs"
                                    />
                                    <TextInput
                                      value={newTeamPhone}
                                      onChangeText={setNewTeamPhone}
                                      placeholder="Phone (optional)"
                                      placeholderTextColor={colors.muted}
                                      style={{ backgroundColor: colors.surface, color: colors.foreground }}
                                      className="px-2 py-1 rounded mb-2 text-xs"
                                    />
                                    <TextInput
                                      value={newTeamEmail}
                                      onChangeText={setNewTeamEmail}
                                      placeholder="Email (optional)"
                                      placeholderTextColor={colors.muted}
                                      style={{ backgroundColor: colors.surface, color: colors.foreground }}
                                      className="px-2 py-1 rounded mb-2 text-xs"
                                      keyboardType="email-address"
                                      autoCapitalize="none"
                                    />
                                    <View className="flex-row gap-2">
                                      <TouchableOpacity
                                        onPress={() => handleCreateTeam(dept.id)}
                                        style={{ backgroundColor: colors.primary }}
                                        className="flex-1 px-2 py-1 rounded"
                                      >
                                        <Text className="text-background font-semibold text-center text-xs">Create</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                        onPress={() => {
                                          setIsAddingTeam(null);
                                          setNewTeamName("");
                                          setNewTeamDescription("");
                                          setNewTeamAddress("");
                                          setNewTeamPhone("");
                                          setNewTeamEmail("");
                                        }}
                                        style={{ backgroundColor: colors.border }}
                                        className="flex-1 px-2 py-1 rounded"
                                      >
                                        <Text className="text-foreground font-semibold text-center text-xs">Cancel</Text>
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                )}

                                {teams?.map((team) => (
                                  <View
                                    key={team.id}
                                    style={{ backgroundColor: colors.background }}
                                    className="rounded p-2 mb-1 flex-row items-center justify-between"
                                  >
                                    <View className="flex-1">
                                      <Text className="text-foreground text-xs">{team.name}</Text>
                                      {team.description && <Text className="text-muted text-xs">{team.description}</Text>}
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
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
