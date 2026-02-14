import React from 'react';
import styles from './styles.module.css';

const BottomBar: React.FC = () => {
  const handleDiscordClick = () => {
    window.open('https://discord.gg/6THYdvayjg', '_blank');
  };

  const handleMatrixClick = () => {
    window.open('https://matrix.to/#/#bankai-tech:matrix.bankai-tech.com', '_blank');
  };

  const handleCoffeeClick = () => {
    window.open('https://www.buymeacoffee.com/BankaiTech', '_blank');
  };

  return (
    <div className={styles.bottomBar}>
      <div className={styles.container}>
        <button
          onClick={handleDiscordClick}
          className={`${styles.button} ${styles.discordButton}`}
          title="Join our Discord community!"
          aria-label="Join Discord"
        >
          <span className={styles.icon}>💬</span>
          <span className={styles.text}>Join Discord</span>
        </button>

        <button
          onClick={handleMatrixClick}
          className={`${styles.button} ${styles.matrixButton}`}
          title="Join our Matrix community!"
          aria-label="Join Matrix"
        >
          <svg
            className={`${styles.icon} ${styles.matrixIcon}`}
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <rect x="1" y="1" width="22" height="22" rx="4" fill="rgba(0, 0, 0, 0.18)" />
            <path
              d="M7 6H5V18H7V16H6V8H7V6ZM17 6V8H18V16H17V18H19V6H17Z"
              fill="currentColor"
            />
            <path
              d="M8.8 16V8H10.7L12 10.5L13.3 8H15.2V16H13.7V10.8L12.7 12.8H11.3L10.3 10.8V16H8.8Z"
              fill="currentColor"
            />
          </svg>
          <span className={styles.text}>Join Matrix</span>
        </button>

        <button
          onClick={handleCoffeeClick}
          className={`${styles.button} ${styles.coffeeButton}`}
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
