import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className={clsx('container', styles.heroContent)}>
        <Heading as="h1" className={clsx('hero__title', styles.heroTitle)}>
          {siteConfig.title}
        </Heading>
        <p className={clsx('hero__subtitle', styles.heroSubtitle)}>{siteConfig.tagline}</p>
        <h2 className={styles.heroSectionTitle}>For Ubuntu Systems</h2>
        <div className={styles.heroAccent} aria-hidden="true" />
        <div className={styles.heroGifRow}>
          <div className={clsx(styles.heroMediaCard, styles.heroMediaCardSide)}>
            <img
              className={`${styles.heroGif} ${styles.heroGifSide}`}
              src="/img/homepage/hero-left.gif"
              alt="Animated homepage graphic left"
              loading="lazy"
            />
          </div>
          <div className={clsx(styles.heroMediaCard, styles.heroMediaCardCenter)}>
            <img
              className={`${styles.heroGif} ${styles.heroGifCenter}`}
              src="/img/homepage/hero-center.gif"
              alt="Animated homepage graphic center"
              loading="lazy"
            />
          </div>
          <div className={clsx(styles.heroMediaCard, styles.heroMediaCardSide)}>
            <img
              className={`${styles.heroGif} ${styles.heroGifSide}`}
              src="/img/homepage/hero-right.gif"
              alt="Animated homepage graphic right"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`Hello from ${siteConfig.title}`} description="Home to My HomeLab Documentation">
      <HomepageHeader />
    </Layout>
  );
}
