import { useMemo, useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Modal, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

type RowKind = "companyDepartment" | "companyTeam" | "orgDepartment" | "orgTeam";

interface GroupedRow {
  id: number;
  name: string;
  ids: number[];
}

export default function AdminLookupOrgScreen() {
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();
  const { staff } = useAuth();

  const [showCompanyDepartmentsModal, setShowCompanyDepartmentsModal] = useState(false);
  const [showCompanyTeamsModal, setShowCompanyTeamsModal] = useState(false);
  const [showOrgDepartmentsModal, setShowOrgDepartmentsModal] = useState(false);
  const [showOrgTeamsModal, setShowOrgTeamsModal] = useState(false);

  const [companyDeptSearch, setCompanyDeptSearch] = useState("");
  const [companyTeamSearch, setCompanyTeamSearch] = useState("");
  const [orgDeptSearch, setOrgDeptSearch] = useState("");
  const [orgTeamSearch, setOrgTeamSearch] = useState("");

  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(0);
  const [selectedOrgId, setSelectedOrgId] = useState<number>(0);
  const [selectedCompanyDeptId, setSelectedCompanyDeptId] = useState<number>(0);
  const [selectedOrgDeptId, setSelectedOrgDeptId] = useState<number>(0);

  const [lastSelectedCompanyId, setLastSelectedCompanyId] = useState<number>(0);
  const [lastSelectedOrgId, setLastSelectedOrgId] = useState<number>(0);
  const [lastSelectedCompanyDeptId, setLastSelectedCompanyDeptId] = useState<number>(0);
  const [lastSelectedOrgDeptId, setLastSelectedOrgDeptId] = useState<number>(0);

  const [showCompanyPickerModal, setShowCompanyPickerModal] = useState(false);
  const [showCompanyDeptPickerModal, setShowCompanyDeptPickerModal] = useState(false);
  const [showOrgPickerModal, setShowOrgPickerModal] = useState(false);
  const [showOrgDeptPickerModal, setShowOrgDeptPickerModal] = useState(false);

  const [companyPickerSearch, setCompanyPickerSearch] = useState("");
  const [companyDeptPickerSearch, setCompanyDeptPickerSearch] = useState("");
  const [orgPickerSearch, setOrgPickerSearch] = useState("");
  const [orgDeptPickerSearch, setOrgDeptPickerSearch] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editTarget, setEditTarget] = useState<{ kind: RowKind; ids: number[] } | null>(null);
  const [editOrigin, setEditOrigin] = useState<RowKind | null>(null);

  const { data: companies } = trpc.companies.list.useQuery();
  const { data: coDepartments, isLoading: coDepartmentsLoading } = trpc.coDepartments.all.useQuery();
  const { data: companyTeams, isLoading: companyTeamsLoading } = trpc.companyTeams.listAll.useQuery();
  const { data: organizations } = trpc.organizations.list.useQuery();
  const { data: staffDepartments, isLoading: staffDepartmentsLoading } = trpc.staffDepartments.list.useQuery({ organizationId: 0 });
  const { data: staffTeams, isLoading: staffTeamsLoading } = trpc.teams.list.useQuery({ organizationId: 0 });

  const isLoading = coDepartmentsLoading || companyTeamsLoading || staffDepartmentsLoading || staffTeamsLoading;

  const getCreatedId = (result: any) => {
    if (typeof result === "number") return Number(result);
    if (result && typeof result.insertId === "number") return Number(result.insertId);
    if (result && typeof result.id === "number") return Number(result.id);
    return 0;
  };

  const createCompanyDepartment = trpc.coDepartments.create.useMutation({
    onError: (error: any) => Alert.alert("Error", error.message || "Failed to create company department"),
  });

  const createCompanyTeam = trpc.companyTeams.create.useMutation({
    onError: (error: any) => Alert.alert("Error", error.message || "Failed to create company team"),
  });

  const createOrgDepartment = trpc.staffDepartments.create.useMutation({
    onError: (error: any) => Alert.alert("Error", error.message || "Failed to create staff department"),
  });

  const createOrgTeam = trpc.teams.create.useMutation({
    onError: (error: any) => Alert.alert("Error", error.message || "Failed to create staff team"),
  });

  const updateCompanyDepartment = trpc.coDepartments.update.useMutation({
    onError: (error: any) => Alert.alert("Error", error.message || "Failed to update company department"),
  });

  const deleteCompanyDepartment = trpc.coDepartments.delete.useMutation({
    onError: (error: any) => Alert.alert("Error", error.message || "Failed to delete company department"),
  });

  const updateCompanyTeam = trpc.companyTeams.update.useMutation({
    onError: (error: any) => Alert.alert("Error", error.message || "Failed to update company team"),
  });

  const deleteCompanyTeam = trpc.companyTeams.delete.useMutation({
    onError: (error: any) => Alert.alert("Error", error.message || "Failed to delete company team"),
  });

  const updateOrgDepartment = trpc.staffDepartments.update.useMutation({
    onError: (error: any) => Alert.alert("Error", error.message || "Failed to update organization department"),
  });

  const deleteOrgDepartment = trpc.staffDepartments.delete.useMutation({
    onError: (error: any) => Alert.alert("Error", error.message || "Failed to delete organization department"),
  });

  const updateOrgTeam = trpc.teams.update.useMutation({
    onError: (error: any) => Alert.alert("Error", error.message || "Failed to update staff/org team"),
  });

  const deleteOrgTeam = trpc.teams.delete.useMutation({
    onError: (error: any) => Alert.alert("Error", error.message || "Failed to delete staff/org team"),
  });

  const coDepartmentById = useMemo(() => {
    const map = new Map<number, any>();
    (coDepartments || []).forEach((dept: any) => map.set(Number(dept.id), dept));
    return map;
  }, [coDepartments]);

  const staffDepartmentById = useMemo(() => {
    const map = new Map<number, any>();
    (staffDepartments || []).forEach((dept: any) => map.set(Number(dept.id), dept));
    return map;
  }, [staffDepartments]);

  const searchList = (items: any[] | undefined, query: string, getLabel: (item: any) => string) => {
    const source = items || [];
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter((item) => getLabel(item).toLowerCase().includes(q));
  };

  const uniqueByName = (items: any[] | undefined): GroupedRow[] => {
    const source = items || [];
    const byName = new Map<string, GroupedRow>();

    source.forEach((item: any) => {
      const name = String(item?.name || "").trim();
      const key = name.toLowerCase();
      const id = Number(item.id);
      if (!key) return;

      const existing = byName.get(key);
      if (!existing) {
        byName.set(key, { id, name, ids: [id] });
      } else if (!existing.ids.includes(id)) {
        existing.ids.push(id);
      }
    });

    return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  const companyDepartmentsScope = selectedCompanyId > 0
    ? (coDepartments || []).filter((dept: any) => Number(dept.companyId) === Number(selectedCompanyId))
    : (coDepartments || []);
  const groupedCompanyDepartments = useMemo(() => uniqueByName(companyDepartmentsScope as any[]), [companyDepartmentsScope]);
  const filteredCompanyDepartments = searchList(groupedCompanyDepartments as any[], companyDeptSearch, (item) => item.name || "") as GroupedRow[];
  const companyTeamsScope = selectedCompanyDeptId > 0
    ? (companyTeams || []).filter((team: any) => Number(team.coDepartmentId) === Number(selectedCompanyDeptId))
    : (companyTeams || []);
  const groupedCompanyTeams = useMemo(() => uniqueByName(companyTeamsScope as any[]), [companyTeamsScope]);
  const filteredCompanyTeams = searchList(groupedCompanyTeams as any[], companyTeamSearch, (item) => item.name || "") as GroupedRow[];

  const orgDepartmentsScope = selectedOrgId > 0
    ? (staffDepartments || []).filter((dept: any) => Number(dept.organizationId) === Number(selectedOrgId))
    : (staffDepartments || []);
  const groupedOrgDepartments = useMemo(() => uniqueByName(orgDepartmentsScope as any[]), [orgDepartmentsScope]);
  const filteredOrgDepartments = searchList(groupedOrgDepartments as any[], orgDeptSearch, (item) => item.name || "") as GroupedRow[];
  const orgTeamsScope = selectedOrgDeptId > 0
    ? (staffTeams || []).filter((team: any) => Number(team.staffDepartmentId) === Number(selectedOrgDeptId))
    : (staffTeams || []);
  const groupedOrgTeams = useMemo(() => uniqueByName(orgTeamsScope as any[]), [orgTeamsScope]);
  const filteredOrgTeams = searchList(groupedOrgTeams as any[], orgTeamSearch, (item) => item.name || "") as GroupedRow[];

  const companyPickerOptions = searchList(companies as any[], companyPickerSearch, (item) => item.name || "");
  const orgPickerOptions = searchList(organizations as any[], orgPickerSearch, (item) => item.name || "");
  const companyDeptPickerOptions = searchList(groupedCompanyDepartments as any[], companyDeptPickerSearch, (item) => item.name || "") as GroupedRow[];
  const orgDeptPickerOptions = searchList(groupedOrgDepartments as any[], orgDeptPickerSearch, (item) => item.name || "") as GroupedRow[];

  const selectedCompanyLabel = selectedCompanyId > 0
    ? (companies || []).find((c: any) => Number(c.id) === Number(selectedCompanyId))?.name || "Selected company"
    : "All Companies";
  const selectedCompanyDeptLabel = selectedCompanyDeptId > 0
    ? groupedCompanyDepartments.find((d) => Number(d.id) === Number(selectedCompanyDeptId))?.name || "Selected department"
    : "All Company Departments";
  const selectedOrgLabel = selectedOrgId > 0
    ? (organizations || []).find((o: any) => Number(o.id) === Number(selectedOrgId))?.name || "Selected organization"
    : "All Organizations";
  const selectedOrgDeptLabel = selectedOrgDeptId > 0
    ? groupedOrgDepartments.find((d) => Number(d.id) === Number(selectedOrgDeptId))?.name || "Selected department"
    : "All Staff/Org Departments";

  const sections = [
    {
      title: "Company Departments",
      icon: "square.grid.2x2.fill" as const,
      color: colors.primary,
      count: uniqueByName(coDepartments as any[]).length,
      onPress: () => setShowCompanyDepartmentsModal(true),
    },
    {
      title: "Company Teams",
      icon: "person.3.fill" as const,
      color: colors.success,
      count: uniqueByName(companyTeams as any[]).length,
      onPress: () => setShowCompanyTeamsModal(true),
    },
    {
      title: "Staff/Org Department",
      icon: "building.2.fill" as const,
      color: colors.warning,
      count: uniqueByName(staffDepartments as any[]).length,
      onPress: () => setShowOrgDepartmentsModal(true),
    },
    {
      title: "Staff/Org Teams",
      icon: "person.3.fill" as const,
      color: colors.muted,
      count: uniqueByName(staffTeams as any[]).length,
      onPress: () => setShowOrgTeamsModal(true),
    },
  ];

  const clearSectionSearches = () => {
    setCompanyDeptSearch("");
    setCompanyTeamSearch("");
    setOrgDeptSearch("");
    setOrgTeamSearch("");
  };

  const openSectionModal = (section: RowKind) => {
    clearSectionSearches();
    setShowCompanyDepartmentsModal(false);
    setShowCompanyTeamsModal(false);
    setShowOrgDepartmentsModal(false);
    setShowOrgTeamsModal(false);

    switch (section) {
      case "companyDepartment":
        setShowCompanyDepartmentsModal(true);
        break;
      case "companyTeam":
        setShowCompanyTeamsModal(true);
        break;
      case "orgDepartment":
        setShowOrgDepartmentsModal(true);
        break;
      case "orgTeam":
        setShowOrgTeamsModal(true);
        break;
    }
  };

  const reopenOriginModal = (origin: RowKind | null) => {
    if (!origin) return;
    switch (origin) {
      case "companyDepartment":
        setShowCompanyDepartmentsModal(true);
        break;
      case "companyTeam":
        setShowCompanyTeamsModal(true);
        break;
      case "orgDepartment":
        setShowOrgDepartmentsModal(true);
        break;
      case "orgTeam":
        setShowOrgTeamsModal(true);
        break;
    }
  };

  const closeEditModal = (reopenOrigin = false) => {
    const origin = editOrigin;
    setShowEditModal(false);
    setTimeout(() => {
      if (reopenOrigin) {
        reopenOriginModal(origin);
      }
      setEditTarget(null);
      setEditName("");
      setEditOrigin(null);
    }, 120);
  };

  const openEdit = (kind: RowKind, row: GroupedRow, closeParentModal?: () => void) => {
    setEditOrigin(kind);
    if (closeParentModal) {
      closeParentModal();
    }
    setTimeout(() => {
      setEditTarget({ kind, ids: row.ids });
      setEditName(row.name);
      setShowEditModal(true);
    }, 180);
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    if (!editName.trim()) {
      Alert.alert("Validation Error", "Please enter a name");
      return;
    }
    if (!staff?.id) {
      Alert.alert("Error", "Staff not authenticated");
      return;
    }

    const ids = editTarget.ids;
    const name = editName.trim();
    const updatedBy = Number(staff.id);

    switch (editTarget.kind) {
      case "companyDepartment":
        await Promise.all(ids.map((id) => updateCompanyDepartment.mutateAsync({ id, name, updatedBy })));
        await utils.coDepartments.invalidate();
        break;
      case "companyTeam":
        await Promise.all(ids.map((id) => updateCompanyTeam.mutateAsync({ id, name, updatedBy })));
        await utils.companyTeams.invalidate();
        break;
      case "orgDepartment":
        await Promise.all(ids.map((id) => updateOrgDepartment.mutateAsync({ id, name, updatedBy })));
        await utils.staffDepartments.invalidate();
        break;
      case "orgTeam":
        await Promise.all(ids.map((id) => updateOrgTeam.mutateAsync({ id, name, updatedBy })));
        await utils.teams.invalidate();
        break;
    }

    closeEditModal(true);
    Alert.alert("Success", "Updated successfully");
  };

  const confirmDelete = (kind: RowKind, row: GroupedRow) => {
    Alert.alert(
      "Confirm Delete",
      `Delete ${row.ids.length > 1 ? "all entries for " : ""}"${row.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            switch (kind) {
              case "companyDepartment":
                await Promise.all(row.ids.map((id) => deleteCompanyDepartment.mutateAsync({ id })));
                await utils.coDepartments.invalidate();
                break;
              case "companyTeam":
                await Promise.all(row.ids.map((id) => deleteCompanyTeam.mutateAsync({ id })));
                await utils.companyTeams.invalidate();
                break;
              case "orgDepartment":
                await Promise.all(row.ids.map((id) => deleteOrgDepartment.mutateAsync({ id })));
                await utils.staffDepartments.invalidate();
                break;
              case "orgTeam":
                await Promise.all(row.ids.map((id) => deleteOrgTeam.mutateAsync({ id })));
                await utils.teams.invalidate();
                break;
            }
            Alert.alert("Success", "Deleted successfully");
          },
        },
      ]
    );
  };

  const renderPickerModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    searchValue: string,
    setSearchValue: (v: string) => void,
    searchPlaceholder: string,
    rows: GroupedRow[],
    kind: RowKind,
    createPending?: boolean,
    createAction?: (name: string) => void,
    emptyText?: string,
    topControls?: React.ReactNode
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
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.muted}
            value={searchValue}
            onChangeText={setSearchValue}
          />

          {topControls}

          <View className="rounded-xl overflow-hidden" style={{ backgroundColor: "#f5f8fa", maxHeight: 320 }}>
            <ScrollView>
              {rows.length === 0 ? (
                <View className="px-3 py-3">
                  <Text className="text-sm" style={{ color: colors.muted }}>{emptyText || "No matching results."}</Text>
                </View>
              ) : (
                rows.map((item: any) => (
                  <View key={String(item.id)} className="px-3 py-2 border-b border-border/40">
                    <View className="flex-row items-center justify-between gap-2">
                      <Text className="text-sm font-semibold text-foreground flex-1" numberOfLines={1}>{item.name}</Text>
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          className="px-3 py-1 rounded-full border border-border bg-background"
                          onPress={() => {
                            openEdit(kind, item, onClose);
                          }}
                        >
                          <Text className="text-xs font-semibold text-foreground">Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="px-3 py-1 rounded-full border border-error bg-error/10"
                          onPress={() => confirmDelete(kind, item)}
                        >
                          <Text className="text-xs font-semibold text-error">Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>

          {createAction && searchValue.trim().length > 0 && !rows.some((item) => item.name.trim().toLowerCase() === searchValue.trim().toLowerCase()) && (
            <TouchableOpacity
              disabled={createPending}
              className="rounded-lg px-4 py-3 mt-3"
              style={{ backgroundColor: createPending ? colors.muted : colors.primary }}
              onPress={() => createAction(searchValue.trim())}
            >
              <Text className="text-base font-semibold text-center" style={{ color: "#fff" }}>
                {createPending ? "Creating..." : `Create "${searchValue.trim()}"`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderSingleSelectorModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    searchValue: string,
    setSearchValue: (v: string) => void,
    placeholder: string,
    options: any[],
    getLabel: (item: any) => string,
    selectedId: number,
    onSelect: (id: number) => void
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
            value={searchValue}
            onChangeText={setSearchValue}
          />

          <View className="rounded-xl overflow-hidden" style={{ backgroundColor: "#f5f8fa", maxHeight: 320 }}>
            <ScrollView>
              <TouchableOpacity className="px-3 py-2 border-b border-border/40" onPress={() => onSelect(0)}>
                <Text className={`text-sm font-semibold ${selectedId === 0 ? "text-primary" : "text-foreground"}`}>All</Text>
              </TouchableOpacity>
              {options.map((item: any) => {
                const id = Number(item.id);
                return (
                  <TouchableOpacity key={String(id)} className="px-3 py-2 border-b border-border/40" onPress={() => onSelect(id)}>
                    <Text className={`text-sm font-semibold ${selectedId === id ? "text-primary" : "text-foreground"}`}>{getLabel(item)}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScreenContainer className="flex-1">
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Text className="text-3xl font-bold text-foreground">&lt;</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Organizational Lookup Tables</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View className="gap-4">
            {sections.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="bg-surface border border-border rounded-2xl p-5"
                onPress={() => {
                  if (item.title === "Company Departments") openSectionModal("companyDepartment");
                  if (item.title === "Company Teams") openSectionModal("companyTeam");
                  if (item.title === "Staff/Org Department") openSectionModal("orgDepartment");
                  if (item.title === "Staff/Org Teams") openSectionModal("orgTeam");
                }}
              >
                <View className="flex-row items-center gap-4">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <IconSymbol name={item.icon} size={24} color={item.color} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-lg font-semibold text-foreground">{item.title}</Text>
                      <View
                        className="px-2 py-1 rounded-full"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <Text className="text-xs font-semibold" style={{ color: item.color }}>
                          {item.count}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <IconSymbol name="chevron.right" size={24} color={colors.muted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {renderPickerModal(
        showCompanyDepartmentsModal,
        () => {
          setShowCompanyDepartmentsModal(false);
          setCompanyDeptSearch("");
        },
        "Company Departments",
        companyDeptSearch,
        setCompanyDeptSearch,
        "Search company departments...",
        filteredCompanyDepartments,
        "companyDepartment",
        createCompanyDepartment.isPending,
        async (name) => {
          if (!staff?.id) {
            Alert.alert("Error", "Staff not authenticated");
            return;
          }
          if (!selectedCompanyId) {
            Alert.alert("Validation Error", "Select a company first before creating a department.");
            return;
          }

          const created = await createCompanyDepartment.mutateAsync({
            companyId: Number(selectedCompanyId),
            name,
            createdBy: Number(staff.id),
            updatedBy: Number(staff.id),
          });

          await utils.coDepartments.invalidate();
          const createdId = getCreatedId(created);
          if (createdId > 0) {
            setSelectedCompanyDeptId(createdId);
          }
          setCompanyDeptSearch("");
        },
        "No matching company departments.",
        <View className="mb-3">
          <Text className="text-xs text-muted mb-1">Company</Text>
          <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border" onPress={() => setShowCompanyPickerModal(true)}>
            <Text className="text-sm font-medium text-foreground">{selectedCompanyLabel}</Text>
          </TouchableOpacity>
        </View>
      )}

      {renderPickerModal(
        showCompanyTeamsModal,
        () => {
          setShowCompanyTeamsModal(false);
          setCompanyTeamSearch("");
        },
        "Company Teams",
        companyTeamSearch,
        setCompanyTeamSearch,
        "Search company teams...",
        filteredCompanyTeams,
        "companyTeam",
        createCompanyTeam.isPending,
        async (name) => {
          if (!staff?.id) {
            Alert.alert("Error", "Staff not authenticated");
            return;
          }
          if (!selectedCompanyDeptId) {
            Alert.alert("Validation Error", "Select a company department first before creating a team.");
            return;
          }

          const dept = coDepartmentById.get(Number(selectedCompanyDeptId));
          if (!dept) {
            Alert.alert("Validation Error", "Selected department not found.");
            return;
          }

          await createCompanyTeam.mutateAsync({
            companyId: Number(dept.companyId),
            coDepartmentId: Number(selectedCompanyDeptId),
            name,
            createdBy: Number(staff.id),
            updatedBy: Number(staff.id),
          });

          await utils.companyTeams.invalidate();
          setCompanyTeamSearch("");
        },
        "No matching company teams.",
        <View className="mb-3">
          <Text className="text-xs text-muted mb-1">Department</Text>
          <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border" onPress={() => setShowCompanyDeptPickerModal(true)}>
            <Text className="text-sm font-medium text-foreground">{selectedCompanyDeptLabel}</Text>
          </TouchableOpacity>
        </View>
      )}

      {renderPickerModal(
        showOrgDepartmentsModal,
        () => {
          setShowOrgDepartmentsModal(false);
          setOrgDeptSearch("");
        },
        "Staff/Org Department",
        orgDeptSearch,
        setOrgDeptSearch,
        "Search staff/org departments...",
        filteredOrgDepartments,
        "orgDepartment",
        createOrgDepartment.isPending,
        async (name) => {
          if (!staff?.id) {
            Alert.alert("Error", "Staff not authenticated");
            return;
          }
          if (!selectedOrgId) {
            Alert.alert("Validation Error", "Select an organization first before creating a department.");
            return;
          }

          const created = await createOrgDepartment.mutateAsync({
            organizationId: Number(selectedOrgId),
            name,
            createdBy: Number(staff.id),
            updatedBy: Number(staff.id),
          });

          await utils.staffDepartments.invalidate();
          const createdId = getCreatedId(created);
          if (createdId > 0) {
            setSelectedOrgDeptId(createdId);
          }
          setOrgDeptSearch("");
        },
        "No matching staff/org departments.",
        <View className="mb-3">
          <Text className="text-xs text-muted mb-1">Organization</Text>
          <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border" onPress={() => setShowOrgPickerModal(true)}>
            <Text className="text-sm font-medium text-foreground">{selectedOrgLabel}</Text>
          </TouchableOpacity>
        </View>
      )}

      {renderPickerModal(
        showOrgTeamsModal,
        () => {
          setShowOrgTeamsModal(false);
          setOrgTeamSearch("");
        },
        "Staff/Org Teams",
        orgTeamSearch,
        setOrgTeamSearch,
        "Search staff/org teams...",
        filteredOrgTeams,
        "orgTeam",
        createOrgTeam.isPending,
        async (name) => {
          if (!staff?.id) {
            Alert.alert("Error", "Staff not authenticated");
            return;
          }
          if (!selectedOrgDeptId) {
            Alert.alert("Validation Error", "Select a staff/org department first before creating a team.");
            return;
          }

          const dept = staffDepartmentById.get(Number(selectedOrgDeptId));
          if (!dept) {
            Alert.alert("Validation Error", "Selected department not found.");
            return;
          }

          await createOrgTeam.mutateAsync({
            organizationId: Number(dept.organizationId),
            staffDepartmentId: Number(selectedOrgDeptId),
            name,
            createdBy: Number(staff.id),
            updatedBy: Number(staff.id),
          });

          await utils.teams.invalidate();
          setOrgTeamSearch("");
        },
        "No matching staff/org teams.",
        <View className="mb-3">
          <Text className="text-xs text-muted mb-1">Department</Text>
          <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border" onPress={() => setShowOrgDeptPickerModal(true)}>
            <Text className="text-sm font-medium text-foreground">{selectedOrgDeptLabel}</Text>
          </TouchableOpacity>
        </View>
      )}

      {renderSingleSelectorModal(
        showCompanyPickerModal,
        () => setShowCompanyPickerModal(false),
        "Select Company",
        companyPickerSearch,
        setCompanyPickerSearch,
        "Search companies...",
        companyPickerOptions,
        (item) => item.name || "",
        selectedCompanyId,
        (id) => {
          setSelectedCompanyId(id);
          if (id > 0) setLastSelectedCompanyId(id);
          setShowCompanyPickerModal(false);
        }
      )}

      {renderSingleSelectorModal(
        showCompanyDeptPickerModal,
        () => setShowCompanyDeptPickerModal(false),
        "Select Company Department",
        companyDeptPickerSearch,
        setCompanyDeptPickerSearch,
        "Search departments...",
        companyDeptPickerOptions,
        (item) => item.name || "",
        selectedCompanyDeptId,
        (id) => {
          setSelectedCompanyDeptId(id);
          if (id > 0) setLastSelectedCompanyDeptId(id);
          setShowCompanyDeptPickerModal(false);
        }
      )}

      {renderSingleSelectorModal(
        showOrgPickerModal,
        () => setShowOrgPickerModal(false),
        "Select Organization",
        orgPickerSearch,
        setOrgPickerSearch,
        "Search organizations...",
        orgPickerOptions,
        (item) => item.name || "",
        selectedOrgId,
        (id) => {
          setSelectedOrgId(id);
          if (id > 0) setLastSelectedOrgId(id);
          setShowOrgPickerModal(false);
        }
      )}

      {renderSingleSelectorModal(
        showOrgDeptPickerModal,
        () => setShowOrgDeptPickerModal(false),
        "Select Organization Department",
        orgDeptPickerSearch,
        setOrgDeptPickerSearch,
        "Search departments...",
        orgDeptPickerOptions,
        (item) => item.name || "",
        selectedOrgDeptId,
        (id) => {
          setSelectedOrgDeptId(id);
          if (id > 0) setLastSelectedOrgDeptId(id);
          setShowOrgDeptPickerModal(false);
        }
      )}

      <Modal visible={showEditModal} transparent animationType="fade" onRequestClose={() => closeEditModal(true)}>
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <View className="w-[92%] rounded-2xl p-5" style={{ backgroundColor: colors.background }}>
            <View className="relative min-h-[44px] items-center justify-center mb-3">
              <TouchableOpacity onPress={() => closeEditModal(true)} className="absolute left-0">
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Edit Name</Text>
            </View>

            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground mb-4"
              placeholder="Enter name"
              placeholderTextColor={colors.muted}
              value={editName}
              onChangeText={setEditName}
            />

            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 bg-surface border border-border py-3 rounded-full items-center"
                onPress={() => closeEditModal(true)}
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary py-3 rounded-full items-center"
                onPress={handleSaveEdit}
              >
                <Text className="text-background font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
