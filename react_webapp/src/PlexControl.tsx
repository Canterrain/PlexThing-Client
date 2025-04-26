import React, { useState, useEffect } from 'react';
import NowPlayingOverlay from './NowPlayingOverlay';
import plexThingLogo from './plexthing.png';

interface RecentlyAdded {
  title: string;
  library: string;
}

interface TranscodingDetail {
  title: string;
  user: string;
  show?: string;
}

interface NowPlaying {
  title: string;
  artworkData: string;
  dominantColor: string;
  show?: string;
  episode?: string;
}

interface ServerStatus {
  serverUp: boolean;
  serverVersion?: string;
}

interface ServerStatusData {
  serverStatus: ServerStatus;
  libraryStats: { [key: string]: number } | null;
  recentlyAdded: RecentlyAdded | null;
  networkBandwidth: { sent_mbps: number; recv_mbps: number };
  activeStreams: {
    count: number;
    nowPlaying: NowPlaying | null;
    details: { title: string; user: string; transcoding: boolean; show?: string }[];
  };
  transcoding: {
    count: number;
    details: TranscodingDetail[];
  };
}

const PlexControl: React.FC = () => {
  const [helperIP] = useState<string>(() => localStorage.getItem('helper_ip') || 'localhost');
  const [serverStatus, setServerStatus] = useState<ServerStatusData>({
    serverStatus: { serverUp: false, serverVersion: '' },
    libraryStats: null,
    recentlyAdded: null,
    networkBandwidth: { sent_mbps: 0, recv_mbps: 0 },
    activeStreams: { count: 0, nowPlaying: null, details: [] },
    transcoding: { count: 0, details: [] },
  });
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionError, setConnectionError] = useState<string>('');

  useEffect(() => {
    const connect = () => {
      const socket = new WebSocket(`ws://${helperIP}:8891`);

      socket.onopen = () => {
        console.log('WebSocket connected');
        setConnectionError('');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'serverStatus') {
            // Update state; we expect the backend to include all required data.
            setServerStatus(data);
          } else if (data.type === 'refresh') {
            window.location.reload();
          }
        } catch (err) {
          console.error('WebSocket parse error:', err);
        }
      };

      socket.onerror = () => {
        setConnectionError('Failed to connect to helper at ws://' + helperIP + ':8891');
      };

      socket.onclose = () => {
        setTimeout(connect, 2000);
      };

      setWs(socket);
    };

    connect();
    return () => ws?.close();
  }, [helperIP]);

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#111',
    borderRadius: '8px',
    padding: '10px',
    color: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
    minWidth: '0',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '10px',
  };

  // Update bottom padding: account for the now playing overlay minimized height plus extra space.
  const dashboardBottomPadding = window.innerHeight / 3 + 120;

  return (
    <div
      className="plex-dashboard"
      style={{
        padding: '20px',
        paddingBottom: `${dashboardBottomPadding}px`,
        fontFamily: 'sans-serif',
        backgroundColor: '#000',
        color: '#fff',
        minHeight: '100vh',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
        <img src={plexThingLogo} alt="PlexThing Logo" style={{ width: '60px', marginRight: '10px' }} />
        <h2 style={{ color: "#FF9900", margin: 0 }}>Plex Server Dashboard</h2>
      </div>

      <div style={gridStyle}>
        <div style={cardStyle}>
          <h3 style={{ color: "#FF9900" }}>Server Status</h3>
          <p>
            <span
              style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: serverStatus.serverStatus.serverUp ? '#2ecc71' : '#e74c3c',
                marginRight: '5px',
              }}
            ></span>
            <strong>{serverStatus.serverStatus.serverUp ? "Online" : "Offline"}</strong>
          </p>
          {serverStatus.serverStatus.serverVersion && (
            <p style={{ fontSize: '0.9em' }}>Version: {serverStatus.serverStatus.serverVersion}</p>
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={{ color: "#FF9900" }}>Library Stats</h3>
          {serverStatus.libraryStats ? (
            <ul style={{ paddingLeft: '15px', margin: '5px 0', fontSize: '0.9em' }}>
              {Object.entries(serverStatus.libraryStats).map(([section, count]) => (
                <li key={section}>{section}: {count} items</li>
              ))}
            </ul>
          ) : (
            <p>No Data</p>
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={{ color: "#FF9900" }}>Recently Added</h3>
          {serverStatus.recentlyAdded ? (
            <p>
              {serverStatus.recentlyAdded.title} <br />
              <em>({serverStatus.recentlyAdded.library})</em>
            </p>
          ) : (
            <p>No Data</p>
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={{ color: "#FF9900" }}>Network</h3>
          <p>Sent: {serverStatus.networkBandwidth.sent_mbps} Mbps</p>
          <p>Recv: {serverStatus.networkBandwidth.recv_mbps} Mbps</p>
        </div>

        <div style={cardStyle}>
          <h3 style={{ color: "#FF9900" }}>Active Streams</h3>
          <p>{serverStatus.activeStreams.count} active</p>
          {serverStatus.activeStreams.details.length > 0 && (
            <ul style={{ paddingLeft: '15px', margin: '5px 0', fontSize: '0.9em' }}>
              {serverStatus.activeStreams.details.map((stream, index) => (
                <li key={index}>
                  {stream.user}: {stream.show ? `${stream.show} - ${stream.title}` : stream.title}
                  {stream.transcoding ? " 🔴" : ""}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={{ color: "#FF9900" }}>Transcoding Details</h3>
          {serverStatus.transcoding.details.length > 0 ? (
            <ul style={{ paddingLeft: '15px', margin: '5px 0', fontSize: '0.9em' }}>
              {serverStatus.transcoding.details.map((detail, index) => (
                <li key={index}>
                  {detail.user}: {detail.show ? `${detail.show} - ${detail.title}` : detail.title}
                </li>
              ))}
            </ul>
          ) : (
            <p>None</p>
          )}
        </div>
      </div>

      {connectionError && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #FF9900', textAlign: 'center' }}>
          <p>{connectionError}</p>
          <p>Attempting auto-reconnect...</p>
        </div>
      )}

      {serverStatus.activeStreams.nowPlaying?.artworkData && (
        <NowPlayingOverlay
          artworkData={serverStatus.activeStreams.nowPlaying.artworkData}
          dominantColor={serverStatus.activeStreams.nowPlaying.dominantColor}
          title={serverStatus.activeStreams.nowPlaying.title}
          episodeName={serverStatus.activeStreams.nowPlaying.episode}
        />
      )}
    </div>
  );
};

export default PlexControl;
