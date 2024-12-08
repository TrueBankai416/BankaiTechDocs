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
//  tutorialSidebar: [{type: 'autogenerated', dirName: '.'}],

  // But you can create a sidebar manually
  
  "docsSidebar": [
        {
            "type": "doc",
            "label": "Introduction",
            "id": "intro"
        },
        "what_is_new_v3",
        {
            "type": "category",
            "label": "Docker  ☁️",
            "collapsed": false,
            link: {
                type: "doc",
                id: "cloud/intro"
            },
            "items": [
                "cloud/quickstart",
                "cloud/app_config",
                "cloud/deployment",
                "cloud/app_check",
                "cloud/creating_service_account",
                "cloud/migrating_from_v2"
            ]
        },
   ],
};

export default sidebars;
