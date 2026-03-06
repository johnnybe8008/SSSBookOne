// ...existing code...
import { useState, useMemo } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
export default function AdminClientOrganizationsScreen() {
                  // ...existing code...
                // Handler for creating a new company
                const handleCreateCompany = () => {
                  createCompany.mutate({
                    name: newCompanyName,
                    description: newCompanyDescription,
                    address: newCompanyAddress,
                    phone: newCompanyPhone,
                    email: newCompanyEmail,
                    divisionId: selectedDivisionId,
                    departmentId: selectedDepartmentId,
                    teamId: selectedTeamId,
                    createdBy: staff?.id || 0,
                    updatedBy: staff?.id || 0,
                  });
                };
              // New Company email state
              const [newCompanyEmail, setNewCompanyEmail] = useState("");
            // New Company phone state
            const [newCompanyPhone, setNewCompanyPhone] = useState("");
          // New Company address state
          const [newCompanyAddress, setNewCompanyAddress] = useState("");
        // New Company description state
        const [newCompanyDescription, setNewCompanyDescription] = useState("");
      // New Company name state
      const [newCompanyName, setNewCompanyName] = useState("");
    // Search Bar state
    const [searchQuery, setSearchQuery] = useState("");
    // Companies data
    const { data: companies } = trpc.companies.all.useQuery();
    // Filtered companies based on searchQuery
    const filteredCompanies = useMemo(() => {
      if (!companies) return [];
      if (!searchQuery.trim()) return companies;
      const lowerQuery = searchQuery.toLowerCase();
      return companies.filter(
        (company) =>
          company.name?.toLowerCase().includes(lowerQuery) ||
          company.address?.toLowerCase().includes(lowerQuery) ||
          company.email?.toLowerCase().includes(lowerQuery)
      );
    }, [companies, searchQuery]);
  // ...existing code...
  // Add Company state
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: staff, isLoading: staffLoading, error: staffError } = trpc.auth.me.useQuery();
  // Fetch divisions data
  const { data: divisions, isLoading: divisionsLoading, error: divisionsError } = trpc.divisions.all.useQuery();
  // Alias for compatibility with existing code
  const allDivisions = divisions;
  // Fetch departments data
  const { data: departments, isLoading: departmentsLoading, error: departmentsError } = trpc.departments.all.useQuery();
  // Alias for compatibility with existing code
  const allDepartments = departments;
  // Fetch teams data
  const { data: teams, isLoading: teamsLoading, error: teamsError } = trpc.companyTeams.all.useQuery();
  // Alias for compatibility with existing code
  const allTeams = teams;
    // ...existing code...
  // ...existing code...
