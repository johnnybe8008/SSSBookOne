import React from "react";
import { Platform } from "react-native";

interface DateTimePickerProps {
  value: Date | string;
  onChange: (value: Date | string) => void;
  mode?: "date" | "time" | "datetime";
  disabled?: boolean;
}

// Native picker import
let NativeDateTimePicker: any = null;
if (Platform.OS !== "web") {
  NativeDateTimePicker = require("@react-native-community/datetimepicker").default;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, onChange, mode = "date", disabled = false }) => {
  if (Platform.OS === "web") {
    // Web: use HTML input
    const inputType = mode === "time" ? "time" : mode === "datetime" ? "datetime-local" : "date";
    return (
      <input
        type={inputType}
        value={typeof value === "string" ? value : value.toISOString().slice(0, 16)}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc", fontSize: 16 }}
      />
    );
  }
  // Native: use DateTimePicker
  return (
    <NativeDateTimePicker
      value={typeof value === "string" ? new Date(value) : value}
      mode={mode}
      onChange={(_event: any, selectedDate: Date | undefined) => {
        if (selectedDate) onChange(selectedDate);
      }}
      disabled={disabled}
    />
  );
};

export default DateTimePicker;
