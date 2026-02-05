import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import CustomCalendar from "@/components/ui/CustomCalendar";
import DatePicker from "@/components/ui/DatePicker";
import DropdownComponent from "@/components/ui/Dropdown";
import { globalStyles } from "@/styles/globalStyle";

/* 🔵 GLOBAL BLE */
import { useBle } from "@/app/ble/BleProvider";
import { Buffer } from "buffer";

/* =========================
   BLE CONSTANTS
========================= */
const SERVICE_UUID = "12345678-1234-1234-1234-1234567890ab";
const CHARACTERISTIC_UUID = "abcd1234-1234-1234-1234-abcdef123456";

/* =========================
   CONSTANTS
========================= */
const activityOptions = [
  { label: "Cleaning", value: "cleaning" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Inspection", value: "inspection" },
  { label: "Feeding", value: "feeding" },
];

/* =========================
   TYPES
========================= */
type ScheduleItem = {
  id: string;
  title: string;
  dateISO: string;
  startTime: string;
  command: "ON" | "OFF";
  type: string;
  description: string;
  enabled: boolean;
};

export default function Schedule() {
  const { fontScale } = useWindowDimensions();

  /* =========================
     GLOBAL BLE
  ========================= */
  const { status: bleStatus, device, connect } = useBle();

  /* =========================
     STATE
  ========================= */
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [bleDetailsVisible, setBleDetailsVisible] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    time: new Date(),
    command: "ON" as "ON" | "OFF",
    type: "",
    description: "",
  });

  const [errors, setErrors] = useState({ title: "", description: "" });

  /* =========================
     BLE PULSE ANIMATION
  ========================= */
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /* =========================
     HELPERS
  ========================= */
  const formatTime = (date: Date) =>
    `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

  const resetForm = () => {
    setFormData({
      title: "",
      time: new Date(),
      command: "ON",
      type: "",
      description: "",
    });
    setErrors({ title: "", description: "" });
  };

  const validateForm = () => {
    let ok = true;
    let e = { title: "", description: "" };

    if (!formData.title.trim()) {
      e.title = "Title is required";
      ok = false;
    }

    if (!formData.description.trim()) {
      e.description = "Description is required";
      ok = false;
    }

    setErrors(e);
    return ok;
  };

  /* =========================
     SEND TO ESP32
  ========================= */
  const sendScheduleToESP32 = async (schedule: ScheduleItem) => {
    if (!device) throw new Error("ESP32 not connected");

    const payload = {
      type: "ADD_SCHEDULE",
      payload: {
        id: schedule.id,
        dateISO: schedule.dateISO,
        startTime: schedule.startTime,
        command: schedule.command,
        enabled: schedule.enabled,
      },
    };

    const base64 = Buffer.from(JSON.stringify(payload)).toString("base64");

    await device.writeCharacteristicWithResponseForService(
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      base64
    );
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const schedule: ScheduleItem = {
      id: `sched_${Date.now()}`,
      title: formData.title,
      dateISO: selectedDate.toISOString().split("T")[0],
      startTime: formatTime(formData.time),
      command: formData.command,
      type: formData.type,
      description: formData.description,
      enabled: true,
    };

    try {
      await sendScheduleToESP32(schedule);
      Alert.alert("Success", "Schedule sent to ESP32");
      setModalVisible(false);
      resetForm();
    } catch {
      Alert.alert("BLE Error", "ESP32 not connected");
    }
  };

  const statusColor =
    bleStatus === "connected"
      ? "#22c55e"
      : bleStatus === "connecting"
      ? "#facc15"
      : "#ef4444";

  /* =========================
     UI
  ========================= */
  return (
    <>
      <ScrollView className="bg-white" contentContainerStyle={{ gap: 20 }}>
        {/* BLE STATUS */}
        <View style={styles.bleWrapper}>
          <Pressable
            style={styles.bleCard}
            onPress={() => bleStatus === "disconnected" && connect()}
            onLongPress={() => setBleDetailsVisible(true)}
          >
            <Animated.View
              style={[
                styles.pulseDot,
                { backgroundColor: statusColor, transform: [{ scale: pulseAnim }] },
              ]}
            />
            <FontAwesome5 name="bluetooth-b" size={14} color="#60a5fa" />
            <Text style={styles.bleText}>
              {bleStatus === "connected"
                ? "ESP32 Connected"
                : bleStatus === "connecting"
                ? "Connecting…"
                : "Tap to reconnect"}
            </Text>
          </Pressable>
        </View>

        <CustomCalendar
          value={selectedDate}
          onChange={(d) => setSelectedDate(new Date(d))}
        />

        <View className="px-5">
          <TouchableOpacity
            style={[globalStyles.card, { paddingVertical: 20 }]}
            className="items-center gap-3"
            onPress={() => setModalVisible(true)}
          >
            <View className="px-3 py-3 bg-green-400 rounded-xl">
              <FontAwesome5 name="broom" size={22} color="white" />
            </View>
            <Text className="font-bold">Add Schedule</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Add Schedule</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <FontAwesome5 name="window-close" size={24} />
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={{ flex: 1 }}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.form}>
                  <TextInput
                    style={styles.input}
                    placeholder="Schedule title"
                    value={formData.title}
                    onChangeText={(t) =>
                      setFormData({ ...formData, title: t })
                    }
                  />
                  {errors.title && (
                    <Text style={styles.error}>{errors.title}</Text>
                  )}

                  <Text style={styles.label}>Time</Text>
                  <DatePicker
                    mode="time"
                    value={formData.time}
                    onChange={(d) =>
                      setFormData({ ...formData, time: d })
                    }
                  />

                  <DropdownComponent
                    data={activityOptions}
                    placeholder="Select activity"
                    onChangeValue={(v) =>
                      setFormData({ ...formData, type: v })
                    }
                  />

                  <TextInput
                    style={[styles.input, { height: 120 }]}
                    placeholder="Description"
                    multiline
                    value={formData.description}
                    onChangeText={(t) =>
                      setFormData({ ...formData, description: t })
                    }
                  />
                  {errors.description && (
                    <Text style={styles.error}>{errors.description}</Text>
                  )}

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSubmit}
                  >
                    <Text style={{ color: "white", fontSize: 16 }}>
                      Save Schedule
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>

      {/* BLE DETAILS */}
      <Modal transparent visible={bleDetailsVisible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>BLE Details</Text>
            <Text style={styles.detailsText}>
              Status: {bleStatus.toUpperCase()}
            </Text>
            <Text style={styles.detailsText}>
              Device: {device?.name ?? "N/A"}
            </Text>
            <Text style={styles.detailsText}>
              ID: {device?.id ?? "—"}
            </Text>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setBleDetailsVisible(false)}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  bleWrapper: {
    alignItems: "center",
    paddingTop: 12,
  },
  bleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    elevation: 4,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  bleText: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  form: {
    padding: 20,
    gap: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#dc2626",
    fontSize: 13,
  },
  saveButton: {
    backgroundColor: "#4ade80",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  detailsCard: {
    width: "85%",
    backgroundColor: "#020617",
    padding: 20,
    borderRadius: 14,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 10,
  },
  detailsText: {
    color: "#cbd5f5",
    fontSize: 14,
    marginBottom: 6,
  },
  closeBtn: {
    marginTop: 14,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});
