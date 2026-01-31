#!/usr/bin/env node
/**
 * AI Translation Script for Docusaurus i18n
 * Translates English source files to multiple languages using free translation API
 * Install: npm install translate-google
 */

const fs = require('fs');
const path = require('path');
const translate = require('translate-google');

// Language codes
const LANGUAGES = {
  'es': 'Spanish',
  'af': 'Afrikaans',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'pl': 'Polish',
  'tr': 'Turkish',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'no': 'Norwegian',
  'da': 'Danish',
  'fi': 'Finnish',
  'hu': 'Hungarian',
  'cs': 'Czech',
  'el': 'Greek',
  'he': 'Hebrew',
  'ro': 'Romanian',
  'sr': 'Serbian',
  'uk': 'Ukrainian',
  'vi': 'Vietnamese',
};

async function translateText(text, targetLang) {
  try {
    const result = await translate(text, { to: targetLang });
    return result;
  } catch (error) {
    console.error(`  Error translating to ${targetLang}: ${error.message}`);
    return text; // Return original if translation fails
  }
}

async function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveJson(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function getAllJsonFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files = files.concat(getAllJsonFiles(fullPath));
    } else if (item.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function translateJsonFile(sourceFile, targetLangCode, targetLangName) {
  const sourceData = await loadJson(sourceFile);
  const translatedData = {};
  
  const fileName = path.basename(sourceFile);
  console.log(`  Translating ${fileName} to ${targetLangName}...`);
  
  for (const [key, value] of Object.entries(sourceData)) {
    if (typeof value === 'object' && value !== null && 'message' in value) {
      const translatedMessage = await translateText(value.message, targetLangCode);
      translatedData[key] = {
        message: translatedMessage,
        description: value.description || ''
      };
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } else {
      translatedData[key] = value;
    }
  }
  
  return translatedData;
}

async function main() {
  const sourceDir = 'i18n/en';
  
  if (!fs.existsSync(sourceDir)) {
    console.error(`Error: ${sourceDir} directory not found!`);
    process.exit(1);
  }
  
  const sourceFiles = getAllJsonFiles(sourceDir);
  console.log(`Found ${sourceFiles.length} source files to translate\n`);
  
  for (const [langCode, langName] of Object.entries(LANGUAGES)) {
    console.log(`\nTranslating to ${langName} (${langCode})...`);
    
    for (const sourceFile of sourceFiles) {
      try {
        const relativePath = path.relative(sourceDir, sourceFile);
        const targetFile = path.join('i18n', langCode, relativePath);
        
        const translatedData = await translateJsonFile(sourceFile, langCode, langName);
        saveJson(targetFile, translatedData);
        console.log(`  ✓ ${relativePath}`);
        
      } catch (error) {
        console.error(`  ✗ Error: ${error.message}`);
      }
    }
  }
  
  console.log('\n✓ Translation complete!');
  console.log('\nNext steps:');
  console.log('1. Review translations for accuracy');
  console.log('2. git add -A');
  console.log('3. git commit -m "Add AI translations for i18n locales"');
  console.log('4. git push origin l10n_main');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
