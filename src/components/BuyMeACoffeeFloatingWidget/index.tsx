import React from 'react';

const BuyMeACoffeeFloatingWidget: React.FC = () => {
  const handleClick = () => {
    window.open('https://www.buymeacoffee.com/BankaiTech', '_blank');
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: '100px',
        right: '18px',
        zIndex: 9999,
        cursor: 'pointer',
        backgroundColor: '#5F7FFF',
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
        e.currentTarget.style.backgroundColor = '#4F6FEF';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.backgroundColor = '#5F7FFF';
      }}
      title="Support me on Buy me a coffee!"
    >
      <span style={{ fontSize: '16px' }}>☕</span>
      Buy me a coffee
    </div>
  );
};

export default BuyMeACoffeeFloatingWidget;
