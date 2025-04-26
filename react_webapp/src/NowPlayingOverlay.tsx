import React, { useState } from 'react';

interface NowPlayingOverlayProps {
  artworkData: string;      // Base64-encoded artwork
  dominantColor: string;    // Dominant color extracted from the artwork
  title: string;            // Series title (for TV) or movie title
  episodeName?: string;     // Episode name (displayed only in expanded mode)
}

const NowPlayingOverlay: React.FC<NowPlayingOverlayProps> = ({
  artworkData,
  dominantColor,
  title,
  episodeName,
}) => {
  // When minimized, occupy one-third of the window height.
  const collapsedHeight = window.innerHeight / 3;
  const expandedHeight = window.innerHeight;
  const [expanded, setExpanded] = useState<boolean>(false);
  const currentHeight = expanded ? expandedHeight : collapsedHeight;

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: `${currentHeight}px`,
    zIndex: 1000,
    overflow: 'hidden',
    backgroundColor: dominantColor,
    transition: 'height 0.3s ease',
  };

  // Use 'cover' in minimized mode and 'contain' when expanded so that portrait artwork is fully visible.
  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: expanded ? 'contain' : 'cover',
    objectPosition: 'center',
    transition: 'object-fit 0.3s ease',
  };

  // The overlay at the bottom with a gradient.
  const overlayTextStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '10px',
    background: `linear-gradient(to top, ${dominantColor} 50%, transparent)`,
    color: '#fff',
  };

  const toggleExpansion = () => {
    setExpanded(!expanded);
  };

  return (
    <div onClick={toggleExpansion} style={containerStyle}>
      <img src={artworkData} alt="Now Playing Artwork" style={imageStyle} />
      <div style={overlayTextStyle}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        {expanded && episodeName && <h4 style={{ margin: 0 }}>{episodeName}</h4>}
      </div>
    </div>
  );
};

export default NowPlayingOverlay;
