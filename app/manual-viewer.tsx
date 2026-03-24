import React from "react";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Alert, Linking, Platform, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { getApiBaseUrl } from "@/constants/oauth";
import { useColors } from "@/hooks/use-colors";

function getManualPdfUrl(fileName: string) {
  const baseUrl =
    Platform.OS === "web" && typeof window !== "undefined" && window.location
      ? window.location.origin
      : getApiBaseUrl();

  if (!baseUrl) {
    return "";
  }

  return `${baseUrl.replace(/\/$/, "")}/manuals/${encodeURIComponent(fileName)}`;
}

function getSingleParam(value: string | string[] | undefined, fallback: string) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

export default function ManualViewerScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ fileName?: string | string[]; title?: string | string[] }>();
  const fileName = getSingleParam(params.fileName, "");
  const title = getSingleParam(params.title, "Manual");
  const manualUrl = fileName ? getManualPdfUrl(fileName) : "";

  const downloadManual = async () => {
    if (!manualUrl) {
      return;
    }

    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        const link = document.createElement("a");
        link.href = manualUrl;
        link.download = fileName || "manual.pdf";
        link.click();
      }
      return;
    }

    const targetUri = `${FileSystem.documentDirectory}${fileName || "manual.pdf"}`;
    await FileSystem.downloadAsync(manualUrl, targetUri);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(targetUri, {
        dialogTitle: title,
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
      });
      return;
    }

    Alert.alert("Success", `PDF saved to: ${targetUri}`);
  };

  const openExternally = async () => {
    if (!manualUrl) {
      return;
    }

    await Linking.openURL(manualUrl);
  };

  const iframe =
    Platform.OS === "web" && manualUrl
      ? React.createElement("iframe", {
          src: manualUrl,
          title,
          style: {
            border: "none",
            width: "100%",
            height: "calc(100vh - 96px)",
            backgroundColor: "#ffffff",
          },
        })
      : null;

  return (
    <ScreenContainer className="flex-1">
      <View className="px-4 pt-4 pb-3 border-b border-border bg-background">
        <View className="flex-row items-center justify-between gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center gap-2 py-2 pr-3"
          >
            <IconSymbol name="chevron.left" size={22} color={colors.primary} />
            <Text className="text-primary font-semibold">Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-base font-semibold text-foreground" numberOfLines={1}>
            {title}
          </Text>
          {Platform.OS === "web" ? (
            <TouchableOpacity
              onPress={() => void downloadManual()}
              className="flex-row items-center gap-2 rounded-full border border-border px-3 py-2"
            >
              <IconSymbol name="arrow.down.doc" size={18} color={colors.foreground} />
              <Text className="text-foreground font-medium">Download</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => void openExternally()}
              className="flex-row items-center gap-2 rounded-full border border-border px-3 py-2"
            >
              <IconSymbol name="arrow.down.doc" size={18} color={colors.foreground} />
              <Text className="text-foreground font-medium">Open</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {Platform.OS === "web" && manualUrl ? (
        <View className="flex-1 bg-background" style={{ minHeight: 0, overflow: "scroll" }}>
          {iframe}
        </View>
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg font-semibold text-foreground text-center mb-2">{title}</Text>
          <Text className="text-sm text-muted text-center mb-5">
            Tap Open to view the PDF in your device browser, then use Back to return to the app.
          </Text>
          <TouchableOpacity
            onPress={() => void openExternally()}
            className="bg-primary rounded-xl px-5 py-3 flex-row items-center gap-2"
          >
            <IconSymbol name="book.fill" size={18} color={colors.background} />
            <Text className="text-background font-semibold">Open Manual</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenContainer>
  );
}
