---
last_update:
  date: 2024/04/17
  author: BankaiTech
---
## How to remove the /docs path
<h3>*How to remove the `/docs` path from the URL.* [Official Docs](https://docusaurus.io/docs/docs-introduction#docs-only-mode)</h3>

<p>We will be editing the file `docusaurus.config.js` for this entire documentation. Or in my case `docusaurus.config.ts`.</p>

<p>Lets Change the directory to the root of the website.</p>

```
cd /var/websites/"HomeLab Docs"/
```
:::note

Your directory will likely be different
:::

## Modifying the docusaurus.config.ts File
<p>Lets open the file with Nano</p>
```
nano docusaurus.config.ts
```
:::note

I am using `typescript` but you may be using `javascript` make sure you use the correct file extension or you will create a new file.
:::

<p>Scroll down until you see this snippet of code</p>

```
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],
```

<p>Add `routeBasePath: '/', // Serve the docs at the site's root` above `sidebarPath: './sidebars.js',`</p>

#### My finished changes to docusaurus.config.ts file
<p>It should look like this</p>

```
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/', // Serve the docs at the site's root
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],
```
<p>Now scroll down some more and find</p>

```      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },
            ],
          },
```

<p>Change `'/docs/intro',` to `'/',`</p>
<p>It should look like this</p>

```
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/',
              },
            ],
          },
```

<p>Now save and Exit</p>

:::info

Save with `CTRL+X`
:::

### Rebuilding the website
<p>Now rebuild the site</p>

```
npm run build
```
