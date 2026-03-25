import { Alert, Linking, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { router } from "expo-router";

import { getApiBaseUrl } from "@/constants/oauth";
import { APP_VERSION } from "@/constants/const";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useIsMobileWeb } from "@/hooks/use-is-mobile-web";
import { useStaffRole } from "@/hooks/use-staff-role";
import { adminManual, buildManualHtml, staffManual, type ManualDefinition } from "@/lib/manuals";

type ManualAsset = {
  accentClassName: string;
  definition: ManualDefinition;
  fileName: string;
  filePrefix: string;
};

function isMobileWebBrowser() {
  if (Platform.OS !== "web" || typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent || "";
  const mobileAgent =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const hasTouchPoints = typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1;

  return mobileAgent || hasTouchPoints;
}

const adminManualAsset: ManualAsset = {
  accentClassName: "bg-error",
  definition: adminManual,
  fileName: "SSS_Admin_Manual.pdf",
  filePrefix: "SSS_Admin_Manual",
};

const staffManualAsset: ManualAsset = {
  accentClassName: "bg-primary",
  definition: staffManual,
  fileName: "SSS_Staff_Manual.pdf",
  filePrefix: "SSS_Staff_Manual",
};

export default function ManualsScreen() {
  const colors = useColors();
  const isMobileWeb = useIsMobileWeb();
  const { isAdmin } = useStaffRole();
  const horizontalPaddingClassName = isMobileWeb ? "px-4" : "px-6";

  const getManualPdfUrl = (fileName: string) => {
    const baseUrl =
      Platform.OS === "web" && typeof window !== "undefined" && window.location
        ? window.location.origin
        : getApiBaseUrl();

    if (!baseUrl) {
      return "";
    }

    return `${baseUrl.replace(/\/$/, "")}/manuals/${encodeURIComponent(fileName)}`;
  };

  const hasStaticManual = async (fileName: string) => {
    const manualUrl = getManualPdfUrl(fileName);
    if (!manualUrl) {
      return false;
    }

    try {
      const response = await fetch(manualUrl, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  };

  const viewStaticManual = async (manual: ManualAsset) => {
    const manualUrl = getManualPdfUrl(manual.fileName);
    if (!manualUrl) {
      throw new Error("Manual URL could not be resolved.");
    }

    if (Platform.OS === "web") {
      if (!isMobileWebBrowser() && typeof window !== "undefined") {
        window.open(manualUrl, "_blank", "noopener,noreferrer");
      } else {
        router.push({
          pathname: "/manual-viewer" as never,
          params: {
            fileName: manual.fileName,
            title: manual.definition.title,
          },
        });
      }
      return;
    }

    await Linking.openURL(manualUrl);
  };

  const downloadStaticManual = async (manual: ManualAsset) => {
    const manualUrl = getManualPdfUrl(manual.fileName);
    if (!manualUrl) {
      throw new Error("Manual URL could not be resolved.");
    }

    if (Platform.OS === "web") {
      const link = document.createElement("a");
      link.href = manualUrl;
      link.download = manual.fileName;
      link.click();
      return;
    }

    const datedFileName = `${manual.filePrefix}_${new Date().toISOString().split("T")[0]}.pdf`;
    const targetUri = `${FileSystem.documentDirectory}${datedFileName}`;
    await FileSystem.downloadAsync(manualUrl, targetUri);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(targetUri, {
        dialogTitle: manual.definition.title,
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
      });
      return;
    }

    Alert.alert("Success", `PDF saved to: ${targetUri}`);
  };

  const viewGeneratedManual = async (manual: ManualDefinition, manualKey: string) => {
    const html = buildManualHtml(manual);

    if (Platform.OS === "web") {
      router.push({
        pathname: "/manual-viewer" as never,
        params: {
          source: "generated",
          manualKey,
          title: manual.title,
        },
      });
      return;
    }

    await Print.printAsync({ html });
  };

  const downloadGeneratedManualPdf = async (manual: ManualDefinition, filePrefix: string) => {
    const html = buildManualHtml(manual);
    const result = await Print.printToFileAsync({ html });
    const datedFileName = `${filePrefix}_${new Date().toISOString().split("T")[0]}.pdf`;
    const targetUri = `${FileSystem.documentDirectory}${datedFileName}`;
    await FileSystem.copyAsync({ from: result.uri, to: targetUri });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(targetUri, {
        dialogTitle: manual.title,
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
      });
      return;
    }

    Alert.alert("Success", `PDF saved to: ${targetUri}`);
  };

  const viewManual = async (manual: ManualAsset) => {
    try {
      if (await hasStaticManual(manual.fileName)) {
        await viewStaticManual(manual);
        return;
      }

      await viewGeneratedManual(
        manual.definition,
        manual.filePrefix === "SSS_Admin_Manual" ? "admin" : "staff",
      );
    } catch (error) {
      console.error("[Manuals] Manual view failed", error);
      Alert.alert("View Failed", "Could not open the manual preview.");
    }
  };

  const downloadManual = async (manual: ManualAsset) => {
    try {
      if (await hasStaticManual(manual.fileName)) {
        await downloadStaticManual(manual);
        return;
      }

      await downloadGeneratedManualPdf(manual.definition, manual.filePrefix);
    } catch (error) {
      console.error("[Manuals] Manual download failed", error);
      Alert.alert("Download Failed", "Could not open or generate the manual PDF.");
    }
  };

  const renderManualCard = (manual: ManualAsset) => (
    <View className="bg-surface rounded-2xl border border-border p-5 mb-4">
      <View className="flex-row items-start justify-between gap-3 mb-3">
        <View className="flex-1">
          <Text className="text-xl font-bold text-foreground">{manual.definition.title}</Text>
          <Text className="text-sm text-muted mt-1">{manual.definition.subtitle}</Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${manual.accentClassName}`}>
          <Text className="text-xs font-semibold text-background">{manual.definition.audience}</Text>
        </View>
      </View>

      <Text className="text-sm text-muted mb-2">{manual.definition.versionNote}</Text>
      <Text className="text-xs text-muted mb-4">
        Preferred static file: <Text className="font-semibold text-foreground">docs/manuals/{manual.fileName}</Text>
      </Text>

      <View className="gap-2 mb-4">
        {manual.definition.sections.slice(0, 4).map((section) => (
          <View key={section.title} className="flex-row items-start gap-2">
            <Text className="text-primary mt-[1px]">-</Text>
            <Text className="text-sm text-foreground flex-1">{section.title}</Text>
          </View>
        ))}
        {manual.definition.sections.length > 4 && (
          <Text className="text-xs text-muted">
            Plus {manual.definition.sections.length - 4} more sections.
          </Text>
        )}
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 bg-background border border-border rounded-xl py-3 px-4 flex-row items-center justify-center gap-2"
          onPress={() => void viewManual(manual)}
        >
          <IconSymbol name="book.fill" size={18} color={colors.foreground} />
          <Text className="text-foreground font-semibold">View Manual</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-primary rounded-xl py-3 px-4 flex-row items-center justify-center gap-2"
          onPress={() => void downloadManual(manual)}
        >
          <IconSymbol name="arrow.down.doc" size={18} color={colors.background} />
          <Text className="text-background font-semibold">Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="flex-1">
      <View className={`${horizontalPaddingClassName} pt-4 pb-3 bg-background border-b border-border`}>
        <Text className="text-2xl font-bold text-foreground">Manuals</Text>
        <Text className="text-sm text-muted mt-1">
          Quick access to printable staff and admin guides for SSS Book One
        </Text>
      </View>

      <ScrollView className={`flex-1 ${horizontalPaddingClassName}`} contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }}>
        <View className="bg-primary/10 rounded-2xl border border-primary/20 p-5 mb-5">
          <Text className="text-base font-semibold text-foreground mb-2">Documentation Notes</Text>
          <Text className="text-sm text-muted mb-2">
            These manuals are based on the current application flow in version {APP_VERSION}.
          </Text>
          <Text className="text-sm text-muted">
            {isAdmin
              ? "Drop the final PDFs into docs/manuals to have the app open them directly. If a PDF is missing, the app falls back to the generated manual."
              : "Drop the final staff PDF into docs/manuals to have the app open it directly. If the PDF is missing, the app falls back to the generated manual."}
          </Text>
        </View>

        {isAdmin ? (
          <>
            {renderManualCard(adminManualAsset)}
            {renderManualCard(staffManualAsset)}
          </>
        ) : (
          renderManualCard(staffManualAsset)
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
