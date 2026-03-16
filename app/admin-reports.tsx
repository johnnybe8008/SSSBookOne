import DateTimePicker from "@/components/ui/DateTimePicker";
import { useMemo, useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Modal, Alert, Platform, TextInput } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

type DateRangeType = "weekly" | "monthly" | "ytd" | "custom";

type GroupedNameOption = {
  id: number;
  key: string;
  name: string;
  ids: number[];
};

type PdfSessionRow = {
  id: number;
  clientName: string;
  staffName: string;
  companyName: string;
  departmentName: string;
  teamName: string;
  status: string;
  type: string;
  scheduled: string;
  start: string;
  end: string;
  billable: string | number;
  notes: string;
};

export default function AdminReportsScreen() {
  const colors = useColors();
  const router = useRouter();

  const [dateRangeType, setDateRangeType] = useState<DateRangeType>("monthly");
  const [customStartDate, setCustomStartDate] = useState(new Date());
  const [customEndDate, setCustomEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Multi-select filters (none selected = all records)
  const [filterCompanyIds, setFilterCompanyIds] = useState<number[]>([]);
  const [filterDepartmentIds, setFilterDepartmentIds] = useState<number[]>([]);
  const [filterTeamIds, setFilterTeamIds] = useState<number[]>([]);
  const [filterStaffIds, setFilterStaffIds] = useState<number[]>([]);

  // Picker modals
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

  // Search fields
  const [companySearch, setCompanySearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");

  const PICKER_ROW_HEIGHT = 40;
  const pickerMaxHeight = PICKER_ROW_HEIGHT * 8;

  const { data: clients, isLoading: loadingClients } = trpc.clients.listAll.useQuery();
  const { data: sessions, isLoading: loadingSessions } = trpc.sessions.listAll.useQuery();
  const { data: companies, isLoading: loadingCompanies } = trpc.companies.list.useQuery();
  const { data: coDepartments, isLoading: loadingDepartments } = trpc.coDepartments.all.useQuery();
  const { data: companyTeams, isLoading: loadingTeams } = trpc.companyTeams.listAll.useQuery();
  const { data: staff, isLoading: loadingStaff } = trpc.staff.listAll.useQuery();
  const { data: fsms, isLoading: loadingFsms } = trpc.fsms.list.useQuery();

  const isLoading = loadingClients || loadingSessions || loadingCompanies || loadingDepartments || loadingTeams || loadingStaff || loadingFsms;

  const companyById = useMemo(() => {
    const map = new Map<number, any>();
    (companies || []).forEach((item: any) => map.set(Number(item.id), item));
    return map;
  }, [companies]);

  const departmentById = useMemo(() => {
    const map = new Map<number, any>();
    (coDepartments || []).forEach((item: any) => map.set(Number(item.id), item));
    return map;
  }, [coDepartments]);

  const teamById = useMemo(() => {
    const map = new Map<number, any>();
    (companyTeams || []).forEach((item: any) => map.set(Number(item.id), item));
    return map;
  }, [companyTeams]);

  const staffById = useMemo(() => {
    const map = new Map<number, any>();
    (staff || []).forEach((item: any) => map.set(Number(item.id), item));
    return map;
  }, [staff]);

  const clientById = useMemo(() => {
    const map = new Map<number, any>();
    (clients || []).forEach((item: any) => map.set(Number(item.id), item));
    return map;
  }, [clients]);

  const dateRange = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    switch (dateRangeType) {
      case "weekly":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "monthly":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "ytd":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "custom":
        startDate = customStartDate;
        endDate = customEndDate;
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate };
  }, [dateRangeType, customStartDate, customEndDate]);

  const filteredDepartments = useMemo(() => {
    const source = coDepartments || [];
    if (filterCompanyIds.length === 0) return source;
    return source.filter((d: any) => filterCompanyIds.includes(Number(d.companyId)));
  }, [coDepartments, filterCompanyIds]);

  const filteredTeams = useMemo(() => {
    const source = companyTeams || [];
    return source.filter((t: any) => {
      if (filterDepartmentIds.length > 0 && !filterDepartmentIds.includes(Number(t.coDepartmentId))) return false;
      if (filterCompanyIds.length > 0) {
        const dept = departmentById.get(Number(t.coDepartmentId));
        if (!dept || !filterCompanyIds.includes(Number(dept.companyId))) return false;
      }
      return true;
    });
  }, [companyTeams, filterCompanyIds, filterDepartmentIds, departmentById]);

  const searchList = (items: any[] | undefined, search: string, pick: (v: any) => string) => {
    const source = items || [];
    const q = search.trim().toLowerCase();
    if (!q) return source;
    return source.filter((item) => pick(item).toLowerCase().includes(q));
  };

  const groupByName = (items: any[] | undefined): GroupedNameOption[] => {
    const grouped = new Map<string, GroupedNameOption>();
    (items || []).forEach((item: any) => {
      const id = Number(item.id);
      const rawName = String(item.name || "").trim();
      if (!id || !rawName) return;
      const key = rawName.toLowerCase();
      const existing = grouped.get(key);
      if (existing) {
        existing.ids.push(id);
      } else {
        grouped.set(key, { id, key, name: rawName, ids: [id] });
      }
    });
    return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  const companyOptions = searchList(companies as any[], companySearch, (v) => v.name || "");
  const groupedDepartmentOptions = useMemo(() => groupByName(filteredDepartments as any[]), [filteredDepartments]);
  const groupedTeamOptions = useMemo(() => groupByName(filteredTeams as any[]), [filteredTeams]);
  const departmentOptions = useMemo(() => {
    const q = departmentSearch.trim().toLowerCase();
    if (!q) return groupedDepartmentOptions;
    return groupedDepartmentOptions.filter((item) => item.name.toLowerCase().includes(q));
  }, [groupedDepartmentOptions, departmentSearch]);
  const teamOptions = useMemo(() => {
    const q = teamSearch.trim().toLowerCase();
    if (!q) return groupedTeamOptions;
    return groupedTeamOptions.filter((item) => item.name.toLowerCase().includes(q));
  }, [groupedTeamOptions, teamSearch]);
  const staffOptions = searchList(staff as any[], staffSearch, (v) => v.name || "");

  const filteredClients = useMemo(() => {
    const source = clients || [];
    return source.filter((c: any) => {
      const companyId = Number(c.companyId || 0);
      const departmentId = Number(c.coDepartmentId ?? c.departmentId ?? 0);
      const teamId = Number(c.companyTeamId ?? c.teamId ?? 0);

      if (filterCompanyIds.length > 0 && !filterCompanyIds.includes(companyId)) return false;
      if (filterDepartmentIds.length > 0 && !filterDepartmentIds.includes(departmentId)) return false;
      if (filterTeamIds.length > 0 && !filterTeamIds.includes(teamId)) return false;
      return true;
    });
  }, [clients, filterCompanyIds, filterDepartmentIds, filterTeamIds]);

  const filteredSessions = useMemo(() => {
    const source = sessions || [];
    const allowedClientIds = new Set(filteredClients.map((c: any) => Number(c.id)));

    return source.filter((s: any) => {
      const sessionDate = s.scheduledDate ? new Date(s.scheduledDate) : (s.sessionStartTime ? new Date(s.sessionStartTime) : null);
      if (!sessionDate) return false;
      if (sessionDate < dateRange.startDate || sessionDate > dateRange.endDate) return false;

      if (!allowedClientIds.has(Number(s.clientId))) return false;
      if (filterStaffIds.length > 0 && !filterStaffIds.includes(Number(s.staffId))) return false;
      return true;
    });
  }, [sessions, filteredClients, dateRange, filterStaffIds]);

  const totalClients = filteredClients.length;
  const totalSessions = filteredSessions.length;
  const totalCompanies = filterCompanyIds.length > 0 ? filterCompanyIds.length : (companies?.length || 0);
  const totalDepartments = groupedDepartmentOptions.length;
  const totalTeams = groupedTeamOptions.length;
  const totalStaff = filterStaffIds.length > 0 ? filterStaffIds.length : (staff?.length || 0);
  const totalFsms = fsms?.length || 0;

  const clientsByDepartment = useMemo(() => {
    const grouped = new Map<number, { departmentName: string; clientCount: number }>();
    filteredClients.forEach((client: any) => {
      const departmentId = Number(client.coDepartmentId ?? client.departmentId ?? 0);
      const department = departmentById.get(departmentId);
      const current = grouped.get(departmentId) || { departmentName: department?.name || "Unassigned", clientCount: 0 };
      current.clientCount += 1;
      grouped.set(departmentId, current);
    });
    return Array.from(grouped.values()).sort((a, b) => b.clientCount - a.clientCount);
  }, [filteredClients, departmentById]);

  const sessionsByStaff = useMemo(() => {
    const grouped = new Map<number, { staffName: string; totalSessions: number; completedSessions: number }>();
    filteredSessions.forEach((session: any) => {
      const id = Number(session.staffId || 0);
      const person = staffById.get(id);
      const current = grouped.get(id) || { staffName: person?.name || `Staff #${id}`, totalSessions: 0, completedSessions: 0 };
      current.totalSessions += 1;
      const statusName = String(session.sessionStatusName || "").toLowerCase();
      if (statusName === "completed") current.completedSessions += 1;
      grouped.set(id, current);
    });

    return Array.from(grouped.values())
      .map((row: { staffName: string; totalSessions: number; completedSessions: number }) => ({ ...row, completionRate: row.totalSessions > 0 ? ((row.completedSessions / row.totalSessions) * 100).toFixed(1) : "0.0" }))
      .sort((a, b) => b.totalSessions - a.totalSessions);
  }, [filteredSessions, staffById]);

  const sessionsByStatus = useMemo(() => {
    const grouped = new Map<string, number>();
    filteredSessions.forEach((session: any) => {
      const status = String(session.sessionStatusName || "Unknown");
      grouped.set(status, (grouped.get(status) || 0) + 1);
    });
    return Array.from(grouped.entries()).map(([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count);
  }, [filteredSessions]);

  const formatDateTime = (value: any) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };

  const clearAllFilters = () => {
    setFilterCompanyIds([]);
    setFilterDepartmentIds([]);
    setFilterTeamIds([]);
    setFilterStaffIds([]);
    setCompanySearch("");
    setDepartmentSearch("");
    setTeamSearch("");
    setStaffSearch("");
  };

  const hasAnyFilter = filterCompanyIds.length > 0 || filterDepartmentIds.length > 0 || filterTeamIds.length > 0 || filterStaffIds.length > 0;

  const toggleMulti = (id: number, setter: (updater: (prev: number[]) => number[]) => void) => {
    setter((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const toggleGroupedMulti = (ids: number[], setter: (updater: (prev: number[]) => number[]) => void) => {
    setter((prev) => {
      const allSelected = ids.every((id) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id) => !ids.includes(id));
      }
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return Array.from(next);
    });
  };

  const selectedDepartmentNameCount = useMemo(() => {
    const selected = new Set(filterDepartmentIds);
    return groupedDepartmentOptions.filter((group) => group.ids.some((id) => selected.has(id))).length;
  }, [groupedDepartmentOptions, filterDepartmentIds]);

  const selectedDepartmentOptionIds = useMemo(() => {
    const selected = new Set(filterDepartmentIds);
    return groupedDepartmentOptions
      .filter((group) => group.ids.some((id) => selected.has(id)))
      .map((group) => group.id);
  }, [groupedDepartmentOptions, filterDepartmentIds]);

  const selectedTeamNameCount = useMemo(() => {
    const selected = new Set(filterTeamIds);
    return groupedTeamOptions.filter((group) => group.ids.some((id) => selected.has(id))).length;
  }, [groupedTeamOptions, filterTeamIds]);

  const selectedTeamOptionIds = useMemo(() => {
    const selected = new Set(filterTeamIds);
    return groupedTeamOptions
      .filter((group) => group.ids.some((id) => selected.has(id)))
      .map((group) => group.id);
  }, [groupedTeamOptions, filterTeamIds]);

  const handleExportCSV = async () => {
    try {
      const csvEscape = (value: string) => {
        if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
          return `"${value.replace(/\"/g, '""')}"`;
        }
        return value;
      };

      const buildFilterRow = (label: string, ids: number[], getName: (id: number) => string) => {
        if (ids.length === 0) {
          return [label, "All"].map(csvEscape).join(",");
        }
        const names = ids.map((id) => getName(id)).filter((name) => !!name);
        return [label, String(ids.length), ...names].map(csvEscape).join(",");
      };

      const csv: string[] = [];
      csv.push("SSS Book One - Reports & Analytics Export");
      csv.push(`Generated,${new Date().toLocaleString()}`);
      csv.push(`Date Range,${dateRangeType.toUpperCase()}`);
      csv.push(`Start Date,${dateRange.startDate.toLocaleDateString()}`);
      csv.push(`End Date,${dateRange.endDate.toLocaleDateString()}`);
      csv.push("");
      csv.push(buildFilterRow("Companies Filter", filterCompanyIds, (id) => companyById.get(Number(id))?.name || `Company #${id}`));
      csv.push(buildFilterRow("Departments Filter", filterDepartmentIds, (id) => departmentById.get(Number(id))?.name || `Department #${id}`));
      csv.push(buildFilterRow("Teams Filter", filterTeamIds, (id) => teamById.get(Number(id))?.name || `Team #${id}`));
      csv.push(buildFilterRow("Staff Filter", filterStaffIds, (id) => staffById.get(Number(id))?.name || `Staff #${id}`));
      csv.push("");
      csv.push("SESSION DETAILS");
      csv.push("Session ID,Client,Staff,Status,Type,Scheduled Date,Start,End,Billable Hours,Notes");
      filteredSessions.forEach((s: any) => {
        const clientName = clientById.get(Number(s.clientId))?.name || s.clientName || `Client #${s.clientId}`;
        const staffName = staffById.get(Number(s.staffId))?.name || `Staff #${s.staffId}`;
        const notes = String(s.notes || "").replace(/"/g, '""');
        csv.push(`${s.id},"${clientName}","${staffName}","${s.sessionStatusName || ""}","${s.sessionTypeName || ""}","${formatDateTime(s.scheduledDate)}","${formatDateTime(s.sessionStartTime)}","${formatDateTime(s.sessionEndTime)}",${s.billableHours ?? ""},"${notes}"`);
      });

      const content = csv.join("\n");
      const fileName = `SSS_Reports_${new Date().toISOString().split("T")[0]}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, content);

      if (Platform.OS === "web") {
        const blob = new Blob([content], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        Alert.alert("Success", "CSV exported");
      } else {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "text/csv",
            dialogTitle: "Export Reports",
            UTI: "public.comma-separated-values-text",
          });
        } else {
          Alert.alert("Success", `CSV saved to ${fileUri}`);
        }
      }
    } catch (error) {
      console.error("CSV export failed", error);
      Alert.alert("Export Failed", "Could not export CSV");
    }
  };

  const handleExportPDF = (mode: "table" | "cards" = "table") => {
    const esc = (v: any) => String(v ?? "-")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");

    const formatFilterSummary = (ids: number[], getName: (id: number) => string) => {
      if (ids.length === 0) return "All";
      const names = ids.map((id) => getName(id)).filter((name) => !!name);
      return `${ids.length}: ${names.join(" | ")}`;
    };

    const sessionData: PdfSessionRow[] = filteredSessions.map((s: any) => {
      const client = clientById.get(Number(s.clientId));
      const worker = staffById.get(Number(s.staffId));
      const clientDeptId = Number(client?.coDepartmentId ?? client?.departmentId ?? 0);
      const clientTeamId = Number(client?.companyTeamId ?? client?.teamId ?? 0);
      const clientCompanyId = Number(client?.companyId || 0);
      const companyName = companyById.get(clientCompanyId)?.name || "-";
      const departmentName = departmentById.get(clientDeptId)?.name || "-";
      const teamName = teamById.get(clientTeamId)?.name || "-";

      return {
        id: s.id,
        clientName: client?.name || s.clientName || `Client #${s.clientId}`,
        staffName: worker?.name || `Staff #${s.staffId}`,
        companyName,
        departmentName,
        teamName,
        status: s.sessionStatusName || "-",
        type: s.sessionTypeName || "-",
        scheduled: formatDateTime(s.scheduledDate),
        start: formatDateTime(s.sessionStartTime),
        end: formatDateTime(s.sessionEndTime),
        billable: s.billableHours ?? "-",
        notes: s.notes || "-",
      };
    });

    const sessionRowsHtml = sessionData.map((row: PdfSessionRow) => {

      return `
        <tr>
          <td>${esc(row.id)}</td>
          <td>${esc(row.clientName)}</td>
          <td>${esc(row.staffName)}</td>
          <td>${esc(row.companyName)}</td>
          <td>${esc(row.departmentName)}</td>
          <td>${esc(row.teamName)}</td>
          <td>${esc(row.status)}</td>
          <td>${esc(row.type)}</td>
          <td>${esc(row.scheduled)}</td>
          <td>${esc(row.start)}</td>
          <td>${esc(row.end)}</td>
          <td>${esc(row.billable)}</td>
          <td>${esc(row.notes)}</td>
        </tr>
      `;
    }).join("\n");

    const sessionCardsHtml = sessionData.map((row: PdfSessionRow) => `
      <div class="session-card">
        <div class="session-title">Session #${esc(row.id)}</div>
        <div class="session-grid-row">
          <div class="session-grid-cell"><span class="label">Client:</span> ${esc(row.clientName)}</div>
          <div class="session-grid-cell"><span class="label">Staff:</span> ${esc(row.staffName)}</div>
          <div class="session-grid-cell"><span class="label">Company:</span> ${esc(row.companyName)}</div>
        </div>
        <div class="session-grid-row">
          <div class="session-grid-cell"><span class="label">Department:</span> ${esc(row.departmentName)}</div>
          <div class="session-grid-cell"><span class="label">Team:</span> ${esc(row.teamName)}</div>
          <div class="session-grid-cell"><span class="label">Status:</span> ${esc(row.status)}</div>
        </div>
        <div class="session-grid-row">
          <div class="session-grid-cell"><span class="label">Type:</span> ${esc(row.type)}</div>
          <div class="session-grid-cell"><span class="label">Scheduled:</span> ${esc(row.scheduled)}</div>
          <div class="session-grid-cell"><span class="label">Start:</span> ${esc(row.start)}</div>
        </div>
        <div class="session-grid-row">
          <div class="session-grid-cell"><span class="label">End:</span> ${esc(row.end)}</div>
          <div class="session-grid-cell"><span class="label">Billable:</span> ${esc(row.billable)}</div>
          <div class="session-grid-cell"><span class="label">Session:</span> #${esc(row.id)}</div>
        </div>
        <div class="session-notes"><span class="label">Notes:</span> ${esc(row.notes)}</div>
      </div>
    `).join("\n");

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            @page { size: Letter portrait; margin: 0.5in; }
            body { font-family: Arial, sans-serif; margin: 0; color: #222; }
            h1 { font-size: 20px; margin: 0 0 8px 0; }
            h2 { font-size: 14px; margin: 16px 0 8px 0; }
            .meta { font-size: 12px; margin: 2px 0; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            th, td { border: 1px solid #ddd; padding: 6px; font-size: 10px; vertical-align: top; word-wrap: break-word; }
            th { background: #f3f6f8; }
            .session-card { border: 1px solid #ddd; border-radius: 10px; padding: 10px; margin-bottom: 10px; page-break-inside: avoid; }
            .session-title { font-size: 12px; font-weight: 700; margin-bottom: 6px; }
            .session-grid-row { font-size: 10px; margin: 2px 0; display: table; width: 100%; table-layout: fixed; }
            .session-grid-cell { display: table-cell; width: 33.333%; padding-right: 8px; vertical-align: top; word-break: break-word; overflow-wrap: anywhere; }
            .session-notes { font-size: 10px; margin-top: 5px; word-break: break-word; overflow-wrap: anywhere; }
            .label { font-weight: 700; }
          </style>
        </head>
        <body>
          <h1>SSS Book One - Reports & Analytics Export</h1>
          <div class="meta">Generated: ${esc(new Date().toLocaleString())}</div>
          <div class="meta">Date Range: ${esc(dateRangeType.toUpperCase())}</div>
          <div class="meta">Start Date: ${esc(dateRange.startDate.toLocaleDateString())}</div>
          <div class="meta">End Date: ${esc(dateRange.endDate.toLocaleDateString())}</div>
          <div class="meta">Companies Filter: ${esc(formatFilterSummary(filterCompanyIds, (id) => companyById.get(Number(id))?.name || `Company #${id}`))}</div>
          <div class="meta">Departments Filter: ${esc(formatFilterSummary(filterDepartmentIds, (id) => departmentById.get(Number(id))?.name || `Department #${id}`))}</div>
          <div class="meta">Teams Filter: ${esc(formatFilterSummary(filterTeamIds, (id) => teamById.get(Number(id))?.name || `Team #${id}`))}</div>
          <div class="meta">Staff Filter: ${esc(formatFilterSummary(filterStaffIds, (id) => staffById.get(Number(id))?.name || `Staff #${id}`))}</div>

          <h2>Session Details</h2>
          ${mode === "cards" ? `
            ${sessionCardsHtml || `<div class="meta">No sessions for selected filters and date range.</div>`}
          ` : `
            <table>
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Client</th>
                  <th>Staff</th>
                  <th>Company</th>
                  <th>Department</th>
                  <th>Team</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Scheduled</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Billable</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${sessionRowsHtml || `<tr><td colspan="13">No sessions for selected filters and date range.</td></tr>`}
              </tbody>
            </table>
          `}
        </body>
      </html>
    `;

    (async () => {
      try {
        const result = await Print.printToFileAsync({ html });
        const fileName = `SSS_Reports_${new Date().toISOString().split("T")[0]}.pdf`;
        const targetUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.copyAsync({ from: result.uri, to: targetUri });

        if (Platform.OS === "web") {
          Alert.alert("PDF Ready", "PDF generated. Use your browser download/share flow.");
          return;
        }

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(targetUri, {
            mimeType: "application/pdf",
            dialogTitle: "Export Reports PDF",
            UTI: "com.adobe.pdf",
          });
        } else {
          Alert.alert("Success", `PDF saved to: ${targetUri}`);
        }
      } catch (error) {
        console.error("PDF export failed", error);
        Alert.alert("PDF Export Failed", "Could not generate PDF file.");
      }
    })();
  };

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

  return (
    <ScreenContainer className="flex-1">
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Text className="text-3xl font-bold text-foreground">&lt;</Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold text-foreground">Reports & Analytics</Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity onPress={handleExportCSV} className="bg-success/10 border border-success rounded-full px-3 py-2">
              <Text className="text-xs font-semibold text-success">CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Alert.alert("PDF Export Format", "Choose PDF layout:", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Option 1 - Table", onPress: () => handleExportPDF("table") },
                  { text: "Option 2 - Screen Layout", onPress: () => handleExportPDF("cards") },
                ]);
              }}
              className="bg-error/10 border border-error rounded-full px-3 py-2"
            >
              <Text className="text-xs font-semibold text-error">PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-sm text-muted mt-4">Loading analytics...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-4 bg-surface border-b border-border">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-foreground">Filters</Text>
              {hasAnyFilter && (
                <TouchableOpacity className="px-3 py-1 rounded-full border border-border bg-background" onPress={clearAllFilters}>
                  <Text className="text-xs font-semibold text-foreground">Clear All</Text>
                </TouchableOpacity>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-xs text-muted mb-2">Date Range</Text>
              <View className="flex-row flex-wrap gap-2">
                <TouchableOpacity onPress={() => setDateRangeType("weekly")} className={`px-4 py-2 rounded-full border ${dateRangeType === "weekly" ? "bg-primary border-primary" : "bg-background border-border"}`}>
                  <Text className={`text-sm font-medium ${dateRangeType === "weekly" ? "text-background" : "text-foreground"}`}>Weekly</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setDateRangeType("monthly")} className={`px-4 py-2 rounded-full border ${dateRangeType === "monthly" ? "bg-primary border-primary" : "bg-background border-border"}`}>
                  <Text className={`text-sm font-medium ${dateRangeType === "monthly" ? "text-background" : "text-foreground"}`}>Monthly</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setDateRangeType("ytd")} className={`px-4 py-2 rounded-full border ${dateRangeType === "ytd" ? "bg-primary border-primary" : "bg-background border-border"}`}>
                  <Text className={`text-sm font-medium ${dateRangeType === "ytd" ? "text-background" : "text-foreground"}`}>YTD</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setDateRangeType("custom")} className={`px-4 py-2 rounded-full border ${dateRangeType === "custom" ? "bg-primary border-primary" : "bg-background border-border"}`}>
                  <Text className={`text-sm font-medium ${dateRangeType === "custom" ? "text-background" : "text-foreground"}`}>Custom</Text>
                </TouchableOpacity>
              </View>

              {dateRangeType === "custom" && (
                <View className="mt-3 gap-2">
                  <TouchableOpacity onPress={() => setShowStartPicker(true)} className="bg-background border border-border rounded-lg px-4 py-3">
                    <Text className="text-xs text-muted mb-1">Start Date</Text>
                    <Text className="text-sm text-foreground">{customStartDate.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowEndPicker(true)} className="bg-background border border-border rounded-lg px-4 py-3">
                    <Text className="text-xs text-muted mb-1">End Date</Text>
                    <Text className="text-sm text-foreground">{customEndDate.toLocaleDateString()}</Text>
                  </TouchableOpacity>

                  {showStartPicker && (
                    <DateTimePicker
                      value={customStartDate}
                      mode="date"
                      onChange={(value) => {
                        setShowStartPicker(Platform.OS === "ios");
                        if (value instanceof Date && !Number.isNaN(value.getTime())) {
                          setCustomStartDate(value);
                        }
                      }}
                    />
                  )}
                  {showEndPicker && (
                    <DateTimePicker
                      value={customEndDate}
                      mode="date"
                      onChange={(value) => {
                        setShowEndPicker(Platform.OS === "ios");
                        if (value instanceof Date && !Number.isNaN(value.getTime())) {
                          setCustomEndDate(value);
                        }
                      }}
                    />
                  )}
                </View>
              )}
            </View>

            <View className="gap-2">
              <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border" onPress={() => setShowCompanyModal(true)}>
                <Text className="text-sm font-medium text-foreground">{filterCompanyIds.length > 0 ? `${filterCompanyIds.length} compan${filterCompanyIds.length === 1 ? "y" : "ies"} selected` : "All Companies"}</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border" onPress={() => setShowDepartmentModal(true)}>
                <Text className="text-sm font-medium text-foreground">{selectedDepartmentNameCount > 0 ? `${selectedDepartmentNameCount} department(s) selected` : "All Departments"}</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border" onPress={() => setShowTeamModal(true)}>
                <Text className="text-sm font-medium text-foreground">{selectedTeamNameCount > 0 ? `${selectedTeamNameCount} team(s) selected` : "All Teams"}</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-2 bg-background rounded-full border border-border" onPress={() => setShowStaffModal(true)}>
                <Text className="text-sm font-medium text-foreground">{filterStaffIds.length > 0 ? `${filterStaffIds.length} staff selected` : "All Staff"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="px-6 py-4 gap-6">
            <View className="gap-4">
              <Text className="text-xl font-bold text-foreground">Overview</Text>
              <View className="flex-row flex-wrap gap-3">
                <View className="flex-1 min-w-[45%] bg-primary/10 border border-primary rounded-2xl p-4">
                  <Text className="text-3xl font-bold text-primary">{totalClients}</Text>
                  <Text className="text-sm text-muted mt-1">Total Clients</Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-success/10 border border-success rounded-2xl p-4">
                  <Text className="text-3xl font-bold text-success">{totalSessions}</Text>
                  <Text className="text-sm text-muted mt-1">Total Sessions</Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-surface border border-border rounded-2xl p-4">
                  <Text className="text-3xl font-bold text-foreground">{totalCompanies}</Text>
                  <Text className="text-sm text-muted mt-1">Companies</Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-surface border border-border rounded-2xl p-4">
                  <Text className="text-3xl font-bold text-foreground">{totalDepartments}</Text>
                  <Text className="text-sm text-muted mt-1">Departments</Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-surface border border-border rounded-2xl p-4">
                  <Text className="text-3xl font-bold text-foreground">{totalTeams}</Text>
                  <Text className="text-sm text-muted mt-1">Teams</Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-surface border border-border rounded-2xl p-4">
                  <Text className="text-3xl font-bold text-foreground">{totalStaff}</Text>
                  <Text className="text-sm text-muted mt-1">Staff</Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-surface border border-border rounded-2xl p-4">
                  <Text className="text-3xl font-bold text-foreground">{totalFsms}</Text>
                  <Text className="text-sm text-muted mt-1">FSMs</Text>
                </View>
              </View>
            </View>

            <View className="bg-surface border border-border rounded-2xl p-5">
              <Text className="text-lg font-semibold text-foreground mb-4">Client Distribution by Department</Text>
              {clientsByDepartment.length === 0 ? (
                <Text className="text-sm text-muted">No department data</Text>
              ) : (
                <View className="gap-3">
                  {clientsByDepartment.slice(0, 10).map((dept, idx) => (
                    <View key={idx} className="flex-row items-center justify-between">
                      <Text className="text-sm text-foreground font-medium flex-1">{dept.departmentName}</Text>
                      <Text className="text-lg font-bold text-primary ml-4">{dept.clientCount}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View className="bg-surface border border-border rounded-2xl p-5">
              <Text className="text-lg font-semibold text-foreground mb-4">Session Completion by Staff</Text>
              {sessionsByStaff.length === 0 ? (
                <Text className="text-sm text-muted">No staff session data</Text>
              ) : (
                <View className="gap-3">
                  {sessionsByStaff.slice(0, 10).map((row, idx) => (
                    <View key={idx} className="border-b border-border pb-3">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-sm font-medium text-foreground flex-1">{row.staffName}</Text>
                        <Text className="text-lg font-bold text-success">{row.completionRate}%</Text>
                      </View>
                      <Text className="text-xs text-muted">Total: {row.totalSessions} | Completed: {row.completedSessions}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View className="bg-surface border border-border rounded-2xl p-5">
              <Text className="text-lg font-semibold text-foreground mb-4">Session Status Distribution</Text>
              {sessionsByStatus.length === 0 ? (
                <Text className="text-sm text-muted">No sessions in current filter</Text>
              ) : (
                <View className="gap-3">
                  {sessionsByStatus.map((row, idx) => (
                    <View key={idx} className="flex-row items-center justify-between">
                      <Text className="text-sm text-foreground">{row.status}</Text>
                      <Text className="text-lg font-bold text-primary">{row.count}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View className="bg-surface border border-border rounded-2xl p-5">
              <Text className="text-lg font-semibold text-foreground mb-4">Session Details (Sessions DB)</Text>
              {filteredSessions.length === 0 ? (
                <Text className="text-sm text-muted">No sessions for selected filters and date range.</Text>
              ) : (
                <View className="gap-3">
                  {filteredSessions.map((s: any) => {
                    const client = clientById.get(Number(s.clientId));
                    const worker = staffById.get(Number(s.staffId));
                    const clientDeptId = Number(client?.coDepartmentId ?? client?.departmentId ?? 0);
                    const clientTeamId = Number(client?.companyTeamId ?? client?.teamId ?? 0);
                    const clientCompanyId = Number(client?.companyId || 0);
                    const companyName = companyById.get(clientCompanyId)?.name || "-";
                    const departmentName = departmentById.get(clientDeptId)?.name || "-";
                    const teamName = teamById.get(clientTeamId)?.name || "-";

                    return (
                      <View key={String(s.id)} className="bg-background border border-border rounded-xl p-3">
                        <Text className="text-sm font-semibold text-foreground">Session #{s.id}</Text>
                        <Text className="text-xs text-muted mt-1">Client: {client?.name || s.clientName || `Client #${s.clientId}`}</Text>
                        <Text className="text-xs text-muted">Staff: {worker?.name || `Staff #${s.staffId}`}</Text>
                        <Text className="text-xs text-muted">Company: {companyName}</Text>
                        <Text className="text-xs text-muted">Department: {departmentName}</Text>
                        <Text className="text-xs text-muted">Team: {teamName}</Text>
                        <Text className="text-xs text-muted">Status: {s.sessionStatusName || "-"}</Text>
                        <Text className="text-xs text-muted">Type: {s.sessionTypeName || "-"}</Text>
                        <Text className="text-xs text-muted">Scheduled: {formatDateTime(s.scheduledDate)}</Text>
                        <Text className="text-xs text-muted">Start: {formatDateTime(s.sessionStartTime)}</Text>
                        <Text className="text-xs text-muted">End: {formatDateTime(s.sessionEndTime)}</Text>
                        <Text className="text-xs text-muted">Billable: {s.billableHours ?? "-"}</Text>
                        <Text className="text-xs text-muted mt-1">Notes: {s.notes || "-"}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}

      {renderMultiSelectModal(
        showCompanyModal,
        () => setShowCompanyModal(false),
        "Companies",
        companySearch,
        setCompanySearch,
        "Search companies...",
        companyOptions,
        (item) => item.name || "",
        filterCompanyIds,
        (id) => toggleMulti(id, setFilterCompanyIds),
        () => {
          setFilterCompanyIds([]);
          setFilterDepartmentIds([]);
          setFilterTeamIds([]);
        }
      )}

      {renderMultiSelectModal(
        showDepartmentModal,
        () => setShowDepartmentModal(false),
        "Departments",
        departmentSearch,
        setDepartmentSearch,
        "Search departments...",
        departmentOptions,
        (item) => item.name || "",
        selectedDepartmentOptionIds,
        (id) => {
          const group = departmentOptions.find((item) => item.ids.includes(id));
          if (group) {
            toggleGroupedMulti(group.ids, setFilterDepartmentIds);
            return;
          }
          toggleMulti(id, setFilterDepartmentIds);
        },
        () => {
          setFilterDepartmentIds([]);
          setFilterTeamIds([]);
        }
      )}

      {renderMultiSelectModal(
        showTeamModal,
        () => setShowTeamModal(false),
        "Teams",
        teamSearch,
        setTeamSearch,
        "Search teams...",
        teamOptions,
        (item) => item.name || "",
        selectedTeamOptionIds,
        (id) => {
          const group = teamOptions.find((item) => item.ids.includes(id));
          if (group) {
            toggleGroupedMulti(group.ids, setFilterTeamIds);
            return;
          }
          toggleMulti(id, setFilterTeamIds);
        },
        () => setFilterTeamIds([])
      )}

      {renderMultiSelectModal(
        showStaffModal,
        () => setShowStaffModal(false),
        "Staff",
        staffSearch,
        setStaffSearch,
        "Search staff...",
        staffOptions,
        (item) => item.name || "",
        filterStaffIds,
        (id) => toggleMulti(id, setFilterStaffIds),
        () => setFilterStaffIds([])
      )}
    </ScreenContainer>
  );
}
