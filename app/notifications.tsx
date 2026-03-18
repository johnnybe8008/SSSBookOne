import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { useStaffRole } from "@/hooks/use-staff-role";
import { trpc } from "@/lib/trpc";

type RecipientType = "client" | "staff";

export default function NotificationsScreen() {
  const colors = useColors();
  const { staff } = useAuth();
  const { isAdmin } = useStaffRole();
  const [recipientType, setRecipientType] = useState<RecipientType>("client");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const staffId = Number(staff?.id || 0);
  const { data: allClients = [], isLoading: clientsLoading } = trpc.clients.listAll.useQuery();
  const { data: allStaff = [], isLoading: staffLoading } = trpc.staff.listAll.useQuery(undefined, { enabled: isAdmin });
  const { data: ownSessions = [], isLoading: sessionsLoading } = trpc.sessions.listByStaff.useQuery(
    { staffId },
    { enabled: !isAdmin && !!staffId }
  );

  const sendManual = trpc.notifications.sendManual.useMutation({
    onSuccess: (result) => {
      const sentCount = result.results.filter((item) => item.status === "sent").length;
      const failedCount = result.results.filter((item) => item.status === "failed").length;
      const skippedCount = result.results.filter((item) => item.status === "skipped").length;
      Alert.alert("Notifications", `Sent: ${sentCount}\nFailed: ${failedCount}\nSkipped: ${skippedCount}`);
      setMessage("");
      setSelectedIds([]);
    },
    onError: (error: any) => {
      Alert.alert("Notifications", error.message || "Failed to send notifications.");
    },
  });

  const ownClientIds = useMemo(() => {
    return new Set((ownSessions || []).map((session: any) => Number(session.clientId)));
  }, [ownSessions]);

  const recipientOptions = useMemo(() => {
    if (recipientType === "staff") {
      return (allStaff || [])
      .filter((member: any) => String(member.mobilePhone || "").trim())
      .map((member: any) => ({
        id: Number(member.id),
        name: member.name,
        preference: member.notificationPreference || "unset",
        phone: member.mobilePhone || "",
      }));
    }

    const source = isAdmin
      ? allClients
      : (allClients || []).filter((client: any) => ownClientIds.has(Number(client.id)));

    return source
      .filter((client: any) => String(client.mobilePhone || "").trim())
      .map((client: any) => ({
        id: Number(client.id),
        name: client.name,
        preference: client.notificationPreference || "unset",
        phone: client.mobilePhone || "",
      }));
  }, [recipientType, allClients, allStaff, isAdmin, ownClientIds]);

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return recipientOptions;
    return recipientOptions.filter((item) => {
      return item.name.toLowerCase().includes(query) || String(item.phone || "").toLowerCase().includes(query);
    });
  }, [recipientOptions, search]);

  const isLoading = clientsLoading || (!isAdmin && sessionsLoading) || (recipientType === "staff" && staffLoading);

  const toggleRecipient = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  };

  const handleSend = () => {
    if (selectedIds.length === 0) {
      Alert.alert("Notifications", "Select at least one recipient.");
      return;
    }
    if (!message.trim()) {
      Alert.alert("Notifications", "Enter a message first.");
      return;
    }
    sendManual.mutate({
      recipientType,
      recipientIds: selectedIds,
      message: message.trim(),
    });
  };

  return (
    <ScreenContainer className="flex-1">
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary text-3xl font-bold">&lt;</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Notifications</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="bg-surface rounded-2xl border border-border p-4 mb-4">
          <Text className="text-base font-semibold text-foreground mb-3">Recipients</Text>
          <View className="flex-row gap-2 mb-3">
            <TouchableOpacity
              className={`flex-1 rounded-xl px-4 py-3 border ${recipientType === "client" ? "bg-primary border-primary" : "bg-background border-border"}`}
              onPress={() => {
                setRecipientType("client");
                setSelectedIds([]);
              }}
            >
              <Text className={`text-center font-semibold ${recipientType === "client" ? "text-background" : "text-foreground"}`}>Clients</Text>
            </TouchableOpacity>
            {isAdmin && (
              <TouchableOpacity
                className={`flex-1 rounded-xl px-4 py-3 border ${recipientType === "staff" ? "bg-primary border-primary" : "bg-background border-border"}`}
                onPress={() => {
                  setRecipientType("staff");
                  setSelectedIds([]);
                }}
              >
                <Text className={`text-center font-semibold ${recipientType === "staff" ? "text-background" : "text-foreground"}`}>Staff</Text>
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={`Search ${recipientType}s by name or phone`}
            className="bg-background border border-border rounded-xl px-4 py-3 text-foreground mb-3"
            placeholderTextColor={colors.muted}
          />

          <Text className="text-xs text-muted mb-3">
            {isAdmin
              ? `Select one or more ${recipientType}s.`
              : "Select one or more clients from your existing sessions."}
          </Text>

          {isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : filteredOptions.length === 0 ? (
            <Text className="text-sm text-muted">No recipients found.</Text>
          ) : (
            <View className="gap-2">
              {filteredOptions.map((item) => {
                const checked = selectedIds.includes(item.id);
                return (
                  <TouchableOpacity
                    key={String(item.id)}
                    className={`rounded-xl border px-4 py-3 ${checked ? "border-primary bg-primary/10" : "border-border bg-background"}`}
                    onPress={() => toggleRecipient(item.id)}
                  >
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">{item.name}</Text>
                        <Text className="text-sm text-muted mt-1">
                          {[item.phone || "No phone", item.preference.toUpperCase()].join(" • ")}
                        </Text>
                      </View>
                      <View className={`w-6 h-6 rounded border items-center justify-center ${checked ? "border-primary bg-primary" : "border-border"}`}>
                        {checked ? <Text className="text-background font-bold">✓</Text> : null}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View className="bg-surface rounded-2xl border border-border p-4 mb-4">
          <Text className="text-base font-semibold text-foreground mb-3">Message</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message here..."
            multiline
            textAlignVertical="top"
            className="bg-background border border-border rounded-xl px-4 py-3 text-foreground min-h-[140px]"
            placeholderTextColor={colors.muted}
          />
          <Text className="text-xs text-muted mt-2">
            Messages send using each recipient's saved preference. WhatsApp delivery requires a configured Twilio WhatsApp sender.
          </Text>
        </View>

        <TouchableOpacity
          className={`rounded-xl px-4 py-4 ${sendManual.isPending ? "bg-muted" : "bg-primary"}`}
          onPress={handleSend}
          disabled={sendManual.isPending}
        >
          {sendManual.isPending ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text className="text-background text-center font-semibold text-base">
              Send to {selectedIds.length} recipient{selectedIds.length === 1 ? "" : "s"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
