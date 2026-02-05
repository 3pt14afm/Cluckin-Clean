import { BleManager, Device } from "react-native-ble-plx";
import { Buffer } from "buffer";

const SERVICE_UUID = "12345678-1234-1234-1234-1234567890ab";
const CHARACTERISTIC_UUID = "abcd1234-1234-1234-1234-abcdef123456";

const manager = new BleManager();

let connectedDevice: Device | null = null;

/* =========================
   CONNECT TO ESP32
========================= */
export const connectToESP32 = async () => {
  manager.startDeviceScan(null, null, async (error, device) => {
    if (error) {
      console.log("Scan error:", error);
      return;
    }

    if (device?.name === "ESP32-SCHEDULER") {
      manager.stopDeviceScan();

      connectedDevice = await device.connect();
      await connectedDevice.discoverAllServicesAndCharacteristics();

      console.log("Connected to ESP32");
    }
  });
};

/* =========================
   SEND JSON TO ESP32
========================= */
export const sendScheduleToESP32 = async (data: any) => {
  if (!connectedDevice) {
    throw new Error("ESP32 not connected");
  }

  const jsonString = JSON.stringify(data);
  const base64Data = Buffer.from(jsonString).toString("base64");

  await connectedDevice.writeCharacteristicWithResponseForService(
    SERVICE_UUID,
    CHARACTERISTIC_UUID,
    base64Data
  );

  console.log("Sent to ESP32:", jsonString);
};
