import { useMemo, useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Modal, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";

/**
 * Clients Screen (Clients Tab)
 * 
 * Displays:
 * - Search bar for client lookup
 * - Filter chips for company/division/department
 * - Scrollable list of client cards
 * - Floating action button to add new client
 */
export default function ClientsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Cascading filter state
  const [filterCompanyId, setFilterCompanyId] = useState<number | null>(null);
  const [filterDepartmentId, setFilterDepartmentId] = useState<number | null>(null);
  const [filterTeamId, setFilterTeamId] = useState<number | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const parsePickerNumber = (value: unknown): number | null => {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "number") return value;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };
  


  // Get all clients
  const { data: allClients, isLoading: clientsLoading } = trpc.clients.listAll.useQuery();
  const { data: allStaff } = trpc.staff.listAll.useQuery();
  const { data: allFsms } = trpc.fsms.list.useQuery();

  // Filter queries for cascading dropdowns
  const { data: companies } = trpc.companies.list.useQuery();
  const { data: departments } = trpc.coDepartments.list.useQuery(
    { companyId: filterCompanyId || 0 },
    { enabled: !!filterCompanyId }
  );
  const { data: companyTeams } = trpc.companyTeams.list.useQuery(
    { coDepartmentId: filterDepartmentId || 0 },
    { enabled: !!filterDepartmentId }
  );
  
  // Reset cascading filters when parent changes
  const handleCompanyChange = (companyId: unknown) => {
    const parsedCompanyId = parsePickerNumber(companyId);
    setFilterCompanyId(parsedCompanyId);
    setFilterDepartmentId(null);
    setFilterTeamId(null);
  };
  
  const handleDepartmentChange = (departmentId: unknown) => {
    const parsedDepartmentId = parsePickerNumber(departmentId);
    setFilterDepartmentId(parsedDepartmentId);
    setFilterTeamId(null);
  };
  
  const clearFilters = () => {
    setFilterCompanyId(null);
    setFilterDepartmentId(null);
    setFilterTeamId(null);
  };
  
  const referralNameByTypeAndId = useMemo(() => {
    const staffMap = new Map<number, string>((allStaff || []).map((s: any) => [s.id, s.name]));
    const fsmMap = new Map<number, string>((allFsms || []).map((f: any) => [f.id, f.name]));
    const clientMap = new Map<number, string>((allClients || []).map((c: any) => [c.id, c.name]));
    return { staffMap, fsmMap, clientMap };
  }, [allStaff, allFsms, allClients]);

  // Client-side filtering
  const displayedClients = allClients?.filter((client: any) => {
    // Search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const matchesSearch = 
        client.name.toLowerCase().includes(query) ||
        (client.email && client.email.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }
    
    // Organizational filter (if department is selected)
    if (filterDepartmentId) {
      if (client.coDepartmentId !== filterDepartmentId) return false;
    }

    if (filterTeamId) {
      if (client.companyTeamId !== filterTeamId) return false;
    }
    
    return true;
  });
  
  const utils = trpc.useUtils();
  


  return (
    <ScreenContainer className="flex-1">
      {/* Search Bar and Add Button */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center bg-surface rounded-xl px-4 py-3 border border-border mb-3">
          <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
          <TextInput
            className="flex-1 ml-3 text-base text-foreground"
            placeholder="Search clients by name or email..."
            placeholderTextColor={colors.muted}
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm("")}>
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Add New Client Button */}
        <TouchableOpacity
          className="bg-primary rounded-xl py-3 px-4 flex-row items-center justify-center gap-2"
          onPress={() => router.push("/add-client" as any)}
        >
          <IconSymbol name="plus.circle.fill" size={20} color={colors.background} />
          <Text className="text-base font-semibold text-background">Add New Client</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Section */}
      <View className="px-6 py-3 bg-background border-b border-border">
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            className="flex-1 px-4 py-3 bg-surface rounded-xl border border-border flex-row items-center justify-between"
            onPress={() => setShowFilterModal(true)}
          >
            <View className="flex-row items-center gap-2">
              <IconSymbol name="line.3.horizontal.decrease" size={18} color={colors.foreground} />
              <Text className="text-sm font-medium text-foreground">
                {filterDepartmentId ? "Filtered" : "Filter by Organization"}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>
          {(filterCompanyId || filterDepartmentId || filterTeamId) && (
            <TouchableOpacity
              className="px-4 py-3 bg-error rounded-xl"
              onPress={clearFilters}
            >
              <Text className="text-sm font-semibold text-white">Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        {filterDepartmentId && (
          <View className="mt-2">
            <Text className="text-xs text-muted">
              Showing clients from selected department
            </Text>
          </View>
        )}
        
        {/* Selection Mode Toggle */}

      </View>
      

      
      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="bg-background rounded-2xl p-6 w-full" style={{ maxHeight: '80%', maxWidth: 560 }}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-foreground">Filter Clients</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              {/* Company Filter */}
              <View className="mb-5">
                <Text className="text-sm font-medium text-foreground mb-3">Company</Text>
                <View className="bg-surface border border-border rounded-xl overflow-hidden px-2" style={{ minHeight: 52, justifyContent: 'center' }}>
                  <Picker
                    selectedValue={filterCompanyId}
                    onValueChange={(value) => handleCompanyChange(value)}
                    style={{ color: colors.foreground, height: 52 }}
                  >
                    <Picker.Item label="Select company..." value={null} />
                    {companies?.map((company) => (
                      <Picker.Item key={company.id} label={company.name} value={company.id} />
                    ))}
                  </Picker>
                </View>
              </View>
              
              {/* Department Filter */}
              {filterCompanyId && (
                <View className="mb-5">
                  <Text className="text-sm font-medium text-foreground mb-3">Department</Text>
                  <View className="bg-surface border border-border rounded-xl overflow-hidden px-2" style={{ minHeight: 52, justifyContent: 'center' }}>
                    <Picker
                      selectedValue={filterDepartmentId}
                      onValueChange={(value) => handleDepartmentChange(value)}
                      style={{ color: colors.foreground, height: 52 }}
                    >
                      <Picker.Item label="Select department..." value={null} />
                      {departments?.map((dept) => (
                        <Picker.Item key={dept.id} label={dept.name} value={dept.id} />
                      ))}
                    </Picker>
                  </View>
                </View>
              )}
              
              {/* Company Team Filter */}
              {filterDepartmentId && companyTeams && companyTeams.length > 0 && (
                <View className="mb-5">
                  <Text className="text-sm font-medium text-foreground mb-3">Team (Optional)</Text>
                  <View className="bg-surface border border-border rounded-xl overflow-hidden px-2" style={{ minHeight: 52, justifyContent: 'center' }}>
                    <Picker
                      selectedValue={filterTeamId}
                      onValueChange={(value) => setFilterTeamId(parsePickerNumber(value))}
                      style={{ color: colors.foreground, height: 52 }}
                    >
                      <Picker.Item label="All teams..." value={null} />
                      {companyTeams.map((team) => (
                        <Picker.Item key={team.id} label={team.name} value={team.id} />
                      ))}
                    </Picker>
                  </View>
                </View>
              )}
            </ScrollView>
            
            <TouchableOpacity
              className="bg-primary rounded-xl py-4 mt-4"
              onPress={() => setShowFilterModal(false)}
            >
              <Text className="text-center text-base font-semibold text-white">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Client List */}
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 100 }}>
        {clientsLoading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : displayedClients && displayedClients.length > 0 ? (
          <View className="gap-4 py-4">
            {displayedClients.map((client: any) => (
                <TouchableOpacity
                  key={client.id}
                  className="bg-surface rounded-2xl p-5 border border-border"
                  onPress={() => router.push(`/client/${client.id}` as any)}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-lg font-semibold text-foreground">{client.name}</Text>
                        {client.isVip === 1 && (
                          <IconSymbol name="star.fill" size={18} color={colors.warning} />
                        )}
                      </View>
                      <Text className="text-sm text-muted mt-1">
                        {client.title || "No title"} • {client.occupation || "No occupation"}
                      </Text>
                    </View>
                    <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                  </View>
                  {(client.mobilePhone || client.workPhone || client.homePhone) && (
                    <View className="flex-row items-center gap-2">
                      <IconSymbol name="phone.fill" size={14} color={colors.muted} />
                      <Text className="text-sm text-muted">
                        {[
                          client.mobilePhone ? `(M) ${client.mobilePhone}` : null,
                          client.workPhone ? `(W) ${client.workPhone}` : null,
                          client.homePhone ? `(H) ${client.homePhone}` : null,
                        ]
                          .filter(Boolean)
                          .join("  •  ")}
                      </Text>
                    </View>
                  )}
                  {client.email && (
                    <View className="flex-row items-center gap-2">
                      <IconSymbol name="envelope.fill" size={14} color={colors.muted} />
                      <Text className="text-sm text-muted">{client.email}</Text>
                    </View>
                  )}
                  {/* Referral Source Badge */}
                  {client.referralSourceType && (
                    <View className="mt-3">
                      <View className={`self-start px-3 py-1 rounded-full ${
                        client.referralSourceType === 'fsm' ? 'bg-primary/10' :
                        client.referralSourceType === 'staff' ? 'bg-success/10' :
                        'bg-warning/10'
                      }`}>
                        <Text className={`text-xs font-medium ${
                          client.referralSourceType === 'fsm' ? 'text-primary' :
                          client.referralSourceType === 'staff' ? 'text-success' :
                          'text-warning'
                        }`}>
                          Referred by {client.referralSourceType.toUpperCase()}
                          {client.referralSourceId
                            ? `: ${
                                client.referralSourceType === 'staff'
                                  ? referralNameByTypeAndId.staffMap.get(client.referralSourceId) || `#${client.referralSourceId}`
                                  : client.referralSourceType === 'fsm'
                                  ? referralNameByTypeAndId.fsmMap.get(client.referralSourceId) || `#${client.referralSourceId}`
                                  : referralNameByTypeAndId.clientMap.get(client.referralSourceId) || `#${client.referralSourceId}`
                              }`
                            : ""}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="items-center justify-center py-12">
              <Text className="text-base text-muted">No clients found</Text>
              {searchTerm && (
                <Text className="text-sm text-muted text-center mt-2">Try a different search term</Text>
              )}
            </View>
          )}
      </ScrollView>
    </ScreenContainer>
  );
}
