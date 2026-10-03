import { useState, useEffect, useRef, useCallback } from 'react';

export function useTelematicsStream() {
  const [isConnected, setIsConnected] = useState(false);
  const [telematicsData, setTelematicsData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [streamConfig, setStreamConfig] = useState({
    driveMode: 'CITY_DRIVING',
    ambientTemp: 25.0,
    hotspotCellIndex: 41,
    isRecording: false,
  });
  const [lastSavedSession, setLastSavedSession] = useState(null);

  const wsRef = useRef(null);

  useEffect(() => {
    const envWsUrl = import.meta.env.VITE_WS_URL;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const host = isLocal ? `${window.location.hostname}:5000` : window.location.host;
    const wsUrl = envWsUrl || `${protocol}//${host}/ws/telematics`;

    let reconnectTimer = null;

    function connect() {
      try {
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          setIsConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);

            if (payload.type === 'CONNECTED') {
              if (payload.config) {
                setStreamConfig((prev) => ({ ...prev, ...payload.config }));
              }
            } else if (payload.type === 'TELEMATICS_UPDATE') {
              setTelematicsData(payload.data);
              setLastUpdated(new Date().toLocaleTimeString());

              if (payload.alerts && payload.alerts.length > 0) {
                setAlerts(payload.alerts);
              } else {
                setAlerts([]);
              }
            } else if (payload.type === 'CONFIG_UPDATE') {
              if (payload.config) {
                setStreamConfig((prev) => ({ ...prev, ...payload.config }));
              }
            } else if (payload.type === 'RECORDING_SAVED') {
              setLastSavedSession(payload.session);
              setStreamConfig((prev) => ({ ...prev, isRecording: false }));
            }
          } catch (e) {
            console.error('Failed to parse WebSocket message', e);
          }
        };

        socket.onclose = () => {
          setIsConnected(false);
          reconnectTimer = setTimeout(connect, 3000);
        };

        socket.onerror = () => {
          setIsConnected(false);
        };
      } catch (err) {
        console.warn('WebSocket connection failed:', err);
      }
    }

    connect();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendCommand = useCallback((type, data = {}) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...data }));
    } else {
      console.warn('Cannot send command: WebSocket is not open.');
    }
  }, []);

  const setDriveMode = useCallback((mode) => sendCommand('SET_MODE', { mode }), [sendCommand]);
  const setAmbientTemp = useCallback((temp) => sendCommand('SET_AMBIENT_TEMP', { temp: Number(temp) }), [sendCommand]);
  const setHotspotCell = useCallback((cellIndex) => sendCommand('SET_HOTSPOT_CELL', { cellIndex }), [sendCommand]);
  const startRecording = useCallback((sessionName) => sendCommand('START_RECORDING', { sessionName }), [sendCommand]);
  const stopRecording = useCallback(() => sendCommand('STOP_RECORDING'), [sendCommand]);

  return {
    isConnected,
    telematicsData,
    lastUpdated,
    alerts,
    streamConfig,
    lastSavedSession,
    setDriveMode,
    setAmbientTemp,
    setHotspotCell,
    startRecording,
    stopRecording,
  };
}

export default useTelematicsStream;

