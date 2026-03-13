import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

/**
 * Admin - Bulk Client Reassignment
 * 
 * Allows admin to move multiple clients between organizational units
 */
export default function AdminBulkReassignScreen() {
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: staff } = trpc.auth.me.useQuery();

  // Filter state
  const [filterCompanyId, setFilterCompanyId] = useState<number>(0);
  const [filterDivisionId, setFilterDivisionId] = useState<number>(0);
  const [filterDeptId, setFilterDeptId] = useState<number>(0);

  // Destination state
  const [destCompanyId, setDestCompanyId] = useState<number>(0);
  const [destDivisionId, setDestDivisionId] = useState<number>(0);
  const [destDeptId, setDestDeptId] = useState<number>(0);
  const [destTeamId, setDestTeamId] = useState<number>(0);

  // Selected clients
  const [selectedClients, setSelectedClients] = useState<Set<number>>(new Set());

  // Queries
  const { data: companies } = trpc.companies.list.useQuery();
  const { data: filterDivisions } = trpc.divisions.list.useQuery(
    { companyId: filterCompanyId },
    { enabled: filterCompanyId > 0 }
  );
  const { data: filterDepts } = trpc.departments.list.useQuery(
    { divisionId: filterDivisionId },
    { enabled: filterDivisionId > 0 }
  );
  const { data: clients, isLoading } = trpc.clients.listAll.useQuery();

  const { data: destDivisions } = trpc.divisions.list.useQuery(
    { companyId: destCompanyId },
    { enabled: destCompanyId > 0 }
  );
  const { data: destDepts } = trpc.departments.list.useQuery(
    { divisionId: destDivisionId },
    { enabled: destDivisionId > 0 }
  );
  const { data: destTeams } = trpc.companyTeams.list.useQuery(
    { departmentId: destDeptId },
    { enabled: destDeptId > 0 }
  );

  // Bulk update mutation
  const bulkUpdate = trpc.clients.bulkUpdate.useMutation({
    onSuccess: () => {
      utils.clients.invalidate();
      setSelectedClients(new Set());
      Alert.alert("Success", `${selectedClients.size} clients reassigned successfully`);
    },
    onError: (error) => Alert.alert("Error", error.message),
  });

  // Filter clients
  const filteredClients = clients?.filter((client) => {
    if (filterCompanyId > 0 && client.companyId !== filterCompanyId) return false;
    if (filterDivisionId > 0 && client.divisionId !== filterDivisionId) return false;
    if (filterDeptId > 0 && client.departmentId !== filterDeptId) return false;
    return true;
  }) || [];

  const toggleClient = (clientId: number) => {
    const newSet = new Set(selectedClients);
    if (newSet.has(clientId)) {
      newSet.delete(clientId);
    } else {
      newSet.add(clientId);
    }
    setSelectedClients(newSet);
  };

  const selectAll = () => {
    setSelectedClients(new Set(filteredClients.map((c) => c.id)));
  };

  const deselectAll = () => {
    setSelectedClients(new Set());
  };

  const handleReassign = () => {
    if (selectedClients.size === 0) {
      Alert.alert("Validation Error", "Please select at least one client");
      return;
    }
    if (destCompanyId === 0 || destDivisionId === 0 || destDeptId === 0 || destTeamId === 0) {
      Alert.alert("Validation Error", "Please select destination company, division, department, and team");
      return;
    }

    Alert.alert(
      "Confirm Reassignment",
      `Reassign ${selectedClients.size} clients to the selected organizational unit?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reassign",
          style: "destructive",
          onPress: () => {
            bulkUpdate.mutate({
              clientIds: Array.from(selectedClients),
              companyId: destCompanyId,
              divisionId: destDivisionId,
              departmentId: destDeptId,
              companyTeamId: destTeamId,
            });
          },
        },
      ]
    );
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
            <Text className="text-3xl font-bold text-foreground">&lt;</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Bulk Reassign Clients</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Filter Section */}
        <View style={{ backgroundColor: colors.surface }} className="p-4 rounded-lg mb-4">
          <Text className="text-foreground font-semibold mb-3">Filter Clients</Text>

          <Text className="text-foreground text-sm mb-1">Company</Text>
          <View style={{ backgroundColor: colors.background }} className="rounded mb-3">
            <Picker
              selectedValue={filterCompanyId}
              onValueChange={(value) => {
                setFilterCompanyId(value);
                setFilterDivisionId(0);
                setFilterDeptId(0);
              }}
              style={{ color: colors.foreground }}
            >
              <Picker.Item label="All Companies" value={0} />
              {companies?.map((c) => (
                <Picker.Item key={c.id} label={c.name} value={c.id} />
              ))}
            </Picker>
          </View>

          {filterCompanyId > 0 && (
            <>
              <Text className="text-foreground text-sm mb-1">Division</Text>
              <View style={{ backgroundColor: colors.background }} className="rounded mb-3">
                <Picker
                  selectedValue={filterDivisionId}
                  onValueChange={(value) => {
                    setFilterDivisionId(value);
                    setFilterDeptId(0);
                  }}
                  style={{ color: colors.foreground }}
                >
                  <Picker.Item label="All Divisions" value={0} />
                  {filterDivisions?.map((d) => (
                    <Picker.Item key={d.id} label={d.name} value={d.id} />
                  ))}
                </Picker>
              </View>
            </>
          )}

          {filterDivisionId > 0 && (
            <>
              <Text className="text-foreground text-sm mb-1">Department</Text>
              <View style={{ backgroundColor: colors.background }} className="rounded mb-3">
                <Picker
                  selectedValue={filterDeptId}
                  onValueChange={setFilterDeptId}
                  style={{ color: colors.foreground }}
                >
                  <Picker.Item label="All Departments" value={0} />
                  {filterDepts?.map((d) => (
                    <Picker.Item key={d.id} label={d.name} value={d.id} />
                  ))}
                </Picker>
              </View>
            </>
          )}
        </View>

        {/* Client List */}
        <View style={{ backgroundColor: colors.surface }} className="p-4 rounded-lg mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-foreground font-semibold">
              Clients ({filteredClients.length}) - Selected ({selectedClients.size})
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity onPress={selectAll} className="px-3 py-1 rounded" style={{ backgroundColor: colors.primary }}>
                <Text className="text-background text-xs font-semibold">Select All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={deselectAll} className="px-3 py-1 rounded" style={{ backgroundColor: colors.border }}>
                <Text className="text-foreground text-xs font-semibold">Clear</Text>
              </TouchableOpacity>
            </View>
          </View>

          {filteredClients.map((client) => (
            <TouchableOpacity
              key={client.id}
              onPress={() => toggleClient(client.id)}
              style={{ backgroundColor: selectedClients.has(client.id) ? colors.primary + "20" : colors.background }}
              className="p-3 rounded mb-2 flex-row items-center"
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 2,
                  borderColor: selectedClients.has(client.id) ? colors.primary : colors.border,
                  backgroundColor: selectedClients.has(client.id) ? colors.primary : "transparent",
                  marginRight: 12,
                }}
              />
              <View className="flex-1">
                <Text className="text-foreground font-semibold">{client.name}</Text>
                <Text className="text-muted text-xs">ID: {client.id}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Destination Section */}
        <View style={{ backgroundColor: colors.surface }} className="p-4 rounded-lg mb-4">
          <Text className="text-foreground font-semibold mb-3">Destination</Text>

          <Text className="text-foreground text-sm mb-1">Company *</Text>
          <View style={{ backgroundColor: colors.background }} className="rounded mb-3">
            <Picker
              selectedValue={destCompanyId}
              onValueChange={(value) => {
                setDestCompanyId(value);
                setDestDivisionId(0);
                setDestDeptId(0);
                setDestTeamId(0);
              }}
              style={{ color: colors.foreground }}
            >
              <Picker.Item label="Select Company" value={0} />
              {companies?.map((c) => (
                <Picker.Item key={c.id} label={c.name} value={c.id} />
              ))}
            </Picker>
          </View>

          {destCompanyId > 0 && (
            <>
              <Text className="text-foreground text-sm mb-1">Division *</Text>
              <View style={{ backgroundColor: colors.background }} className="rounded mb-3">
                <Picker
                  selectedValue={destDivisionId}
                  onValueChange={(value) => {
                    setDestDivisionId(value);
                    setDestDeptId(0);
                    setDestTeamId(0);
                  }}
                  style={{ color: colors.foreground }}
                >
                  <Picker.Item label="Select Division" value={0} />
                  {destDivisions?.map((d) => (
                    <Picker.Item key={d.id} label={d.name} value={d.id} />
                  ))}
                </Picker>
              </View>
            </>
          )}

          {destDivisionId > 0 && (
            <>
              <Text className="text-foreground text-sm mb-1">Department *</Text>
              <View style={{ backgroundColor: colors.background }} className="rounded mb-3">
                <Picker
                  selectedValue={destDeptId}
                  onValueChange={(value) => {
                    setDestDeptId(value);
                    setDestTeamId(0);
                  }}
                  style={{ color: colors.foreground }}
                >
                  <Picker.Item label="Select Department" value={0} />
                  {destDepts?.map((d) => (
                    <Picker.Item key={d.id} label={d.name} value={d.id} />
                  ))}
                </Picker>
              </View>
            </>
          )}

          {destDeptId > 0 && (
            <>
              <Text className="text-foreground text-sm mb-1">Team *</Text>
              <View style={{ backgroundColor: colors.background }} className="rounded mb-3">
                <Picker
                  selectedValue={destTeamId}
                  onValueChange={setDestTeamId}
                  style={{ color: colors.foreground }}
                >
                  <Picker.Item label="Select Team" value={0} />
                  {destTeams?.map((t) => (
                    <Picker.Item key={t.id} label={t.name} value={t.id} />
                  ))}
                </Picker>
              </View>
            </>
          )}
        </View>

        {/* Reassign Button */}
        <TouchableOpacity
          onPress={handleReassign}
          style={{ backgroundColor: colors.primary }}
          className="px-6 py-4 rounded-lg mb-6"
          disabled={bulkUpdate.isPending}
        >
          {bulkUpdate.isPending ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text className="text-background font-bold text-center text-lg">
              Reassign {selectedClients.size} Clients
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
