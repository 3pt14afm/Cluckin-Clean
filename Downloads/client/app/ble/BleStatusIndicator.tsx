import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Alert,
} from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useBle } from "./BleProvider";

export default function BleStatusIndicator() {
  const { status, connect, disconnect, device } = useBle();
  const pulse = useRef(new Animated.Value(0.6)).current;

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

  const color =
    status === "connected"
      ? "#22c55e"
      : status === "connecting"
      ? "#facc15"
      : "#ef4444";

  const onLongPress = () => {
    Alert.alert(
      "BLE Details",
      `Status: ${status}\nDevice: ${device?.name ?? "None"}\nID: ${
        device?.id ?? "—"
      }`,
      [
        { text: "Disconnect", onPress: disconnect, style: "destructive" },
        { text: "Close" },
      ]
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={connect}
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
        <FontAwesome5 name="bluetooth-b" size={14} color="#60a5fa" />
        <Text style={styles.text}>
          {status === "connected"
            ? "Connected"
            : status === "connecting"
            ? "Connecting"
            : "Tap to reconnect"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginVertical: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
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
  },
});
