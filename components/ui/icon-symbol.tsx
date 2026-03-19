// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left": "chevron-left",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "person.2.fill": "people",
  "person.badge.plus": "person-add",
  "person.fill.xmark": "person-off",
  "calendar": "calendar-today",
  "chart.bar.fill": "bar-chart",
  "chart.bar": "bar-chart",
  "ellipsis.circle.fill": "more-horiz",
  "plus.circle.fill": "add-circle",
  "magnifyingglass": "search",
  "line.3.horizontal.decrease": "filter-list",
  "star.fill": "star",
  "phone.fill": "phone",
  "envelope.fill": "email",
  "message.fill": "message",
  "clock.fill": "schedule",
  "checkmark.circle.fill": "check-circle",
  "checkmark": "check",
  "xmark.circle.fill": "cancel",
  "exclamationmark.triangle.fill": "warning",
  "wrench.fill": "build",
  "mappin.circle.fill": "place",
  "building.2.fill": "business",
  "doc.fill": "description",
  "book.fill": "menu-book",
  "arrow.down.doc": "file-download",
  "arrow.up.doc": "file-upload",
  "trash": "delete",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
