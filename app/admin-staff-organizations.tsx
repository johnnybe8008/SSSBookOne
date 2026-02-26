
import React, { useState, useEffect } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Alert } from "react-native";
import { useAuth } from "@/hooks/use-auth";
import { ScreenContainer } from "../components/screen-container";
import { useColors } from "../hooks/use-color-scheme";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { trpc } from "../lib/trpc";

type Team = { id: string; name: string };
type Department = { id: string; name: string; teams: Team[] };
type Organization = {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  departments: Department[];
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
};

export default function ManageStaffOrganizationScreen() {
  // Top-level debug state
  const [renderError, setRenderError] = useState(null);
  useEffect(() => {
    console.log('[DEBUG] Rendered ManageStaffOrganizationScreen', {
      showForm,
      editingOrg,
      formData,
    });
  });
  const colors = useColors();
  const router = useRouter();
  const { staff } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    departmentId: "",
    teamId: "",
  });
  const [formError, setFormError] = useState("");

  // Fetch organizations, departments, and teams
  const { data: organizations, isLoading: loading, error } = trpc.organizations.list.useQuery();
  const { data: allDepartments } = trpc.staffDepartments.list.useQuery({ organizationId: editingOrg?.id || 0 });
  const { data: allTeams } = trpc.teams.list.useQuery({ groupId: editingOrg?.id || 0 });

  // Mutations
  const createOrg = trpc.organizations.create.useMutation({
    onSuccess: () => {
      setShowForm(false);
      setFormData({ name: "", address: "", email: "", phone: "", departmentId: "", teamId: "" });
      setEditingOrg(null);
    },
    onError: (err) => setFormError(err.message || "Failed to add organization"),
  });
  const updateOrg = trpc.organizations.update.useMutation({
    onSuccess: () => {
      setShowForm(false);
      setFormData({ name: "", address: "", email: "", phone: "", departmentId: "", teamId: "" });
      setEditingOrg(null);
    },
    onError: (err) => setFormError(err.message || "Failed to update organization"),
  });

  // Handlers
  const handleBack = () => {
    if (showForm) {
      setShowForm(false);
      setEditingOrg(null);
      setFormError("");
    } else {
      router.back();
    }
  };
  const handleAddNew = () => {
    setShowForm(true);
    setEditingOrg(null);
    setFormData({ name: "", address: "", email: "", phone: "", departmentId: "", teamId: "" });
    setFormError("");
  };
  const handleOrgPress = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      address: org.address,
      email: org.email,
      phone: org.phone,
      departmentId: "",
      teamId: "",
    });
    setShowForm(true);
    setFormError("");
  };

  // Filter organizations by search
  const filteredOrgs = (organizations ?? []).filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Validate required fields
  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.phone.trim()) return "Phone number is required";
    return "";
  };

  // Handle form submit
  const handleFormSubmit = () => {
    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }
    if (!staff?.id) {
      setFormError("Staff authentication required");
      return;
    }
    if (editingOrg) {
      updateOrg.mutate({ id: Number(editingOrg.id), ...formData, updatedBy: staff.id });
    } else {
      createOrg.mutate({ ...formData, createdBy: staff.id, updatedBy: staff.id });
    }
  };

  // Add department/team logic (simplified for now)
  const handleAddDepartment = () => {
    Alert.alert("Add Department", "Feature not implemented in this demo.");
  };
  const handleAddTeam = () => {
    Alert.alert("Add Team", "Feature not implemented in this demo.");
  };

  // Insert a debug row as the first item in the FlatList
  const debugRow = {
    id: '__debug__',
    name: '[DEBUG ROW]',
    address: '',
    email: '',
    phone: '',
    departments: [],
  };
  const debugData = [debugRow, ...(filteredOrgs ?? [])];

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleBack} accessibilityLabel="Back">
          <Text style={[styles.headerIcon, { color: colors.primary }]}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DEBUG: Manage Staff Organizations</Text>
        {!showForm && (
          <TouchableOpacity
            onPress={() => {
              console.log('Add button pressed');
              handleAddNew();
            }}
            accessibilityLabel="Add New Organization"
          >
            <Text style={[styles.headerIcon, { color: colors.primary || '#007bff' }]}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* STATIC DEBUG BANNER - should always be visible if file is updating */}
      <View style={{ backgroundColor: '#f00', padding: 10, marginBottom: 8 }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>[DEBUG BANNER] If you see this, the file is updating and rendering new code.</Text>
      </View>
      {renderError && (
        <View style={{ backgroundColor: '#ffcccc', padding: 8, marginBottom: 8 }}>
          <Text style={{ color: '#900', fontWeight: 'bold' }}>RENDER ERROR: {String(renderError)}</Text>
        </View>
      )}
      {showForm && (
        <View style={{ backgroundColor: '#fffae6', borderWidth: 2, borderColor: 'red', padding: 8, marginBottom: 8 }}>
          <Text style={{ color: '#c00', fontWeight: 'bold' }}>DEBUG: showForm is TRUE</Text>
        </View>
      )}
      {!showForm ? (
        <View style={{ flex: 1 }}>
          <View style={styles.searchBarContainer}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search organizations..."
              style={[styles.searchBar, { backgroundColor: colors.surface, color: colors.foreground }]}
              placeholderTextColor={colors.muted}
            />
          </View>
          <FlatList
            data={debugData}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              if (item.id === '__debug__') {
                return (
                  <View style={{ backgroundColor: '#ff0', padding: 10, marginBottom: 8 }}>
                    <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 14 }}>[DEBUG ROW] showForm: {String(showForm)} | editingOrg: {editingOrg ? JSON.stringify(editingOrg) : 'null'}</Text>
                  </View>
                );
              }
              try {
                return (
                  <View style={[styles.orgRow, { minHeight: 56, justifyContent: 'center', flexDirection: 'row', alignItems: 'center' }]}> 
                    {/* Inline chevron for debug */}
                    <Text style={{ fontSize: 28, color: '#0ff', fontWeight: 'bold', marginRight: 8 }}>{'>'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.orgName}>{item.name}</Text>
                      <Text style={styles.orgAddress}>
                        {item.address ? item.address.split("\n")[0] : "No address"}
                      </Text>
                      <View style={styles.orgContactRow}>
                        <Text
                          style={[styles.orgContact, { color: colors.primary || '#007bff' }]}
                          onPress={() => item.email && Linking.openURL(`mailto:${item.email}`)}
                          accessibilityRole="link"
                        >
                          {item.email || "No email"}
                        </Text>
                        <Text
                          style={[styles.orgContact, { color: colors.primary || '#007bff' }]}
                          onPress={() => item.phone && Linking.openURL(`tel:${item.phone}`)}
                          accessibilityRole="link"
                        >
                          {item.phone || "No phone"}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleOrgPress(item)}
                      accessibilityLabel="Edit Organization"
                      style={{ marginLeft: 8, backgroundColor: '#e0e0e0', borderRadius: 18, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Text style={{ fontSize: 28, color: colors.primary || '#007bff', fontWeight: 'bold' }}>{'>'}</Text>
                    </TouchableOpacity>
                  </View>
                );
              } catch (err) {
                setRenderError(err.message || String(err));
                return (
                  <View style={{ backgroundColor: '#ffcccc', padding: 8 }}>
                    <Text style={{ color: '#900', fontWeight: 'bold' }}>RENDER ERROR: {String(err)}</Text>
                  </View>
                );
              }
            }}
            ListEmptyComponent={<Text style={styles.emptyText}>No organizations found.</Text>}
            style={{ flex: 1 }}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, borderWidth: 2, borderColor: 'red' }}>
          <Text style={styles.formTitle}>{editingOrg ? "Edit Organization" : "Add New Organization"}</Text>
          {formError ? <Text style={styles.formError}>{formError}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder="Name *"
            value={formData.name}
            onChangeText={text => setFormData({ ...formData, name: text })}
            placeholderTextColor={colors.muted}
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={formData.address}
            onChangeText={text => setFormData({ ...formData, address: text })}
            placeholderTextColor={colors.muted}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={formData.email}
            onChangeText={text => setFormData({ ...formData, email: text })}
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Phone *"
            value={formData.phone}
            onChangeText={text => setFormData({ ...formData, phone: text })}
            placeholderTextColor={colors.muted}
            keyboardType="phone-pad"
          />
          {/* Department dropdown */}
          <View style={styles.dropdownRow}>
            <Text style={styles.dropdownLabel}>Department</Text>
            <TouchableOpacity onPress={handleAddDepartment} style={styles.addButton}><Text style={styles.addButtonText}>+</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal style={styles.dropdownScroll}>
            {(allDepartments ?? []).map((dept: any) => (
              <TouchableOpacity
                key={dept.id}
                style={[styles.dropdownItem, formData.departmentId === dept.id && styles.dropdownItemSelected]}
                onPress={() => setFormData({ ...formData, departmentId: dept.id, teamId: "" })}
              >
                <Text>{dept.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Team dropdown */}
          <View style={styles.dropdownRow}>
            <Text style={styles.dropdownLabel}>Team</Text>
            <TouchableOpacity onPress={handleAddTeam} style={styles.addButton}><Text style={styles.addButtonText}>+</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal style={styles.dropdownScroll}>
            {(allTeams ?? []).filter((t: any) => !formData.departmentId || t.staffDepartmentId === formData.departmentId).map((team: any) => (
              <TouchableOpacity
                key={team.id}
                style={[styles.dropdownItem, formData.teamId === team.id && styles.dropdownItemSelected]}
                onPress={() => setFormData({ ...formData, teamId: team.id })}
              >
                <Text>{team.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Action buttons */}
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleBack}><Text style={styles.cancelButtonText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleFormSubmit}><Text style={styles.saveButtonText}>{editingOrg ? "Save Changes" : "Add Organization"}</Text></TouchableOpacity>
          </View>
        </ScrollView>
      )}
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
    marginBottom: 8,
  },
  searchBar: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  orgRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  orgName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  orgAddress: {
    color: "#888",
    marginBottom: 4,
  },
  orgContactRow: {
    flexDirection: "row",
    gap: 16,
  },
  orgContact: {
    textDecorationLine: "underline",
    marginRight: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#aaa",
    marginTop: 32,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  formError: {
    color: "#c00",
    marginBottom: 8,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dropdownLabel: {
    fontWeight: "bold",
    marginRight: 8,
  },
  addButton: {
    backgroundColor: "#eee",
    borderRadius: 16,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  dropdownScroll: {
    marginBottom: 12,
  },
  dropdownItem: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#eee",
    marginRight: 8,
  },
  dropdownItemSelected: {
    backgroundColor: "#cce5ff",
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#eee",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