/**
 * Admin - Manage Client Organizations
 * 
 * Four-level hierarchy: Companies → Divisions → Departments → Teams
 */
  const [expandedCompanyId, setExpandedCompanyId] = useState<number | null>(null);
  // Division/Department selectors for new company
  const [selectedDivisionId, setSelectedDivisionId] = useState<number | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [divisionSearch, setDivisionSearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [showCreateDivision, setShowCreateDivision] = useState(false);
  const [showCreateDepartment, setShowCreateDepartment] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  // ...existing code...
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
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
  // ...existing code...
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

    // ...existing code...

  // Handler functions must be above the main return
  // ...existing code...

  // ...existing code...

  // ...existing code...
        <ScrollView style={{ maxHeight: 120 }}>
          {allDivisions && allDivisions
            .filter(d => d.name.toLowerCase().includes(divisionSearch.toLowerCase()))
            .map(d => (
              <TouchableOpacity
                key={d.id}
                onPress={() => setSelectedDivisionId(d.id)}
                style={{ backgroundColor: selectedDivisionId === d.id ? colors.primary + '20' : 'transparent' }}
                className="py-2 px-2 border-b border-border"
              >
                <Text style={{ color: colors.foreground }} className="font-medium">{d.name}</Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
        {/* Create Division Modal */}
        {showCreateDivision && (
                      <>
                        <Text style={{ color: 'orange', fontSize: 12, marginBottom: 4 }}>
                          companyId: {expandedCompanyId?.toString() || 'null'} | staff.id: {staff?.id?.toString() || 'null'}
                        </Text>
                        <View className="absolute top-0 left-0 right-0 bg-background p-4 z-10 border border-primary rounded-xl">
                          <Text className="text-lg font-semibold mb-2">Create New Division</Text>
                          <TextInput
                            value={newDivisionName}
                            onChangeText={setNewDivisionName}
                            placeholder="Division Name"
                            className="bg-background border border-border rounded-xl px-4 py-3 mb-2"
                          />
                          {/* Debug payload display */}
                          <Text style={{ color: 'red', fontSize: 12, marginBottom: 8 }}>
                            {JSON.stringify({
                              companyId: expandedCompanyId,
                              name: newDivisionName,
                              description: newDivisionDescription,
                              createdBy: staff?.id,
                              updatedBy: staff?.id,
                            }, null, 2)}
                          </Text>
                          <TouchableOpacity
                            onPress={() => {
                              if (!newDivisionName.trim() || !newDivisionDescription.trim() || !staff?.id || !expandedCompanyId) return;
                              handleCreateDivision(expandedCompanyId);
                              setShowCreateDivision(false);
                              setNewDivisionName("");
                              setNewDivisionDescription("");
                            }}
                            className="bg-primary py-2 rounded-xl mb-2"
                          >
                            <Text className="text-background text-center font-semibold">Add</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setShowCreateDivision(false)}>
                            <Text className="text-center text-primary font-medium">Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </>
        )}
      <>
        <TextInput
          value={departmentSearch}
          onChangeText={setDepartmentSearch}
          placeholder="Search departments..."
          placeholderTextColor={colors.muted}
          className="bg-background border border-border rounded-xl px-4 py-3 mb-2"
        />
        <TouchableOpacity onPress={() => setShowCreateDepartment(true)} className="mb-2">
          <Text className="text-primary font-medium">+ Create New Department</Text>
        </TouchableOpacity>
        <ScrollView style={{ maxHeight: 120 }}>
          {allDepartments && allDepartments
            .filter(d => d.name.toLowerCase().includes(departmentSearch.toLowerCase()))
            .map(d => (
              <TouchableOpacity
                key={d.id}
                onPress={() => setSelectedDepartmentId(d.id)}
                style={{ backgroundColor: selectedDepartmentId === d.id ? colors.primary + '20' : 'transparent' }}
                className="py-2 px-2 border-b border-border"
              >
                <Text style={{ color: colors.foreground }} className="font-medium">{d.name}</Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </>
      {/* Create Department Modal */}
      {showCreateDepartment && (
        <View className="absolute top-0 left-0 right-0 bg-background p-4 z-10 border border-primary rounded-xl">
          <Text className="text-lg font-semibold mb-2">Create New Department</Text>
          <TextInput
            value={newDepartmentName}
            onChangeText={setNewDepartmentName}
            placeholder="Department Name"
            className="bg-background border border-border rounded-xl px-4 py-3 mb-2"
          />
          <TouchableOpacity
            onPress={() => {
              if (!newDepartmentName.trim()) return;
              createDept.mutate({ name: newDepartmentName, createdBy: staff.id, updatedBy: staff.id });
              setShowCreateDepartment(false);
              setNewDepartmentName("");
            }}
            className="bg-primary py-2 rounded-xl mb-2"
          >
            <Text className="text-background text-center font-semibold">Create</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowCreateDepartment(false)}>
            <Text className="text-center text-primary">Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* End of all modals and selectors */}
      <>
        {/* Team Selector (required) */}
        <Text className="text-sm font-medium text-foreground mb-2 mt-2">Team *</Text>
        <TextInput
          value={teamSearch}
          onChangeText={setTeamSearch}
          placeholder="Search teams..."
          placeholderTextColor={colors.muted}
          className="bg-background border border-border rounded-xl px-4 py-3 mb-2"
        />
        <TouchableOpacity onPress={() => setShowCreateTeam(true)} className="mb-2">
          <Text className="text-primary font-medium">+ Create New Team</Text>
        </TouchableOpacity>
        <ScrollView style={{ maxHeight: 120 }}>
          {allTeams && allTeams
            .filter(t => t.name.toLowerCase().includes(teamSearch.toLowerCase()))
            .map(t => (
              <TouchableOpacity
                key={t.id}
                onPress={() => setSelectedTeamId(t.id)}
                style={{ backgroundColor: selectedTeamId === t.id ? colors.primary + '20' : 'transparent' }}
                className="py-2 px-2 border-b border-border"
              >
                <Text style={{ color: colors.foreground }} className="font-medium">{t.name}</Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </>
      {/* Create Team Modal */}
      {showCreateTeam && (
        <View className="absolute top-0 left-0 right-0 bg-background p-4 z-10 border border-primary rounded-xl">
          <Text className="text-lg font-semibold mb-2">Create New Team</Text>
          <TextInput
            value={newTeamName}
            onChangeText={setNewTeamName}
            placeholder="Team Name"
            className="bg-background border border-border rounded-xl px-4 py-3 mb-2"
          />
          <TouchableOpacity
            onPress={() => {
              if (!newTeamName.trim()) return;
              createTeam.mutate({ name: newTeamName, createdBy: staff.id, updatedBy: staff.id });
              setShowCreateTeam(false);
              setNewTeamName("");
            }}
            className="bg-primary py-2 rounded-xl mb-2"
          >
            <Text className="text-background text-center font-semibold">Create</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowCreateTeam(false)}>
            <Text className="text-center text-primary">Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

  const handleCreateDivision = (companyId: number) => {
    if (!newDivisionName.trim() || !newDivisionDescription.trim() || !staff?.id) return;
    const validCompanyId = companyId || editingCompanyId;
    const payload = {
      companyId: validCompanyId ?? undefined,
      name: newDivisionName,
      createdBy: staff?.id ?? 0,
      updatedBy: staff?.id ?? 0,
    };
    console.log('Division Payload:', payload);
    createDivision.mutate(payload);
  };

  const handleCreateDept = (divisionId: number) => {
    if (!newDeptName.trim() || !staff?.id) return;
    createDept.mutate({
      divisionId: divisionId ?? undefined,
      name: newDeptName,
      createdBy: staff?.id ?? 0,
      updatedBy: staff?.id ?? 0,
    });
  };

  const handleCreateTeam = (deptId: number) => {
    if (!newTeamName.trim() || !staff?.id) return;
    createTeam.mutate({
      departmentId: deptId ?? undefined,
      name: newTeamName,
      createdBy: staff?.id ?? 0,
      updatedBy: staff?.id ?? 0,
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
    setExpandedCompanyId(company.id); // Ensure expandedCompanyId is set when editing
    setEditCompanyName(company.name);
    setEditCompanyDescription(company.description || "");
    setEditCompanyAddress(company.address || "");
    setEditCompanyPhone(company.phone || "");
    setEditCompanyEmail(company.email || "");
  };

  const handleUpdateCompany = () => {
    if (!editCompanyName.trim() || !staff?.id || !editingCompanyId) return;
    updateCompany.mutate({
      id: editingCompanyId,
      name: editCompanyName,
      address: editCompanyAddress || undefined,
      phone: editCompanyPhone || undefined,
      email: editCompanyEmail || undefined,
      divisionId: selectedDivisionId ?? undefined,
      departmentId: selectedDepartmentId ?? undefined,
      teamId: selectedTeamId,
      updatedBy: staff.id,
    });
  };

  const handleStartEditDivision = (division: any) => {
    setEditingDivisionId(division.id);
    setEditDivisionName(division.name);
    setEditDivisionDescription(division.description || "");
  };

  // ...existing code...

  const handleUpdateDept = () => {
    if (!editDeptName.trim() || !staff?.id || !editingDeptId) return;
    updateDept.mutate({
      id: editingDeptId,
      name: editDeptName,
      // description: editDeptDescription, // Remove if not in type
      updatedBy: staff.id,
    });
  };

  const handleStartEditTeam = (team: any) => {
    setEditingTeamId(team.id);
    setEditTeamName(team.name);
    setEditTeamDescription(team.description || "");
  };

  const handleUpdateTeam = () => {
    if (!editTeamName.trim() || !staff?.id || !editingTeamId) return;
    updateTeam.mutate({
      id: editingTeamId,
      name: editTeamName,
      // description: editTeamDescription, // Remove if not in type
      updatedBy: staff.id,
    });
  };

  if (staffLoading || divisionsLoading || departmentsLoading || teamsLoading) {
    return (
      <>
        <View style={{ padding: 8 }}>
          <Text style={{ color: 'orange', fontSize: 14 }}>
            Debug: expandedCompanyId = {(typeof expandedCompanyId !== 'undefined' ? expandedCompanyId?.toString() : 'null')} | staff.id = {(staff && typeof staff.id !== 'undefined' ? staff.id?.toString() : 'null')}
          </Text>
        </View>
        <ScreenContainer className="items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </ScreenContainer>
      </>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-4">
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center gap-2 mb-4"
          >
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            <Text className="text-primary text-base font-semibold">Back</Text>
          </TouchableOpacity>
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
            <View style={{ backgroundColor: colors.background }} className="p-4 rounded-lg mb-4">
              <Text className="text-foreground font-semibold mb-3">Add New Company</Text>
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
              {/* Division Selector */}
              <View className="flex-row items-center mb-1">
                <Text className="text-foreground font-semibold">Division</Text>
                <TouchableOpacity onPress={() => setShowCreateDivision(true)} className="ml-2">
                  <Text style={{ color: colors.primary, fontSize: 18 }}>+</Text>
                </TouchableOpacity>
              </View>
              <View className="mb-2">
                {allDivisions?.length ? (
                  allDivisions.map((d) => (
                    <TouchableOpacity
                      key={d.id}
                      onPress={() => setSelectedDivisionId(d.id)}
                      style={{ backgroundColor: selectedDivisionId === d.id ? colors.primary + '20' : 'transparent' }}
                      className="px-2 py-1 rounded mb-1"
                    >
                      <Text style={{ color: colors.foreground }}>{d.name}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text className="text-muted">No divisions found</Text>
                )}
                {showCreateDivision && (
                  <View className="mt-2">
                    <TextInput
                      value={newDivisionName}
                      onChangeText={setNewDivisionName}
                      placeholder="New Division Name"
                      placeholderTextColor={colors.muted}
                      style={{ backgroundColor: colors.surface, color: colors.foreground }}
                      className="px-2 py-1 rounded mb-1"
                    />
                    <TextInput
                      value={newDivisionDescription}
                      onChangeText={setNewDivisionDescription}
                      placeholder="Description (optional)"
                      placeholderTextColor={colors.muted}
                      style={{ backgroundColor: colors.surface, color: colors.foreground }}
                      className="px-2 py-1 rounded mb-1"
                    />
                    <View className="flex-row gap-2 mt-1">
                      <TouchableOpacity
                        onPress={() => handleCreateDivision()}
                        style={{ backgroundColor: colors.primary }}
                        className="px-3 py-1 rounded"
                      >
                        <Text className="text-background font-semibold text-center">Add</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setShowCreateDivision(false);
                          setNewDivisionName("");
                          setNewDivisionDescription("");
                        }}
                        style={{ backgroundColor: colors.border }}
                        className="px-3 py-1 rounded"
                      >
                        <Text className="text-foreground font-semibold text-center">Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
              {/* Department Selector */}
              <View className="flex-row items-center mb-1">
                <Text className="text-foreground font-semibold">Department</Text>
                <TouchableOpacity onPress={() => setShowCreateDepartment(true)} className="ml-2">
                  <Text style={{ color: colors.primary, fontSize: 18 }}>+</Text>
                </TouchableOpacity>
              </View>
              <View className="mb-2">
                {allDepartments?.length ? (
                  allDepartments.map((d) => (
                    <TouchableOpacity
                      key={d.id}
                      onPress={() => setSelectedDepartmentId(d.id)}
                      style={{ backgroundColor: selectedDepartmentId === d.id ? colors.primary + '20' : 'transparent' }}
                      className="px-2 py-1 rounded mb-1"
                    >
                      <Text style={{ color: colors.foreground }}>{d.name}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text className="text-muted">No departments found</Text>
                )}
                {showCreateDepartment && (
                  <View className="mt-2">
                    <TextInput
                      value={newDepartmentName}
                      onChangeText={setNewDepartmentName}
                      placeholder="New Department Name"
                      placeholderTextColor={colors.muted}
                      style={{ backgroundColor: colors.surface, color: colors.foreground }}
                      className="px-2 py-1 rounded mb-1"
                    />
                    <TextInput
                      value={newDeptDescription}
                      onChangeText={setNewDeptDescription}
                      placeholder="Description (optional)"
                      placeholderTextColor={colors.muted}
                      style={{ backgroundColor: colors.surface, color: colors.foreground }}
                      className="px-2 py-1 rounded mb-1"
                    />
                    <View className="flex-row gap-2 mt-1">
                      <TouchableOpacity
                        onPress={() => handleCreateDepartment()}
                        style={{ backgroundColor: colors.primary }}
                        className="px-3 py-1 rounded"
                      >
                        <Text className="text-background font-semibold text-center">Add</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setShowCreateDepartment(false);
                          setNewDepartmentName("");
                          setNewDeptDescription("");
                        }}
                        style={{ backgroundColor: colors.border }}
                        className="px-3 py-1 rounded"
                      >
                        <Text className="text-foreground font-semibold text-center">Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
              {/* Team Selector */}
              <View className="flex-row items-center mb-1">
                <Text className="text-foreground font-semibold">Team</Text>
                <TouchableOpacity onPress={() => setShowCreateTeam(true)} className="ml-2">
                  <Text style={{ color: colors.primary, fontSize: 18 }}>+</Text>
                </TouchableOpacity>
              </View>
              <View className="mb-3">
                {allTeams?.length ? (
                  allTeams.map((t) => (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => setSelectedTeamId(t.id)}
                      style={{ backgroundColor: selectedTeamId === t.id ? colors.primary + '20' : 'transparent' }}
                      className="px-2 py-1 rounded mb-1"
                    >
                      <Text style={{ color: colors.foreground }}>{t.name}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text className="text-muted">No teams found</Text>
                )}
                {showCreateTeam && (
                  <View className="mt-2">
                    <TextInput
                      value={newTeamName}
                      onChangeText={setNewTeamName}
                      placeholder="New Team Name"
                      placeholderTextColor={colors.muted}
                      style={{ backgroundColor: colors.surface, color: colors.foreground }}
                      className="px-2 py-1 rounded mb-1"
                    />
                    <TextInput
                      value={newTeamDescription}
                      onChangeText={setNewTeamDescription}
                      placeholder="Description (optional)"
                      placeholderTextColor={colors.muted}
                      style={{ backgroundColor: colors.surface, color: colors.foreground }}
                      className="px-2 py-1 rounded mb-1"
                    />
                    <View className="flex-row gap-2 mt-1">
                      <TouchableOpacity
                        onPress={() => handleCreateTeam()}
                        style={{ backgroundColor: colors.primary }}
                        className="px-3 py-1 rounded"
                      >
                        <Text className="text-background font-semibold text-center">Add</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setShowCreateTeam(false);
                          setNewTeamName("");
                          setNewTeamDescription("");
                        }}
                        style={{ backgroundColor: colors.border }}
                        className="px-3 py-1 rounded"
                      >
                        <Text className="text-foreground font-semibold text-center">Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
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
                    setSelectedDivisionId(null);
                    setSelectedDepartmentId(null);
                    setSelectedTeamId(null);
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
        {filteredCompanies?.map((company: any) => (
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
                <View className="flex-row items-center mb-1">
                  <Text className="text-foreground font-semibold">Division</Text>
                  <TouchableOpacity onPress={() => setShowCreateDivision(true)} className="ml-2">
                    <Text style={{ color: colors.primary, fontSize: 18 }}>+</Text>
                  </TouchableOpacity>
                </View>
                <View className="mb-2">
                  {allDivisions?.length ? (
                    allDivisions.map((d: any) => (
                      <TouchableOpacity
                        key={d.id}
                        onPress={() => setSelectedDivisionId(d.id)}
                        style={{ backgroundColor: selectedDivisionId === d.id ? colors.primary + '20' : 'transparent' }}
                        className="px-2 py-1 rounded mb-1"
                      >
                        <Text style={{ color: colors.foreground }}>{d.name}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text className="text-muted">No divisions found</Text>
                  )}
                  {showCreateDivision && (
                    <View className="mt-2">
                      <TextInput
                        value={newDivisionName}
                        onChangeText={setNewDivisionName}
                        placeholder="New Division Name"
                        placeholderTextColor={colors.muted}
                        style={{ backgroundColor: colors.surface, color: colors.foreground }}
                        className="px-2 py-1 rounded mb-1"
                      />
                      <TextInput
                        value={newDivisionDescription}
                        onChangeText={setNewDivisionDescription}
                        placeholder="Description (optional)"
                        placeholderTextColor={colors.muted}
                        style={{ backgroundColor: colors.surface, color: colors.foreground }}
                        className="px-2 py-1 rounded mb-1"
                      />
                      <View className="flex-row gap-2 mt-1">
                        <TouchableOpacity
                          onPress={() => handleCreateDivision(selectedDivisionId ?? 0)}
                          style={{ backgroundColor: colors.primary }}
                          className="px-3 py-1 rounded"
                        >
                          <Text className="text-background font-semibold text-center">Add</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setShowCreateDivision(false);
                            setNewDivisionName("");
                            setNewDivisionDescription("");
                          }}
                          style={{ backgroundColor: colors.border }}
                          className="px-3 py-1 rounded"
                        >
                          <Text className="text-foreground font-semibold text-center">Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
                {/* Department Selector */}
                <View className="flex-row items-center mb-1">
                  <Text className="text-foreground font-semibold">Department</Text>
                  <TouchableOpacity onPress={() => setShowCreateDepartment(true)} className="ml-2">
                    <Text style={{ color: colors.primary, fontSize: 18 }}>+</Text>
                  </TouchableOpacity>
                </View>
                <View className="mb-2">
                  {allDepartments?.length ? (
                    allDepartments.map((d: any) => (
                      <TouchableOpacity
                        key={d.id}
                        onPress={() => setSelectedDepartmentId(d.id)}
                        style={{ backgroundColor: selectedDepartmentId === d.id ? colors.primary + '20' : 'transparent' }}
                        className="px-2 py-1 rounded mb-1"
                      >
                        <Text style={{ color: colors.foreground }}>{d.name}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text className="text-muted">No departments found</Text>
                  )}
                  {showCreateDepartment && (
                    <View className="mt-2">
                      <TextInput
                        value={newDepartmentName}
                        onChangeText={setNewDepartmentName}
                        placeholder="New Department Name"
                        placeholderTextColor={colors.muted}
                        style={{ backgroundColor: colors.surface, color: colors.foreground }}
                        className="px-2 py-1 rounded mb-1"
                      />
                      <TextInput
                        value={newDeptDescription}
                        onChangeText={setNewDeptDescription}
                        placeholder="Description (optional)"
                        placeholderTextColor={colors.muted}
                        style={{ backgroundColor: colors.surface, color: colors.foreground }}
                        className="px-2 py-1 rounded mb-1"
                      />
                      <View className="flex-row gap-2 mt-1">
                        <TouchableOpacity
                          onPress={() => handleCreateDept(selectedDepartmentId ?? 0)}
                          style={{ backgroundColor: colors.primary }}
                          className="px-3 py-1 rounded"
                        >
                          <Text className="text-background font-semibold text-center">Add</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setShowCreateDepartment(false);
                            setNewDepartmentName("");
                            setNewDeptDescription("");
                          }}
                          style={{ backgroundColor: colors.border }}
                          className="px-3 py-1 rounded"
                        >
                          <Text className="text-foreground font-semibold text-center">Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
                {/* Team Selector */}
                <View className="flex-row items-center mb-1">
                  <Text className="text-foreground font-semibold">Team</Text>
                  <TouchableOpacity onPress={() => setShowCreateTeam(true)} className="ml-2">
                    <Text style={{ color: colors.primary, fontSize: 18 }}>+</Text>
                  </TouchableOpacity>
                </View>
                <View className="mb-3">
                  {allTeams?.length ? (
                    allTeams.map((t: any) => (
                      <TouchableOpacity
                        key={t.id}
                        onPress={() => setSelectedTeamId(t.id)}
                        style={{ backgroundColor: selectedTeamId === t.id ? colors.primary + '20' : 'transparent' }}
                        className="px-2 py-1 rounded mb-1"
                      >
                        <Text style={{ color: colors.foreground }}>{t.name}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text className="text-muted">No teams found</Text>
                  )}
                  {showCreateTeam && (
                    <View className="mt-2">
                      <TextInput
                        value={newTeamName}
                        onChangeText={setNewTeamName}
                        placeholder="New Team Name"
                        placeholderTextColor={colors.muted}
                        style={{ backgroundColor: colors.surface, color: colors.foreground }}
                        className="px-2 py-1 rounded mb-1"
                      />
                      <TextInput
                        value={newTeamDescription}
                        onChangeText={setNewTeamDescription}
                        placeholder="Description (optional)"
                        placeholderTextColor={colors.muted}
                        style={{ backgroundColor: colors.surface, color: colors.foreground }}
                        className="px-2 py-1 rounded mb-1"
                      />
                      <View className="flex-row gap-2 mt-1">
                        <TouchableOpacity
                          onPress={() => handleCreateTeam(selectedTeamId ?? 0)}
                          style={{ backgroundColor: colors.primary }}
                          className="px-3 py-1 rounded"
                        >
                          <Text className="text-background font-semibold text-center">Add</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setShowCreateTeam(false);
                            setNewTeamName("");
                            setNewTeamDescription("");
                          }}
                          style={{ backgroundColor: colors.border }}
                          className="px-3 py-1 rounded"
                        >
                          <Text className="text-foreground font-semibold text-center">Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
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

                {divisions?.map((division: any) => (
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
                            onPress={handleUpdateCompany}
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

                        {departments?.map((dept: any) => (
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
                                <TouchableOpacity onPress={() => setEditingDeptId(dept.id)} className="ml-2">
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

                                {teams?.map((team: any) => (
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
