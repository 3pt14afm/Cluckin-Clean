import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { BleManager, Device, State } from "react-native-ble-plx";

const ESP32_NAME = "ESP32-SCHEDULER";

type BleStatus = "disconnected" | "connecting" | "connected";

type BleContextType = {
  status: BleStatus;
  device: Device | null;
  bluetoothOn: boolean;
  connect: () => void;
  disconnect: () => void;
};

const BleContext = createContext<BleContextType | null>(null);

// ✅ Single BLE manager for whole app
const manager = new BleManager();

export function BleProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<BleStatus>("disconnected");
  const [device, setDevice] = useState<Device | null>(null);
  const [bluetoothOn, setBluetoothOn] = useState(false);

  const hasAutoConnected = useRef(false);

  /* =========================
     BLUETOOTH STATE LISTENER
  ========================= */
  useEffect(() => {
    const sub = manager.onStateChange((state) => {
      setBluetoothOn(state === State.PoweredOn);

      if (state !== State.PoweredOn) {
        setStatus("disconnected");
        setDevice(null);
      }
    }, true);

    return () => sub.remove();
  }, []);

  /* =========================
     CONNECT
  ========================= */
  const connect = useCallback(() => {
    if (!bluetoothOn) return;
    if (status !== "disconnected") return;

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

    // ⏱️ Safety timeout (stop scanning after 10s)
    setTimeout(() => {
      manager.stopDeviceScan();
      setStatus((s) => (s === "connecting" ? "disconnected" : s));
    }, 10000);
  }, [bluetoothOn, status]);

  /* =========================
     DISCONNECT
  ========================= */
  const disconnect = useCallback(() => {
    if (device) {
      device.cancelConnection();
    }
    setDevice(null);
    setStatus("disconnected");
  }, [device]);

  /* =========================
     AUTO-CONNECT (ONCE)
  ========================= */
  useEffect(() => {
    if (bluetoothOn && !hasAutoConnected.current) {
      hasAutoConnected.current = true;
      connect();
    }
  }, [bluetoothOn, connect]);

  /* =========================
     CLEANUP
  ========================= */
  useEffect(() => {
    return () => {
      manager.stopDeviceScan();
      if (device) {
        device.cancelConnection();
      }
    };
  }, [device]);

  return (
    <BleContext.Provider
      value={{
        status,
        device,
        bluetoothOn,
        connect,
        disconnect,
      }}
    >
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
