import { TextInput, FlatList, ScrollView, Modal, Alert, Linking, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useRef } from 'react';
import { useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/use-colors';
import { useAuth } from '@/hooks/use-auth';
import { ScreenContainer } from '../components/screen-container';
import type { Organization, StaffDepartment, Team } from '../drizzle/schema';

export default function AdminOrganizationsScreen() {
      // State for organization form data
      const [formData, setFormData] = useState({ name: '', address: '', email: '', phone: '' });
    // State for form error
    const [formError, setFormError] = useState("");
  // Theme colors
  const colors = useColors();
  // State for add/edit modal visibility
  const [modalVisible, setModalVisible] = useState(false);
  // State for organization search
  const [searchQuery, setSearchQuery] = useState("");
  // State for currently editing organization
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  // Track if we are in create mode (no editingOrg)
  const isCreateMode = !editingOrg;
  // Local staging for departments and teams
  const [pendingDepartments, setPendingDepartments] = useState<any[]>([]);
  const [pendingTeams, setPendingTeams] = useState<any[]>([]);
  // State for selected departments in modal
  const [selectedDeptNames, setSelectedDeptNames] = useState<string[]>([]);
  // State for new department name input
  const [newDeptName, setNewDeptName] = useState("");
  // State for department modal visibility
  const [addDeptModalVisible, setAddDeptModalVisible] = useState(false);

  // Place useEffect at top-level scope
  useEffect(() => {
    if (addDeptModalVisible) {
      setSelectedDeptNames((pendingDepartments ?? []).map((d: any) => d.name));
    }
  }, [addDeptModalVisible, pendingDepartments]);
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
    if (isCreateMode) {
      setPendingDepartments((prev) => {
        // Prevent duplicates by name
        if (prev.some((d) => d.name === dept.name)) return prev;
        return [...prev, { name: dept.name, teams: [] }];
      });
    } else {
      if (!editingOrg?.id || !staff?.id) {
        setAddDeptError("Missing organization or staff context");
        return;
      }
        addDepartmentMutation.mutate({
          name: dept.name,
          organizationId: Number(editingOrg.id),
          createdBy: staff?.id,
          updatedBy: staff?.id,
      });
    }
  };

  const handleAddDepartment = () => {
    // Preselect departments from pendingDepartments in create mode, allDepartments in edit mode
    if (isCreateMode) {
      setSelectedDeptNames((pendingDepartments ?? []).map((d: any) => d.name));
    } else {
      setSelectedDeptNames((allDepartments ?? []).map((d: any) => d.name));
    }
    setAddDeptModalVisible(true);
    setNewDeptName("");
    setAddDeptError("");
  };

  // Save department to local state (staging)
  const handleDeptSave = () => {
    console.log('[DEBUG] handleDeptSave called', { newDeptName, pendingDepartments });
    if (!newDeptName.trim()) {
      setAddDeptError("Department name is required");
      return;
    }
    // Only add to local state in create mode
    if (isCreateMode) {
      setPendingDepartments((prev) => {
        const next = [...prev, { name: newDeptName, teams: [] }];
        console.log('[DEBUG] pendingDepartments after add', next);
        return next;
      });
      setTimeout(() => {
        setAddDeptModalVisible(false);
        setNewDeptName("");
        setAddDeptError("");
      }, 0);
    } else {
      // Existing org: use backend mutation
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
    }
  };

  const handleRemoveDepartment = (deptIdOrName: number | string) => {
    if (isCreateMode) {
      setPendingDepartments((prev) => prev.filter((d, idx) => (typeof deptIdOrName === 'number' ? idx !== deptIdOrName : d.name !== deptIdOrName)));
    } else {
      // Existing org: use backend mutation
      Alert.alert("Debug", `handleRemoveDepartment called for department ${deptIdOrName}`);
      Alert.alert("Debug", "About to show confirmation dialog for department " + deptIdOrName);
      const dept = (allDepartments ?? []).find((d: StaffDepartment) => d.id === deptIdOrName);
      const teamsInDept = (allTeams ?? []).filter((t: Team) => t.staffDepartmentId === deptIdOrName);
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
            console.log('Calling removeDepartmentMutation.mutate', { id: deptIdOrName, organizationId: editingOrg?.id });
            removeDepartmentMutation.mutate({ id: deptIdOrName, organizationId: editingOrg?.id });
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
                console.log("Triggering department delete mutation", deptIdOrName);
                Alert.alert("Debug", `Deleting department ${deptIdOrName}`);
                try {
                  console.log('Calling removeDepartmentMutation.mutate', { id: deptIdOrName, organizationId: editingOrg?.id });
                  removeDepartmentMutation.mutate({ id: deptIdOrName, organizationId: editingOrg?.id });
                } catch (err) {
                  console.error("Mutation error", err);
                }
              },
            },
          ]
        );
      }
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

  // Ensure pendingDepartments is initialized after allTeams, allDepartments, and editingOrg are loaded
  useEffect(() => {
    if (editingOrg && allDepartments && allTeams) {
      setPendingDepartments((allDepartments ?? []).map((d: any) => ({
        id: d.id,
        name: d.name,
        teams: (allTeams ?? []).filter((t: any) => t.staffDepartmentId === d.id)
      })));
    }
  }, [editingOrg, allDepartments, allTeams]);

  // Add debug logging and visible error/status output
  const createOrgMutation = trpc.organizations.create.useMutation({
    onSuccess: (data) => {
      console.log('[CREATE ORG SUCCESS]', data);
      setModalVisible(false);
      setTimeout(() => {
        console.log('[DEBUG] After setModalVisible(false), modalVisible =', modalVisible);
      }, 100);
      console.log('[DEBUG] setModalVisible(false) called after org create');
      setEditingOrg(null);
      setFormData({ name: '', address: '', email: '', phone: '' });
      setFormError('');
      setSearchQuery("");
      utils?.organizations?.list?.invalidate?.();
    },
    onError: (err) => {
      console.error('[CREATE ORG ERROR]', err);
      setFormError(err.message || 'Failed to add organization');
    },
  });

  // Update mutations should be declared as top-level hooks
  const updateOrgMutation = trpc.organizations.update.useMutation({
    onSuccess: (data) => {
      console.log('[UPDATE ORG SUCCESS]', data);
      setModalVisible(false);
      setEditingOrg(null);
      setFormData({ name: '', address: '', email: '', phone: '' });
      setFormError('');
      setSearchQuery("");
      utils?.organizations?.list?.invalidate?.();
    },
    onError: (err) => {
      console.error('[UPDATE ORG ERROR]', err);
      setFormError(err.message || 'Failed to update organization');
    },
  });
  const updateDepartmentMutation = trpc.staffDepartments.update.useMutation({
    onSuccess: () => {
      utils?.staffDepartments?.list?.invalidate?.();
      utils?.staffDepartments?.all?.invalidate?.();
    },
    onError: (err) => setAddDeptError(err.message || 'Failed to update department'),
  });
  const updateTeamMutation = trpc.teams.update.useMutation({
    onSuccess: () => {
      utils?.teams?.list?.invalidate?.();
    },
    onError: (err) => setNewTeamError(err.message || 'Failed to update team'),
  });
  const handleFormSubmit = async () => {
    console.log('[DEBUG] Save button pressed', formData, pendingDepartments, pendingTeams);
    if (!formData.name.trim()) {
      setFormError("Name is required");
      return;
    }
    if (!formData.phone.trim()) {
      setFormError("Phone number is required");
      return;
    }
    // Session check before any mutation
    if (!staff?.id) {
      setFormError("Session expired. Please log in again.");
      return;
    }
    // Debug: Log cookies and fetch options before mutation
    console.log('[DEBUG] document.cookie before mutation:', document.cookie);
    if (typeof window !== 'undefined' && window.fetch) {
      const originalFetch = window.fetch;
      window.fetch = function(input, init) {
        console.log('[DEBUG] fetch called:', input, init);
        return originalFetch.apply(this, arguments);
      };
    }
    // Add a short delay before triggering mutation to allow cookies to re-attach
    await new Promise(resolve => setTimeout(resolve, 100));
    try {
      if (editingOrg) {
        // --- EDIT FLOW IMPLEMENTATION ---
        // 1. Update organization
        await updateOrgMutation.mutateAsync({
          id: editingOrg.id,
          ...formData,
          updatedBy: staff.id,
        });
        // 2. Update departments
        for (const dept of allDepartments) {
          await updateDepartmentMutation.mutateAsync({
            id: dept.id,
            name: dept.name,
            organizationId: editingOrg.id,
            updatedBy: staff.id,
          });
        }
        // 3. Update teams
        for (const team of allTeams) {
          await updateTeamMutation.mutateAsync({
            id: team.id,
            name: team.name,
            staffDepartmentId: team.staffDepartmentId,
            organizationId: editingOrg.id,
            updatedBy: staff.id,
          });
        }
        setModalVisible(false);
        setEditingOrg(null);
        setFormData({ name: '', address: '', email: '', phone: '' });
        setFormError('');
        setSearchQuery("");
        utils?.organizations?.list?.invalidate?.();
        return;
      }
      // --- ADD FLOW ---
      // 1. Create org, then 2. create departments, then 3. create teams
      await new Promise<void>(async (resolve, reject) => {
        try {
          await createOrgMutation.mutateAsync({ ...formData, createdBy: staff.id, updatedBy: staff.id });
        } catch (err: any) {
          console.error('[CREATE ORG ERROR]', err);
          setFormError(err.message || 'Failed to add organization');
          reject(err);
          return;
        }
        try {
          const orgId = createOrgMutation.data?.insertId || createOrgMutation.data?.id;
          for (const dept of pendingDepartments) {
            if (!staff?.id) throw new Error('Session expired during department creation.');
            console.log('[DEBUG] Creating department:', dept);
            try {
              await addDepartmentMutation.mutateAsync({
                name: dept.name,
                organizationId: orgId,
                createdBy: staff.id,
                updatedBy: staff.id,
              });
            } catch (err: any) {
              console.error('[ERROR DURING DEPARTMENT SAVE]', err);
              setFormError(err.message || 'Failed to save department.');
              reject(err);
              return;
            }
            const deptId = addDepartmentMutation.data?.insertId || addDepartmentMutation.data?.id;
            for (const team of dept.teams || []) {
              if (!staff?.id) throw new Error('Session expired during team creation.');
              console.log('[DEBUG] Creating team:', team);
              try {
                await addTeamMutation.mutateAsync({
                  name: team.name,
                  staffDepartmentId: deptId,
                  organizationId: orgId,
                  createdBy: staff.id,
                  updatedBy: staff.id,
                });
              } catch (err: any) {
                console.error('[ERROR DURING TEAM SAVE]', err);
                setFormError(err.message || 'Failed to save team.');
                reject(err);
                return;
              }
            }
          }
          setPendingDepartments([]);
          setPendingTeams([]);
          setModalVisible(false);
          setEditingOrg(null);
          setFormData({ name: '', address: '', email: '', phone: '' });
          setFormError('');
          setSearchQuery("");
          utils?.organizations?.list?.invalidate?.();
          resolve();
        } catch (err: any) {
          console.error('[ERROR DURING SAVE CYCLE]', err);
          setFormError(err.message || 'Failed to save organization, departments, or teams.');
          reject(err);
        }
      });
    } catch (err: any) {
      console.error('[SAVE CYCLE ERROR]', err);
      setFormError(err.message || 'Failed to save organization, departments, or teams.');
    }
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
        onRequestClose={() => {
          setModalVisible(false);
          setTimeout(() => {
            console.log('[DEBUG] After setModalVisible(false) (onRequestClose), modalVisible =', modalVisible);
          }, 100);
          console.log('[DEBUG] Modal onRequestClose triggered');
        }}
      >
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          {/* Modal Header Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.primary }}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 18, color: '#222', textAlign: 'center' }}>
              {isCreateMode ? 'Add New Staff Organization' : 'Update organization information'}
            </Text>
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
          {/* Debug: Show pendingDepartments and teams */}
          {/* Debug display of isCreateMode and editingOrg removed */}
          {/* Debug display of pendingDepartments removed */}
          {/* Departments listed horizontally, each with nested teams below */}
          {pendingDepartments.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                {pendingDepartments.map((dept: any, idx: number) => {
                  // Fix team display: always use dept.teams if present, otherwise filter allTeams
                  let deptTeams = dept.teams ?? [];
                  if (!deptTeams.length && allTeams && dept.id) {
                    deptTeams = allTeams.filter((team: any) => team.staffDepartmentId === dept.id);
                  }
                  return (
                    <View key={dept.id || dept.name || idx} style={{ marginRight: 24, alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 4 }}>
                        <Text style={{ color: '#333', marginRight: 4 }}>{dept.name}</Text>
                        {/* Removed red X and TouchableOpacity */}
                      </View>
                      {/* Teams for this department, listed vertically and left-aligned */}
                      <View style={{ marginTop: 4, alignItems: 'flex-start' }}>
                        {deptTeams.length === 0 ? (
                          <Text style={{ color: '#888', fontStyle: 'italic' }}>No teams</Text>
                        ) : (
                          deptTeams.map((team: any, tIdx: number) => (
                            <View key={team.id || team.name || tIdx} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 4, marginRight: 0 }}>
                              <Text style={{ color: '#333', marginRight: 4 }}>{team.name}</Text>
                            </View>
                          ))
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <Text style={{ color: '#888', fontStyle: 'italic', paddingHorizontal: 12, paddingVertical: 4, backgroundColor: '#eee', borderRadius: 16 }}>
              No departments assigned
            </Text>
          )}

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
                {/* Checkbox list of all departments, searchable */}
                <View style={{ maxHeight: 300, marginBottom: 12, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f5f8fa' }}>
                  <ScrollView>
                    {(() => {
                      // Unique department names, filtered by search
                      const uniqueDepts = (allDepartmentsGlobal ?? []).filter((dept: any, idx: number, arr: any[]) =>
                        arr.findIndex(d => d.name === dept.name) === idx
                      );
                      // Exclude departments already in Org if not editing
                      const excludeNames = (pendingDepartments ?? []).map((d: any) => d.name);
                      const filteredDepts = uniqueDepts.filter((dept: any) =>
                        dept.name.toLowerCase().includes(newDeptName.toLowerCase())
                        // If editing, show all; if creating, exclude already added
                        && (editingOrg ? true : !excludeNames.includes(dept.name))
                      );
                      if (filteredDepts.length === 0 && newDeptName.trim() !== '') {
                        return (
                          <Text style={{ color: '#888', fontStyle: 'italic', paddingHorizontal: 12, paddingVertical: 4 }}>
                            No matching departments.
                          </Text>
                        );
                      }
                      return filteredDepts.map((dept: any) => (
                        <TouchableOpacity
                          key={dept.id || dept.name}
                          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12 }}
                          onPress={() => {
                            setSelectedDeptNames((selected) =>
                              selected.includes(dept.name)
                                ? selected.filter((name) => name !== dept.name)
                                : [...selected, dept.name]
                            );
                          }}
                        >
                          <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: selectedDeptNames.includes(dept.name) ? colors.primary : '#ccc', backgroundColor: selectedDeptNames.includes(dept.name) ? colors.primary : '#fff', marginRight: 12, justifyContent: 'center', alignItems: 'center' }}>
                            {selectedDeptNames.includes(dept.name) && (
                              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>✓</Text>
                            )}
                          </View>
                          <Text style={{ fontSize: 16 }}>{dept.name}</Text>
                        </TouchableOpacity>
                      ));
                    })()}
                  </ScrollView>
                </View>
                {/* Done button to confirm selection */}
                <TouchableOpacity
                  onPress={() => {
                    // Replace local departments with selected
                    const newDepartments = selectedDeptNames.map((name) => {
                      // If department already exists, keep its teams
                      const existing = pendingDepartments.find((d) => d.name === name);
                      return existing ? existing : { name, teams: [] };
                    });
                    setPendingDepartments(newDepartments);
                    setAddDeptModalVisible(false);
                    setNewDeptName('');
                  }}
                  style={{ marginTop: 16 }}
                >
                  <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Done</Text>
                </TouchableOpacity>
                {/* Option to create new department if not found */}
                {newDeptName.trim() !== '' &&
                  !(allDepartmentsGlobal ?? []).some((dept: any) => dept.name.toLowerCase() === newDeptName.trim().toLowerCase()) && (
                    <TouchableOpacity
                      onPress={handleDeptSave}
                      style={{ backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, marginTop: 8 }}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Create "{newDeptName.trim()}"</Text>
                    </TouchableOpacity>
                )}
                {/* Cancel button */}
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
                    {(isCreateMode ? pendingDepartments : allDepartments)?.map((dept: any, idx: number) => (
                      <TouchableOpacity
                        key={dept.id || dept.name || idx}
                        style={{ backgroundColor: selectedDeptId === (dept.id ?? idx) ? colors.primary : '#eee', borderRadius: 8, padding: 10, marginBottom: 6 }}
                        onPress={() => setSelectedDeptId(dept.id ?? idx)}
                      >
                        <Text style={{ color: selectedDeptId === (dept.id ?? idx) ? '#fff' : '#333' }}>{dept.name}</Text>
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
                            if (selectedDeptId === null || selectedDeptId === undefined) {
                              setNewTeamError("Please select a department before creating a team.");
                              return;
                            }
                            if (isCreateMode) {
                              setPendingDepartments(prev => prev.map((dept, idx) =>
                                idx === selectedDeptId ? { ...dept, teams: [...(dept.teams || []), { name }] } : dept
                              ));
                              setTeamSearch("");
                              setNewTeamError("");
                              setAddTeamModalVisible(false);
                            } else {
                              addTeamMutation.mutate({
                                organizationId: editingOrg?.id ? Number(editingOrg.id) : 0,
                                staffDepartmentId: selectedDeptId!,
                                name,
                                createdBy: staff?.id!,
                                updatedBy: staff?.id!,
                              } as any);
                            }
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
                        if (selectedDeptId === null || selectedDeptId === undefined) {
                          setNewTeamError("Please select a department before creating a team.");
                          return;
                        }
                        if (isCreateMode) {
                          setPendingDepartments(prev => prev.map((dept, idx) =>
                            idx === selectedDeptId ? { ...dept, teams: [...(dept.teams || []), { name: teamSearch.trim() }] } : dept
                          ));
                          setTeamSearch("");
                          setNewTeamError("");
                          setAddTeamModalVisible(false);
                        } else {
                          addTeamMutation.mutate({
                            organizationId: editingOrg?.id ? Number(editingOrg.id) : 0,
                            staffDepartmentId: selectedDeptId!,
                            name: teamSearch.trim(),
                            createdBy: staff?.id!,
                            updatedBy: staff?.id!,
                          } as any);
                        }
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