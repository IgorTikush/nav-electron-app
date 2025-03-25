import React, { useState, useEffect } from 'react';
import DevicePanel from './components/DevicePanel';
import MapView from './components/MapView';

export interface Device {
  connected: boolean;
  firmwareVersion: string | null;
}

function App() {
  const [device, setDevice] = useState<Device>({
    connected: false,
    firmwareVersion: null
  });
  
  const [showMap, setShowMap] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check initial device status when app loads
  useEffect(() => {
    const checkInitialStatus = async () => {
      try {
        const status = await window.electronAPI.getDeviceStatus();
        setDevice({
          connected: status.connected,
          firmwareVersion: status.firmwareVersion
        });
      } catch (error) {
        console.error('Failed to get device status:', error);
      }
    };
    
    checkInitialStatus();
  }, []);

  const connectDevice = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await window.electronAPI.connectDevice();
      if (result.connected) {
        setDevice({
          ...device,
          connected: true
        });
      } else {
        setError('Failed to connect to device. Please check the connection and try again.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      console.error('Failed to connect device:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkFirmware = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const result = await window.electronAPI.checkFirmware();
      if (result.version) {
        setDevice({
          ...device,
          firmwareVersion: result.version
        });
      }
    } catch (error) {
      console.error('Failed to check firmware:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMap = (): void => {
    setShowMap(!showMap);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>Navigation Device App</h1>
      {error && (
        <div style={{
          marginBottom: '200px',
        }}>
          <p style={{ margin: 0, color: '#c62828' }}>{error}</p>
          <button 
            style={{
              background: 'none',
              border: 'none',
              color: '#c62828',
              fontSize: '20px',
              cursor: 'pointer'
            }}
            onClick={() => setError(null)}
          >×</button>
        </div>
      )}
      <DevicePanel 
        device={device}
        onConnect={connectDevice}
        onCheckFirmware={checkFirmware}
        onToggleMap={toggleMap}
        isLoading={isLoading}
      />
      {showMap && <MapView />}
    </div>
  );
}

export default App; 