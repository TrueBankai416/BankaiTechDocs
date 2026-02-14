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
          <svg
            className={`${styles.icon} ${styles.discordIcon}`}
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="currentColor"
              d="M20.317 4.369A19.791 19.791 0 0 0 15.885 3c-.191.333-.403.78-.551 1.125a18.271 18.271 0 0 0-6.668 0A12.469 12.469 0 0 0 8.114 3a19.736 19.736 0 0 0-4.433 1.37C.884 8.58.126 12.687.505 16.738a19.954 19.954 0 0 0 5.993 3.043c.486-.664.92-1.367 1.296-2.104a12.981 12.981 0 0 1-2.037-.98c.171-.125.338-.256.5-.391c3.927 1.847 8.19 1.847 12.07 0c.164.137.331.268.5.391c-.651.381-1.332.71-2.037.98c.376.737.81 1.44 1.296 2.104a19.903 19.903 0 0 0 5.994-3.043c.446-4.701-.76-8.77-3.763-12.369ZM8.02 14.306c-1.183 0-2.157-1.089-2.157-2.419c0-1.331.95-2.419 2.157-2.419c1.218 0 2.18 1.1 2.157 2.419c0 1.33-.95 2.419-2.157 2.419Zm7.974 0c-1.183 0-2.156-1.089-2.156-2.419c0-1.331.95-2.419 2.156-2.419c1.219 0 2.181 1.1 2.157 2.419c0 1.33-.938 2.419-2.157 2.419Z"
            />
          </svg>
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
            viewBox="0 0 72 72"
            aria-hidden="true"
            focusable="false"
          >
            <g>
              <circle cx="36" cy="36" r="28" fill="#b1cc33" />
              <path
                fill="#fff"
                fillRule="evenodd"
                d="M30.698 20.513c0-1.171.95-2.124 2.124-2.124 7.95 0 14.395 6.432 14.395 14.366 0 1.17-.95 2.12-2.124 2.12a2.122 2.122 0 0 1-2.123-2.12c0-5.593-4.544-10.127-10.148-10.127a2.122 2.122 0 0 1-2.124-2.115z"
                clipRule="evenodd"
              />
              <path
                fill="#fff"
                fillRule="evenodd"
                d="M51.483 30.639c1.173 0 2.124.949 2.124 2.12 0 7.933-6.445 14.365-14.395 14.365a2.122 2.122 0 0 1-2.124-2.12c0-1.17.95-2.119 2.124-2.119 5.604 0 10.147-4.534 10.147-10.126 0-1.171.95-2.12 2.124-2.12z"
                clipRule="evenodd"
              />
              <path
                fill="#fff"
                fillRule="evenodd"
                d="M41.335 51.487c0 1.171-.95 2.12-2.124 2.12-7.95 0-14.395-6.432-14.395-14.366 0-1.17.951-2.119 2.124-2.119s2.124.949 2.124 2.12c0 5.592 4.543 10.126 10.147 10.126 1.173 0 2.124.949 2.124 2.12z"
                clipRule="evenodd"
              />
              <path
                fill="#fff"
                fillRule="evenodd"
                d="M20.517 41.36a2.122 2.122 0 0 1-2.124-2.118c0-7.934 6.445-14.366 14.395-14.366 1.173 0 2.124.949 2.124 2.12 0 1.17-.95 2.119-2.124 2.119-5.604 0-10.147 4.534-10.147 10.127 0 1.17-.951 2.119-2.124 2.119z"
                clipRule="evenodd"
              />
            </g>
            <g>
              <circle cx="36" cy="36" r="28" fill="none" stroke="#000" strokeWidth="2" />
              <path
                fill="none"
                stroke="#000"
                strokeLinecap="round"
                strokeWidth="2"
                d="M30.698 20.513c0-1.171.95-2.12 2.124-2.12 7.95 0 14.395 6.432 14.395 14.366 0 1.17-.95 2.12-2.124 2.12a2.122 2.122 0 0 1-2.123-2.12c0-5.593-4.544-10.127-10.148-10.127a2.122 2.122 0 0 1-2.124-2.12z"
              />
              <path
                fill="none"
                stroke="#000"
                strokeLinecap="round"
                strokeWidth="2"
                d="M51.483 30.639c1.173 0 2.124.949 2.124 2.12 0 7.933-6.445 14.365-14.395 14.365a2.122 2.122 0 0 1-2.124-2.12c0-1.17.95-2.119 2.124-2.119 5.604 0 10.147-4.534 10.147-10.126 0-1.171.95-2.12 2.124-2.12z"
              />
              <path
                fill="none"
                stroke="#000"
                strokeLinecap="round"
                strokeWidth="2"
                d="M41.335 51.487c0 1.171-.95 2.12-2.124 2.12-7.95 0-14.395-6.432-14.395-14.366 0-1.17.951-2.119 2.124-2.119s2.124.949 2.124 2.12c0 5.592 4.543 10.126 10.147 10.126 1.173 0 2.124.949 2.124 2.12z"
              />
              <path
                fill="none"
                stroke="#000"
                strokeLinecap="round"
                strokeWidth="2"
                d="M20.517 41.36a2.122 2.122 0 0 1-2.124-2.118c0-7.934 6.445-14.366 14.395-14.366 1.173 0 2.124.949 2.124 2.12 0 1.17-.95 2.119-2.124 2.119-5.604 0-10.147 4.534-10.147 10.127 0 1.17-.951 2.119-2.124 2.119z"
              />
            </g>
          </svg>
          <span className={styles.text}>Join Matrix</span>
        </button>

        <button
          onClick={handleCoffeeClick}
          className={`${styles.button} ${styles.coffeeButton}`}
          title="Support me on Buy me a coffee!"
          aria-label="Buy me a coffee"
        >
          <svg
            className={`${styles.icon} ${styles.coffeeIcon}`}
            viewBox="0 0 64 64"
            aria-hidden="true"
            focusable="false"
          >
            <image
              className={styles.coffeeImage}
              href="https://assets.nicepagecdn.com/0ae97ec5/5379283/images/buy-me-a-coffee6984-removebg-preview.png"
              x="0"
              y="0"
              width="64"
              height="64"
              preserveAspectRatio="xMidYMid meet"
            />
          </svg>
          <span className={styles.text}>Buy me a coffee</span>
        </button>
      </div>
    </div>
  );
};

export default BottomBar;
