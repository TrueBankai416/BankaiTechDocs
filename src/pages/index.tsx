import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <h2>For Ubuntu Systems</h2>
        <div className={styles.heroGifRow}>
          <img
            className={`${styles.heroGif} ${styles.heroGifSide}`}
            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDFqNTB0anN4bjE0ZHF3dnQ1MGttcGpkMThiaXZxd2N4dXBrdHI5YyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/JRiAeFnqoFLtrHqttI/giphy.gif"
            alt="Animated homepage graphic left"
            loading="lazy"
          />
          <img
            className={`${styles.heroGif} ${styles.heroGifCenter}`}
            src="https://media.giphy.com/media/o7RZbs4KAA6tvM4H6j/giphy.gif"
            alt="Animated homepage graphic center"
            loading="lazy"
          />
          <img
            className={`${styles.heroGif} ${styles.heroGifSide}`}
            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGM1MHQyM3ByZTVzdW1pMTZnN240M3RyYmV3eGNuYWZmMjBsMzE0bCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT9IgzoKnwFNmISR8I/giphy.gif"
            alt="Animated homepage graphic right"
            loading="lazy"
          />
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
