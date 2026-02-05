import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  Platform,
  Modal,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import ActionCard from "@/components/ui/ActionCard";
import MyAccordion from "@/components/ui/Accordion";

import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Feather from "@expo/vector-icons/Feather";

/* 🔵 GLOBAL BLE */
import { useBle } from "@/app/ble/BleProvider";

const { height } = Dimensions.get("window");

export default function HomeScreen() {
  const { status, connect, device } = useBle();

  const [helpVisible, setHelpVisible] = useState(false);
  const [bleDetailsVisible, setBleDetailsVisible] = useState(false);

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

  const quickActions = [
    {
      icon: <Ionicons name="grid" size={24} color="black" />,
      title: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <FontAwesome5 name="calendar-week" size={24} color="black" />,
      title: "Schedule",
      path: "/schedule",
    },
    {
      icon: <Feather name="monitor" size={24} color="black" />,
      title: "Monitoring",
      path: "/monitoring",
    },
    {
      icon: <Feather name="bell" size={24} color="black" />,
      title: "Notifications",
      path: "/notification",
    },
  ];

  const statusColor =
    status === "connected"
      ? "#22c55e"
      : status === "connecting"
      ? "#facc15"
      : "#ef4444";

  return (
    <>
      <ScrollView className="flex-1 px-5 bg-white">
        <View className="gap-5 pb-5">
          {/* BLE STATUS INDICATOR */}
          <View style={styles.bleWrapper}>
            <Pressable
              onPress={() => status === "disconnected" && connect()}
              onLongPress={() => setBleDetailsVisible(true)}
              style={styles.bleCard}
            >
              <Animated.View
                style={[
                  styles.pulseDot,
                  {
                    backgroundColor: statusColor,
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              />
              <FontAwesome5
                name="bluetooth-b"
                size={14}
                color="#60a5fa"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.bleText}>
                {status === "connected"
                  ? "ESP32 Connected"
                  : status === "connecting"
                  ? "Connecting…"
                  : "Tap to reconnect"}
              </Text>
            </Pressable>
          </View>

          {/* HERO IMAGE */}
          <Image
            source={require("@/assets/images/barn.jpg")}
            style={{ width: "100%", height: 150, borderRadius: 12 }}
            resizeMode="cover"
          />

          {/* WELCOME */}
          <View>
            <Text className="text-3xl font-bold text-gray-600">Welcome</Text>
            <Text className="text-xl font-bold text-gray-400">
              Your farm is running smoothly
            </Text>
          </View>

          {/* QUICK ACTIONS */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 15 }}>
            {quickActions.map((item) => (
              <ActionCard key={item.title} path={item.path}>
                {item.icon}
                <Text>{item.title}</Text>
              </ActionCard>
            ))}
          </View>

          {/* HELP */}
          <ActionCard path="/" widthFull onPress={() => setHelpVisible(true)}>
            <Ionicons name="help-circle" size={24} color="black" />
            <Text>How to Use</Text>
          </ActionCard>
        </View>
      </ScrollView>

      {/* HOW TO USE MODAL */}
      <Modal animationType="slide" visible={helpVisible}>
        <SafeAreaProvider>
          <SafeAreaView
            className={`flex gap-3 w-full ${
              Platform.OS === "android" ? "pt-10" : ""
            }`}
          >
            <View className="px-5 flex-row justify-between items-center">
              <Text style={{ fontSize: 25 }} className="font-bold">
                How to Use?
              </Text>
              <TouchableOpacity onPress={() => setHelpVisible(false)}>
                <FontAwesome5 name="window-close" size={24} />
              </TouchableOpacity>
            </View>
            <MyAccordion />
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>

      {/* BLE DETAILS MODAL */}
      <Modal transparent visible={bleDetailsVisible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>BLE Details</Text>
            <Text style={styles.detailsText}>
              Status: {status.toUpperCase()}
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
              <Text style={{ color: "white", fontWeight: "600" }}>Close</Text>
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
    paddingTop: 10,
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
    letterSpacing: 0.3,
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
