import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Alert,
  AlertButton,
} from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useBle } from "./BleProvider";

export default function BleStatusIndicator() {
  const { status, bluetoothOn, connect, disconnect, device } = useBle();
  const pulse = useRef(new Animated.Value(0.6)).current;

  /* =========================
     PULSE ANIMATION
  ========================= */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.6,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /* =========================
     DERIVED UI STATE
  ========================= */
  const effectiveStatus =
    !bluetoothOn ? "bluetooth-off" : status;

  const color =
    effectiveStatus === "connected"
      ? "#22c55e"
      : effectiveStatus === "connecting"
      ? "#facc15"
      : "#ef4444";

  const label =
    effectiveStatus === "connected"
      ? "Connected"
      : effectiveStatus === "connecting"
      ? "Connecting…"
      : effectiveStatus === "bluetooth-off"
      ? "Turn on Bluetooth"
      : "Tap to connect";

  /* =========================
     INTERACTIONS
  ========================= */
  const onPress = () => {
    if (!bluetoothOn) {
      Alert.alert(
        "Bluetooth is Off",
        "Please turn on Bluetooth to connect to the ESP32."
      );
      return;
    }

    if (status === "disconnected") {
      connect(); // 🔁 retry scan / reconnect
    }
  };

  const onLongPress = () => {
    const buttons: AlertButton[] = [];

    if (status === "connected") {
      buttons.push({
        text: "Disconnect",
        onPress: disconnect,
        style: "destructive",
      });
    }

    buttons.push({ text: "Close", style: "cancel" });

    Alert.alert(
      "BLE Details",
      `Bluetooth: ${bluetoothOn ? "ON" : "OFF"}
Status: ${status}
Device: ${device?.name ?? "None"}
ID: ${device?.id ?? "—"}`,
      buttons
    );
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.wrapper}
    >
      <View style={styles.card}>
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: color, transform: [{ scale: pulse }] },
          ]}
        />
        <FontAwesome5
          name="bluetooth-b"
          size={14}
          color={bluetoothOn ? "#60a5fa" : "#94a3b8"}
        />
        <Text style={styles.text}>{label}</Text>
      </View>

      
    </TouchableOpacity>
  );
}

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginVertical: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    gap: 8,
    elevation: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    color: "#e5e7eb",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
