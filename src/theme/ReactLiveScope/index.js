import React from 'react';

// Add any components, variables, or utilities that should be available in live code blocks
const ReactLiveScope = {
  React,
  ...React,
  useState: React.useState,
  useEffect: React.useEffect,
  Fragment: React.Fragment,
  createElement: React.createElement,
};

export default ReactLiveScope;
