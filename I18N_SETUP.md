# Internationalization (i18n) Setup Guide

This document explains how to set up and manage translations for the BankaiTech documentation site using Docusaurus i18n.

## Current Configuration

The site is configured to support multiple languages:

- **Default locale:** English (`en`)
- **Additional locales:** Spanish (`es`)

## Configuration Changes Made

### 1. Updated `docusaurus.config.ts`

Added i18n configuration:

```typescript
i18n: {
  defaultLocale: 'en',
  locales: ['en', 'es'],
  localeConfigs: {
    en: {
      htmlLang: 'en-US',
      label: 'English',
    },
    es: {
      htmlLang: 'es-ES',
      label: 'Español',
    },
  },
},
```

### 2. Added Locale Dropdown to Navbar

Added a locale dropdown selector in the navbar:

```typescript
{
  type: 'localeDropdown',
  position: 'right',
},
```

### 3. Updated Search Plugin

Updated the search plugin to support multiple languages:

```typescript
language: ['en', 'es'],
```

## Known Issue: Sidebar Translation Key Conflicts

~~The current sidebar structure contains duplicate category names across different sections (e.g., multiple "Docs" categories, multiple "Installation" categories, etc.). This causes translation key conflicts when trying to generate translation files.~~

**STATUS: RESOLVED** ✅

Option 1 has been implemented to resolve the sidebar translation key conflicts. Unique keys have been added to all duplicate category `_category_.json` files.

### Previous Error Message

```
Error: Multiple docs sidebar items produce the same translation key.
- `sidebar.autoSidebar.category.Docs`: 20 duplicates found
- `sidebar.autoSidebar.category.Installation`: 2 duplicates found
- `sidebar.autoSidebar.category.Troubleshooting`: 3 duplicates found
...
```

### Resolution Applied (Option 1)

Unique `key` attributes have been added to all category metadata files. Example:

```json
{
  "label": "Docs",
  "key": "docker-docs",
  "position": 2
}
```

Categories with unique keys added:
- **Discord:** `discord-docs`
- **Docker:** `docker-docs`
- **Docusaurus:** `docusaurus-docs`, `docusaurus-troubleshooting`
- **Examples/Arr Suite:** `arr-suite-docs`, `arr-suite-qbittorrent`
- **Examples/Node-RED:** `node-red-docs`
- **Examples/Reverse Proxies:** `reverse-proxy-docs`
- **Examples/VPN:** `vpn-docs`
- **GitHub:** `github-docs`
- **HDD Tools:** `hdd-tools-docs`
- **Jellyfin:** `jellyfin-docs`, `jellyfin-installation`
- **MariaDB:** `mariadb-docs`
- **MS Windows/Local KMS:** `kms-docs`
- **MS Windows/Office:** `office-docs`
- **MS Windows/Windows:** `windows-docs`
- **Networking:** `networking-docs`
- **Nextcloud:** `nextcloud-docs`, `nextcloud-installation`, `nextcloud-troubleshooting`
- **NextcloudPI:** `nextcloudpi-docs`
- **Proxmox:** `proxmox-docs`, `proxmox-networking`
- **Reverse Proxy:** `reverse-proxy-reverse-docs`, `nginx-troubleshooting`
- **Torrent Clients/qBittorrent:** `torrent-qbittorrent`, `torrent-qbittorrent-docs`
- **Ubiquiti:** `ubiquiti-docs`

## Translation Workflow

Once the sidebar key conflicts have been resolved (see section above), follow these steps:

### 1. Generate Translation Files

```bash
npm run write-translations -- --locale es
```

This creates translation files in `i18n/es/`:
- `i18n/es/code.json` - UI labels and React components (94 translations)
- `i18n/es/docusaurus-theme-classic/navbar.json` - Navbar translations (6 translations)
- `i18n/es/docusaurus-theme-classic/footer.json` - Footer translations (9 translations)
- `i18n/es/docusaurus-plugin-content-docs/current.json` - Docs sidebar translations (149 translations)

### 2. Translate JSON Files

Edit the generated JSON files and translate the `message` fields:

```json
{
  "Welcome to my website": {
    "message": "Bienvenido a mi sitio web"
  }
}
```

### 3. Copy and Translate Markdown Files

Copy documentation files to the locale folder:

```bash
# Copy docs
mkdir -p i18n/es/docusaurus-plugin-content-docs/current
cp -r docs/** i18n/es/docusaurus-plugin-content-docs/current

# Copy pages (if any)
mkdir -p i18n/es/docusaurus-plugin-content-pages
cp -r src/pages/**.md i18n/es/docusaurus-plugin-content-pages
cp -r src/pages/**.mdx i18n/es/docusaurus-plugin-content-pages
```

Then translate the copied Markdown files.

### 4. Test Translations

Start the dev server with a specific locale:

```bash
npm run start -- --locale es
```

Visit `http://localhost:3000/es/` to see the translated site.

### 5. Build All Locales

Build the site for all locales:

```bash
npm run build
```

This creates:
- `build/` - Default English site
- `build/es/` - Spanish site

## Deployment

The site can be deployed using:

### Single-Domain Strategy (Recommended)

Deploy the entire `build/` folder. The site will be accessible at:
- `https://docs.bankai-tech.com` - English (default)
- `https://docs.bankai-tech.com/es` - Spanish

### Multi-Domain Strategy

Build each locale separately and deploy to different domains:

```bash
npm run build -- --locale es
```

Configure different domains for each locale in `i18n.localeConfigs[<locale>].url`.

## Adding More Locales

To add additional locales (e.g., French):

1. Update `docusaurus.config.ts`:
   ```typescript
   locales: ['en', 'es', 'fr'],
   localeConfigs: {
     // ... existing configs
     fr: {
       htmlLang: 'fr-FR',
       label: 'Français',
     },
   }
   ```

2. Update search plugin:
   ```typescript
   language: ['en', 'es', 'fr'],
   ```

3. Generate translations:
   ```bash
   npm run write-translations -- --locale fr
   ```

4. Follow the translation workflow above

## Translation Best Practices

1. **Use Explicit Heading IDs:** Add explicit IDs to headings to avoid translation issues:
   ```markdown
   ### Hello World {#hello-world}
   ```

2. **Mark Translatable Text:** Use `<Translate>` component or `translate()` function:
   ```jsx
   import Translate from '@docusaurus/Translate';
   
   <Translate>Hello World</Translate>
   ```

3. **Keep Default Locale Up to Date:** Always update the default locale (English) first, then propagate changes to translations.

4. **Version Control:** Commit translation files to git for collaborative translation.

## References

- [Docusaurus i18n Tutorial](https://docusaurus.io/docs/i18n/tutorial)
- [Docusaurus i18n Introduction](https://docusaurus.io/docs/i18n/introduction)
- [Using Git for Translations](https://docusaurus.io/docs/i18n/git)
- [Using Crowdin for Translations](https://docusaurus.io/docs/i18n/crowdin)

## Next Steps

To complete the i18n setup and begin the translation process:

1. ✅ **Sidebar conflicts resolved:** Unique keys added to all duplicate categories
2. **Translate JSON files:** Edit the generated JSON message fields in `i18n/es/`
3. **Copy and translate Markdown files:** Follow the steps in section "Copy and Translate Markdown Files"
4. **Test translations:** Run `npm run start -- --locale es` to test
5. **Build for production:** Run `npm run build` to create localized sites
