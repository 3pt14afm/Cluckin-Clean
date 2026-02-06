import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  ImageBackground,
  Platform,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
/* 🔵 GLOBAL BLE */
import { useBle } from "@/app/ble/BleProvider";
import BleStatusIndicator from "../ble/BleStatusIndicator";
import MyAccordion from "@/components/ui/Accordion";

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { status, device, bluetoothOn } = useBle();
  const [helpVisible, setHelpVisible] = useState(false);
  const [bleDetailsVisible, setBleDetailsVisible] = useState(false);
  const router = useRouter();
  // Unified data structure for all large cards
  const actions = [
    { 
      title: "System Dashboard", 
      sub: "Real-time stats & controls", 
      icon: "grid", 
      color: "#3b82f6", 
      bg: "#dbeafe",
      path: "/dashboard" 
    },
    { 
      title: "Schedule", 
      sub: "Automate your farm routine", 
      icon: "calendar", 
      color: "#8b5cf6", 
      bg: "#ede9fe",
      path: "/schedule" 
    },
    { 
      title: "Monitoring", 
      sub: "Camera & sensor history", 
      icon: "activity", 
      color: "#10b981", 
      bg: "#d1fae5",
      path: "/monitoring" 
    },
    { 
      title: "Notifications", 
      sub: "Alerts and system logs", 
      icon: "bell", 
      color: "#f59e0b", 
      bg: "#fef3c7",
      path: "/notification" 
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* HERO SECTION */}
        <ImageBackground
          source={require("@/assets/images/barn.jpg")}
          style={styles.heroImage}
          imageStyle={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
        >
          <LinearGradient
            colors={['rgba(15, 23, 42, 0.4)', 'rgba(15, 23, 42, 0.8)']}
            style={styles.gradient}
          >
            {/* TOP MIDDLE STATUS */}
            <SafeAreaView style={styles.headerTop}>
               <TouchableOpacity onPress={() => setBleDetailsVisible(true)}>
                  <BleStatusIndicator />
               </TouchableOpacity>
            </SafeAreaView>

            <View style={styles.heroContent}>
              <Text style={styles.welcomeText}>Hello, Farmer</Text>
              <Text style={styles.subWelcomeText}>Everything is looking good today.</Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* QUICK ACTIONS STACK */}
        <View style={styles.gridContainer}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          
          <View style={styles.stack}>
            {actions.map((item, idx) => (
              <Pressable onPress={() => router.push(item.path as any)}  key={idx} style={styles.largeCard}>
                <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
                  <Feather name={item.icon as any} size={24} color={item.color} />
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text 
                   style={styles.cardSub}>{item.sub}</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#cbd5e1" />
              </Pressable>
            ))}
          </View>
        </View>

        {/* HELP BAR */}
        <TouchableOpacity 
          style={styles.helpBar}
          onPress={() => setHelpVisible(true)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="help-circle-outline" size={22} color="#64748b" />
            <Text style={styles.helpText}>How to use this app</Text>
          </View>
          <Feather name="arrow-right" size={18} color="#94a3b8" />
        </TouchableOpacity>

      </ScrollView>

      {/* HOW TO USE MODAL */}
      <Modal animationType="slide" visible={helpVisible}>
        <SafeAreaProvider>
          <SafeAreaView style={styles.modalSafe}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Help Center</Text>
              <TouchableOpacity onPress={() => setHelpVisible(false)}>
                <Ionicons name="close-circle" size={32} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <ScrollView className="px-5">
              <MyAccordion />
            </ScrollView>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>

      {/* BLE DETAILS MODAL */}
      <Modal transparent visible={bleDetailsVisible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Connection Details</Text>
            <View style={styles.detailRow}>
               <Text style={styles.detailLabel}>Bluetooth:</Text>
               <Text style={styles.detailValue}>{bluetoothOn ? "Enabled" : "Disabled"}</Text>
            </View>
            <View style={styles.detailRow}>
               <Text style={styles.detailLabel}>Status:</Text>
               <Text style={[styles.detailValue, { color: status === 'connected' ? '#10b981' : '#f59e0b' }]}>
                 {status.toUpperCase()}
               </Text>
            </View>
            <View style={styles.detailRow}>
               <Text style={styles.detailLabel}>Device:</Text>
               <Text style={styles.detailValue}>{device?.name ?? "None"}</Text>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setBleDetailsVisible(false)}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  heroImage: {
    width: '100%',
    height: 280,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 10 : 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  heroContent: {
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
  },
  subWelcomeText: {
    fontSize: 16,
    color: '#e2e8f0',
    marginTop: 4,
  },
  gridContainer: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  stack: {
    gap: 16,
  },
  largeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  cardSub: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  helpBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  helpText: {
    marginLeft: 12,
    color: '#1e293b',
    fontWeight: '600',
  },
  // Modal Styles
  modalSafe: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  detailsCard: {
    width: "85%",
    backgroundColor: "white",
    padding: 24,
    borderRadius: 30,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    color: '#64748b',
    fontWeight: '600',
  },
  detailValue: {
    color: '#1e293b',
    fontWeight: '700',
  },
  closeBtn: {
    marginTop: 20,
    backgroundColor: "#1e293b",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
  },
});