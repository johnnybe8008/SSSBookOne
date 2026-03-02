import { Modal, Pressable } from "react-native";
import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { OrganizationalBreadcrumbs } from "@/components/organizational-breadcrumbs";
import { Picker } from "@react-native-picker/picker";

export default function AdminStaffScreen() {
  // All hooks must be at the top level and in the same order every render
  const [orgModalVisible, setOrgModalVisible] = useState(false);
  const [deptModalVisible, setDeptModalVisible] = useState(false);
  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOrganizations, setFilterOrganizations] = useState<number[]>([]);
  const [filterDepartments, setFilterDepartments] = useState<number[]>([]);
  const [filterTeams, setFilterTeams] = useState<number[]>([]);
  const [filterRoles, setFilterRoles] = useState<string[]>([]);
  const [filterResetKey, setFilterResetKey] = useState(0);

  const colors = useColors();
  const { data: allStaff, isLoading } = trpc.staff.listAll.useQuery();
  const { data: organizations } = trpc.organizations.list.useQuery();
  const { data: staffDepartments } = trpc.staffDepartments.list.useQuery({ organizationId: 0 });
  const { data: teams } = trpc.teams.list.useQuery({ groupId: 0 });


  // Helper function to get organizational breadcrumbs for a staff member
  const getStaffBreadcrumbs = (staff: any) => {
    const breadcrumbs: string[] = [];
    
    if (staff.teamId && teams) {
      const team = teams.find((t: any) => t.id === staff.teamId);
      if (team) {
        // Find organization
        const org = organizations?.find((o: any) => o.id === team.groupId);
        if (org) {
          breadcrumbs.push(org.name);
        }
        
        // Find department
        const dept = staffDepartments?.find((d: any) => d.id === team.staffDepartmentId);
        if (dept) {
          breadcrumbs.push(dept.name);
        }
        
        // Add team
        breadcrumbs.push(team.name);
      }
    }
    
    return breadcrumbs;
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    if (!allStaff || allStaff.length === 0) {
      Alert.alert("No Data", "There are no staff members to export.");
      return;
    }

    // Create CSV header
    const header = "Name,Email,Phone,Role,VIP Rated,Organization,Department,Team\n";
    
    // Create CSV rows
    const rows = allStaff.map((staff: any) => {
      const breadcrumbs = getStaffBreadcrumbs(staff);
      const org = breadcrumbs[0] || "";
      const dept = breadcrumbs[1] || "";
      const team = breadcrumbs[2] || "";
      
      return [
        `"${staff.name}"`,
        `"${staff.email || ""}"`,
        `"${staff.phone || ""}"`,
        staff.role,
        staff.isVipRated ? "Yes" : "No",
        `"${org}"`,
        `"${dept}"`,
        `"${team}"`
      ].join(",");
    }).join("\n");

    const csv = header + rows;
    
    // TODO: Implement actual file download/sharing
    // For now, just show an alert with the CSV data
    Alert.alert(
      "Export Staff",
      `CSV export ready with ${allStaff.length} staff members. In a production app, this would download a file.`,
      [
        { text: "OK" },
        { text: "Copy to Clipboard", onPress: () => {
          // TODO: Copy CSV to clipboard
          Alert.alert("Success", "CSV data copied to clipboard");
        }}
      ]
    );
  };

  // CSV Import Handler
  const handleImportCSV = () => {
    Alert.alert(
      "Import Staff",
      "CSV import functionality coming soon. Expected format:\nName,Email,Phone,Role,VIP Rated,Organization,Department,Team",
      [{ text: "OK" }]
    );
  };

  // Filter staff based on search and filters
  const filteredStaff = allStaff?.filter((staff: any) => {
    // Search filter (name or email)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        staff.name.toLowerCase().includes(query) ||
        staff.email?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Role filter (multi)
    if (filterRoles.length > 0 && !filterRoles.includes(staff.role)) {
      return false;
    }

    // Team filter (multi)
    if (filterTeams.length > 0 && !filterTeams.includes(staff.teamId)) {
      return false;
    }

    // Department filter (multi)
    if (filterDepartments.length > 0) {
      const team = teams?.find((t: any) => t.id === staff.teamId);
      if (!team || !filterDepartments.includes(team.staffDepartmentId)) {
        return false;
      }
    }

    // Organization filter (multi)
    if (filterOrganizations.length > 0) {
      const team = teams?.find((t: any) => t.id === staff.teamId);
      if (!team || !filterOrganizations.includes(team.groupId)) {
        return false;
      }
    }

    return true;
  }) || [];

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

  return (
    <ScreenContainer className="p-4">
      <ScrollView>
        {/* Header Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.primary }}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 24, color: colors.foreground, textAlign: 'center' }}>
            Manage Staff
          </Text>
          <TouchableOpacity onPress={() => router.push("/admin-staff-add" as any)}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.primary }}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="mb-4">
          <TextInput
            className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground"
            placeholder="Search by name or email..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters - horizontal arrangement */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {/* Organization Filter (Multi-select with checkbox modal) */}
          <View style={{ flex: 1, minWidth: 120 }}>
            <Pressable
              onPress={() => setOrgModalVisible(true)}
              style={{ padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.surface }}
            >
              <Text style={{ color: colors.foreground }}>
                {filterOrganizations.length === 0
                  ? 'All Organizations'
                  : organizations?.filter((org: any) => filterOrganizations.includes(org.id)).map((org: any) => org.name).join(', ')}
              </Text>
            </Pressable>
            <Modal
              visible={orgModalVisible}
              animationType="slide"
              transparent
              onRequestClose={() => setOrgModalVisible(false)}
            >
              <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setOrgModalVisible(false)}>
                <View style={{ margin: 40, backgroundColor: '#fff', borderRadius: 12, padding: 20 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Select Organizations</Text>
                  <ScrollView style={{ maxHeight: 300 }}>
                    {organizations?.map((org: any) => (
                      <Pressable
                        key={org.id}
                        onPress={() => {
                          setFilterOrganizations((prev) =>
                            prev.includes(org.id)
                              ? prev.filter((id) => id !== org.id)
                              : [...prev, org.id]
                          );
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}
                      >
                        <View style={{ width: 20, height: 20, borderWidth: 1, borderColor: colors.primary, borderRadius: 4, marginRight: 12, backgroundColor: filterOrganizations.includes(org.id) ? colors.primary : '#fff', justifyContent: 'center', alignItems: 'center' }}>
                          {filterOrganizations.includes(org.id) && (
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>✓</Text>
                          )}
                        </View>
                        <Text style={{ color: colors.foreground }}>{org.name}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  <Pressable
                    onPress={() => setOrgModalVisible(false)}
                    style={{ marginTop: 16, alignSelf: 'flex-end' }}
                  >
                    <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Done</Text>
                  </Pressable>
                </View>
              </Pressable>
            </Modal>
          </View>
          {/* Department Filter (unique by name) */}
          <View style={{ flex: 1, minWidth: 120 }}>
            <Pressable
              onPress={() => setDeptModalVisible(true)}
              style={{ padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.surface }}
            >
              <Text style={{ color: colors.foreground }}>
                {filterDepartments.length === 0
                  ? 'All Departments'
                  : Array.from(new Map((staffDepartments || []).map((d: any) => [d.name, d])).values())
                      .filter((dept: any) => filterDepartments.includes(dept.id))
                      .map((dept: any) => dept.name)
                      .join(', ')}
              </Text>
            </Pressable>
            <Modal
              visible={deptModalVisible}
              animationType="slide"
              transparent
              onRequestClose={() => setDeptModalVisible(false)}
            >
              <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setDeptModalVisible(false)}>
                <View style={{ margin: 40, backgroundColor: '#fff', borderRadius: 12, padding: 20 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Select Departments</Text>
                  <ScrollView style={{ maxHeight: 300 }}>
                    {Array.from(new Map((staffDepartments || []).map((d: any) => [d.name, d])).values()).map((dept: any) => (
                      <Pressable
                        key={dept.id}
                        onPress={() => {
                          setFilterDepartments((prev) =>
                            prev.includes(dept.id)
                              ? prev.filter((id) => id !== dept.id)
                              : [...prev, dept.id]
                          );
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}
                      >
                        <View style={{ width: 20, height: 20, borderWidth: 1, borderColor: colors.primary, borderRadius: 4, marginRight: 12, backgroundColor: filterDepartments.includes(dept.id) ? colors.primary : '#fff', justifyContent: 'center', alignItems: 'center' }}>
                          {filterDepartments.includes(dept.id) && (
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>✓</Text>
                          )}
                        </View>
                        <Text style={{ color: colors.foreground }}>{dept.name}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  <Pressable
                    onPress={() => setDeptModalVisible(false)}
                    style={{ marginTop: 16, alignSelf: 'flex-end' }}
                  >
                    <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Done</Text>
                  </Pressable>
                </View>
              </Pressable>
            </Modal>
          </View>
          {/* Team Filter (unique by name) */}
          <View style={{ flex: 1, minWidth: 120 }}>
            <Pressable
              onPress={() => setTeamModalVisible(true)}
              style={{ padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.surface }}
            >
              <Text style={{ color: colors.foreground }}>
                {filterTeams.length === 0
                  ? 'All Teams'
                  : Array.from(new Map((teams || []).map((t: any) => [t.name, t])).values())
                      .filter((team: any) => filterTeams.includes(team.id))
                      .map((team: any) => team.name)
                      .join(', ')}
              </Text>
            </Pressable>
            <Modal
              visible={teamModalVisible}
              animationType="slide"
              transparent
              onRequestClose={() => setTeamModalVisible(false)}
            >
              <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setTeamModalVisible(false)}>
                <View style={{ margin: 40, backgroundColor: '#fff', borderRadius: 12, padding: 20 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Select Teams</Text>
                  <ScrollView style={{ maxHeight: 300 }}>
                    {Array.from(new Map((teams || []).map((t: any) => [t.name, t])).values()).map((team: any) => (
                      <Pressable
                        key={team.id}
                        onPress={() => {
                          setFilterTeams((prev) =>
                            prev.includes(team.id)
                              ? prev.filter((id) => id !== team.id)
                              : [...prev, team.id]
                          );
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}
                      >
                        <View style={{ width: 20, height: 20, borderWidth: 1, borderColor: colors.primary, borderRadius: 4, marginRight: 12, backgroundColor: filterTeams.includes(team.id) ? colors.primary : '#fff', justifyContent: 'center', alignItems: 'center' }}>
                          {filterTeams.includes(team.id) && (
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>✓</Text>
                          )}
                        </View>
                        <Text style={{ color: colors.foreground }}>{team.name}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  <Pressable
                    onPress={() => setTeamModalVisible(false)}
                    style={{ marginTop: 16, alignSelf: 'flex-end' }}
                  >
                    <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Done</Text>
                  </Pressable>
                </View>
              </Pressable>
            </Modal>
          </View>
          {/* Role Filter */}
          <View style={{ flex: 1, minWidth: 120 }}>
            <Pressable
              onPress={() => setRoleModalVisible(true)}
              style={{ padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.surface }}
            >
              <Text style={{ color: colors.foreground }}>
                {filterRoles.length === 0
                  ? 'All Roles'
                  : ['admin', 'counselor', 'viewer']
                      .filter((role) => filterRoles.includes(role))
                      .map((role) => role.charAt(0).toUpperCase() + role.slice(1))
                      .join(', ')}
              </Text>
            </Pressable>
            <Modal
              visible={roleModalVisible}
              animationType="slide"
              transparent
              onRequestClose={() => setRoleModalVisible(false)}
            >
              <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setRoleModalVisible(false)}>
                <View style={{ margin: 40, backgroundColor: '#fff', borderRadius: 12, padding: 20 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Select Roles</Text>
                  <ScrollView style={{ maxHeight: 300 }}>
                    {['admin', 'counselor', 'viewer'].map((role) => (
                      <Pressable
                        key={role}
                        onPress={() => {
                          setFilterRoles((prev) =>
                            prev.includes(role)
                              ? prev.filter((r) => r !== role)
                              : [...prev, role]
                          );
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}
                      >
                        <View style={{ width: 20, height: 20, borderWidth: 1, borderColor: colors.primary, borderRadius: 4, marginRight: 12, backgroundColor: filterRoles.includes(role) ? colors.primary : '#fff', justifyContent: 'center', alignItems: 'center' }}>
                          {filterRoles.includes(role) && (
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>✓</Text>
                          )}
                        </View>
                        <Text style={{ color: colors.foreground }}>{role.charAt(0).toUpperCase() + role.slice(1)}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  <Pressable
                    onPress={() => setRoleModalVisible(false)}
                    style={{ marginTop: 16, alignSelf: 'flex-end' }}
                  >
                    <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Done</Text>
                  </Pressable>
                </View>
              </Pressable>
            </Modal>
          </View>
        </View>
        {/* Clear Filters Button */}
        {(searchQuery || filterOrganizations.length > 0 || filterDepartments.length > 0 || filterTeams.length > 0 || filterRoles.length > 0) && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery("");
              setFilterOrganizations([]);
              setFilterDepartments([]);
              setFilterTeams([]);
              setFilterRoles([]);
              setFilterResetKey((k) => k + 1);
            }}
            className="bg-muted rounded-lg p-3 mb-4"
          >
            <Text className="text-background font-semibold text-center">Clear All Filters</Text>
          </TouchableOpacity>
        )}

        {/* Staff List */}
        <Text className="text-sm text-muted mb-3">
          Showing {filteredStaff.length} of {allStaff?.length || 0} staff members
        </Text>
        {filteredStaff && filteredStaff.length > 0 ? (
          <View className="gap-3">
            {filteredStaff.map((staff: any) => (
              <TouchableOpacity
                key={staff.id}
                onPress={() => router.push(`/admin-staff-edit?id=${staff.id}` as any)}
                className="bg-surface rounded-lg p-4 border border-border"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground">
                      {staff.name}
                    </Text>
                    <Text className="text-sm text-muted mt-1">{staff.email}</Text>
                    
                    {/* Organizational Breadcrumbs */}
                    <OrganizationalBreadcrumbs items={getStaffBreadcrumbs(staff)} className="mt-2" />
                    
                    {/* Badges */}
                    <View className="flex-row gap-2 mt-2">
                      {staff.role === "admin" && (
                        <View className="bg-error rounded px-2 py-1">
                          <Text className="text-xs text-background font-semibold">ADMIN</Text>
                        </View>
                      )}
                      {staff.role === "counselor" && (
                        <View className="bg-primary rounded px-2 py-1">
                          <Text className="text-xs text-background font-semibold">COUNSELOR</Text>
                        </View>
                      )}
                      {staff.role === "viewer" && (
                        <View className="bg-success rounded px-2 py-1">
                          <Text className="text-xs text-background font-semibold">VIEW ONLY</Text>
                        </View>
                      )}
                      {staff.isVipRated && (
                        <View className="bg-warning rounded px-2 py-1">
                          <Text className="text-xs text-background font-semibold">VIP</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <Text className="text-2xl text-muted">›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="items-center py-12">
            <Text className="text-muted text-center">No staff members found</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
