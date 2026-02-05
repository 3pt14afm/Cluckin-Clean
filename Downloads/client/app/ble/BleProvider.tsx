import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { BleManager, Device } from "react-native-ble-plx";

const ESP32_NAME = "ESP32-SCHEDULER";

type BleStatus = "disconnected" | "connecting" | "connected";

type BleContextType = {
  status: BleStatus;
  device: Device | null;
  connect: () => void;
  disconnect: () => void;
};

const BleContext = createContext<BleContextType | null>(null);

// ✅ One manager for the whole app
const manager = new BleManager();

export function BleProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<BleStatus>("disconnected");
  const [device, setDevice] = useState<Device | null>(null);

  /* =========================
     CONNECT (STABLE)
  ========================= */
  const connect = useCallback(() => {
    if (status === "connecting" || status === "connected") return;

    setStatus("connecting");

    manager.startDeviceScan(null, null, async (error, found) => {
      if (error) {
        setStatus("disconnected");
        return;
      }

      if (found?.name === ESP32_NAME) {
        manager.stopDeviceScan();

        try {
          const connected = await found.connect();
          await connected.discoverAllServicesAndCharacteristics();

          connected.onDisconnected(() => {
            setDevice(null);
            setStatus("disconnected");
          });

          setDevice(connected);
          setStatus("connected");
        } catch {
          setStatus("disconnected");
        }
      }
    });
  }, [status]);

  /* =========================
     DISCONNECT
  ========================= */
  const disconnect = useCallback(() => {
    if (device) {
      device.cancelConnection();
      setDevice(null);
    }
    setStatus("disconnected");
  }, [device]);

  /* =========================
     AUTO-CONNECT ON APP START
  ========================= */
  useEffect(() => {
    connect();

    return () => {
      manager.stopDeviceScan();
      if (device) {
        device.cancelConnection();
      }
    };
  }, [connect, device]);

  return (
    <BleContext.Provider value={{ status, device, connect, disconnect }}>
      {children}
    </BleContext.Provider>
  );
}

export function useBle() {
  const ctx = useContext(BleContext);
  if (!ctx) {
    throw new Error("useBle must be used inside BleProvider");
  }
  return ctx;
}
