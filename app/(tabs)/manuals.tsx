import { Alert, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { APP_VERSION } from "@/constants/const";
import { adminManual, buildManualHtml, staffManual, type ManualDefinition } from "@/lib/manuals";
import { useStaffRole } from "@/hooks/use-staff-role";

export default function ManualsScreen() {
  const colors = useColors();
  const { isAdmin } = useStaffRole();

  const exportManualPdf = async (manual: ManualDefinition, filePrefix: string) => {
    try {
      const html = buildManualHtml(manual);

      if (Platform.OS === "web") {
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        iframe.setAttribute("aria-hidden", "true");
        document.body.appendChild(iframe);

        const cleanup = () => {
          window.setTimeout(() => {
            iframe.parentNode?.removeChild(iframe);
          }, 1000);
        };

        iframe.onload = () => {
          try {
            const frameWindow = iframe.contentWindow;
            if (!frameWindow) {
              cleanup();
              Alert.alert("Export Failed", "The browser could not prepare the manual for printing.");
              return;
            }

            frameWindow.focus();
            frameWindow.print();
            cleanup();
          } catch (error) {
            console.error("[Manuals] Web print failed", error);
            cleanup();
            Alert.alert("Export Failed", "Could not open the print dialog for this manual.");
          }
        };

        iframe.srcdoc = `<!DOCTYPE html>${html}`;

        return;
      }

      const result = await Print.printToFileAsync({ html });
      const fileName = `${filePrefix}_${new Date().toISOString().split("T")[0]}.pdf`;
      const targetUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.copyAsync({ from: result.uri, to: targetUri });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(targetUri, {
          mimeType: "application/pdf",
          dialogTitle: manual.title,
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("Success", `PDF saved to: ${targetUri}`);
      }
    } catch (error) {
      console.error("[Manuals] PDF export failed", error);
      Alert.alert("Export Failed", "Could not generate the manual PDF.");
    }
  };

  const renderManualCard = (manual: ManualDefinition, filePrefix: string, accentClassName: string) => (
    <View className="bg-surface rounded-2xl border border-border p-5 mb-4">
      <View className="flex-row items-start justify-between gap-3 mb-3">
        <View className="flex-1">
          <Text className="text-xl font-bold text-foreground">{manual.title}</Text>
          <Text className="text-sm text-muted mt-1">{manual.subtitle}</Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${accentClassName}`}>
          <Text className="text-xs font-semibold text-background">{manual.audience}</Text>
        </View>
      </View>

      <Text className="text-sm text-muted mb-4">{manual.versionNote}</Text>

      <View className="gap-2 mb-4">
        {manual.sections.slice(0, 4).map((section) => (
          <View key={section.title} className="flex-row items-start gap-2">
            <Text className="text-primary mt-[1px]">•</Text>
            <Text className="text-sm text-foreground flex-1">{section.title}</Text>
          </View>
        ))}
        {manual.sections.length > 4 && (
          <Text className="text-xs text-muted">Plus {manual.sections.length - 4} more sections.</Text>
        )}
      </View>

      <TouchableOpacity
        className="bg-primary rounded-xl py-3 px-4 flex-row items-center justify-center gap-2"
        onPress={() => void exportManualPdf(manual, filePrefix)}
      >
        <IconSymbol name="arrow.down.doc" size={18} color={colors.background} />
        <Text className="text-background font-semibold">Export PDF</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer className="flex-1">
      <View className="px-6 pt-4 pb-3 bg-background border-b border-border">
        <Text className="text-2xl font-bold text-foreground">Manuals</Text>
        <Text className="text-sm text-muted mt-1">
          Quick access to printable staff and admin guides for SSS Book One
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }}>
        <View className="bg-primary/10 rounded-2xl border border-primary/20 p-5 mb-5">
          <Text className="text-base font-semibold text-foreground mb-2">Documentation Notes</Text>
          <Text className="text-sm text-muted mb-2">
            These manuals are based on the current application flow in version {APP_VERSION}.
          </Text>
          <Text className="text-sm text-muted">
            {isAdmin
              ? "Admin users can export both the admin guide and the staff guide. Screenshot placeholders are included so real captures can be dropped in during a later documentation pass."
              : "This area gives staff a printable guide for the current system. Screenshot placeholders are included so real captures can be dropped in during a later documentation pass."}
          </Text>
        </View>

        {isAdmin ? (
          <>
            {renderManualCard(adminManual, "SSS_Admin_Manual", "bg-error")}
            {renderManualCard(staffManual, "SSS_Staff_Manual", "bg-primary")}
          </>
        ) : (
          renderManualCard(staffManual, "SSS_Staff_Manual", "bg-primary")
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
