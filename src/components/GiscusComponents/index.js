import React from 'react';
import Giscus from "@giscus/react";
import { useColorMode } from '@docusaurus/theme-common';

export default function GiscusComponent() {
  const { colorMode } = useColorMode();

  return (
    <Giscus    
        data-repo="TrueBankai416/BankaiTechDocs"
        data-repo-id="R_kgDOLsjlxA"
        data-category="General"
        data-category-id="DIC_kwDOLsjlxM4CeyWI"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="en"
        crossorigin="anonymous"
        async>
    />
  );
}
