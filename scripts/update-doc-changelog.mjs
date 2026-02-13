import fs from 'node:fs';
import {spawnSync} from 'node:child_process';

const MAX_DOC_UPDATES = Number(process.env.MAX_DOC_UPDATES ?? 5);
const MAX_FILES_PER_COMMIT = Number(process.env.MAX_FILES_PER_COMMIT ?? 8);
const IGNORE_COMMIT_MESSAGE =
  /(merge pull request|merge branch|docs:\s*update automatic changelog|update automatic changelog|format|prettier|lint|typo|spell|^modified:\s|^new file:\s)/i;

const LOW_SIGNAL_COMMIT_MESSAGE =
  /^(add files via upload|update\s+[^\n]+\.(md|mdx)|create\s+[^\n]+\.(md|mdx)|rename\s+[^\n]+\.(md|mdx)|update\s+and\s+rename\s+[^\n]+\.(md|mdx)\s+to\s+[^\n]+\.(md|mdx))$/i;

const changedFilesCountCache = new Map();

function runGit(args) {
  const result = spawnSync('git', args, {encoding: 'utf8'});

  if (result.status !== 0) {
    const stderr = result.stderr?.trim();
    throw new Error(`git ${args.join(' ')} failed${stderr ? `: ${stderr}` : ''}`);
  }

  return result.stdout ?? '';
}

function quoteYamlString(value) {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeNote(value) {
  return value.trim().replace(/\s+/g, ' ');
}

function isRedundantFileUpdateNote(note, filePath) {
  const normalizedNote = normalizeNote(note);
  const fileName = filePath.split('/').pop() ?? '';
  const fileNameNoExt = fileName.replace(/\.(md|mdx)$/i, '');

  const patterns = [
    new RegExp(`^update\\s+${escapeRegExp(fileName)}$`, 'i'),
    new RegExp(`^update\\s+${escapeRegExp(fileNameNoExt)}(?:\\.(?:md|mdx))?$`, 'i'),
    new RegExp(`^create\\s+${escapeRegExp(fileName)}$`, 'i'),
    new RegExp(`^create\\s+${escapeRegExp(fileNameNoExt)}(?:\\.(?:md|mdx))?$`, 'i'),
  ];

  return patterns.some((pattern) => pattern.test(normalizedNote));
}

function collectUpdatesForFile(filePath) {
  const output = runGit([
    'log',
    '--follow',
    '--date=short',
    '--pretty=format:%ad%x09%H%x09%s',
    '--',
    filePath,
  ]).trim();

  if (!output) {
    return [];
  }

  const unique = new Set();
  const updates = [];

  for (const line of output.split(/\r?\n/)) {
    const [date, hash, ...messageParts] = line.split('\t');
    const note = messageParts.join('\t').trim();

    if (!date || !hash || !note) {
      continue;
    }

    const normalizedNote = normalizeNote(note);

    if (IGNORE_COMMIT_MESSAGE.test(normalizedNote)) {
      continue;
    }

    if (LOW_SIGNAL_COMMIT_MESSAGE.test(normalizedNote)) {
      continue;
    }

    if (isRedundantFileUpdateNote(normalizedNote, filePath)) {
      continue;
    }

    if (countChangedFiles(hash) > MAX_FILES_PER_COMMIT) {
      continue;
    }

    const dedupeKey = `${date}|${normalizedNote}`;
    if (unique.has(dedupeKey)) {
      continue;
    }

    unique.add(dedupeKey);
    updates.push({date, note: normalizedNote});

    if (updates.length >= MAX_DOC_UPDATES) {
      break;
    }
  }

  return updates;
}

function countChangedFiles(hash) {
  if (changedFilesCountCache.has(hash)) {
    return changedFilesCountCache.get(hash);
  }

  const filesOutput = runGit(['show', '--name-only', '--pretty=format:', '--no-renames', hash]).trim();
  const count = filesOutput ? filesOutput.split(/\r?\n/).filter(Boolean).length : 0;

  changedFilesCountCache.set(hash, count);
  return count;
}

function buildUpdatesBlock(updates, newline) {
  const lines = ['updates:'];

  for (const update of updates) {
    lines.push(`  - date: ${update.date}`);
    lines.push(`    note: ${quoteYamlString(update.note)}`);
  }

  return lines.join(newline);
}

function replaceUpdatesInFrontmatter(frontmatter, updatesBlock, newline) {
  const lines = frontmatter.split(/\r?\n/);
  const updatesStart = lines.findIndex((line) => /^updates:\s*$/.test(line.trim()));

  if (updatesStart >= 0) {
    let updatesEnd = lines.length;

    for (let index = updatesStart + 1; index < lines.length; index += 1) {
      if (/^[A-Za-z0-9_-]+:\s*/.test(lines[index])) {
        updatesEnd = index;
        break;
      }
    }

    const nextLines = [
      ...lines.slice(0, updatesStart),
      ...updatesBlock.split(newline),
      ...lines.slice(updatesEnd),
    ];

    return nextLines.join(newline);
  }

  const withSpacing = frontmatter.trimEnd();
  return `${withSpacing}${newline}${updatesBlock}`;
}

function updateFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const frontmatterMatch = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!frontmatterMatch) {
    return false;
  }

  const newline = source.includes('\r\n') ? '\r\n' : '\n';
  const updates = collectUpdatesForFile(filePath);

  const currentFrontmatter = frontmatterMatch[1];
  const updatesBlock = buildUpdatesBlock(updates, newline);
  const nextFrontmatter = replaceUpdatesInFrontmatter(currentFrontmatter, updatesBlock, newline);

  if (nextFrontmatter === currentFrontmatter) {
    return false;
  }

  const nextSource = source.replace(frontmatterMatch[0], `---${newline}${nextFrontmatter}${newline}---`);
  fs.writeFileSync(filePath, nextSource, 'utf8');
  return true;
}

function main() {
  const trackedDocs = runGit(['ls-files', 'docs/**/*.md', 'docs/**/*.mdx'])
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  let changedCount = 0;

  for (const filePath of trackedDocs) {
    if (updateFile(filePath)) {
      changedCount += 1;
    }
  }

  process.stdout.write(`Updated changelog frontmatter in ${changedCount} doc file(s).\n`);
}

main();
