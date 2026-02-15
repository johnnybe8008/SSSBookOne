import { useState, useMemo } from "react";
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

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

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
  const [expandedDivisionId, setExpandedDivisionId] = useState<number | null>(null);

  // Department state
  const [isAddingDepartment, setIsAddingDepartment] = useState<number | null>(null);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptDescription, setNewDeptDescription] = useState("");
  const [expandedDeptId, setExpandedDeptId] = useState<number | null>(null);

  // Team state
  const [isAddingTeam, setIsAddingTeam] = useState<number | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");

  // Edit state for companies
  const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null);
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editCompanyDescription, setEditCompanyDescription] = useState("");
  const [editCompanyAddress, setEditCompanyAddress] = useState("");
  const [editCompanyPhone, setEditCompanyPhone] = useState("");
  const [editCompanyEmail, setEditCompanyEmail] = useState("");

  // Edit state for divisions
  const [editingDivisionId, setEditingDivisionId] = useState<number | null>(null);
  const [editDivisionName, setEditDivisionName] = useState("");
  const [editDivisionDescription, setEditDivisionDescription] = useState("");

  // Edit state for departments
  const [editingDeptId, setEditingDeptId] = useState<number | null>(null);
  const [editDeptName, setEditDeptName] = useState("");
  const [editDeptDescription, setEditDeptDescription] = useState("");

  // Edit state for teams
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamDescription, setEditTeamDescription] = useState("");

  // Queries
  const { data: companies, isLoading } = trpc.companies.list.useQuery();

  // Filtered companies based on search query
  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    if (!searchQuery.trim()) return companies;
    
    const query = searchQuery.toLowerCase();
    return companies.filter(company => 
      company.name.toLowerCase().includes(query) ||
      company.address?.toLowerCase().includes(query) ||
      company.phone?.toLowerCase().includes(query) ||
      company.email?.toLowerCase().includes(query) ||
      company.contactPerson?.toLowerCase().includes(query)
    );
  }, [companies, searchQuery]);
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

  const updateCompany = trpc.companies.update.useMutation({
    onSuccess: () => {
      utils.companies.invalidate();
      setEditingCompanyId(null);
      Alert.alert("Success", "Company updated");
    },
    onError: (error) => Alert.alert("Error", error.message),
  });

  const updateDivision = trpc.divisions.update.useMutation({
    onSuccess: () => {
      utils.divisions.invalidate();
      setEditingDivisionId(null);
      Alert.alert("Success", "Division updated");
    },
    onError: (error) => Alert.alert("Error", error.message),
  });

  const updateDept = trpc.departments.update.useMutation({
    onSuccess: () => {
      utils.departments.invalidate();
      setEditingDeptId(null);
      Alert.alert("Success", "Department updated");
    },
    onError: (error) => Alert.alert("Error", error.message),
  });

  const updateTeam = trpc.companyTeams.update.useMutation({
    onSuccess: () => {
      utils.companyTeams.invalidate();
      setEditingTeamId(null);
      Alert.alert("Success", "Team updated");
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

  const handleStartEditCompany = (company: any) => {
    setEditingCompanyId(company.id);
    setEditCompanyName(company.name);
    setEditCompanyDescription(company.description || "");
    setEditCompanyAddress(company.address || "");
    setEditCompanyPhone(company.phone || "");
    setEditCompanyEmail(company.email || "");
  };

  const handleUpdateCompany = () => {
    if (!editCompanyName.trim() || !user?.id || !editingCompanyId) return;
    updateCompany.mutate({
      id: editingCompanyId,
      name: editCompanyName,
      address: editCompanyAddress || undefined,
      phone: editCompanyPhone || undefined,
      email: editCompanyEmail || undefined,
      updatedBy: user.id,
    });
  };

  const handleStartEditDivision = (division: any) => {
    setEditingDivisionId(division.id);
    setEditDivisionName(division.name);
    setEditDivisionDescription(division.description || "");
  };

  const handleUpdateDivision = () => {
    if (!editDivisionName.trim() || !user?.id || !editingDivisionId) return;
    updateDivision.mutate({
      id: editingDivisionId,
      name: editDivisionName,
      description: editDivisionDescription,
      updatedBy: user.id,
    });
  };

  const handleStartEditDept = (dept: any) => {
    setEditingDeptId(dept.id);
    setEditDeptName(dept.name);
    setEditDeptDescription(dept.description || "");
  };

  const handleUpdateDept = () => {
    if (!editDeptName.trim() || !user?.id || !editingDeptId) return;
    updateDept.mutate({
      id: editingDeptId,
      name: editDeptName,
      description: editDeptDescription,
      updatedBy: user.id,
    });
  };

  const handleStartEditTeam = (team: any) => {
    setEditingTeamId(team.id);
    setEditTeamName(team.name);
    setEditTeamDescription(team.description || "");
  };

  const handleUpdateTeam = () => {
    if (!editTeamName.trim() || !user?.id || !editingTeamId) return;
    updateTeam.mutate({
      id: editingTeamId,
      name: editTeamName,
      description: editTeamDescription,
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

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">Manage Client Organizations</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Search Bar */}
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search companies, addresses, contacts..."
          placeholderTextColor={colors.muted}
          style={{ backgroundColor: colors.surface, color: colors.foreground }}
          className="px-4 py-3 rounded-lg mb-4"
        />

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
        {filteredCompanies?.map((company) => (
          <View key={company.id} style={{ backgroundColor: colors.surface }} className="rounded-lg mb-3 p-4">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => setExpandedCompanyId(expandedCompanyId === company.id ? null : company.id)}
                className="flex-1"
              >
                <Text className="text-foreground font-bold text-lg">{company.name}</Text>
                {(company.address || company.phone || company.email) && (
                  <View className="mt-2 gap-1">
                    {company.address && <Text className="text-muted text-xs">📍 {company.address}</Text>}
                    {company.phone && <Text className="text-muted text-xs">📞 {company.phone}</Text>}
                    {company.email && <Text className="text-muted text-xs">✉️ {company.email}</Text>}
                  </View>
                )}
              </TouchableOpacity>
              <View className="flex-row gap-2">
                <TouchableOpacity onPress={() => handleStartEditCompany(company)} className="ml-2">
                  <Text className="text-primary">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteCompany(company.id)}>
                  <Text className="text-error">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Edit Company Form */}
            {editingCompanyId === company.id && (
              <View style={{ backgroundColor: colors.background }} className="p-4 rounded-lg mt-4">
                <Text className="text-foreground font-semibold mb-3">Edit Company</Text>
                <TextInput
                  value={editCompanyName}
                  onChangeText={setEditCompanyName}
                  placeholder="Company Name"
                  placeholderTextColor={colors.muted}
                  style={{ backgroundColor: colors.surface, color: colors.foreground }}
                  className="px-3 py-2 rounded mb-2"
                />
                <TextInput
                  value={editCompanyDescription}
                  onChangeText={setEditCompanyDescription}
                  placeholder="Description (optional)"
                  placeholderTextColor={colors.muted}
                  style={{ backgroundColor: colors.surface, color: colors.foreground }}
                  className="px-3 py-2 rounded mb-2"
                  multiline
                />
                <TextInput
                  value={editCompanyAddress}
                  onChangeText={setEditCompanyAddress}
                  placeholder="Address (optional)"
                  placeholderTextColor={colors.muted}
                  style={{ backgroundColor: colors.surface, color: colors.foreground }}
                  className="px-3 py-2 rounded mb-2"
                />
                <TextInput
                  value={editCompanyPhone}
                  onChangeText={setEditCompanyPhone}
                  placeholder="Phone (optional)"
                  placeholderTextColor={colors.muted}
                  style={{ backgroundColor: colors.surface, color: colors.foreground }}
                  className="px-3 py-2 rounded mb-2"
                  keyboardType="phone-pad"
                />
                <TextInput
                  value={editCompanyEmail}
                  onChangeText={setEditCompanyEmail}
                  placeholder="Email (optional)"
                  placeholderTextColor={colors.muted}
                  style={{ backgroundColor: colors.surface, color: colors.foreground }}
                  className="px-3 py-2 rounded mb-3"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={handleUpdateCompany}
                    style={{ backgroundColor: colors.primary }}
                    className="flex-1 px-4 py-2 rounded"
                  >
                    <Text className="text-background font-semibold text-center">Update</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setEditingCompanyId(null)}
                    style={{ backgroundColor: colors.muted }}
                    className="flex-1 px-4 py-2 rounded"
                  >
                    <Text className="text-background font-semibold text-center">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

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
                      className="px-3 py-2 rounded mb-3"
                      multiline
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
                        {(division.address || division.phone || division.email) && (
                          <View className="mt-1 gap-0.5">
                            {division.address && <Text className="text-muted text-xs">📍 {division.address}</Text>}
                            {division.phone && <Text className="text-muted text-xs">📞 {division.phone}</Text>}
                            {division.email && <Text className="text-muted text-xs">✉️ {division.email}</Text>}
                          </View>
                        )}
                      </TouchableOpacity>
                      <View className="flex-row gap-2">
                        <TouchableOpacity onPress={() => handleStartEditDivision(division)} className="ml-2">
                          <Text className="text-primary text-sm">Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteDivision(division.id)}>
                          <Text className="text-error text-sm">Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Edit Division Form */}
                    {editingDivisionId === division.id && (
                      <View style={{ backgroundColor: colors.surface }} className="p-3 rounded-lg mt-3">
                        <Text className="text-foreground font-semibold mb-2">Edit Division</Text>
                        <TextInput
                          value={editDivisionName}
                          onChangeText={setEditDivisionName}
                          placeholder="Division Name"
                          placeholderTextColor={colors.muted}
                          style={{ backgroundColor: colors.background, color: colors.foreground }}
                          className="px-3 py-2 rounded mb-2"
                        />
                        <TextInput
                          value={editDivisionDescription}
                          onChangeText={setEditDivisionDescription}
                          placeholder="Description (optional)"
                          placeholderTextColor={colors.muted}
                          style={{ backgroundColor: colors.background, color: colors.foreground }}
                          className="px-3 py-2 rounded mb-2"
                          multiline
                        />
                        <View className="flex-row gap-2">
                          <TouchableOpacity
                            onPress={handleUpdateDivision}
                            style={{ backgroundColor: colors.primary }}
                            className="flex-1 px-3 py-2 rounded"
                          >
                            <Text className="text-background font-semibold text-center text-sm">Update</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => setEditingDivisionId(null)}
                            style={{ backgroundColor: colors.muted }}
                            className="flex-1 px-3 py-2 rounded"
                          >
                            <Text className="text-background font-semibold text-center text-sm">Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

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
                              className="px-3 py-2 rounded mb-3"
                              multiline
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
                                {(dept.address || dept.phone || dept.email) && (
                                  <View className="mt-1 gap-0.5">
                                    {dept.address && <Text className="text-muted text-xs">📍 {dept.address}</Text>}
                                    {dept.phone && <Text className="text-muted text-xs">📞 {dept.phone}</Text>}
                                    {dept.email && <Text className="text-muted text-xs">✉️ {dept.email}</Text>}
                                  </View>
                                )}
                              </TouchableOpacity>
                              <View className="flex-row gap-2">
                                <TouchableOpacity onPress={() => handleStartEditDept(dept)} className="ml-2">
                                  <Text className="text-primary text-xs">Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDeleteDept(dept.id)}>
                                  <Text className="text-error text-xs">Delete</Text>
                                </TouchableOpacity>
                              </View>
                            </View>

                            {/* Edit Department Form */}
                            {editingDeptId === dept.id && (
                              <View style={{ backgroundColor: colors.background }} className="p-3 rounded-lg mt-2">
                                <Text className="text-foreground font-semibold mb-2">Edit Department</Text>
                                <TextInput
                                  value={editDeptName}
                                  onChangeText={setEditDeptName}
                                  placeholder="Department Name"
                                  placeholderTextColor={colors.muted}
                                  style={{ backgroundColor: colors.surface, color: colors.foreground }}
                                  className="px-3 py-2 rounded mb-2"
                                />
                                <TextInput
                                  value={editDeptDescription}
                                  onChangeText={setEditDeptDescription}
                                  placeholder="Description (optional)"
                                  placeholderTextColor={colors.muted}
                                  style={{ backgroundColor: colors.surface, color: colors.foreground }}
                                  className="px-3 py-2 rounded mb-2"
                                  multiline
                                />
                                <View className="flex-row gap-2">
                                  <TouchableOpacity
                                    onPress={handleUpdateDept}
                                    style={{ backgroundColor: colors.primary }}
                                    className="flex-1 px-3 py-2 rounded"
                                  >
                                    <Text className="text-background font-semibold text-center text-xs">Update</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    onPress={() => setEditingDeptId(null)}
                                    style={{ backgroundColor: colors.muted }}
                                    className="flex-1 px-3 py-2 rounded"
                                  >
                                    <Text className="text-background font-semibold text-center text-xs">Cancel</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            )}

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
                                  <View key={team.id} className="mb-1">
                                    <View
                                      style={{ backgroundColor: colors.background }}
                                      className="rounded p-2 flex-row items-center justify-between"
                                    >
                                      <View className="flex-1">
                                        <Text className="text-foreground text-xs">{team.name}</Text>
                                        {team.description && <Text className="text-muted text-xs">{team.description}</Text>}
                                        {(team.address || team.phone || team.email) && (
                                          <View className="mt-0.5 gap-0.5">
                                            {team.address && <Text className="text-muted text-xs">📍 {team.address}</Text>}
                                            {team.phone && <Text className="text-muted text-xs">📞 {team.phone}</Text>}
                                            {team.email && <Text className="text-muted text-xs">✉️ {team.email}</Text>}
                                          </View>
                                        )}
                                      </View>
                                      <View className="flex-row gap-2">
                                        <TouchableOpacity onPress={() => handleStartEditTeam(team)}>
                                          <Text className="text-primary text-xs">Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteTeam(team.id)}>
                                          <Text className="text-error text-xs">Delete</Text>
                                        </TouchableOpacity>
                                      </View>
                                    </View>

                                    {/* Edit Team Form */}
                                    {editingTeamId === team.id && (
                                      <View style={{ backgroundColor: colors.surface }} className="p-2 rounded-lg mt-1">
                                        <Text className="text-foreground font-semibold mb-2">Edit Team</Text>
                                        <TextInput
                                          value={editTeamName}
                                          onChangeText={setEditTeamName}
                                          placeholder="Team Name"
                                          placeholderTextColor={colors.muted}
                                          style={{ backgroundColor: colors.background, color: colors.foreground }}
                                          className="px-3 py-2 rounded mb-2"
                                        />
                                        <TextInput
                                          value={editTeamDescription}
                                          onChangeText={setEditTeamDescription}
                                          placeholder="Description (optional)"
                                          placeholderTextColor={colors.muted}
                                          style={{ backgroundColor: colors.background, color: colors.foreground }}
                                          className="px-3 py-2 rounded mb-2"
                                          multiline
                                        />
                                        <View className="flex-row gap-2">
                                          <TouchableOpacity
                                            onPress={handleUpdateTeam}
                                            style={{ backgroundColor: colors.primary }}
                                            className="flex-1 px-3 py-2 rounded"
                                          >
                                            <Text className="text-background font-semibold text-center text-xs">Update</Text>
                                          </TouchableOpacity>
                                          <TouchableOpacity
                                            onPress={() => setEditingTeamId(null)}
                                            style={{ backgroundColor: colors.muted }}
                                            className="flex-1 px-3 py-2 rounded"
                                          >
                                            <Text className="text-background font-semibold text-center text-xs">Cancel</Text>
                                          </TouchableOpacity>
                                        </View>
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
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
