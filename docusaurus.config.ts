import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
 
const config: Config = {
  title: 'My HomeLab Documentation',
  tagline: 'Debugging is when you are a detective in a crime where you are also the murderer',
  favicon: 'img/favcon.ico',

  // Set the production url of your site here
  url: 'https://docs.bankai-tech.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'HomeLab Docs', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          routeBasePath: '/', // Serve the docs at the site's root
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/TrueBankai416/BankaiTechDocs/tree/main/',
        },
        blog: false, //{
      //    showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
        //  editUrl:
        //    'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
       // },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
   // Adds bar to top of the Page
    announcementBar: {
      id: 'Pick your Operating System',
      content:
        'This site is mainly for Ubuntu Systems. For windows, visit <a target="_blank" rel="noopener noreferrer" href="https://docs.demonwarriortech.com">DemonWarriorTech</a>',
      backgroundColor: '#fafbfc',
      textColor: '#091E42',
      isCloseable: true,
    },
   // Declare some <meta> tags
    metadata: [
      {name: 'keywords', content: 'Docs, Nextcloud, Tutorial, Documentation'},
    ],
 //   forbiddenGiscusDocPaths: [
 //   ''
 //   ],
 //   forbiddenGiscusBlogPaths: [
 //   ''
 //   ],
    sidebar: {
      autoCollapseCategories: true
    },
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 5,
    },
    // Replace with your project's social card
    image: 'img/social-card.jpg',
    algolia: {
      appId: 'I9USLRX50E',
      apiKey: '11cd211e50738625f1423428ad36ae4e',
      indexName: 'bankai-tech.com',
      // Optional: see doc section below
      contextualSearch: true,
      // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl. You can use regexp or string in the `from` param. For example: localhost:3000 vs myCompany.com/docs
      replaceSearchResultPathname: {
        from: '/docs/', // or as RegExp: /\/docs\//
        to: '/',
      },
      // Optional: Algolia search parameters
      searchParameters: {},

      // Optional: path for search page that enabled by default (`false` to disable it)
      searchPagePath: 'search',
    },
    navbar: {
      title: 'Bankai Docs',
      logo: {
        alt: 'My Site Logo',
        src: 'img/icon.jpg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Tutorials',
        },
    //    {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/facebook/docusaurus',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Tutorials',
              to: '/category/tutorial---docker',
            },
          ],
        },
        {
          title: 'Community',
          items: [
       //     {
       //       label: 'Stack Overflow',
       //       href: 'https://stackoverflow.com/questions/tagged/docusaurus',
       //     },
            {
              label: 'Discord',
              href: 'https://discord.gg/8ER7t3bGQN',
            },
      //      {
      //        label: 'Twitter',
      //        href: 'https://twitter.com/docusaurus',
      //      },
          ],
        },
        {
          title: 'More',
          items: [
      //      {
      //        label: 'Blog',
         //     to: '/blog',
       //     },
      //      {
      //        label: 'GitHub',
      //        href: 'https://github.com/facebook/docusaurus',
      //      },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} My HomeLab Docs`,
    },
    prism: {
      darkTheme: prismThemes.dracula,
      theme: prismThemes.github,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
