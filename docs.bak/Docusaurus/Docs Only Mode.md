---
last_update:
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

```
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Documented Tutorial',
                to: '/docs/category/documented-tutorials-',
              },
              {
                label: 'Examples',
                to: '/docs/category/examples-',
              },
              {
                label: 'Jellyfin Extras',
                to: '/docs/category/jellyfin-extras-',
              },
              {
                label: 'Arr Self-Hosting',
                to: '/docs/category/arr-self-hosting',
              },
              {
                label: 'Videos',
                to: '/docs/category/videos-tutorials',
              },
            ],
```

<p>Change `'/docs/intro',` to `'/',` for every link</p>
<p>It should look like this</p>

```
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Documented Tutorial',
                to: '/category/documented-tutorials-',
              },
              {
                label: 'Examples',
                to: '/category/examples-',
              },
              {
                label: 'Jellyfin Extras',
                to: '/category/jellyfin-extras-',
              },
              {
                label: 'Arr Self-Hosting',
                to: '/category/arr-self-hosting',
              },
              {
                label: 'Videos',
                to: '/category/videos-tutorials',
              },
            ],
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
## Changing the default Landing Page
<p>Now if you wanted to change your landing page to your own `index.js`, `index.md`, or a specific document</p>
<p>You will have to add</p>
```
---
slug: /
---
```
To the file
<p>For example if you wanted a visitor to land on `https://docs.bankai-tech.com/Docker/Nextcloud/Installation` when typing `https://docs.bankai-tech.com` in the browser</p>
You would have to add the `slug: /` shown in the example codeblock above to the top of the file hosting that page. In my case its in `/docs/Docker/Nextcloud/Installation.md`

<p>If you build the file after adding the `slug` you will recieve and error</p>
![slug Error](/img/Docusaurus/slugError.png)
<p>This is because the default homepage is routed to `/` also.</p>

<p>To fix this we need to either delete or rename the file `src/pages/index.js` or for typscript users `src/pages/index.tsx`</p>
:::note
I renamed `src/pages/index.tsx` to `src/pages/index.tsx.bak` \
Just incase I wanted to revert these changes in the future
:::

<p>You can now rebuild the website with no errors</p>
```
npm run build
```
