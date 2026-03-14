import { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

export default function AdminStaffBulkReassignScreen() {
  const colors = useColors();
  const utils = trpc.useUtils();
  const { data: me } = trpc.auth.me.useQuery();

  const [showFilters, setShowFilters] = useState(true);

  const [filterOrgId, setFilterOrgId] = useState<number>(0);
  const [filterDeptId, setFilterDeptId] = useState<number>(0);
  const [filterTeamId, setFilterTeamId] = useState<number>(0);

  const [destOrgId, setDestOrgId] = useState<number>(0);
  const [destDeptId, setDestDeptId] = useState<number>(0);
  const [destTeamId, setDestTeamId] = useState<number>(0);

  const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);

  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showDestOrgModal, setShowDestOrgModal] = useState(false);
  const [showDestDeptModal, setShowDestDeptModal] = useState(false);
  const [showDestTeamModal, setShowDestTeamModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

  const [orgSearch, setOrgSearch] = useState("");
  const [deptSearch, setDeptSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [destOrgSearch, setDestOrgSearch] = useState("");
  const [destDeptSearch, setDestDeptSearch] = useState("");
  const [destTeamSearch, setDestTeamSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");

  const PICKER_ROW_HEIGHT = 40;
  const pickerMaxHeight = PICKER_ROW_HEIGHT * 8;

  const { data: organizations } = trpc.organizations.list.useQuery();
  const { data: allDepartments } = trpc.staffDepartments.list.useQuery({ organizationId: 0 });
  const { data: allTeams } = trpc.teams.list.useQuery({ organizationId: 0 });
  const { data: allStaff, isLoading } = trpc.staff.listAll.useQuery();

  const filteredDepartments = useMemo(() => {
    const source = allDepartments || [];
    return filterOrgId > 0 ? source.filter((d: any) => Number(d.organizationId) === Number(filterOrgId)) : source;
  }, [allDepartments, filterOrgId]);

  const filteredTeams = useMemo(() => {
    const source = allTeams || [];
    return source.filter((t: any) => {
      if (filterOrgId > 0 && Number(t.groupId) !== Number(filterOrgId)) return false;
      if (filterDeptId > 0 && Number(t.staffDepartmentId) !== Number(filterDeptId)) return false;
      return true;
    });
  }, [allTeams, filterOrgId, filterDeptId]);

  const destDepartments = useMemo(() => {
    const source = allDepartments || [];
    return destOrgId > 0 ? source.filter((d: any) => Number(d.organizationId) === Number(destOrgId)) : source;
  }, [allDepartments, destOrgId]);

  const destTeams = useMemo(() => {
    const source = allTeams || [];
    return source.filter((t: any) => {
      if (destOrgId > 0 && Number(t.groupId) !== Number(destOrgId)) return false;
      if (destDeptId > 0 && Number(t.staffDepartmentId) !== Number(destDeptId)) return false;
      return true;
    });
  }, [allTeams, destOrgId, destDeptId]);

  const sourceStaff = useMemo(() => {
    const source = allStaff || [];
    return source.filter((s: any) => {
      if (filterTeamId > 0) {
        return Number(s.teamId) === Number(filterTeamId);
      }
      if (filterOrgId === 0 && filterDeptId === 0) {
        return true;
      }
      const team = (allTeams || []).find((t: any) => Number(t.id) === Number(s.teamId));
      if (!team) return false;
      if (filterOrgId > 0 && Number(team.groupId) !== Number(filterOrgId)) return false;
      if (filterDeptId > 0 && Number(team.staffDepartmentId) !== Number(filterDeptId)) return false;
      return true;
    });
  }, [allStaff, allTeams, filterOrgId, filterDeptId, filterTeamId]);

  const filteredStaffOptions = useMemo(() => {
    const q = staffSearch.trim().toLowerCase();
    if (!q) return sourceStaff;
    return sourceStaff.filter((s: any) => {
      const name = (s.name || "").toLowerCase();
      const email = (s.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [sourceStaff, staffSearch]);

  const searchList = (items: any[] | undefined, search: string, pick: (v: any) => string) => {
    const q = search.trim().toLowerCase();
    const source = items || [];
    if (!q) return source;
    return source.filter((item) => pick(item).toLowerCase().includes(q));
  };

  const orgOptions = searchList(organizations as any[], orgSearch, (v) => v.name || "");
  const deptOptions = searchList(filteredDepartments as any[], deptSearch, (v) => v.name || "");
  const teamOptions = searchList(filteredTeams as any[], teamSearch, (v) => v.name || "");
  const destOrgOptions = searchList(organizations as any[], destOrgSearch, (v) => v.name || "");
  const destDeptOptions = searchList(destDepartments as any[], destDeptSearch, (v) => v.name || "");
  const destTeamOptions = searchList(destTeams as any[], destTeamSearch, (v) => v.name || "");

  const orgLabel = organizations?.find((o: any) => Number(o.id) === Number(filterOrgId))?.name || "All Organizations";
  const deptLabel = (allDepartments || []).find((d: any) => Number(d.id) === Number(filterDeptId))?.name || "All Departments";
  const teamLabel = (allTeams || []).find((t: any) => Number(t.id) === Number(filterTeamId))?.name || "All Teams";

  const destOrgLabel = organizations?.find((o: any) => Number(o.id) === Number(destOrgId))?.name || "Select Organization";
  const destDeptLabel = (allDepartments || []).find((d: any) => Number(d.id) === Number(destDeptId))?.name || "Select Department";
  const destTeamLabel = (allTeams || []).find((t: any) => Number(t.id) === Number(destTeamId))?.name || "Select Team";

  const selectedStaff = useMemo(() => {
    const selected = new Set(selectedStaffIds);
    return (allStaff || []).filter((s: any) => selected.has(Number(s.id)));
  }, [allStaff, selectedStaffIds]);

  const hasAnyFilter = filterOrgId > 0 || filterDeptId > 0 || filterTeamId > 0 || selectedStaffIds.length > 0;

  const bulkUpdateStaff = trpc.staff.bulkUpdate.useMutation({
    onSuccess: (res: any) => {
      utils.staff.listAll.invalidate();
      Alert.alert("Success", `${res?.updated || selectedStaffIds.length} staff member(s) reassigned successfully`);
      setSelectedStaffIds([]);
      router.back();
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to reassign staff members");
    },
  });

  const toggleStaffSelection = (id: number) => {
    setSelectedStaffIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const clearAllFilters = () => {
    setFilterOrgId(0);
    setFilterDeptId(0);
    setFilterTeamId(0);
    setSelectedStaffIds([]);
    setStaffSearch("");
  };

  const handleBulkReassign = () => {
    if (selectedStaffIds.length === 0) {
      Alert.alert("Error", "Please select at least one staff member");
      return;
    }
    if (!destTeamId) {
      Alert.alert("Error", "Please select a destination team");
      return;
    }
    if (!me?.id) {
      Alert.alert("Error", "Unable to determine current admin user");
      return;
    }

    Alert.alert(
      "Confirm Bulk Reassignment",
      `Reassign ${selectedStaffIds.length} staff member(s) to ${destTeamLabel}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reassign",
          onPress: () => {
            bulkUpdateStaff.mutate({
              staffIds: selectedStaffIds,
              teamId: destTeamId,
              updatedBy: Number(me.id),
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
    allowClear = true
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
            <Text className="text-2xl font-bold text-foreground">Bulk Staff Reassign</Text>
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
            <Text className="text-sm font-semibold text-foreground mb-2">Source Organization</Text>
            <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border" onPress={() => setShowOrgModal(true)}>
              <Text className="text-sm font-medium text-foreground">{orgLabel}</Text>
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
            <Text className="text-sm font-semibold text-foreground mb-2">Select Staff</Text>
            <View className="flex-row gap-2">
              <TouchableOpacity className="flex-1 px-4 py-2 bg-background rounded-full border border-border" onPress={() => setShowStaffModal(true)}>
                <Text className="text-sm font-medium text-foreground">
                  {selectedStaffIds.length > 0 ? `${selectedStaffIds.length} selected` : "No staff selected"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border" onPress={() => setSelectedStaffIds([])}>
                <Text className="text-sm font-medium text-foreground">Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}>
        <View className="bg-surface rounded-2xl border border-border p-4 mb-4">
          <Text className="text-base font-semibold text-foreground mb-3">Selected Staff</Text>
          {selectedStaff.length === 0 ? (
            <Text className="text-sm text-muted">No staff selected yet.</Text>
          ) : (
            <View className="gap-2">
              {selectedStaff.slice(0, 12).map((member: any) => (
                <View key={member.id} className="px-3 py-2 bg-background rounded-xl border border-border">
                  <Text className="text-sm font-semibold text-foreground">{member.name}</Text>
                  <Text className="text-xs text-muted">{member.email || "No email"}</Text>
                </View>
              ))}
              {selectedStaff.length > 12 && (
                <Text className="text-xs text-muted">...and {selectedStaff.length - 12} more</Text>
              )}
            </View>
          )}
        </View>

        <View className="bg-surface rounded-2xl border border-border p-4 mb-4 gap-3">
          <Text className="text-base font-semibold text-foreground">Destination Team</Text>

          <View>
            <Text className="text-sm text-muted mb-2">Organization *</Text>
            <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border" onPress={() => setShowDestOrgModal(true)}>
              <Text className="text-sm font-medium text-foreground">{destOrgLabel}</Text>
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
          className={`rounded-xl p-4 ${bulkUpdateStaff.isPending || selectedStaffIds.length === 0 || !destTeamId ? "bg-muted" : "bg-primary"}`}
          disabled={bulkUpdateStaff.isPending || selectedStaffIds.length === 0 || !destTeamId}
          onPress={handleBulkReassign}
        >
          {bulkUpdateStaff.isPending ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text className="text-background font-semibold text-center text-lg">
              Reassign {selectedStaffIds.length} Staff Member{selectedStaffIds.length !== 1 ? "s" : ""}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {renderSingleSelectModal(
        showOrgModal,
        () => setShowOrgModal(false),
        "Source Organization",
        orgSearch,
        setOrgSearch,
        "Search organizations...",
        orgOptions,
        (o) => o.name || "",
        filterOrgId,
        (id) => {
          setFilterOrgId(id);
          setFilterDeptId(0);
          setFilterTeamId(0);
          setShowOrgModal(false);
        }
      )}

      {renderSingleSelectModal(
        showDeptModal,
        () => setShowDeptModal(false),
        "Source Department",
        deptSearch,
        setDeptSearch,
        "Search departments...",
        deptOptions,
        (d) => d.name || "",
        filterDeptId,
        (id) => {
          setFilterDeptId(id);
          setFilterTeamId(0);
          setShowDeptModal(false);
        }
      )}

      {renderSingleSelectModal(
        showTeamModal,
        () => setShowTeamModal(false),
        "Source Team",
        teamSearch,
        setTeamSearch,
        "Search teams...",
        teamOptions,
        (t) => t.name || "",
        filterTeamId,
        (id) => {
          setFilterTeamId(id);
          setShowTeamModal(false);
        }
      )}

      {renderSingleSelectModal(
        showDestOrgModal,
        () => setShowDestOrgModal(false),
        "Destination Organization",
        destOrgSearch,
        setDestOrgSearch,
        "Search organizations...",
        destOrgOptions,
        (o) => o.name || "",
        destOrgId,
        (id) => {
          setDestOrgId(id);
          setDestDeptId(0);
          setDestTeamId(0);
          setShowDestOrgModal(false);
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
        (d) => d.name || "",
        destDeptId,
        (id) => {
          setDestDeptId(id);
          setDestTeamId(0);
          setShowDestDeptModal(false);
        },
        false
      )}

      {renderSingleSelectModal(
        showDestTeamModal,
        () => setShowDestTeamModal(false),
        "Destination Team",
        destTeamSearch,
        setDestTeamSearch,
        "Search teams...",
        destTeamOptions,
        (t) => t.name || "",
        destTeamId,
        (id) => {
          setDestTeamId(id);
          setShowDestTeamModal(false);
        },
        false
      )}

      <Modal visible={showStaffModal} transparent animationType="fade" onRequestClose={() => setShowStaffModal(false)}>
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <View className="w-[92%] rounded-2xl p-5" style={{ backgroundColor: colors.background, maxHeight: "82%" }}>
            <View className="relative min-h-[44px] items-center justify-center mb-3">
              <TouchableOpacity onPress={() => setShowStaffModal(false)} className="absolute left-0">
                <Text className="text-3xl font-bold text-foreground">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground text-center">Select Staff</Text>
            </View>

            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-base text-foreground mb-3"
              placeholder="Search staff..."
              placeholderTextColor={colors.muted}
              value={staffSearch}
              onChangeText={setStaffSearch}
            />

            <View className="rounded-xl overflow-hidden" style={{ backgroundColor: "#f5f8fa", maxHeight: pickerMaxHeight }}>
              <ScrollView>
                {filteredStaffOptions.length === 0 ? (
                  <View className="px-3 py-3">
                    <Text className="text-sm" style={{ color: colors.muted }}>No staff found.</Text>
                  </View>
                ) : (
                  filteredStaffOptions.map((item: any) => {
                    const checked = selectedStaffIds.includes(Number(item.id));
                    return (
                      <TouchableOpacity
                        key={String(item.id)}
                        className="px-3 flex-row items-center"
                        style={{ minHeight: PICKER_ROW_HEIGHT }}
                        onPress={() => toggleStaffSelection(Number(item.id))}
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
                          <Text className="text-xs text-muted" numberOfLines={1}>{item.email || "No email"}</Text>
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
