## Installing Algolia Search for Docusaurus
<h3>*This method will use the Local version of  [Algolia Search Bar](https://docsearch.algolia.com/docs/legacy/run-your-own/)*</h3>
*Click [here](https://docusaurus.io/docs/search) for official Docs.*

### Installing Jq
First we need to install [Jq](https://jqlang.github.io/jq/download/)
```
sudo apt-get install jq -y
```
:::info

`-y` auto-selects `yes` when installing
:::

Make sure you are in the root of your website, in my case ill run
```
cd /var/websites/"HomeLab Docs"
```
### Creating an Algolia Account
Lets create an [Algolia Account](https://dashboard.algolia.com/users/sign_up)

![Create Algolia Account](/img/Docusaurus/CreateAccount.jpg)

Now go to the `Settings` page

![Algolia Settings](/img/Docusaurus/AlgoliaSettings.jpg)

Continue to the `API` Page

![Algolia API](/img/Docusaurus/AlgoliaAPI.jpg)

Take note of the ID and Both keys, we will be using them shortly.

![Algolia Keys](/img/Docusaurus/AlgoliaKeys.jpg)

### Creating the .env file
Now lets create an `.env` file.
```
nano .env
```
Paste your `ID` and `Admin API Key` in the following format
```
APPLICATION_ID=YOUR_APP_ID
API_KEY=YOUR_API_KEY
```
:::tip[Hint]

Paste by pressing `CTRL+SHIFT+V`
Save by pressing `CTRL+X`
:::

### Creating config.json file
Now lets make a [Docusaurus v2 config](https://github.com/algolia/docsearch-configs/blob/master/configs/docusaurus-2.json) file.
```
nano config.json
```
Paste the following
```
{
  "index_name": "docusaurus-2",
  "start_urls": [
    "https://docusaurus.io/"
  ],
  "sitemap_urls": [
    "https://docusaurus.io/sitemap.xml"
  ],
  "sitemap_alternate_links": true,
  "stop_urls": [
    "/tests"
  ],
  "selectors": {
    "lvl0": {
      "selector": "(//ul[contains(@class,'menu__list')]//a[contains(@class, 'menu__link menu__link--sublist menu__link--active')]/text() | //nav[contains(@class, 'navbar')]//a[contains(@class, 'navbar__link--active')]/text())[last()]",
      "type": "xpath",
      "global": true,
      "default_value": "Documentation"
    },
    "lvl1": "header h1",
    "lvl2": "article h2",
    "lvl3": "article h3",
    "lvl4": "article h4",
    "lvl5": "article h5, article td:first-child",
    "lvl6": "article h6",
    "text": "article p, article li, article td:last-child"
  },
  "strip_chars": " .,;:#",
  "custom_settings": {
    "separatorsToIndex": "_",
    "attributesForFaceting": [
      "language",
      "version",
      "type",
      "docusaurus_tag"
    ],
    "attributesToRetrieve": [
      "hierarchy",
      "content",
      "anchor",
      "url",
      "url_without_anchor",
      "type"
    ]
  },
  "conversation_id": [
    "833762294"
  ],
  "nb_hits": 46250
}
```
Update the following with your `domain`
```
  "start_urls": [
    "https://docusaurus.io/"
  ],
  "sitemap_urls": [
    "https://docusaurus.io/sitemap.xml"
  ],
```

#### My completed config.json file
```
{
  "index_name": "bankai-tech.com",
  "start_urls": [
    "https://docs.bankai-tech.com/"
  ],
  "sitemap_urls": [
    "https://docs.bankai-tech.com/sitemap.xml"
  ],
  "sitemap_alternate_links": true,
  "stop_urls": [
    "/tests"
  ],
  "selectors": {
    "lvl0": {
      "selector": "(//ul[contains(@class,'menu__list')]//a[contains(@class, 'menu__link menu__link--sublist menu__link--active')]/text() | //nav[contains(@class, 'navbar')]//a[contains(@class, 'navbar__link--active')]/text())[last()]",
      "type": "xpath",
      "global": true,
      "default_value": "Documentation"
    },
    "lvl1": "header h1",
    "lvl2": "article h2",
    "lvl3": "article h3",
    "lvl4": "article h4",
    "lvl5": "article h5, article td:first-child",
    "lvl6": "article h6",
    "text": "article p, article li, article td:last-child"
  },
  "strip_chars": " .,;:#",
  "custom_settings": {
    "separatorsToIndex": "_",
    "attributesForFaceting": [
      "language",
      "version",
      "type",
      "docusaurus_tag"
    ],
    "attributesToRetrieve": [
      "hierarchy",
      "content",
      "anchor",
      "url",
      "url_without_anchor",
      "type"
    ]
  },
  "conversation_id": [
    "833762294"
  ],
  "nb_hits": 46250
}
```

### Building the website
Now build the site.
```
npm run build
```

### Start the crawler with docker
Now we should be able to start the [crawler](https://docsearch.algolia.com/docs/legacy/run-your-own/#run-the-crawl-from-the-docker-image).
```
docker run -it --env-file=./.env -e "CONFIG=$(cat ./config.json | jq -r tostring)" algolia/docsearch-scraper
```
:::note

You will have to run this command everytime you create or change a directory
:::

If successful the output should look like this

![Algolia Crawler](/img/Docusaurus/Crawler.jpg)
