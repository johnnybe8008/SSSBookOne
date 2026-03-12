import React from "react";
import { Platform, TextInput } from "react-native";

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
    const formatLocalDateOnly = (date: Date): string => {
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, "0");
      const day = `${date.getDate()}`.padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const formatLocalDateTime = (date: Date): string => {
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, "0");
      const day = `${date.getDate()}`.padStart(2, "0");
      const hour = `${date.getHours()}`.padStart(2, "0");
      const minute = `${date.getMinutes()}`.padStart(2, "0");
      return `${year}-${month}-${day}T${hour}:${minute}`;
    };

    const isValidDate = (year: number, month: number, day: number): boolean => {
      if (month < 1 || month > 12 || day < 1 || day > 31) return false;
      const test = new Date(year, month - 1, day);
      return (
        test.getFullYear() === year &&
        test.getMonth() === month - 1 &&
        test.getDate() === day
      );
    };

    const parseTypedDateToIso = (raw: string): string | null => {
      const trimmed = raw.trim();
      if (!trimmed) return null;

      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
      }

      const digits = trimmed.replace(/\D/g, "");
      if (digits.length === 8) {
        // Supports MMDDYYYY typing, e.g. 12291992.
        const month = parseInt(digits.slice(0, 2), 10);
        const day = parseInt(digits.slice(2, 4), 10);
        const year = parseInt(digits.slice(4, 8), 10);
        if (!isValidDate(year, month, day)) return null;
        return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      }

      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
        const [m, d, y] = trimmed.split("/").map((part) => parseInt(part, 10));
        if (!isValidDate(y, m, d)) return null;
        return `${y.toString().padStart(4, "0")}-${m.toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
      }

      return null;
    };

    const isoToUsDate = (iso: string): string => {
      const [year, month, day] = iso.split("-");
      return `${month}/${day}/${year}`;
    };

    const inputValue = (() => {
      if (typeof value === "string") {
        if (mode === "date") {
          const iso = parseTypedDateToIso(value);
          return iso ? isoToUsDate(iso) : value;
        }
        return mode === "datetime" ? value.slice(0, 16) : value.slice(11, 16);
      }
      if (mode === "date") return isoToUsDate(formatLocalDateOnly(value));
      if (mode === "datetime") return formatLocalDateTime(value);
      return value.toTimeString().slice(0, 5);
    })();

    if (mode === "date") {
      const [draftValue, setDraftValue] = React.useState(inputValue);
      const pickerIsoValue = parseTypedDateToIso(draftValue) || parseTypedDateToIso(inputValue) || "";

      React.useEffect(() => {
        setDraftValue(inputValue);
      }, [inputValue]);

      return (
        <div style={{ display: "flex", gap: 8, alignItems: "center", width: "100%" }}>
          <div style={{ flex: 1 }}>
            <TextInput
              placeholder="MM/DD/YYYY"
              value={draftValue}
              onChangeText={(typed) => {
                setDraftValue(typed);
                const parsedIso = parseTypedDateToIso(typed);
                onChange(parsedIso ?? typed);
              }}
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
              autoCorrect={false}
              selectTextOnFocus
              editable={!disabled}
              style={{ padding: 8, borderRadius: 8, borderWidth: 1, borderColor: "#ccc", fontSize: 16, width: "100%", backgroundColor: "#fff" }}
            />
          </div>
          <input
            type="date"
            value={pickerIsoValue}
            disabled={disabled}
            aria-label="Pick date"
            onChange={(e) => {
              const iso = e.target.value;
              if (!iso) return;
              const [year, month, day] = iso.split("-");
              const us = `${month}/${day}/${year}`;
              setDraftValue(us);
              onChange(iso);
            }}
            style={{
              height: 40,
              borderRadius: 8,
              border: "1px solid #ccc",
              padding: "0 8px",
              backgroundColor: "#fff",
            }}
          />
        </div>
      );
    }

    return (
      <input
        type={inputType}
        value={inputValue}
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
