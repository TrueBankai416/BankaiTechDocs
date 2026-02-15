import React from 'react';
import Layout from '@theme-original/Layout';
import type { Props } from '@theme/Layout';
import ScrollToTopButton from '@site/src/components/ScrollToTopButton';

export default function LayoutWrapper(props: Props): React.JSX.Element {
  return (
    <>
      <Layout {...props} />
      <ScrollToTopButton />
    </>
  );
}