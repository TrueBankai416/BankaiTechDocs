import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

// Environment Variable Config
require('dotenv').config({path: './.env', debug: true})
const { siteConfig } = useDocusaurusContext()
const serverId = siteConfig.customFields.EMAILJS_SERVER_ID as string
const templateId = siteConfig.customFields.EMAILJS_TEMPLATE_ID as string
const publicKey = siteConfig.customFields.EMAILJS_PUBLIC_KEY as string

// Main Config 
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
    plugins: [
//      [
//        'docusaurus-plugin-dotenv',
//        {
//          id: 'dotenv',
//          path: "./.env", // The path to your environment variables.
//          safe: false, // If false ignore safe-mode, if true load './.env.example', if a string load that file as the sample
//          systemvars: false, // Set to true if you would rather load all system variables as well (useful for CI purposes)
//          silent: false, //  If true, all warnings will be suppressed
//          expand: false, // Allows your variables to be "expanded" for reusability within your .env file
//          defaults: false, //  Adds support for dotenv-defaults. If set to true, uses ./.env.defaults
//         ignoreStub: true
 //       },
 //     ],
      [
        'posthog-docusaurus',
        {
          id: 'posthog',
          apiKey: 'POSTHOG_API_KEY',
          appUrl: 'https://us.i.posthog.com', // optional, defaults to "https://us.i.posthog.com"
          enableInDevelopment: false, // optional
        },
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
      appId: 'process.env.ALGOLIA_APP_ID',
      apiKey: 'process.env.ALGOLIA_API_KEY',
      indexName: 'bankai-tech',
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
          {to: 'https://buymeacoffee.com/BankaiTech', label: 'Buy Me a Coffee', position: 'left'},
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
            {
              label: 'Discord',
              href: 'https://discord.gg/6THYdvayjg',
            },
            {
              label: 'Buy me a Coffee',
              href: 'https://buymeacoffee.com/BankaiTech',
            },
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
