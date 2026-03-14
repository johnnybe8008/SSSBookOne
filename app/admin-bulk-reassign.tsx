import { useMemo, useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

export default function AdminBulkReassignScreen() {
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: me } = trpc.auth.me.useQuery();

  const [showFilters, setShowFilters] = useState(true);

  // Source filters (division removed, company -> department -> team)
  const [filterCompanyIds, setFilterCompanyIds] = useState<number[]>([]);
  const [filterDeptIds, setFilterDeptIds] = useState<number[]>([]);
  const [filterTeamIds, setFilterTeamIds] = useState<number[]>([]);

  // Destination selectors
  const [destCompanyId, setDestCompanyId] = useState<number>(0);
  const [destDeptId, setDestDeptId] = useState<number>(0);
  const [destTeamId, setDestTeamId] = useState<number>(0);

  const [selectedClientIds, setSelectedClientIds] = useState<number[]>([]);

  // Modals
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showDestCompanyModal, setShowDestCompanyModal] = useState(false);
  const [showDestDeptModal, setShowDestDeptModal] = useState(false);
  const [showDestTeamModal, setShowDestTeamModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);

  // Search
  const [companySearch, setCompanySearch] = useState("");
  const [deptSearch, setDeptSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [destCompanySearch, setDestCompanySearch] = useState("");
  const [destDeptSearch, setDestDeptSearch] = useState("");
  const [destTeamSearch, setDestTeamSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");

  const PICKER_ROW_HEIGHT = 40;
  const pickerMaxHeight = PICKER_ROW_HEIGHT * 8;

  // Queries
  const { data: companies } = trpc.companies.list.useQuery();
  const { data: allClients, isLoading } = trpc.clients.listAll.useQuery();

  const { data: allDepartments } = trpc.coDepartments.all.useQuery();
  const { data: allTeams } = trpc.companyTeams.listAll.useQuery();

  const { data: destDepartments } = trpc.coDepartments.list.useQuery(
    { companyId: destCompanyId },
    { enabled: destCompanyId > 0 }
  );
  const { data: destTeams } = trpc.companyTeams.list.useQuery(
    { coDepartmentId: destDeptId },
    { enabled: destDeptId > 0 }
  );

  const searchList = (items: any[] | undefined, search: string, pick: (v: any) => string) => {
    const q = search.trim().toLowerCase();
    const source = items || [];
    if (!q) return source;
    return source.filter((item) => pick(item).toLowerCase().includes(q));
  };

  const departmentById = useMemo(() => {
    const map = new Map<number, any>();
    (allDepartments || []).forEach((dept: any) => {
      map.set(Number(dept.id), dept);
    });
    return map;
  }, [allDepartments]);

  const filteredDepartments = useMemo(() => {
    const source = allDepartments || [];
    if (filterCompanyIds.length === 0) return source;
    return source.filter((d: any) => filterCompanyIds.includes(Number(d.companyId)));
  }, [allDepartments, filterCompanyIds]);

  const sourceDepartmentOptions = useMemo(() => {
    if (filterCompanyIds.length > 0) return filteredDepartments;

    const byName = new Map<string, any>();
    filteredDepartments.forEach((dept: any) => {
      const key = String(dept.name || "").trim().toLowerCase();
      if (!byName.has(key)) {
        byName.set(key, dept);
      }
    });
    return Array.from(byName.values());
  }, [filteredDepartments, filterCompanyIds]);

  const filteredTeams = useMemo(() => {
    const source = allTeams || [];
    if (filterDeptIds.length > 0) {
      return source.filter((t: any) => filterDeptIds.includes(Number(t.coDepartmentId)));
    }

    return source.filter((t: any) => {
      if (filterCompanyIds.length > 0) {
        const dept = departmentById.get(Number(t.coDepartmentId));
        if (!dept || !filterCompanyIds.includes(Number(dept.companyId))) return false;
      }
      return true;
    });
  }, [allTeams, filterCompanyIds, filterDeptIds, departmentById]);

  const sourceTeamOptions = useMemo(() => {
    if (filterCompanyIds.length > 0 && filterDeptIds.length > 0) return filteredTeams;

    const byName = new Map<string, any>();
    filteredTeams.forEach((team: any) => {
      const key = String(team.name || "").trim().toLowerCase();
      if (!byName.has(key)) {
        byName.set(key, team);
      }
    });
    return Array.from(byName.values());
  }, [filteredTeams, filterDeptIds, filterCompanyIds]);

  const sourceDepartmentGroupByOptionId = useMemo(() => {
    const groups = new Map<number, number[]>();
    const scope = filteredDepartments || [];

    if (filterCompanyIds.length > 0) {
      scope.forEach((dept: any) => {
        groups.set(Number(dept.id), [Number(dept.id)]);
      });
      return groups;
    }

    sourceDepartmentOptions.forEach((option: any) => {
      const key = String(option.name || "").trim().toLowerCase();
      const ids = scope
        .filter((dept: any) => String(dept.name || "").trim().toLowerCase() === key)
        .map((dept: any) => Number(dept.id));
      groups.set(Number(option.id), ids.length > 0 ? ids : [Number(option.id)]);
    });

    return groups;
  }, [filteredDepartments, sourceDepartmentOptions, filterCompanyIds]);

  const selectedDepartmentDisplayCount = useMemo(() => {
    if (filterCompanyIds.length > 0) return filterDeptIds.length;

    const selected = new Set<number>(filterDeptIds);
    const names = new Set<string>();
    (filteredDepartments || []).forEach((dept: any) => {
      if (selected.has(Number(dept.id))) {
        names.add(String(dept.name || "").trim().toLowerCase());
      }
    });
    return names.size;
  }, [filterCompanyIds, filterDeptIds, filteredDepartments]);

  const sourceTeamGroupByOptionId = useMemo(() => {
    const groups = new Map<number, number[]>();
    const scope = filteredTeams || [];

    if (filterCompanyIds.length > 0 && filterDeptIds.length > 0) {
      scope.forEach((team: any) => {
        groups.set(Number(team.id), [Number(team.id)]);
      });
      return groups;
    }

    sourceTeamOptions.forEach((option: any) => {
      const key = String(option.name || "").trim().toLowerCase();
      const ids = scope
        .filter((team: any) => String(team.name || "").trim().toLowerCase() === key)
        .map((team: any) => Number(team.id));
      groups.set(Number(option.id), ids.length > 0 ? ids : [Number(option.id)]);
    });

    return groups;
  }, [filteredTeams, sourceTeamOptions, filterDeptIds, filterCompanyIds]);

  const selectedTeamDisplayCount = useMemo(() => {
    if (filterCompanyIds.length > 0 && filterDeptIds.length > 0) return filterTeamIds.length;

    const selected = new Set<number>(filterTeamIds);
    const names = new Set<string>();
    (filteredTeams || []).forEach((team: any) => {
      if (selected.has(Number(team.id))) {
        names.add(String(team.name || "").trim().toLowerCase());
      }
    });
    return names.size;
  }, [filterCompanyIds, filterDeptIds, filterTeamIds, filteredTeams]);

  const companyOptions = searchList(companies as any[], companySearch, (v) => v.name || "");
  const deptOptions = searchList(sourceDepartmentOptions as any[], deptSearch, (v) => v.name || "");
  const teamOptions = searchList(sourceTeamOptions as any[], teamSearch, (v) => v.name || "");
  const destCompanyOptions = searchList(companies as any[], destCompanySearch, (v) => v.name || "");
  const destDeptOptions = searchList(destDepartments as any[], destDeptSearch, (v) => v.name || "");
  const destTeamOptions = searchList(destTeams as any[], destTeamSearch, (v) => v.name || "");

  const filteredClients = useMemo(() => {
    const source = allClients || [];
    return source.filter((client: any) => {
      if (filterCompanyIds.length > 0 && !filterCompanyIds.includes(Number(client.companyId))) return false;

      const coDepartmentId = Number(client.coDepartmentId ?? client.departmentId ?? 0);
      if (filterDeptIds.length > 0 && !filterDeptIds.includes(coDepartmentId)) return false;

      const companyTeamId = Number(client.companyTeamId ?? client.teamId ?? 0);
      if (filterTeamIds.length > 0 && !filterTeamIds.includes(companyTeamId)) return false;

      return true;
    });
  }, [allClients, filterCompanyIds, filterDeptIds, filterTeamIds]);

  const filteredClientOptions = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return filteredClients;
    return filteredClients.filter((c: any) => {
      const name = (c.name || "").toLowerCase();
      const email = (c.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [filteredClients, clientSearch]);

  const selectedClients = useMemo(() => {
    const selected = new Set(selectedClientIds);
    return (allClients || []).filter((c: any) => selected.has(Number(c.id)));
  }, [allClients, selectedClientIds]);

  const companyById = useMemo(() => {
    const map = new Map<number, string>();
    (companies || []).forEach((company: any) => {
      map.set(Number(company.id), company.name || "");
    });
    return map;
  }, [companies]);

  const companyLabel = filterCompanyIds.length > 0 ? `${filterCompanyIds.length} compan${filterCompanyIds.length === 1 ? "y" : "ies"} selected` : "All Companies";
  const deptLabel = selectedDepartmentDisplayCount > 0 ? `${selectedDepartmentDisplayCount} department(s) selected` : "All Departments";
  const teamLabel = selectedTeamDisplayCount > 0 ? `${selectedTeamDisplayCount} team(s) selected` : "All Teams";

  const destCompanyLabel = companies?.find((c: any) => Number(c.id) === Number(destCompanyId))?.name || "Select Company";
  const destDeptLabel = (destDepartments || []).find((d: any) => Number(d.id) === Number(destDeptId))?.name || "Select Department";
  const destTeamLabel = (destTeams || []).find((t: any) => Number(t.id) === Number(destTeamId))?.name || "Select Team";

  const hasAnyFilter = filterCompanyIds.length > 0 || filterDeptIds.length > 0 || filterTeamIds.length > 0 || selectedClientIds.length > 0;

  const bulkUpdate = trpc.clients.bulkUpdate.useMutation({
    onSuccess: (res: any) => {
      utils.clients.listAll.invalidate();
      setSelectedClientIds([]);
      Alert.alert("Success", `${res?.updatedCount || 0} client(s) reassigned successfully`);
    },
    onError: (error) => Alert.alert("Error", error.message),
  });

  const createDestinationDepartment = trpc.coDepartments.create.useMutation({
    onError: (error: any) => Alert.alert("Error", error.message || "Failed to create department"),
  });

  const createDestinationTeam = trpc.companyTeams.create.useMutation({
    onError: (error: any) => Alert.alert("Error", error.message || "Failed to create team"),
  });

  const toggleClient = (id: number) => {
    setSelectedClientIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const toggleMulti = (id: number, setter: (updater: (prev: number[]) => number[]) => void) => {
    setter((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const toggleGroupMulti = (
    optionId: number,
    groupByOptionId: Map<number, number[]>,
    setter: (updater: (prev: number[]) => number[]) => void
  ) => {
    const group = groupByOptionId.get(optionId) || [optionId];
    setter((prev) => {
      const allSelected = group.every((id) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id) => !group.includes(id));
      }
      const merged = new Set(prev);
      group.forEach((id) => merged.add(id));
      return Array.from(merged);
    });
  };

  const getCreatedId = (result: any) => {
    if (typeof result === "number") return Number(result);
    if (result && typeof result.insertId === "number") return Number(result.insertId);
    if (result && typeof result.id === "number") return Number(result.id);
    return 0;
  };

  const selectAllFiltered = () => {
    setSelectedClientIds((prev) => {
      const set = new Set(prev);
      filteredClients.forEach((c: any) => set.add(Number(c.id)));
      return Array.from(set);
    });
  };

  const clearAllFilters = () => {
    setFilterCompanyIds([]);
    setFilterDeptIds([]);
    setFilterTeamIds([]);
    setSelectedClientIds([]);
    setClientSearch("");
  };

  const handleReassign = () => {
    if (selectedClientIds.length === 0) {
      Alert.alert("Validation Error", "Please select at least one client");
      return;
    }
    if (!destCompanyId || !destDeptId || !destTeamId) {
      Alert.alert("Validation Error", "Please select destination company, department, and team");
      return;
    }

    Alert.alert(
      "Confirm Reassignment",
      `Reassign ${selectedClientIds.length} client(s) to ${destTeamLabel}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reassign",
          style: "destructive",
          onPress: () => {
            bulkUpdate.mutate({
              clientIds: selectedClientIds,
              companyId: destCompanyId,
              coDepartmentId: destDeptId,
              companyTeamId: destTeamId,
            });
          },
        },
      ]
    );
  };

  const renderSingleSelectModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    search: string,
    setSearch: (v: string) => void,
    placeholder: string,
    options: any[],
    getLabel: (item: any) => string,
    selectedId: number,
    onPick: (id: number) => void,
    allowClear = true,
    emptyLabel?: string,
    onCreate?: (name: string) => void,
    isCreating = false
  ) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
        <View className="w-[92%] rounded-2xl p-5" style={{ backgroundColor: colors.background, maxHeight: "82%" }}>
          <View className="relative min-h-[44px] items-center justify-center mb-3">
            <TouchableOpacity onPress={onClose} className="absolute left-0">
              <Text className="text-3xl font-bold text-foreground">&lt;</Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold text-foreground text-center">{title}</Text>
          </View>

          <TextInput
            className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground mb-3"
            placeholder={placeholder}
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
          />

          <View className="rounded-xl overflow-hidden" style={{ backgroundColor: "#f5f8fa", maxHeight: pickerMaxHeight }}>
            <ScrollView>
              {allowClear && (
                <TouchableOpacity className="px-3 flex-row items-center" style={{ minHeight: PICKER_ROW_HEIGHT }} onPress={() => onPick(0)}>
                  <Text className="text-sm text-foreground">Clear selection</Text>
                </TouchableOpacity>
              )}
              {options.map((item: any) => {
                const id = Number(item.id);
                const checked = selectedId > 0 && selectedId === id;
                return (
                  <TouchableOpacity key={String(id)} className="px-3 flex-row items-center" style={{ minHeight: PICKER_ROW_HEIGHT }} onPress={() => onPick(id)}>
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        borderWidth: 2,
                        borderColor: checked ? colors.primary : "#ccc",
                        backgroundColor: checked ? colors.primary : "#fff",
                        marginRight: 10,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {checked ? <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>✓</Text> : null}
                    </View>
                    <Text className="text-sm text-foreground" numberOfLines={1}>{getLabel(item)}</Text>
                  </TouchableOpacity>
                );
              })}
              {options.length === 0 && search.trim().length > 0 && (
                <View className="px-3 py-3">
                  <Text className="text-sm" style={{ color: colors.muted }}>{emptyLabel || "No matching results."}</Text>
                </View>
              )}
            </ScrollView>
          </View>

          {onCreate && search.trim().length > 0 && !options.some((item: any) => getLabel(item).trim().toLowerCase() === search.trim().toLowerCase()) && (
            <TouchableOpacity
              disabled={isCreating}
              className="rounded-lg px-4 py-3 mt-3"
              style={{ backgroundColor: isCreating ? colors.muted : colors.primary }}
              onPress={() => onCreate(search.trim())}
            >
              <Text className="text-base font-semibold text-center" style={{ color: "#fff" }}>
                {isCreating ? "Creating..." : `Create "${search.trim()}"`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderMultiSelectModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    search: string,
    setSearch: (v: string) => void,
    placeholder: string,
    options: any[],
    getLabel: (item: any) => string,
    selectedIds: number[],
    onToggle: (id: number) => void,
    onClear?: () => void
  ) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
        <View className="w-[92%] rounded-2xl p-5" style={{ backgroundColor: colors.background, maxHeight: "82%" }}>
          <View className="relative min-h-[44px] items-center justify-center mb-3">
            <TouchableOpacity onPress={onClose} className="absolute left-0">
              <Text className="text-3xl font-bold text-foreground">&lt;</Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold text-foreground text-center">{title}</Text>
          </View>

          <TextInput
            className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground mb-3"
            placeholder={placeholder}
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
          />

          {onClear && selectedIds.length > 0 && (
            <View className="flex-row justify-end mb-2">
              <TouchableOpacity className="px-3 py-1 rounded-full border border-border bg-background" onPress={onClear}>
                <Text className="text-xs font-semibold text-foreground">Clear</Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="rounded-xl overflow-hidden" style={{ backgroundColor: "#f5f8fa", maxHeight: pickerMaxHeight }}>
            <ScrollView>
              {options.map((item: any) => {
                const id = Number(item.id);
                const checked = selectedIds.includes(id);
                return (
                  <TouchableOpacity key={String(id)} className="px-3 flex-row items-center" style={{ minHeight: PICKER_ROW_HEIGHT }} onPress={() => onToggle(id)}>
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        borderWidth: 2,
                        borderColor: checked ? colors.primary : "#ccc",
                        backgroundColor: checked ? colors.primary : "#fff",
                        marginRight: 10,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {checked ? <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>✓</Text> : null}
                    </View>
                    <Text className="text-sm text-foreground" numberOfLines={1}>{getLabel(item)}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Text className="text-3xl font-bold text-foreground">&lt;</Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">Bulk Client Reassign</Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center gap-2 px-4 py-2 bg-surface rounded-full border border-border"
            onPress={() => setShowFilters((v) => !v)}
          >
            <IconSymbol name="line.3.horizontal.decrease" size={18} color={colors.foreground} />
            <Text className="text-sm font-medium text-foreground">Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showFilters && (
        <View className="px-6 py-4 bg-surface border-b border-border gap-3">
          {hasAnyFilter && (
            <View className="flex-row justify-end">
              <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border" onPress={clearAllFilters}>
                <Text className="text-sm font-medium text-foreground">Clear All</Text>
              </TouchableOpacity>
            </View>
          )}

          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Source Company</Text>
            <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border" onPress={() => setShowCompanyModal(true)}>
              <Text className="text-sm font-medium text-foreground">{companyLabel}</Text>
            </TouchableOpacity>
          </View>

          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Source Department</Text>
            <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border" onPress={() => setShowDeptModal(true)}>
              <Text className="text-sm font-medium text-foreground">{deptLabel}</Text>
            </TouchableOpacity>
          </View>

          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Source Team</Text>
            <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border" onPress={() => setShowTeamModal(true)}>
              <Text className="text-sm font-medium text-foreground">{teamLabel}</Text>
            </TouchableOpacity>
          </View>

          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Select Clients</Text>
            <View className="flex-row gap-2">
              <TouchableOpacity className="flex-1 px-4 py-2 bg-background rounded-full border border-border" onPress={() => setShowClientModal(true)}>
                <Text className="text-sm font-medium text-foreground">
                  {selectedClientIds.length > 0 ? `${selectedClientIds.length} selected` : "No clients selected"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border" onPress={() => setSelectedClientIds([])}>
                <Text className="text-sm font-medium text-foreground">Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}>
        <View className="bg-surface rounded-2xl border border-border p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-semibold text-foreground">Selected Clients</Text>
            <TouchableOpacity className="px-3 py-1 rounded-full border border-border bg-background" onPress={selectAllFiltered}>
              <Text className="text-xs text-foreground font-semibold">Select All Filtered</Text>
            </TouchableOpacity>
          </View>

          {selectedClients.length === 0 ? (
            <Text className="text-sm text-muted">No clients selected yet.</Text>
          ) : (
            <View className="gap-2">
              {selectedClients.slice(0, 12).map((client: any) => (
                <View key={client.id} className="px-3 py-2 bg-background rounded-xl border border-border">
                  <Text className="text-sm font-semibold text-foreground">{client.name}</Text>
                  <Text className="text-xs text-muted">{companyById.get(Number(client.companyId)) || "No company"}</Text>
                </View>
              ))}
              {selectedClients.length > 12 && (
                <Text className="text-xs text-muted">...and {selectedClients.length - 12} more</Text>
              )}
            </View>
          )}
        </View>

        <View className="bg-surface rounded-2xl border border-border p-4 mb-4 gap-3">
          <Text className="text-base font-semibold text-foreground">Destination</Text>

          <View>
            <Text className="text-sm text-muted mb-2">Company *</Text>
            <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border" onPress={() => setShowDestCompanyModal(true)}>
              <Text className="text-sm font-medium text-foreground">{destCompanyLabel}</Text>
            </TouchableOpacity>
          </View>

          <View>
            <Text className="text-sm text-muted mb-2">Department *</Text>
            <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border" onPress={() => setShowDestDeptModal(true)}>
              <Text className="text-sm font-medium text-foreground">{destDeptLabel}</Text>
            </TouchableOpacity>
          </View>

          <View>
            <Text className="text-sm text-muted mb-2">Team *</Text>
            <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border" onPress={() => setShowDestTeamModal(true)}>
              <Text className="text-sm font-medium text-foreground">{destTeamLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleReassign}
          className={`rounded-xl p-4 ${bulkUpdate.isPending || selectedClientIds.length === 0 || !destCompanyId || !destDeptId || !destTeamId ? "bg-muted" : "bg-primary"}`}
          disabled={bulkUpdate.isPending || selectedClientIds.length === 0 || !destCompanyId || !destDeptId || !destTeamId}
        >
          {bulkUpdate.isPending ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text className="text-background font-semibold text-center text-lg">
              Reassign {selectedClientIds.length} Client{selectedClientIds.length !== 1 ? "s" : ""}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {renderMultiSelectModal(
        showCompanyModal,
        () => setShowCompanyModal(false),
        "Source Company",
        companySearch,
        setCompanySearch,
        "Search companies...",
        companyOptions,
        (v) => v.name || "",
        filterCompanyIds,
        (id) => {
          toggleMulti(id, setFilterCompanyIds);
        },
        () => {
          setFilterCompanyIds([]);
          setFilterDeptIds([]);
          setFilterTeamIds([]);
        }
      )}

      {renderMultiSelectModal(
        showDeptModal,
        () => setShowDeptModal(false),
        "Source Department",
        deptSearch,
        setDeptSearch,
        "Search departments...",
        deptOptions,
        (v) => v.name || "",
        filterDeptIds,
        (id) => {
          toggleGroupMulti(id, sourceDepartmentGroupByOptionId, setFilterDeptIds);
        },
        () => {
          setFilterDeptIds([]);
          setFilterTeamIds([]);
        }
      )}

      {renderMultiSelectModal(
        showTeamModal,
        () => setShowTeamModal(false),
        "Source Team",
        teamSearch,
        setTeamSearch,
        "Search teams...",
        teamOptions,
        (v) => v.name || "",
        filterTeamIds,
        (id) => {
          toggleGroupMulti(id, sourceTeamGroupByOptionId, setFilterTeamIds);
        },
        () => {
          setFilterTeamIds([]);
        }
      )}

      {renderSingleSelectModal(
        showDestCompanyModal,
        () => setShowDestCompanyModal(false),
        "Destination Company",
        destCompanySearch,
        setDestCompanySearch,
        "Search companies...",
        destCompanyOptions,
        (v) => v.name || "",
        destCompanyId,
        (id) => {
          setDestCompanyId(id);
          setDestDeptId(0);
          setDestTeamId(0);
          setShowDestCompanyModal(false);
        },
        false
      )}

      {renderSingleSelectModal(
        showDestDeptModal,
        () => setShowDestDeptModal(false),
        "Destination Department",
        destDeptSearch,
        setDestDeptSearch,
        "Search departments...",
        destDeptOptions,
        (v) => v.name || "",
        destDeptId,
        (id) => {
          setDestDeptId(id);
          setDestTeamId(0);
          setShowDestDeptModal(false);
        },
        false,
        "No matching departments.",
        async (name) => {
          if (!destCompanyId) {
            Alert.alert("Validation Error", "Please select destination company first");
            return;
          }
          if (!me?.id) {
            Alert.alert("Error", "Unable to determine current admin user");
            return;
          }

          const created = await createDestinationDepartment.mutateAsync({
            companyId: Number(destCompanyId),
            name,
            createdBy: Number(me.id),
            updatedBy: Number(me.id),
          });

          await utils.coDepartments.invalidate();
          const createdId = getCreatedId(created);
          if (createdId > 0) {
            setDestDeptId(createdId);
            setDestTeamId(0);
          }
          setDestDeptSearch("");
          setShowDestDeptModal(false);
        },
        createDestinationDepartment.isPending
      )}

      {renderSingleSelectModal(
        showDestTeamModal,
        () => setShowDestTeamModal(false),
        "Destination Team",
        destTeamSearch,
        setDestTeamSearch,
        "Search teams...",
        destTeamOptions,
        (v) => v.name || "",
        destTeamId,
        (id) => {
          setDestTeamId(id);
          setShowDestTeamModal(false);
        },
        false,
        "No matching teams.",
        async (name) => {
          if (!destCompanyId) {
            Alert.alert("Validation Error", "Please select destination company first");
            return;
          }
          if (!destDeptId) {
            Alert.alert("Validation Error", "Please select destination department first");
            return;
          }
          if (!me?.id) {
            Alert.alert("Error", "Unable to determine current admin user");
            return;
          }

          const created = await createDestinationTeam.mutateAsync({
            companyId: Number(destCompanyId),
            coDepartmentId: Number(destDeptId),
            name,
            createdBy: Number(me.id),
            updatedBy: Number(me.id),
          });

          await utils.companyTeams.invalidate();
          const createdId = getCreatedId(created);
          if (createdId > 0) {
            setDestTeamId(createdId);
          }
          setDestTeamSearch("");
          setShowDestTeamModal(false);
        },
        createDestinationTeam.isPending
      )}

      <Modal visible={showClientModal} transparent animationType="fade" onRequestClose={() => setShowClientModal(false)}>
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <View className="w-[92%] rounded-2xl p-5" style={{ backgroundColor: colors.background, maxHeight: "82%" }}>
            <View className="relative min-h-[44px] items-center justify-center mb-3">
              <TouchableOpacity onPress={() => setShowClientModal(false)} className="absolute left-0">
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Clients</Text>
            </View>

            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground mb-3"
              placeholder="Search clients..."
              placeholderTextColor={colors.muted}
              value={clientSearch}
              onChangeText={setClientSearch}
            />

            <View className="rounded-xl overflow-hidden" style={{ backgroundColor: "#f5f8fa", maxHeight: pickerMaxHeight }}>
              <ScrollView>
                {filteredClientOptions.length === 0 ? (
                  <View className="px-3 py-3">
                    <Text className="text-sm" style={{ color: colors.muted }}>No clients found.</Text>
                  </View>
                ) : (
                  filteredClientOptions.map((item: any) => {
                    const checked = selectedClientIds.includes(Number(item.id));
                    return (
                      <TouchableOpacity
                        key={String(item.id)}
                        className="px-3 flex-row items-center"
                        style={{ minHeight: PICKER_ROW_HEIGHT }}
                        onPress={() => toggleClient(Number(item.id))}
                      >
                        <View
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            borderWidth: 2,
                            borderColor: checked ? colors.primary : "#ccc",
                            backgroundColor: checked ? colors.primary : "#fff",
                            marginRight: 10,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {checked ? <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>✓</Text> : null}
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm text-foreground" numberOfLines={1}>{item.name}</Text>
                          <Text className="text-xs text-muted" numberOfLines={1}>{companyById.get(Number(item.companyId)) || "No company"}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
