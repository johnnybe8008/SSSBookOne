import { TextInput, FlatList, ScrollView, Modal, Alert, Linking, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/use-colors';
import { useAuth } from '@/hooks/use-auth';
import { ScreenContainer } from '../components/screen-container';
import type { Organization, StaffDepartment, Team } from '../drizzle/schema';

export default function AdminOrganizationsScreen() {
          // State for organization form data
          const [formData, setFormData] = useState({
            name: '',
            address: '',
            email: '',
            phone: '',
          });
        // State for form error
        const [formError, setFormError] = useState("");
      // State for organization search
      const [searchQuery, setSearchQuery] = useState("");
    // State for currently editing organization
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const colors = useColors();
  const { staff } = useAuth();
  const utils = trpc.useUtils();
  const router = useRouter();
  // ...existing code...

  // State for selected team name (fixes missing setSelectedTeamName)
  const [selectedTeamName, setSelectedTeamName] = useState<string>("");

  // ...existing code...
  // ...existing code...

  // Place this block after allTeamsGlobal, allTeams, and setSelectedTeamName are declared
  // Render team list after hooks are initialized, using useMemo for safety
  const renderTeamList = () => {
    let teamListContent = null;
    try {
      const safeAllTeamsGlobal: any[] = Array.isArray(allTeamsGlobal) ? allTeamsGlobal : [];
      const safeAllTeams: any[] = Array.isArray(allTeams) ? allTeams : [];
      const allTeamNames: string[] = safeAllTeamsGlobal.map((t: any) => t.name);
      const uniqueTeamNames: string[] = Array.from(new Set(allTeamNames));
      const assignedTeamNames: string[] = safeAllTeams
        .filter((t: any) => t.staffDepartmentId === selectedDeptId)
        .map((t: any) => t.name);
      // Filter out assigned teams and match search
      const filteredTeamNames: string[] = uniqueTeamNames.filter(
        (name: string) =>
          !assignedTeamNames.includes(name) &&
          (!teamSearch || name.toLowerCase().includes(teamSearch.toLowerCase()))
      );
      if (filteredTeamNames.length === 0) {
        teamListContent = (
          <Text style={{ color: '#888', padding: 12 }}>No teams found.</Text>
        );
      } else {
        teamListContent = filteredTeamNames.map((name: string) => (
          <TouchableOpacity
            key={name}
            style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}
            onPress={() => setSelectedTeamName(name)}
          >
            <Text style={{ fontSize: 16 }}>{name}</Text>
          </TouchableOpacity>
        ));
      }
    } catch (e) {
      teamListContent = <Text style={{ color: '#888', padding: 12 }}>Loading teams...</Text>;
    }
    return <ScrollView>{teamListContent}</ScrollView>;
  };
  // ...existing code...

  // State for new department name input
  const [newDeptName, setNewDeptName] = useState("");

  // State for department modal visibility
  const [addDeptModalVisible, setAddDeptModalVisible] = useState(false);
  // State for department error
  const [addDeptError, setAddDeptError] = useState("");

  // Team delete mutation
  const removeTeamMutation = trpc.teams.delete.useMutation({
    onSuccess: () => {
      utils?.teams?.list?.invalidate?.();
    },
    onError: (err) => {
      Alert.alert("Error", err.message || "Failed to remove team");
    },
  });

  // Handler for removing a team
  const handleRemoveTeam = (teamId: number, teamName: string) => {
    const msg = `Are you sure you want to remove the team "${teamName}"?`;
    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm(msg)) {
        try {
          console.log('Calling removeTeamMutation.mutate', { id: teamId });
          removeTeamMutation.mutate({ id: teamId });
        } catch (err) {
          console.error("Mutation error", err);
        }
      }
    } else {
      Alert.alert(
        "Remove Team",
        msg,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => {
              console.log("Triggering team delete mutation", teamId);
              Alert.alert("Debug", `Deleting team ${teamId}`);
              removeTeamMutation.mutate({ id: teamId });
            },
          },
        ]
      );
    }
  };
  const [addTeamModalVisible, setAddTeamModalVisible] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [teamSearch, setTeamSearch] = useState("");
  const [newTeamError, setNewTeamError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const addDepartmentMutation = trpc.staffDepartments.create.useMutation({
    onSuccess: () => {
      setAddDeptModalVisible(false);
      setNewDeptName("");
      setAddDeptError("");
      utils?.staffDepartments?.list?.invalidate?.();
      utils?.staffDepartments?.all?.invalidate?.();
    },
    onError: (err) => setAddDeptError(err.message || "Failed to add department"),
  });

  const removeDepartmentMutation = trpc.staffDepartments.delete.useMutation({
    onSuccess: () => {
      utils?.staffDepartments?.list?.invalidate?.();
      utils?.staffDepartments?.all?.invalidate?.();
      utils?.teams?.list?.invalidate?.();
    },
    onError: (err) => {
      console.error('[removeDepartmentMutation] error', err);
      Alert.alert("Error", err.message || "Failed to remove department");
    },
  });

  const addTeamMutation = trpc.teams.create.useMutation({
    onSuccess: () => {
      setTeamSearch("");
      setNewTeamError("");
      setAddTeamModalVisible(false);
      utils?.teams?.list?.invalidate?.();
    },
    onError: (err) => setNewTeamError(err.message || "Failed to add team"),
  });

  const {
    data: organizations = [],
    isLoading: orgsLoading,
    isError: orgsError,
    error: orgsErrorObj
  } = trpc.organizations.list.useQuery();
  const filteredOrgs = (organizations ?? []).filter((org: Organization) =>
    org.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { data: allDepartments = [] } = trpc.staffDepartments.list.useQuery(
    editingOrg?.id ? { organizationId: Number(editingOrg.id) } : { organizationId: -1 },
    { enabled: !!editingOrg?.id }
  );
  const { data: allDepartmentsGlobal = [] } = trpc.staffDepartments.all.useQuery();
  // Fetch all teams for all orgs for unique team name listing in Add Team modal
  const { data: allTeamsGlobal = [] } = trpc.teams.list.useQuery({});
  // Fetch teams for the current org for department display
  const { data: allTeams = [] } = trpc.teams.list.useQuery(
    editingOrg?.id ? { organizationId: Number(editingOrg.id) } : { organizationId: 0 },
    { enabled: !!editingOrg?.id }
  );

  // Handlers
  const handleAssignDepartment = (dept: StaffDepartment) => {
    if (!editingOrg?.id || !staff?.id) {
      setAddDeptError("Missing organization or staff context");
      return;
    }
    addDepartmentMutation.mutate({
      name: dept.name,
      organizationId: Number(editingOrg.id),
      createdBy: staff.id,
      updatedBy: staff.id,
    });
  };

  const handleAddDepartment = () => {
    setAddDeptModalVisible(true);
    setNewDeptName("");
    setAddDeptError("");
  };

  const handleDeptSave = () => {
    if (!newDeptName.trim()) {
      setAddDeptError("Department name is required");
      return;
    }
    if (!editingOrg?.id || !staff?.id) {
      setAddDeptError("Missing organization or staff context");
      return;
    }
    addDepartmentMutation.mutate({
      name: newDeptName,
      organizationId: Number(editingOrg.id),
      createdBy: staff.id,
      updatedBy: staff.id,
    });
  };

  const handleRemoveDepartment = (deptId: number) => {
    Alert.alert("Debug", `handleRemoveDepartment called for department ${deptId}`);
    Alert.alert("Debug", "About to show confirmation dialog for department " + deptId);
    const dept = (allDepartments ?? []).find((d: StaffDepartment) => d.id === deptId);
    const teamsInDept = (allTeams ?? []).filter((t: Team) => t.staffDepartmentId === deptId);
    const deptName = dept?.name || "this department";
    const teamCount = teamsInDept.length;
    let warningMsg = `Are you sure you want to remove ${deptName}?`;
    if (teamCount > 0) {
      warningMsg += `\n\nWarning: This will also delete ${teamCount} team${teamCount > 1 ? 's' : ''} within this department.`;
    }
    // Use window.confirm on web, Alert.alert on native
    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm(warningMsg)) {
        try {
          console.log('Calling removeDepartmentMutation.mutate', { id: deptId, organizationId: editingOrg?.id });
          removeDepartmentMutation.mutate({ id: deptId, organizationId: editingOrg?.id });
        } catch (err) {
          console.error("Mutation error", err);
        }
      }
    } else {
      Alert.alert(
        "Remove Department",
        warningMsg,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => {
              console.log("Triggering department delete mutation", deptId);
              Alert.alert("Debug", `Deleting department ${deptId}`);
              try {
                console.log('Calling removeDepartmentMutation.mutate', { id: deptId, organizationId: editingOrg?.id });
                removeDepartmentMutation.mutate({ id: deptId, organizationId: editingOrg?.id });
              } catch (err) {
                console.error("Mutation error", err);
              }
            },
          },
        ]
      );
    }
  };

  const handleOrgPress = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name || '',
      address: org.address || '',
      email: org.email || '',
      phone: org.phone || '',
    });
    setModalVisible(true);
  };

  const handleFormSubmit = () => {
    if (!formData.name.trim()) {
      setFormError("Name is required");
      return;
    }
    if (!formData.phone.trim()) {
      setFormError("Phone number is required");
      return;
    }
    if (!staff?.id) {
      setFormError("Staff authentication required");
      return;
    }
    // TODO: Implement updateOrg and createOrg mutations
    setModalVisible(false);
  };

  // Organization delete mutation
  const removeOrganizationMutation = trpc.organizations.delete.useMutation({
    onSuccess: () => {
      utils?.organizations?.list?.invalidate?.();
      setModalVisible(false);
      setEditingOrg(null);
    },
    onError: (err) => {
      Alert.alert("Error", err.message || "Failed to remove organization");
    },
  });

  // Handler for removing an organization
  const handleRemoveOrganization = (orgId: number, orgName: string) => {
    const msg = `Are you sure you want to delete the organization "${orgName}"?\n\nThis will also delete all departments and teams for this organization.`;
    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm(msg)) {
        try {
          removeOrganizationMutation.mutate({ id: orgId });
        } catch (err) {
          console.error("Mutation error", err);
        }
      }
    } else {
      Alert.alert(
        "Delete Organization",
        msg,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              removeOrganizationMutation.mutate({ id: orgId });
            },
          },
        ]
      );
    }
  };

  // --- UI rendering starts here ---
  return (
    <ScreenContainer>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Staff Organizations</Text>
        <TouchableOpacity
          onPress={() => {
            setEditingOrg(null);
            setFormData({ name: '', address: '', email: '', phone: '' });
            setModalVisible(true);
          }}
        >
          <Text style={styles.headerIcon}>+</Text>
        </TouchableOpacity>
      </View>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={{ backgroundColor: '#f5f5f5', borderRadius: 12, padding: 12, fontSize: 16 }}
          placeholder="Search organizations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#aaa"
        />
      </View>
      {orgsLoading ? (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Text style={{ color: '#888', fontSize: 18 }}>Loading organizations...</Text>
        </View>
      ) : orgsError ? (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Text style={{ color: '#d32f2f', fontSize: 18 }}>Error loading organizations</Text>
          <Text style={{ color: '#d32f2f', fontSize: 14 }}>{orgsErrorObj?.message || 'Unknown error'}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrgs}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                onPress={() => handleOrgPress(item)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  minHeight: 80,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderColor: '#eee',
                  backgroundColor: '#fff',
                }}
                activeOpacity={0.8}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 2 }}>{item.name}</Text>
                  <Text style={{ color: '#666', fontSize: 14, marginBottom: 2 }}>
                    {item.address ? item.address.split("\n")[0] : "No address"}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Text
                      style={{ color: colors.primary, marginRight: 12, textDecorationLine: 'underline' }}
                      onPress={() => {
                        if (item.email) Linking.openURL('mailto:' + item.email);
                      }}
                    >
                      {item.email || 'No email'}
                    </Text>
                    <Text
                      style={{ color: colors.primary, textDecorationLine: 'underline' }}
                      onPress={() => {
                        if (item.phone) Linking.openURL('tel:' + item.phone);
                      }}
                    >
                      {item.phone || 'No phone'}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 28, color: colors.primary || '#007bff', fontWeight: 'bold', marginLeft: 8 }}>{'>'}</Text>
              </TouchableOpacity>
            );
          }}
          style={{ flex: 1 }}
          ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>No organizations found.</Text>}
        />
      )}
      {/* Add/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          {/* Modal Header Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.primary }}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 18, color: '#222', textAlign: 'center' }}>Update organization information</Text>
            <View style={{ width: 28 }} />
          </View>
          {formError ? <Text style={{ color: '#d32f2f', fontSize: 16, marginBottom: 12 }}>{formError}</Text> : null}
          {/* Name */}
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>Name *</Text>
          <TextInput
            style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 }}
            placeholder="Name *"
            value={formData.name}
            onChangeText={text => setFormData({ ...formData, name: text })}
            placeholderTextColor={colors.muted}
          />
          {/* Address */}
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>Address</Text>
          <TextInput
            style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 }}
            placeholder="Address"
            value={formData.address}
            onChangeText={(text: string) => setFormData({ ...formData, address: text })}
            placeholderTextColor={colors.muted}
            multiline
          />
          {/* Email */}
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>Email</Text>
          <TextInput
            style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 }}
            placeholder="Email"
            value={formData.email}
            onChangeText={(text: string) => setFormData({ ...formData, email: text })}
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {/* Phone */}
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>Phone *</Text>
          <TextInput
            style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 }}
            placeholder="Phone *"
            value={formData.phone}
            onChangeText={(text: string) => setFormData({ ...formData, phone: text })}
            placeholderTextColor={colors.muted}
            keyboardType="phone-pad"
          />
          {/* Departments */}
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>Departments</Text>
          {/* Departments listed horizontally, each with nested teams below */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              {Array.from(new Set((allDepartments ?? []).map((d: any) => d.id)))
                .map((deptId) => {
                  const dept = (allDepartments ?? []).find((d: any) => d.id === deptId);
                  if (!dept) return null;
                  return (
                    <View key={dept.id} style={{ marginRight: 24, alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 4 }}>
                        <Text style={{ color: '#333', marginRight: 4 }}>{dept.name}</Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveDepartment(dept.id)}
                        >
                          <Text style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: 16 }}>×</Text>
                        </TouchableOpacity>
                      </View>
                      {/* Teams for this department, listed vertically and left-aligned */}
                      <View style={{ marginTop: 4, alignItems: 'flex-start' }}>
                        {(allTeams ?? []).filter((team: Team) => team.staffDepartmentId === dept.id).length === 0 ? (
                          <Text style={{ color: '#888', fontStyle: 'italic' }}>No teams</Text>
                        ) : (
                          (allTeams ?? [])
                            .filter((team: Team) => team.staffDepartmentId === dept.id)
                            .map((team: Team) => (
                              <View key={team.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 4, marginRight: 0 }}>
                                <Text style={{ color: '#333', marginRight: 4 }}>{team.name}</Text>
                                <TouchableOpacity
                                  onPress={() => handleRemoveTeam(team.id, team.name)}
                                >
                                  <Text style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: 16 }}>×</Text>
                                </TouchableOpacity>
                              </View>
                            ))
                        )}
                      </View>
                    </View>
                  );
                })}
              {(allDepartments ?? []).length === 0 && (
                <Text style={{ color: '#888', fontStyle: 'italic', paddingHorizontal: 12, paddingVertical: 4, backgroundColor: '#eee', borderRadius: 16 }}>
                  No departments assigned
                </Text>
              )}
            </View>
          </ScrollView>

          {/* Add Department Button */}
          <View style={{ marginBottom: 8 }}>
            <TouchableOpacity
              style={{ backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, alignSelf: 'flex-start' }}
              onPress={handleAddDepartment}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Add Department</Text>
            </TouchableOpacity>
          </View>
          {/* Add Team Button below Add Department */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <TouchableOpacity
              onPress={() => setAddTeamModalVisible(true)}
              style={{ backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, alignSelf: 'flex-start' }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Add Team</Text>
            </TouchableOpacity>
          </View>
          {/* Department Selector Modal */}
          <Modal
            visible={addDeptModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setAddDeptModalVisible(false)}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '90%', maxHeight: '80%' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Add Department</Text>
                {/* Search input for departments */}
                <TextInput
                  style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12 }}
                  placeholder="Search departments..."
                  value={newDeptName}
                  onChangeText={setNewDeptName}
                  placeholderTextColor={colors.muted}
                />
                {/* List of filtered departments (always scrollable) */}
                <View style={{ maxHeight: 300, marginBottom: 12, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f5f8fa' }}>
                  <ScrollView>
                    {(() => {
                      const assignedNames = new Set((allDepartments ?? []).map((d: any) => d.name));
                      const filteredDepts = (allDepartmentsGlobal ?? [])
                        .filter((dept: any, idx: number, arr: any[]) =>
                          arr.findIndex(d => d.name === dept.name) === idx &&
                          !assignedNames.has(dept.name) &&
                          dept.name.toLowerCase().includes(newDeptName.toLowerCase())
                        );
                      if (filteredDepts.length === 0 && newDeptName.trim() !== '') {
                        return (
                          <Text style={{ color: '#888', fontStyle: 'italic', paddingHorizontal: 12, paddingVertical: 4 }}>
                            No matching departments. Enter a new name to create.
                          </Text>
                        );
                      }
                      return filteredDepts.map((dept: any) => (
                        <TouchableOpacity
                          key={dept.id}
                          style={{ backgroundColor: '#cce5ff', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 6, marginHorizontal: 8 }}
                          onPress={() => {
                            handleAssignDepartment(dept);
                            setAddDeptModalVisible(false);
                            setNewDeptName('');
                          }}
                        >
                          <Text style={{ color: '#007bff' }}>{dept.name}</Text>
                        </TouchableOpacity>
                      ));
                    })()}
                  </ScrollView>
                </View>
                {/* Option to create new department if not found */}
                {newDeptName.trim() !== '' &&
                  !(allDepartmentsGlobal ?? []).some((dept: any) => dept.name.toLowerCase() === newDeptName.trim().toLowerCase()) && (
                    <TouchableOpacity
                      onPress={() => {
                        handleDeptSave();
                        setAddDeptModalVisible(false);
                      }}
                      style={{ backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, marginTop: 8 }}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Create "{newDeptName.trim()}"</Text>
                    </TouchableOpacity>
                )}
                {/* Cancel button */}
                <TouchableOpacity onPress={() => { setAddDeptModalVisible(false); setNewDeptName(''); }} style={{ marginTop: 16 }}>
                  <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          {/* Teams for each department, above Add Team button */}
          {/* Only horizontal department/team list remains above */}
          {/* Add Team Modal */}
          <Modal
            visible={addTeamModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setAddTeamModalVisible(false)}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '90%', maxHeight: '80%' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Add Team</Text>
                {/* Department dropdown */}
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>Select Department</Text>
                <View style={{ marginBottom: 16 }}>
                  <ScrollView style={{ maxHeight: 120 }}>
                    {(allDepartments ?? []).map((dept: any) => (
                      <TouchableOpacity
                        key={dept.id}
                        style={{ backgroundColor: selectedDeptId === dept.id ? colors.primary : '#eee', borderRadius: 8, padding: 10, marginBottom: 6 }}
                        onPress={() => setSelectedDeptId(dept.id)}
                      >
                        <Text style={{ color: selectedDeptId === dept.id ? '#fff' : '#333' }}>{dept.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                {/* Team selector placeholder */}
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>Select or Create Team</Text>
                <TextInput
                  style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12 }}
                  placeholder="Search teams..."
                  value={teamSearch}
                  onChangeText={setTeamSearch}
                  placeholderTextColor={colors.muted}
                />
                <View style={{ maxHeight: 200, marginBottom: 12, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f5f8fa' }}>
                  <ScrollView>
                    {(() => {
                      // Unique team names across all orgs, excluding those already in the selected department
                      const allTeamNames: string[] = (allTeamsGlobal ?? []).map((t: any) => t.name);
                      const uniqueTeamNames: string[] = Array.from(new Set(allTeamNames));
                      const assignedTeamNames: string[] = (allTeams ?? [])
                        .filter((t: any) => t.staffDepartmentId === selectedDeptId)
                        .map((t: any) => t.name);
                      // Explicitly type filteredTeams as string[]
                      const filteredTeams: string[] = uniqueTeamNames.filter((name: string) =>
                        typeof name === 'string' &&
                        !assignedTeamNames.includes(name) &&
                        name.toLowerCase().includes(teamSearch.toLowerCase())
                      );
                      if (filteredTeams.length === 0 && teamSearch.trim() !== "") {
                        return (
                          <Text style={{ color: '#888', fontStyle: 'italic', paddingHorizontal: 12, paddingVertical: 4 }}>
                            No matching teams. Enter a new name to create.
                          </Text>
                        );
                      }
                      return (filteredTeams as string[]).map((name: string) => (
                        <TouchableOpacity
                          key={name}
                          style={{ backgroundColor: '#cce5ff', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 6, marginHorizontal: 8 }}
                          onPress={() => {
                            if (!selectedDeptId) {
                              setNewTeamError("Please select a department before creating a team.");
                              return;
                            }
                            addTeamMutation.mutate({
                              organizationId: editingOrg?.id ? Number(editingOrg.id) : 0,
                              staffDepartmentId: selectedDeptId!,
                              name,
                              createdBy: staff?.id!,
                              updatedBy: staff?.id!,
                            } as any);
                          }}
                        >
                          <Text style={{ color: '#007bff' }}>{name}</Text>
                        </TouchableOpacity>
                      ));
                    })()}
                  </ScrollView>
                </View>
                {teamSearch.trim() !== '' &&
                  !(allTeams ?? []).some((team: any) => team.name.toLowerCase() === teamSearch.trim().toLowerCase()) && (
                    <TouchableOpacity
                      onPress={() => {
                        if (!selectedDeptId) {
                          setNewTeamError("Please select a department before creating a team.");
                          return;
                        }
                          addTeamMutation.mutate({
                            organizationId: editingOrg?.id ? Number(editingOrg.id) : 0,
                            staffDepartmentId: selectedDeptId!,
                            name: teamSearch.trim(),
                            createdBy: staff?.id!,
                            updatedBy: staff?.id!,
                          } as any);
                      }}
                      style={{ backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, marginTop: 8 }}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Create "{teamSearch.trim()}"</Text>
                    </TouchableOpacity>
                )}
                {newTeamError ? <Text style={{ color: '#d32f2f', marginTop: 8 }}>{newTeamError}</Text> : null}
                {/* Cancel button */}
                <TouchableOpacity onPress={() => { setAddTeamModalVisible(false); setTeamSearch(''); }} style={{ marginTop: 16 }}>
                  <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          {/* Save button */}
          <TouchableOpacity
            onPress={handleFormSubmit}
            style={{ backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 14, marginTop: 24, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Save</Text>
          </TouchableOpacity>
          {editingOrg && (
            <TouchableOpacity
              onPress={() => handleRemoveOrganization(editingOrg.id, editingOrg.name)}
              style={{
                backgroundColor: '#d32f2f',
                borderRadius: 8,
                paddingVertical: 14,
                marginTop: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Delete Organization</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerIcon: {
    fontSize: 28,
    fontWeight: "bold",
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  searchBarContainer: {
    paddingHorizontal: 16,
  }
});