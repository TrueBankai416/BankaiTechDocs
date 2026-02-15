import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

export default function ScrollToTopButton(): React.JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const [fly, setFly] = useState(false);

  useEffect(() => {
    const toggleVisibility = (): void => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = (): void => {
    setFly(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => setFly(false), 800);
  };

  return (
    <button
      type="button"
      className={clsx(styles.scrollBtn, isVisible && styles.show, fly && styles.fly)}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <img src="/img/ScrollToTop.png" alt="Back to top" />
    </button>
  );
}