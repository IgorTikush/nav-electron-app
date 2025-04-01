import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { SerialPort } from 'serialport';

interface USBDevice {
  connected: boolean;
  firmwareVersion: string | null;
  interface?: any;
  inEndpoint?: any;
  outEndpoint?: any;
}

let device: USBDevice = {
  connected: false,
  firmwareVersion: null
};

const createWindow = (): void => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');

  win.webContents.openDevTools();
};

const connectUSBDevice = async (): Promise<{ connected: boolean, error?: Error }> => {
  try {
    // List available ports
    const ports = await SerialPort.list();
    console.log('Available ports:', ports);

    // Find your device (you can identify it by vendorId or other properties)
    let port = ports.find(p => p.productId === '57105');
    console.log('Port:', port);
    if (!port && ports.length) {
      port = ports[0];
    }
    if (!port) {
      return { connected: false, error: new Error('Device not found') };
    }

    const serialPort = new SerialPort({
      path: port.path,
      baudRate: 9600  // adjust based on your device
    });

    // Set up event handlers
    serialPort.on('open', () => {
      console.log('Connection opened');
    });

    serialPort.on('data', (data) => {
      console.log('Data received:', data);
    });

    return { connected: true };
  } catch (error) {
    return { connected: false, error: new Error('Failed to connect to USB device') };
  }
};

const checkFirmwareVersion = (): Promise<{ version: string | null }> => {
  return new Promise((resolve) => {
    console.log('Checking firmware version...');

    if (!device.connected) {
      console.log('Cannot check firmware: Device not connected');
      resolve({ version: null });
      return;
    }

    sendMessageToDevice('GET_FIRMWARE_VERSION').then(result => {
      if (!result.success) {
        console.log('Failed to send firmware version request');
        resolve({ version: device.firmwareVersion });
      } else {
        setTimeout(() => {
          resolve({ version: device.firmwareVersion });
        }, 1000);
      }
    });
  });
};

const sendMessageToDevice = (message: string): Promise<{ success: boolean, error?: Error }> => {
  return new Promise((resolve) => {
    console.log(`Sending message to device: ${message}`);

    if (!device.connected || !device.inEndpoint) {
      console.log('Cannot send message: Device not connected or endpoint not available');
      resolve({ success: false, error: new Error('Device not connected') });
      return;
    }

    try {
      const buffer = Buffer.from(message);

      device.inEndpoint.transfer(buffer, (error: Error) => {
        if (error) {
          console.error('Error sending message to device:', error);
          resolve({ success: false, error });
          return;
        }

        console.log('Message sent successfully');
        resolve({ success: true });
      });
    } catch (error: any) {
      console.error('Error sending message to device:', error);
      resolve({ success: false, error });
    }
  });
};

const startDeviceListener = (): void => {
  if (!device.connected || !device.inEndpoint) {
    console.log('Cannot start listener: Device not connected or endpoint not available');
    return;
  }

  console.log('Starting device message listener...');

  const bufferSize = 1024;

  const startListening = () => {
    device.inEndpoint.transfer(bufferSize, (error: Error, data: Buffer) => {
      if (error) {
        console.error('Error receiving data from device:', error);

        if (device.connected) {
          setTimeout(startListening, 1000);
        }
        return;
      }

      if (data && data.length > 0) {
        const message = data.toString().trim();
        console.log('Received message from device:', message);

        BrowserWindow.getAllWindows().forEach(window => {
          window.webContents.send('device:message-received', message);
        });

        processDeviceMessage(message);
      }

      if (device.connected) {
        startListening();
      }
    });
  };

  startListening();
};

const processDeviceMessage = (message: string): void => {
  if (message.startsWith('FW:')) {
    device.firmwareVersion = message.substring(3);
    console.log(`Firmware version updated: ${device.firmwareVersion}`);

    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('device:firmware-updated', device.firmwareVersion);
    });
  }
};

app.whenReady().then(() => {
  ipcMain.handle('device:connect', async () => {
    return await connectUSBDevice();
  });

  ipcMain.handle('device:check-firmware', async () => {
    return await checkFirmwareVersion();
  });

  ipcMain.handle('device:get-status', () => {
    return {
      connected: device.connected,
      firmwareVersion: device.firmwareVersion
    };
  });

  ipcMain.handle('device:send-message', async (_, message: string) => {
    return await sendMessageToDevice(message);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}); 