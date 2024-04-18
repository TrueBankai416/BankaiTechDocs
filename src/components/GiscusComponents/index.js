import React from 'react';
import Giscus from "@giscus/react";
import { useColorMode } from '@docusaurus/theme-common';

export default function GiscusComponent() {
  const { colorMode } = useColorMode();

  return (
    <Giscus    
      repo="ghUsername/repoName"
      repoId="someHash"
      category="Announcements"
      categoryId="someHash"
      mapping="title"
      term="specific-term" //If you didn't select "Discussion title contains a specific term", omit.
      strict="0"
      reactionsEnabled="1"
      emitMetadata="1"
      inputPosition="top"
      theme={colorMode}
      lang="en"
      loading="lazy"
      crossorigin="anonymous"
      async
    />
  );
}
