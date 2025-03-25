interface ElectronAPI {
  connectDevice: () => Promise<{ connected: boolean }>;
  checkFirmware: () => Promise<{ version: string | null }>;
  getDeviceStatus: () => Promise<{
    connected: boolean;
    firmwareVersion: string | null;
  }>;
}

declare interface Window {
  electronAPI: ElectronAPI;
} 