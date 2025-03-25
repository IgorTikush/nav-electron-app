import React from 'react';
import { Device } from '../App';

interface DevicePanelProps {
  device: Device;
  onConnect: () => void;
  onCheckFirmware: () => void;
  onToggleMap: () => void;
  isLoading: boolean;
}

function DevicePanel({ device, onConnect, onCheckFirmware, onToggleMap, isLoading }: DevicePanelProps) {
  // Inline styles
  const panelStyle: React.CSSProperties = {
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    marginBottom: '20px'
  };
  
  const statusStyle: React.CSSProperties = {
    marginBottom: '15px'
  };
  
  const loadingStyle: React.CSSProperties = {
    color: '#888',
    fontStyle: 'italic'
  };
  
  const controlsStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  };
  
  const buttonStyle: React.CSSProperties = {
    padding: '8px 12px',
    backgroundColor: '#4285f4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    opacity: (state: boolean) => state ? 0.6 : 1
  };
  
  return (
    <div style={panelStyle}>
      <div style={statusStyle}>
        <p>
          <strong>Connection Status:</strong> {device.connected ? 'Connected' : 'Disconnected'}
        </p>
        {device.firmwareVersion && (
          <p>
            <strong>Firmware Version:</strong> {device.firmwareVersion}
          </p>
        )}
        {isLoading && (
          <p style={loadingStyle}>
            <em>Processing...</em>
          </p>
        )}
      </div>
      
      <div style={controlsStyle}>
        <button 
          style={{
            ...buttonStyle,
            opacity: (device.connected || isLoading) ? 0.6 : 1,
            cursor: (device.connected || isLoading) ? 'not-allowed' : 'pointer'
          }}
          onClick={onConnect}
          disabled={device.connected || isLoading}
        >
          {device.connected ? 'Device Connected' : 'Connect USB Device'}
        </button>
        
        <button 
          style={{
            ...buttonStyle,
            opacity: (!device.connected || isLoading) ? 0.6 : 1,
            cursor: (!device.connected || isLoading) ? 'not-allowed' : 'pointer'
          }}
          onClick={onCheckFirmware}
          disabled={!device.connected || isLoading}
        >
          Check Firmware Version
        </button>
        
        <button 
          style={{
            ...buttonStyle,
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
          onClick={onToggleMap}
          disabled={isLoading}
        >
          {'Show/Hide Map'}
        </button>
      </div>
    </div>
  );
}

export default DevicePanel; 