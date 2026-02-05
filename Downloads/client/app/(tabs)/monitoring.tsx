import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Platform,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
} from "react-native";
import { globalStyles } from "@/styles/globalStyle";

import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

import * as Progress from "react-native-progress";
import StatusCard from "@/components/ui/StatusCard";

/* 🔵 GLOBAL BLE */
import { useBle } from "@/app/ble/BleProvider";

export default function Monitoring() {
  const { fontScale } = useWindowDimensions();

  /* =========================
     GLOBAL BLE
  ========================= */
  const { status: bleStatus, connect } = useBle();
  const isConnected = bleStatus === "connected";

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

  const statusColor =
    bleStatus === "connected"
      ? "#22c55e"
      : bleStatus === "connecting"
      ? "#facc15"
      : "#ef4444";

  /* =========================
     MOCK DATA
  ========================= */
  const cleaningData = [
    { label: "Hour", value: 0.75, color: "#2196f3" },
    { label: "Minutes", value: 0.378, color: "#4caf50" },
    { label: "Seconds", value: 0.3, color: "#ff9800" },
  ];

  const historyData = [
    {
      id: 1,
      icon: <AntDesign name="check-circle" size={12} color="green" />,
      details: "Cleaning completed",
      time: new Date(),
    },
    {
      id: 2,
      icon: <Entypo name="warning" size={12} color="orange" />,
      details: "Collector emptied",
      time: new Date(Date.now() - 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    },
    {
      id: 3,
      icon: <Entypo name="circle-with-cross" size={12} color="red" />,
      details: "High waste level detected",
      time: new Date("2025-08-30T16:00:00"),
    },
  ];

  const formatTime = (date: Date) => {
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })}`;
    }

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  /* =========================
     UI
  ========================= */
  return (
    <ScrollView className="flex-1 px-5 bg-white">
      <View
        className="gap-5"
        style={{
          height: "100%",
          paddingBottom: Platform.OS === "ios" ? 100 : 30,
        }}
      >
        {/* 🔵 BLE STATUS INDICATOR */}
        <View style={styles.bleWrapper}>
          <Pressable
            style={styles.bleCard}
            onPress={() => bleStatus === "disconnected" && connect()}
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
              {bleStatus === "connected"
                ? "ESP32 Connected"
                : bleStatus === "connecting"
                ? "Connecting…"
                : "Disconnected — Tap to reconnect"}
            </Text>
          </Pressable>
        </View>

        {/* ⚠️ DISCONNECTED WARNING */}
        {!isConnected && (
          <View style={styles.warningCard}>
            <FontAwesome name="warning" size={18} color="#f59e0b" />
            <Text style={styles.warningText}>
              Live monitoring unavailable. Device disconnected.
            </Text>
          </View>
        )}

        {/* Header */}
        <View className="gap-1">
          <Text className="font-bold" style={{ fontSize: 24 * fontScale }}>
            Monitoring
          </Text>
          <Text
            className="text-gray-400 font-semibold"
            style={{ fontSize: 14 * fontScale }}
          >
            Track waste levels and farm environment in real-time
          </Text>
        </View>

        {/* Machine Status */}
       <View style={{ opacity: isConnected ? 1 : 0.4 }}>
          <Text className="text-3xl font-bold">Machine Status</Text>

          <View className="flex flex-col gap-2">
            <View className="flex flex-row items-center gap-2">
              <FontAwesome
                name="circle"
                size={15}
                color={isConnected ? "green" : "gray"}
              />
              <Text className="text-lg font-semibold">
                {isConnected ? "Running" : "Offline"}
              </Text>
            </View>

            <View className="flex flex-row items-center gap-2">
              <FontAwesome name="circle" size={15} color="red" />
              <Text>{isConnected ? "10% Full" : "—"}</Text>
            </View>
          </View>

          <View>
            <Text className="text-lg font-semibold">Next Cleaning</Text>
            <Text className="text-gray-400">
              {isConnected ? "Scheduled at 8:00 AM" : "Unavailable"}
            </Text>
          </View>
        </View>

        {/* Cleaning Data */}
        <View
          className="bg-white px-5 rounded-lg gap-3"
          style={[
            globalStyles.card,
            { paddingVertical: 20, opacity: isConnected ? 1 : 0.4 },
          ]}
        >
          <Text className="font-bold" style={{ fontSize: 15 * fontScale }}>
            Cleaning Data (Duration)
          </Text>

          {cleaningData.map((item, index) => (
            <View key={index} style={{ marginTop: 10 }}>
              <View className="flex-row justify-between items-center">
                <Text>{item.label}</Text>
                <Text>
                  {isConnected ? `${(item.value * 100).toFixed(1)}%` : "—"}
                </Text>
              </View>
              <Progress.Bar
                progress={isConnected ? item.value : 0}
                width={null}
                height={20}
                color={item.color}
                borderRadius={3}
              />
            </View>
          ))}
        </View>

        {/* History (still visible even offline) */}
        <View
          className="bg-white px-5 py-3 rounded-lg"
          style={[globalStyles.card]}
        >
          <Text className="font-bold mb-3" style={{ fontSize: 15 * fontScale }}>
            History
          </Text>

          {historyData.map((item) => (
            <View
              key={item.id}
              className="flex-row items-center justify-between gap-3 mb-3"
            >
              <View className="flex-row gap-2 items-center">
                {item.icon}
                <Text
                  className="font-semibold"
                  style={{ fontSize: 16 * fontScale }}
                >
                  {item.details}
                </Text>
              </View>
              <Text
                className="text-gray-400 text-sm"
                style={{ fontSize: 12 * fontScale }}
              >
                {formatTime(item.time)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
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
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  warningText: {
    color: "#92400e",
    fontSize: 14,
    fontWeight: "600",
  },
});
