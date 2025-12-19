import React from 'react';
import styles from './styles.module.css';

const BottomBar: React.FC = () => {
  const handleDiscordClick = () => {
    window.open('https://discord.gg/6THYdvayjg', '_blank');
  };

  const handleCoffeeClick = () => {
    window.open('https://www.buymeacoffee.com/BankaiTech', '_blank');
  };

  return (
    <div className={styles.bottomBar}>
      <div className={styles.container}>
        <button
          onClick={handleDiscordClick}
          className={styles.button}
          title="Join our Discord community!"
          aria-label="Join Discord"
        >
          <span className={styles.icon}>💬</span>
          <span className={styles.text}>Join Discord</span>
        </button>
        
        <button
          onClick={handleCoffeeClick}
          className={styles.button}
          title="Support me on Buy me a coffee!"
          aria-label="Buy me a coffee"
        >
          <span className={styles.icon}>☕</span>
          <span className={styles.text}>Buy me a coffee</span>
        </button>
      </div>
    </div>
  );
};

export default BottomBar;
