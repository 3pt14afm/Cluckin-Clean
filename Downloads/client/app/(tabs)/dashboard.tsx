import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Pressable,
} from "react-native";
import StatusCard from "@/components/ui/StatusCard";
import { LineChart } from "react-native-chart-kit";

/* 🔵 GLOBAL BLE */
import { useBle } from "@/app/ble/BleProvider";
import BleStatusIndicator from "@/app/ble/BleStatusIndicator";

export default function Dashboard() {
  const { fontScale, width } = useWindowDimensions();
  const { status: bleStatus } = useBle();

  const [speed, setSpeed] = useState(75);

  const increaseSpeed = () => {
    if (bleStatus !== "connected") return;
    if (speed < 100) setSpeed((prev) => Math.min(prev + 5, 100));
  };

  const decreaseSpeed = () => {
    if (bleStatus !== "connected") return;
    if (speed > 0) setSpeed((prev) => Math.max(prev - 5, 0));
  };

  const controlsDisabled = bleStatus !== "connected";

  return (
    <ScrollView
      className="px-5"
      style={{ height: "100%" }}
      contentContainerStyle={{ paddingVertical: 20, gap: 10 }}
    >
      {/* GLOBAL BLE STATUS */}
      <BleStatusIndicator />

      {/* Header */}
      <Text
        className="font-bold text-black"
        style={{ fontSize: 24 * fontScale }}
      >
        Smart Cleaning System Dashboard
      </Text>
      <Text className="text-gray-400 mb-3" style={{ fontSize: 12 * fontScale }}>
        Real-Time Operational Metrics
      </Text>

      {/* System Status */}
      <StatusCard className="bg-[#1b2735] p-4 rounded-xl">
        <Text
          className="text-gray-300 mb-2"
          style={{ fontSize: 12 * fontScale }}
        >
          SYSTEM STATUS
        </Text>
        <View className="flex-row items-center justify-between">
          <Text
            className={`font-bold ${
              bleStatus === "connected"
                ? "text-green-400"
                : bleStatus === "connecting"
                ? "text-yellow-400"
                : "text-red-400"
            }`}
            style={{ fontSize: 22 * fontScale }}
          >
            {bleStatus === "connected"
              ? "OPERATIONAL"
              : bleStatus === "connecting"
              ? "CONNECTING"
              : "OFFLINE"}
          </Text>
          <View
            className={`w-3 h-3 rounded-full ${
              bleStatus === "connected"
                ? "bg-green-500"
                : bleStatus === "connecting"
                ? "bg-yellow-400"
                : "bg-red-500"
            }`}
          />
        </View>
      </StatusCard>

      {/* Cleaning Speed Control */}
      <StatusCard className="bg-[#1b2735] p-4 rounded-xl">
        <Text
          className="text-gray-300 mb-2"
          style={{ fontSize: 12 * fontScale }}
        >
          CLEANING SPEED CONTROL
        </Text>

        <View className="flex-row items-center justify-between mb-2">
          <Pressable
            onPress={decreaseSpeed}
            disabled={controlsDisabled}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              controlsDisabled ? "bg-gray-600" : "bg-[#243447]"
            }`}
          >
            <Text className="text-white text-lg font-bold">–</Text>
          </Pressable>

          <Text
            className={`font-bold ${
              controlsDisabled ? "text-gray-500" : "text-blue-400"
            }`}
            style={{ fontSize: 22 * fontScale }}
          >
            {speed}%
          </Text>

          <Pressable
            onPress={increaseSpeed}
            disabled={controlsDisabled}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              controlsDisabled ? "bg-gray-600" : "bg-[#243447]"
            }`}
          >
            <Text className="text-white text-lg font-bold">+</Text>
          </Pressable>
        </View>

        <View className="w-full h-2 bg-[#334155] rounded-full overflow-hidden mt-1">
          <View
            style={{
              width: `${speed}%`,
              height: "100%",
              backgroundColor: controlsDisabled ? "#6b7280" : "#3b82f6",
            }}
          />
        </View>

        <View className="flex-row justify-between mt-1">
          <Text className="text-gray-500 text-xs">Slow (0%)</Text>
          <Text className="text-gray-500 text-xs">Max (100%)</Text>
        </View>
      </StatusCard>

      {/* Waste Level Monitoring */}
      <StatusCard className="bg-[#1b2735] p-4 rounded-xl">
        <Text
          className="text-gray-300 mb-2"
          style={{ fontSize: 12 * fontScale }}
        >
          WASTE LEVEL MONITORING (0–100%)
        </Text>

        <LineChart
          data={{
            labels: ["10.00", "10.15", "10.30"],
            datasets: [
              {
                data: [20, 60, 45, 60],
                color: (o = 1) => `rgba(59,130,246,${o})`,
                strokeWidth: 2,
              },
              {
                data: [30, 55, 70, 100],
                color: (o = 1) => `rgba(239,68,68,${o})`,
                strokeWidth: 2,
              },
            ],
          }}
          width={width - 60}
          height={180}
          yAxisSuffix="%"
          chartConfig={{
            backgroundColor: "#1b2735",
            backgroundGradientFrom: "#1b2735",
            backgroundGradientTo: "#1b2735",
            color: () => "#3b82f6",
            labelColor: () => "#9ca3af",
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: "#1e40af",
            },
          }}
          bezier
          style={{ borderRadius: 10 }}
        />

        <Text className="text-blue-400 mt-2 text-sm">Power: 32.5W</Text>
      </StatusCard>

      {/* Cleaning History */}
      <StatusCard className="bg-[#1b2735] p-4 rounded-xl">
        <Text
          className="text-gray-300 mb-2"
          style={{ fontSize: 12 * fontScale }}
        >
          CLEANING HISTORY
        </Text>
        <View className="bg-[#243447] rounded-lg p-3">
          <Text className="text-white">Previous Cleaning Cycles</Text>
          <View className="mt-2">
            <Text className="text-gray-400 text-xs">
              2023-10-26 — 1hr 30m
            </Text>
            <Text className="text-gray-400 text-xs">
              Duration: 45m — 85% → 78%
            </Text>
            <Text className="text-gray-400 text-xs">
              Avg Speed Remove: 2hr 15m — 40% → 98%
            </Text>
          </View>
        </View>
      </StatusCard>
    </ScrollView>
  );
}
