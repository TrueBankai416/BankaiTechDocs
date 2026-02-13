import React from 'react';

const DiscordFloatingWidget: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current) {
        return;
      }

      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: '15px',
        right: '260px',
        zIndex: 9999,
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Choose a community to join"
        style={{
          cursor: 'pointer',
          backgroundColor: 'var(--ifm-color-primary)',
          color: 'var(--ifm-color-primary-contrast-foreground)',
          padding: '12px 16px',
          borderRadius: '50px',
          fontSize: '14px',
          fontWeight: 'bold',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          boxShadow: 'var(--ifm-global-shadow-lw)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: 'none',
        }}
      >
        <span style={{ fontSize: '16px' }}>💬</span>
        Join Community
        <span aria-hidden="true">▾</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '56px',
            right: '0',
            minWidth: '180px',
            backgroundColor: 'var(--ifm-background-surface-color)',
            border: '1px solid var(--ifm-color-emphasis-300)',
            borderRadius: '12px',
            boxShadow: 'var(--ifm-global-shadow-md)',
            overflow: 'hidden',
          }}
        >
          <a
            href="https://discord.gg/6THYdvayjg"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            style={{
              display: 'block',
              padding: '10px 12px',
              color: 'var(--ifm-font-color-base)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Discord
          </a>
          <a
            href="https://matrix.to/#/#bankai-tech:matrix.bankai-tech.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            style={{
              display: 'block',
              padding: '10px 12px',
              color: 'var(--ifm-font-color-base)',
              textDecoration: 'none',
              fontWeight: 600,
              borderTop: '1px solid var(--ifm-color-emphasis-300)',
            }}
          >
            Matrix
          </a>
        </div>
      )}
    </div>
  );
};

export default DiscordFloatingWidget;
