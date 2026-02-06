import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React, { useState } from "react";
import {
  Alert,
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
  ActivityIndicator,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

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

const activityOptions = [
  { label: "Cleaning", value: "cleaning" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Inspection", value: "inspection" },
  { label: "Feeding", value: "feeding" },
];

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
  const { device } = useBle();

  /* =========================
      STATE
  ========================= */
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    time: new Date(),
    command: "ON" as "ON" | "OFF",
    type: "",
    description: "",
  });

  const [errors, setErrors] = useState({ title: "", description: "" });

  /* =========================
      HELPERS
  ========================= */
  const formatTime = (date: Date) =>
    `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

  const validateForm = () => {
    let ok = true;
    let e = { title: "", description: "" };
    if (!formData.title.trim()) { e.title = "Title is required"; ok = false; }
    if (!formData.description.trim()) { e.description = "Description is required"; ok = false; }
    setErrors(e);
    return ok;
  };

  const sendScheduleToESP32 = async (schedule: ScheduleItem) => {
    // If device is null/undefined, this will throw and be caught in handleSubmit
    if (!device) throw new Error("ESP32_NOT_CONNECTED");

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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const newSchedule: ScheduleItem = {
      id: `sched_${Date.now()}`,
      title: formData.title,
      dateISO: selectedDate.toISOString().split("T")[0],
      startTime: formatTime(formData.time),
      command: formData.command,
      type: formData.type,
      description: formData.description,
      enabled: true,
    };

    setLoading(true);

    try {
      // 1. Attempt BLE transfer first. If it fails, execution stops here.
      await sendScheduleToESP32(newSchedule);
      
      // 2. ONLY reach here if the ESP32 successfully received the data
      setSchedules([...schedules, newSchedule]);
      
      Alert.alert("Success", "Schedule synced with ESP32");
      setModalVisible(false);
      
      // Reset form
      setFormData({ title: "", time: new Date(), command: "ON", type: "", description: "" });
    } catch (error) {
      // 3. Handle connection failure
      Alert.alert(
        "Connection Error", 
        "ESP32 is not connected. Please connect the device to save this schedule."
      );
    } finally {
      setLoading(false);
    }
  };

  const dailySchedules = schedules.filter(
    (s) => s.dateISO === selectedDate.toISOString().split("T")[0]
  );

  return (
    <>
      <ScrollView className="bg-white" contentContainerStyle={{ paddingBottom: 40 }}>
        <CustomCalendar
          value={selectedDate}
          onChange={(d) => setSelectedDate(new Date(d))}
        />

        <View className="px-5 mt-4">
          <TouchableOpacity
            style={[globalStyles.card, { paddingVertical: 15, flexDirection: 'row' }]}
            className="items-center justify-center gap-3"
            onPress={() => setModalVisible(true)}
          >
            <View className="p-2 bg-green-500 rounded-lg">
              <FontAwesome5 name="plus" size={16} color="white" />
            </View>
            <Text className="font-bold text-slate-800">New Schedule</Text>
          </TouchableOpacity>
        </View>

        <View className="px-5 mt-8">
          <Text style={styles.sectionTitle}>Schedules for {selectedDate.toLocaleDateString()}</Text>
          
          {dailySchedules.length > 0 ? (
            dailySchedules.map((item) => (
              <View key={item.id} style={styles.scheduleCard}>
                <View style={styles.timeBox}>
                  <Text style={styles.timeText}>{item.startTime}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{item.command}</Text>
                  </View>
                </View>
                <View style={styles.contentBox}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemType}>{item.type || "General Task"}</Text>
                  <Text style={styles.itemDesc} numberOfLines={1}>{item.description}</Text>
                </View>
                <Feather name="more-vertical" size={20} color="#94a3b8" />
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Feather name="calendar" size={32} color="#cbd5e1" />
              </View>
              <Text style={styles.emptyText}>No schedule for this day</Text>
              <Text style={styles.emptySubText}>Tap the button above to add one.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Add Schedule</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} disabled={loading}>
                <FontAwesome5 name="window-close" size={24} color={loading ? "#cbd5e1" : "#64748b"} />
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.form}>
                  <Text style={styles.label}>Task Title</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Morning Feeding"
                    value={formData.title}
                    onChangeText={(t) => setFormData({ ...formData, title: t })}
                    editable={!loading}
                  />
                  {errors.title && <Text style={styles.error}>{errors.title}</Text>}

                  <Text style={styles.label}>Start Time</Text>
                  <DatePicker
                    mode="time"
                    value={formData.time}
                    onChange={(d) => setFormData({ ...formData, time: d })}
                  />

                  <Text style={styles.label}>Activity Type</Text>
                  <DropdownComponent
                    data={activityOptions}
                    placeholder="Select activity"
                    onChangeValue={(v) => setFormData({ ...formData, type: v })}
                  />

                  <Text style={styles.label}>Notes</Text>
                  <TextInput
                    style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                    placeholder="Additional details..."
                    multiline
                    value={formData.description}
                    onChangeText={(t) => setFormData({ ...formData, description: t })}
                    editable={!loading}
                  />
                  {errors.description && <Text style={styles.error}>{errors.description}</Text>}

                  <TouchableOpacity 
                    style={[styles.saveButton, loading && { opacity: 0.7 }]} 
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={{ color: "white", fontSize: 16, fontWeight: '700' }}>Save Schedule</Text>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  headerText: {
    fontSize: 22,
    fontWeight: "800",
    color: '#1e293b'
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  form: {
    padding: 24,
    gap: 12,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b'
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: '#475569',
    marginTop: 8
  },
  error: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: '600'
  },
  saveButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: 'center',
    marginTop: 20,
    minHeight: 60,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  scheduleCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
        android: { elevation: 2 }
    })
  },
  timeBox: {
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
    paddingRight: 15,
    marginRight: 15,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b'
  },
  statusBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16a34a'
  },
  contentBox: {
    flex: 1
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b'
  },
  itemType: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'capitalize'
  },
  itemDesc: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b'
  },
  emptySubText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4
  }
});