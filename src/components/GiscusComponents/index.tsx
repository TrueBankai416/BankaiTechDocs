import React from 'react';
import Giscus from "@giscus/react";
import { useColorMode } from '@docusaurus/theme-common';

export default function GiscusComponent() {
  const { colorMode } = useColorMode();

  return (
    <Giscus    
      id="comments"
      repo="TrueBankai416/BankaiTechDocs"
      repoId="R_kgDOLsjlxA"
      category="Announcements"
      categoryId="DIC_kwDOLsjlxM4CeyWH"
      mapping="pathname"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={colorMode}
      lang="en"
      loading="lazy"
    />
  );
}
