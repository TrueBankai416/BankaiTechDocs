import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [{type: 'autogenerated', dirName: '.'}],

  // But you can create a sidebar manually
  
  "docsSidebar": [
        {
      type: 'category',
      label: 'Getting Started with Docker',
      link: { type: 'doc', id: 'Docker/Introduction' },
      items: [
       {
          type: 'category',
          label: 'Installation',
          items: [
            'Docker/Installing Docker/Docker Engine',
            'Docker/Installing Docker/Docker-Compose'
          ],
       },
        'Docker/Helpful Commands',
        'Docker/Troubleshooting/Docker',
      ],
    },
   ],
};

export default {
 
  themeConfig: {
    docs: {
      docsSidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
  },
};
