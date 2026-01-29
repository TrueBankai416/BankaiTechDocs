import React from 'react';

const DiscordFloatingWidget: React.FC = () => {
  const handleClick = () => {
    window.open('https://discord.gg/6THYdvayjg', '_blank');
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: '15px',
        right: '260px', // Position to the left of the BuyMeACoffee widget
        zIndex: 9999,
        cursor: 'pointer',
        backgroundColor: '#7289da',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '50px',
        fontSize: '14px',
        fontWeight: 'bold',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: 'none',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.backgroundColor = '#677bc4';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.backgroundColor = '#7289da';
      }}
      title="Join our Discord community!"
    >
      <span style={{ fontSize: '16px' }}>💬</span>
      Join Discord
    </div>
  );
};

export default DiscordFloatingWidget;
