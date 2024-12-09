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
  autoSidebar: [{type: 'autogenerated', dirName: '.'}],

  // But you can create a sidebar manually
  
  "docSidebar": [
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
            'Docker/Installing Docker/Docker-Compose',
          ],
        },
         'Docker/Helpful Commands',
         'Docker/Troubleshooting/Docker',
      ],      
    },
   {
    type: 'category',
    label: 'Nextcloud',
    link: { type: 'doc', id: 'Nextcloud/Introduction' },
    items: [
     {
        type: 'category',
        label: 'Installation',
        items: [
          'Nextcloud/Installation/Minimum',
          'Nextcloud/Installation/Collabora',
          'Nextcloud/Installation/Memories',
          'Nextcloud/Installation/Complete',
         ],
      },   
        'Nextcloud/Docs/Updating',
        'Nextcloud/Docs/Pre-built Images',
        'Nextcloud/Docs/Helpful Commands',
    ],
  }, 
  {
    type: 'category',
    label: 'NextcloudPI',
    link: { type: 'doc', id: 'NextcloudPI/Introduction' },
    items: [
        'NextcloudPI/Installation/Install',
    ],
  },
  { 
     type: 'category',
     label: 'MariaDb',
     items: [
         'MariaDB/Updating',
    ],
  },
  {  
     type: 'category',
     label: 'Docusaurus',
     link: { type: 'doc', id: 'Docusaurus/Introduction' },
     items: [
         'Docusaurus/Docs/Algolia-Search',
         'Docusaurus/Docs/Docs Only Mode',
         'Docusaurus/Docs/Connecting to GitHub',
     ],
   },
 ],


  "exampleSidebar": [
        {
      type: 'category',
      label: 'Reverse Proxy',
      link: { type: 'doc', id: 'Examples/Reverse Proxies/Introduction' },
      items: [
        {
          type: 'category',
          label: 'Nginx',
          items: [
            'Examples/Reverse Proxies/Nginx/Nginx',
          ],
        },
      ],      
    },
   {
    type: 'category',
    label: 'Node-RED',
    link: { type: 'doc', id: 'Examples/Node-RED/Introduction' },
    items: [
     {
        type: 'category',
        label: 'Flows',
        items: [
          'Examples/Node-RED/Flows/Flows',
         ],
      },   
    ],
  }, 
 ],
};

export default sidebars;