import React from 'react';
import Content from '@theme-original/NotFound/Content';
import styles from './styles.module.css';

export default function ContentWrapper(props) {
  return (
    <div className={styles.notFoundBg}>
      <h1 className={styles.hideh1}>404 -Page Not Found</h1>
      <p>We could not find what you were looking for.

Please contact the owner of the site that linked <br />
you to the original URL and let them know their link is broken.</p>
    </div>
  );
}