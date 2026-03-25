import { ScrollView, Text, View, TouchableOpacity, Alert, Platform, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useIsMobileWeb } from "@/hooks/use-is-mobile-web";
import { useAuth } from "@/hooks/use-auth";
import { useStaffRole } from "@/hooks/use-staff-role";
import { trpc } from "@/lib/trpc";
import { APP_VERSION } from "@/constants/const";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

/**
 * More Screen (More Tab)
 * 
 * Displays:
 * - Profile section with staff info
 * - Settings options
 * - Admin section (for admin users only)
 * - Logout button
 */
export default function MoreScreen() {
    // Debug: Log session token and staff info when More tab is opened
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|; )session_token=([^;]*)/);
      const token = match ? decodeURIComponent(match[1]) : null;
      // console.log("[MoreScreen][DEBUG] session_token from cookie:", token);
    }
    // ...existing code...
    // Ensure only one useAuth destructuring
    // ...existing code...
  const colors = useColors();
  const isMobileWeb = useIsMobileWeb();
  const router = useRouter();
  const horizontalPaddingClassName = isMobileWeb ? "px-4" : "px-6";
  const { staff, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { isAdmin } = useStaffRole();
  const { data: allStaff = [] } = trpc.staff.listAll.useQuery(undefined, {
    enabled: isAdmin,
  });
  const { data: allClients = [] } = trpc.clients.listAll.useQuery(undefined, {
    enabled: isAdmin,
  });
  const { data: allCompanies = [] } = trpc.companies.list.useQuery(undefined, {
    enabled: isAdmin,
  });

  // Fix admin account mutation
  const fixAdminMutation = trpc.auth.fixAdmin.useMutation();

  const handleLogout = () => {
    if (Platform.OS === "web") {
      // console.log("[MoreScreen] Web logout confirm dialog");
      if (window.confirm("Are you sure you want to logout?")) {
        (async () => {
          // console.log("[MoreScreen] Logout button pressed");
          await logout();
          // console.log("[MoreScreen] Logout completed, navigating to /login");
          router.replace("/login" as any);
        })();
      }
    } else {
      Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Logout",
            style: "destructive",
            onPress: async () => {
              // console.log("[MoreScreen] Logout button pressed");
              await logout();
              // console.log("[MoreScreen] Logout completed, navigating to /login");
              router.replace("/login" as any);
            },
          },
        ]
      );
    }
  };

  const csvEscape = (value: unknown) => {
    const text = String(value ?? "");
    if (!/[",\n]/.test(text)) {
      return text;
    }
    return `"${text.replace(/"/g, '""')}"`;
  };

  const confirmAndRunExport = (title: string, message: string, action: () => void | Promise<void>) => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && !window.confirm(`${title}\n\n${message}`)) {
        return;
      }
      void action();
      return;
    }

    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Export",
        onPress: () => {
          void action();
        },
      },
    ]);
  };

  const saveAndShareCsv = async (csv: string, fileName: string, successMessage: string, dialogTitle: string) => {
    if (Platform.OS === "web") {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      Alert.alert("Success", successMessage);
      return;
    }

    const baseDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
    if (!baseDir) {
      throw new Error("No writable directory available for CSV export.");
    }

    const fileUri = `${baseDir}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      try {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle,
          UTI: "public.comma-separated-values-text",
        });
      } catch {
        Alert.alert("Success", `CSV saved to ${fileUri}`);
      }
    } else {
      Alert.alert("Success", `CSV saved to ${fileUri}`);
    }
  };

  const handleExportStaffCsv = async () => {
    try {
      if (!allStaff.length) {
        Alert.alert("Export Staff CSV", "No staff records found to export.");
        return;
      }

      const headers = [
        "id",
        "organizationId",
        "staffDepartmentId",
        "teamId",
        "name",
        "address",
        "phone",
        "email",
        "mustChangePassword",
        "lastSignedIn",
        "role",
        "isVipRated",
        "isAdmin",
        "createdAt",
        "createdBy",
        "updatedAt",
        "updatedBy",
      ];

      const rows = allStaff.map((member: any) => [
        member.id,
        member.organizationId,
        member.staffDepartmentId,
        member.teamId,
        member.name,
        member.address,
        member.phone,
        member.email,
        member.mustChangePassword,
        member.lastSignedIn,
        member.role,
        member.isVipRated,
        member.isAdmin,
        member.createdAt,
        member.createdBy,
        member.updatedAt,
        member.updatedBy,
      ]);

      const csv = [
        headers.map(csvEscape).join(","),
        ...rows.map((row) => row.map(csvEscape).join(",")),
      ].join("\n");

      const fileName = `staff_export_${new Date().toISOString().split("T")[0]}.csv`;
      await saveAndShareCsv(csv, fileName, `Exported ${allStaff.length} staff records.`, "Export Staff CSV");
    } catch (error) {
      // console.error("[MoreScreen] Staff CSV export failed", error);
      Alert.alert("Export Failed", "Could not export Staff CSV.");
    }
  };

  const handleExportClientsCsv = async () => {
    try {
      if (!allClients.length) {
        Alert.alert("Export Clients CSV", "No client records found to export.");
        return;
      }

      const headers = [
        "id",
        "companyId",
        "coDepartmentId",
        "companyTeamId",
        "referralSourceId",
        "referralSourceType",
        "name",
        "address",
        "addressLine1",
        "city",
        "stateProvince",
        "postalCode",
        "homePhone",
        "mobilePhone",
        "workPhone",
        "email",
        "occupation",
        "title",
        "dateOfBirth",
        "timeInServiceYears",
        "timeInServiceMonths",
        "timeInService",
        "status",
        "isVip",
        "notificationPreference",
        "notificationOptOut",
        "createdAt",
        "createdBy",
        "updatedAt",
        "updatedBy",
      ];

      const rows = allClients.map((client: any) => [
        client.id,
        client.companyId,
        client.coDepartmentId,
        client.companyTeamId,
        client.referralSourceId,
        client.referralSourceType,
        client.name,
        client.address,
        client.addressLine1,
        client.city,
        client.stateProvince,
        client.postalCode,
        client.homePhone,
        client.mobilePhone,
        client.workPhone,
        client.email,
        client.occupation,
        client.title,
        client.dateOfBirth,
        client.timeInServiceYears,
        client.timeInServiceMonths,
        client.timeInService,
        client.status,
        client.isVip,
        client.notificationPreference,
        client.notificationOptOut,
        client.createdAt,
        client.createdBy,
        client.updatedAt,
        client.updatedBy,
      ]);

      const csv = [
        headers.map(csvEscape).join(","),
        ...rows.map((row) => row.map(csvEscape).join(",")),
      ].join("\n");

      const fileName = `clients_export_${new Date().toISOString().split("T")[0]}.csv`;
      await saveAndShareCsv(csv, fileName, `Exported ${allClients.length} client records.`, "Export Clients CSV");
    } catch (error) {
      // console.error("[MoreScreen] Clients CSV export failed", error);
      Alert.alert("Export Failed", "Could not export Clients CSV.");
    }
  };

  const handleExportCompaniesCsv = async () => {
    try {
      if (!allCompanies.length) {
        Alert.alert("Export Companies CSV", "No company records found to export.");
        return;
      }

      const headers = [
        "id",
        "name",
        "address",
        "addressLine1",
        "city",
        "stateProvince",
        "postalCode",
        "phone",
        "email",
        "website",
        "contactPerson",
        "createdAt",
        "createdBy",
        "updatedAt",
        "updatedBy",
      ];

      const rows = allCompanies.map((company: any) => [
        company.id,
        company.name,
        company.address,
        company.addressLine1,
        company.city,
        company.stateProvince,
        company.postalCode,
        company.phone,
        company.email,
        company.website,
        company.contactPerson,
        company.createdAt,
        company.createdBy,
        company.updatedAt,
        company.updatedBy,
      ]);

      const csv = [
        headers.map(csvEscape).join(","),
        ...rows.map((row) => row.map(csvEscape).join(",")),
      ].join("\n");

      const fileName = `companies_export_${new Date().toISOString().split("T")[0]}.csv`;
      await saveAndShareCsv(csv, fileName, `Exported ${allCompanies.length} company records.`, "Export Companies CSV");
    } catch (error) {
      // console.error("[MoreScreen] Companies CSV export failed", error);
      Alert.alert("Export Failed", "Could not export Companies CSV.");
    }
  };

  if (authLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }
  if (!isAuthenticated) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <Text className="text-xl font-semibold text-foreground mb-4">Not Logged In</Text>
        <Text className="text-base text-muted text-center mb-6">
          Please log in to access settings and profile.
        </Text>
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-full"
          onPress={() => router.push("/login" as any)}
        >
          <Text className="text-background font-semibold">Log In</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className={`${horizontalPaddingClassName} pt-4 pb-3 bg-background border-b border-border`}>
        <Text className="text-2xl font-bold text-foreground">More</Text>
      </View>

      <ScrollView className={`flex-1 ${horizontalPaddingClassName}`} contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }}>
        {/* Profile Section */}
        <View className="bg-surface rounded-2xl p-6 border border-border mb-6">
          <Text className="text-2xl font-semibold text-primary mb-1">
            {staff?.name || "User"}
          </Text>
          <Text className="text-base text-muted mb-1">
            {staff?.role ? staff.role.charAt(0).toUpperCase() + staff.role.slice(1) : ""}
          </Text>
          {staff?.email && (
            <Text className="text-sm text-muted mb-1">{staff.email}</Text>
          )}
        </View>

        {/* Settings Section */}
        <View className="bg-surface rounded-2xl border border-border mb-6 overflow-hidden">
          <Text className="text-sm font-semibold text-muted px-6 pt-4 pb-2">Settings</Text>
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-t border-border"
            onPress={() => {
              if (!staff?.id) {
                Alert.alert("Edit Profile", "Staff profile could not be loaded.");
                return;
              }
              router.push(`/admin-staff-edit?id=${staff.id}` as any);
            }}
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol name="person.2.fill" size={20} color={colors.foreground} />
              <Text className="text-base text-foreground">Edit Profile</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-t border-border"
            onPress={() => router.push("/notifications" as any)}
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol name="message.fill" size={20} color={colors.foreground} />
              <Text className="text-base text-foreground">Notifications</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity
            className="px-6 py-4 flex-row items-center justify-between border-t border-border"
            onPress={() => router.push("/about" as any)}
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color={colors.foreground} />
              <Text className="text-base text-foreground">About</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Admin Section (only visible to admins) */}
        {isAdmin && (
          <View className="bg-surface rounded-2xl border border-border mb-6 overflow-hidden">
            <Text className="text-sm font-semibold text-primary px-6 pt-4 pb-2">Admin Functions</Text>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-organizations" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="person.2.fill" size={20} color={colors.foreground} />
                <Text className="text-base text-foreground">Manage Staff Organizations</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>


            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-staff" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="person.2.fill" size={20} color={colors.primary} />
                <Text className="text-base text-foreground">Manage Staff</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-client-organizations" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="person.2.fill" size={20} color={colors.foreground} />
                <Text className="text-base text-foreground">Manage Client Companies</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            {/* Removed Manage Client Companies tab item */}

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-staff-bulk-reassign" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="person.2.fill" size={20} color={colors.primary} />
                <Text className="text-base text-foreground">Bulk Reassign Staff</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-bulk-reassign" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="person.2.fill" size={20} color={colors.foreground} />
                <Text className="text-base text-foreground">Bulk Reassign Clients</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-lookup-org" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="building.2.fill" size={20} color={colors.foreground} />
                <Text className="text-base text-foreground">Organizational Lookup Tables</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-fsms" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="person.2.fill" size={20} color={colors.foreground} />
                <Text className="text-base text-foreground">Manage FSMs</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-reports" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="chart.bar" size={20} color={colors.primary} />
                <Text className="text-base text-foreground">Reports & Analytics</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-csv-import" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="doc.fill" size={20} color={colors.success} />
                <Text className="text-base text-foreground">CSV Import (Staff)</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-csv-import-clients" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="doc.fill" size={20} color={colors.success} />
                <Text className="text-base text-foreground">CSV Import (Clients)</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            {/* Staff CSV Export Link */}
            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() =>
                confirmAndRunExport(
                  "Export Staff CSV",
                  "Export all staff records to a CSV file now?",
                  handleExportStaffCsv,
                )
              }
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="arrow.up.doc" size={20} color={colors.success} />
                <Text className="text-base text-foreground">Export Staff CSV</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() =>
                confirmAndRunExport(
                  "Export Clients CSV",
                  "Export all client records to a CSV file now?",
                  handleExportClientsCsv,
                )
              }
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="arrow.up.doc" size={20} color={colors.success} />
                <Text className="text-base text-foreground">Export Clients CSV</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() =>
                confirmAndRunExport(
                  "Export Companies CSV",
                  "Export all company records to a CSV file now?",
                  handleExportCompaniesCsv,
                )
              }
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="arrow.up.doc" size={20} color={colors.success} />
                <Text className="text-base text-foreground">Export Companies CSV</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-sms-providers" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="message.fill" size={20} color={colors.primary} />
                <Text className="text-base text-foreground">Manage SMS Providers</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              className="px-6 py-4 flex-row items-center justify-between border-t border-border"
              onPress={() => router.push("/admin-reset-database" as any)}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="trash" size={20} color={colors.error} />
                <Text className="text-base text-error font-semibold">Reset Database</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          className="bg-error/10 py-4 rounded-xl border border-error/30 items-center"
          onPress={() => {
            // console.log("[MoreScreen] Logout button direct onPress fired");
            handleLogout();
          }}
        >
          <Text className="text-base font-semibold text-error">Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text className="text-xs text-muted text-center mt-6">
          SSS Book One v{APP_VERSION}
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}
