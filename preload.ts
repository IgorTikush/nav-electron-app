import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  connectDevice: async () => {
    return await ipcRenderer.invoke('device:connect');
  },

  checkFirmware: async () => {
    return await ipcRenderer.invoke('device:check-firmware');
  },

  getDeviceStatus: async () => {
    return await ipcRenderer.invoke('device:get-status');
  }
}); 