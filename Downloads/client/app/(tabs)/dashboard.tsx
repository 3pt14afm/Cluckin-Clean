import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Pressable,
  SafeAreaView,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Feather } from "@expo/vector-icons"; // Assuming Expo, or use your icon set

/* 🔵 GLOBAL BLE */
import { useBle } from "@/app/ble/BleProvider";
import BleStatusIndicator from "@/app/ble/BleStatusIndicator";

// Custom Card Component for consistency
const GlassCard = ({ children, style }: any) => (
  <View 
    style={[{
      backgroundColor: 'rgba(30, 41, 59, 0.7)',
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.05)',
      marginBottom: 16,
    }, style]}
  >
    {children}
  </View>
);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {/* Header Section */}
        <View style={{ marginTop: 20, marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 28 * fontScale, fontWeight: "800", color: "#f8fafc" }}>
              Dashboard
            </Text>
            <Text style={{ fontSize: 14 * fontScale, color: "#94a3b8", marginTop: 4 }}>
              Smart Cleaning System
            </Text>
          </View>
          <BleStatusIndicator />
        </View>

        {/* System Status - Mini Glass Pill */}
        <View style={{ 
          flexDirection: 'row', 
          backgroundColor: bleStatus === "connected" ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          padding: 12, 
          borderRadius: 16, 
          alignItems: 'center',
          marginBottom: 20,
          borderWidth: 1,
          borderColor: bleStatus === "connected" ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
        }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: bleStatus === "connected" ? "#22c55e" : "#ef4444", marginRight: 10 }} />
          <Text style={{ color: bleStatus === "connected" ? "#4ade80" : "#f87171", fontWeight: "600", fontSize: 13 }}>
            SYSTEM {bleStatus === "connected" ? "OPERATIONAL" : bleStatus.toUpperCase()}
          </Text>
        </View>

        {/* Speed Control Section */}
        <GlassCard>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: "#cbd5e1", fontSize: 14, fontWeight: "600" }}>CLEANING SPEED</Text>
            <View style={{ backgroundColor: "#3b82f6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ color: "white", fontWeight: "bold" }}>{speed}%</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Pressable
              onPress={decreaseSpeed}
              disabled={controlsDisabled}
              style={({ pressed }) => ({
                width: 54, height: 54, borderRadius: 18, backgroundColor: "#1e293b", 
                alignItems: "center", justifyContent: "center", opacity: pressed || controlsDisabled ? 0.6 : 1,
                borderWidth: 1, borderColor: "#334155"
              })}
            >
              <Feather name="minus" size={24} color="#f8fafc" />
            </Pressable>

            {/* Modern Progress Bar */}
            <View style={{ flex: 1, height: 8, backgroundColor: "#334155", borderRadius: 4, marginLeft: 20, marginRight:30, marginHorizontal: 20, overflow: 'hidden' }}>
              <View style={{ width: `${speed}%`, height: '100%', backgroundColor: "#3b82f6" }} />
            </View>

            <Pressable
              onPress={increaseSpeed}
              disabled={controlsDisabled}
              style={({ pressed }) => ({
                width: 54, height: 54, borderRadius: 18, backgroundColor: "#3b82f6", 
                alignItems: "center", justifyContent: "center", opacity: pressed || controlsDisabled ? 0.6 : 1,
                shadowColor: "#3b82f6", shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }
              })}
            >
              <Feather name="plus" size={24} color="white" />
            </Pressable>
          </View>
        </GlassCard>

        {/* Metrics Chart */}
        <GlassCard>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
            <Text style={{ color: "#cbd5e1", fontSize: 14, fontWeight: "600" }}>WASTE LEVEL</Text>
            <Text style={{ color: "#3b82f6", fontWeight: "700" }}>32.5W Power</Text>
          </View>
          
          <LineChart
            data={{
              labels: ["10:00", "10:15", "10:30", "10:45"],
              datasets: [
                { data: [20, 60, 45, 60], color: (o = 1) => `rgba(59, 130, 246, ${o})`, strokeWidth: 3 },
                { data: [30, 55, 70, 90], color: (o = 1) => `rgba(248, 113, 113, ${o})`, strokeWidth: 3 }
              ],
            }}
            width={width - 80}
            height={160}
            chartConfig={{
              backgroundGradientFrom: "#1e293b",
              backgroundGradientTo: "#1e293b",
              decimalPlaces: 0,
              color: (o = 1) => `rgba(255, 255, 255, ${o})`,
              labelColor: (o = 1) => `rgba(148, 163, 184, ${o})`,
              style: { borderRadius: 16 },
              propsForDots: { r: "0" }, // Hide dots for a cleaner look
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16, marginLeft: -20 }}
          />
        </GlassCard>

        {/* History List */}
        <Text style={{ color: "#f8fafc", fontSize: 18, fontWeight: "700", marginBottom: 12, marginTop: 8 }}>
          Recent Activity
        </Text>
        {[
          { date: "Oct 26", time: "1h 30m", desc: "Deep Clean Cycle", level: "85% → 78%" },
          { date: "Oct 25", time: "45m", desc: "Standard Brush", level: "40% → 98%" }
        ].map((item, idx) => (
          <View key={idx} style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            backgroundColor: '#1e293b', 
            padding: 16, 
            borderRadius: 16, 
            marginBottom: 10,
            borderLeftWidth: 4,
            borderLeftColor: idx === 0 ? '#3b82f6' : '#94a3b8'
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#f8fafc", fontWeight: "600" }}>{item.desc}</Text>
              <Text style={{ color: "#94a3b8", fontSize: 12 }}>{item.date} • {item.level}</Text>
            </View>
            <Text style={{ color: "#cbd5e1", fontWeight: "bold" }}>{item.time}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}