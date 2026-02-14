import { useState } from "react";
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
  const [filterDivisionId, setFilterDivisionId] = useState<number | null>(null);
  const [filterDepartmentId, setFilterDepartmentId] = useState<number | null>(null);
  const [filterTeamId, setFilterTeamId] = useState<number | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  


  // Search clients with filters
  const { data: searchResults, isLoading: searchLoading } = trpc.clients.search.useQuery(
    { searchTerm },
    { enabled: searchTerm.length >= 2 }
  );

  // Filter queries for cascading dropdowns
  const { data: companies } = trpc.companies.list.useQuery();
  const { data: divisions } = trpc.divisions.list.useQuery(
    { companyId: filterCompanyId || 0 },
    { enabled: !!filterCompanyId }
  );
  const { data: departments } = trpc.departments.list.useQuery(
    { divisionId: filterDivisionId || 0 },
    { enabled: !!filterDivisionId }
  );
  const { data: companyTeams } = trpc.companyTeams.list.useQuery(
    { departmentId: filterDepartmentId || 0 },
    { enabled: !!filterDepartmentId }
  );
  
  // Get filtered clients list
  const { data: filteredClients } = trpc.clients.list.useQuery(
    { departmentId: filterDepartmentId || 0 },
    { enabled: !searchTerm && !!filterDepartmentId }
  );
  
  // Reset cascading filters when parent changes
  const handleCompanyChange = (companyId: number | null) => {
    setFilterCompanyId(companyId);
    setFilterDivisionId(null);
    setFilterDepartmentId(null);
    setFilterTeamId(null);
  };
  
  const handleDivisionChange = (divisionId: number | null) => {
    setFilterDivisionId(divisionId);
    setFilterDepartmentId(null);
    setFilterTeamId(null);
  };
  
  const handleDepartmentChange = (departmentId: number | null) => {
    setFilterDepartmentId(departmentId);
    setFilterTeamId(null);
  };
  
  const clearFilters = () => {
    setFilterCompanyId(null);
    setFilterDivisionId(null);
    setFilterDepartmentId(null);
    setFilterTeamId(null);
  };
  
  const utils = trpc.useUtils();
  


  return (
    <ScreenContainer className="flex-1">
      {/* Search Bar */}
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center bg-surface rounded-xl px-4 py-3 border border-border">
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
          {(filterCompanyId || filterDivisionId || filterDepartmentId) && (
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
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-foreground">Filter Clients</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              {/* Company Filter */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-foreground mb-2">Company</Text>
                <View className="bg-surface border border-border rounded-xl overflow-hidden">
                  <Picker
                    selectedValue={filterCompanyId}
                    onValueChange={(value) => handleCompanyChange(value)}
                    style={{ color: colors.foreground }}
                  >
                    <Picker.Item label="Select company..." value={null} />
                    {companies?.map((company) => (
                      <Picker.Item key={company.id} label={company.name} value={company.id} />
                    ))}
                  </Picker>
                </View>
              </View>
              
              {/* Division Filter */}
              {filterCompanyId && (
                <View className="mb-4">
                  <Text className="text-sm font-medium text-foreground mb-2">Division</Text>
                  <View className="bg-surface border border-border rounded-xl overflow-hidden">
                    <Picker
                      selectedValue={filterDivisionId}
                      onValueChange={(value) => handleDivisionChange(value)}
                      style={{ color: colors.foreground }}
                    >
                      <Picker.Item label="Select division..." value={null} />
                      {divisions?.map((division) => (
                        <Picker.Item key={division.id} label={division.name} value={division.id} />
                      ))}
                    </Picker>
                  </View>
                </View>
              )}
              
              {/* Department Filter */}
              {filterDivisionId && (
                <View className="mb-4">
                  <Text className="text-sm font-medium text-foreground mb-2">Department</Text>
                  <View className="bg-surface border border-border rounded-xl overflow-hidden">
                    <Picker
                      selectedValue={filterDepartmentId}
                      onValueChange={(value) => handleDepartmentChange(value)}
                      style={{ color: colors.foreground }}
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
                <View className="mb-4">
                  <Text className="text-sm font-medium text-foreground mb-2">Company Team (Optional)</Text>
                  <View className="bg-surface border border-border rounded-xl overflow-hidden">
                    <Picker
                      selectedValue={filterTeamId}
                      onValueChange={(value) => setFilterTeamId(value)}
                      style={{ color: colors.foreground }}
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
        {searchLoading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : searchTerm.length >= 2 && searchResults ? (
          // Show search results
          searchResults.length > 0 ? (
            <View className="gap-4 py-4">
              {searchResults.map((client) => (
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
                  {client.mobilePhone && (
                    <View className="flex-row items-center gap-2">
                      <IconSymbol name="phone.fill" size={14} color={colors.muted} />
                      <Text className="text-sm text-muted">{client.mobilePhone}</Text>
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
            </View>
          )
        ) : filterDepartmentId && filteredClients ? (
          // Show filtered results
          filteredClients.length > 0 ? (
            <View className="gap-4 py-4">
              {filteredClients.map((client) => (
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

                  {/* Contact Information */}
                  <View className="gap-2 mb-3">
                    {client.mobilePhone && (
                      <View className="flex-row items-center gap-2">
                        <IconSymbol name="phone.fill" size={14} color={colors.muted} />
                        <Text className="text-sm text-muted">{client.mobilePhone}</Text>
                      </View>
                    )}
                    {client.email && (
                      <View className="flex-row items-center gap-2">
                        <IconSymbol name="envelope.fill" size={14} color={colors.muted} />
                        <Text className="text-sm text-muted">{client.email}</Text>
                      </View>
                    )}
                  </View>

                  {/* Status Badge */}
                  <View className="flex-row items-center gap-2 flex-wrap">
                    <View className={`px-3 py-1 rounded-full ${client.status === "Active" ? "bg-success/20" : "bg-muted/20"}`}>
                      <Text className={`text-xs font-medium ${client.status === "Active" ? "text-success" : "text-muted"}`}>
                        {client.status}
                      </Text>
                    </View>
                    {client.notificationOptOut === 1 && (
                      <View className="px-3 py-1 rounded-full bg-warning/20">
                        <Text className="text-xs font-medium text-warning">Opted Out</Text>
                      </View>
                    )}
                    {client.referralSourceType && (
                      <View className="px-3 py-1 rounded-full bg-primary/20 flex-row items-center gap-1">
                        <IconSymbol name="person.badge.plus" size={12} color={colors.primary} />
                        <Text className="text-xs font-medium text-primary">
                          {client.referralSourceType === 'fsm' ? 'FSM' : 
                           client.referralSourceType === 'staff' ? 'Staff' : 
                           client.referralSourceType === 'client' ? 'Client' : 'Ref'}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="items-center justify-center py-12">
              <Text className="text-base text-muted text-center">No clients found matching "{searchTerm}"</Text>
              <Text className="text-sm text-muted text-center mt-2">Try a different search term</Text>
            </View>
          )
        ) : (
          <View className="items-center justify-center py-12">
            <IconSymbol name="magnifyingglass" size={48} color={colors.muted} />
            <Text className="text-base text-muted text-center mt-4">Search for clients by name or email</Text>
            <Text className="text-sm text-muted text-center mt-2">Enter at least 2 characters to search</Text>
          </View>
        )}
      </ScrollView>


      
      {/* Floating Action Button */}
      <View className="absolute bottom-6 right-6">
        <TouchableOpacity
          className="bg-primary w-16 h-16 rounded-full items-center justify-center"
          style={{ shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
          onPress={() => {
            // Navigate to add client screen
            router.push("/add-client" as any);
          }}
        >
          <IconSymbol name="plus.circle.fill" size={32} color={colors.background} />
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
