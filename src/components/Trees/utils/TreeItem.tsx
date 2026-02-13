import React, {Children, isValidElement, useMemo, useState, type ReactNode} from 'react';
import {Icon} from '@iconify/react';
import styles from '../styles.module.css';

interface TreeItemProps {
  icon?: string | null;
  iconSize?: number;
  badge?: string;
  label: string;
  expanded?: boolean;
  children?: ReactNode;
  level?: number;
  defaultEmoji?: string;
}

const fileIconMap: Record<string, string> = {
  mdx: 'vscode-icons:file-type-mdx',
  md: 'vscode-icons:file-type-markdown',
  json: 'vscode-icons:file-type-json',
  js: 'vscode-icons:file-type-js-official',
  jsx: 'vscode-icons:file-type-reactjs',
  ts: 'vscode-icons:file-type-typescript-official',
  tsx: 'vscode-icons:file-type-reactts',
  yml: 'vscode-icons:file-type-yaml',
  yaml: 'vscode-icons:file-type-yaml',
  css: 'vscode-icons:file-type-css',
  html: 'vscode-icons:file-type-html',
  sh: 'vscode-icons:file-type-shell',
  env: 'vscode-icons:file-type-dotenv',
};

function resolveFileIcon(label: string, icon: string | null | undefined): string | null | undefined {
  if (icon === null) {
    return null;
  }

  if (typeof icon === 'string' && icon.trim().length > 0 && icon !== 'vscode-icons:default-file') {
    return icon;
  }

  const match = label.toLowerCase().match(/\.([a-z0-9]+)$/);
  if (match?.[1]) {
    return fileIconMap[match[1]] ?? 'vscode-icons:default-file';
  }

  return 'vscode-icons:default-file';
}

export default function TreeItem({
  icon,
  iconSize = 20,
  badge,
  label,
  expanded = false,
  children,
  level = 0,
  defaultEmoji,
}: TreeItemProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const childElements = useMemo(
    () => Children.toArray(children).filter((child) => isValidElement(child)),
    [children],
  );
  const hasChildren = childElements.length > 0;
  const resolvedIcon = hasChildren ? icon : resolveFileIcon(label, icon);

  const toggleExpand = () => {
    if (hasChildren) {
      setIsExpanded((current) => !current);
    }
  };

  return (
    <div className={styles.treeNode}>
      <div
        className={`${styles.nodeContent} ${hasChildren ? styles.hasChildren : ''}`.trim()}
        style={{paddingLeft: `${level * 20}px`}}
        onClick={toggleExpand}
        role={hasChildren ? 'button' : undefined}
        tabIndex={hasChildren ? 0 : undefined}
        onKeyDown={(event) => {
          if (!hasChildren) {
            return;
          }

          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleExpand();
          }
        }}
      >
        {hasChildren ? <span className={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span> : null}

        <span className={styles.nodeIcon}>
          {resolvedIcon === null ? null :
          typeof resolvedIcon === 'string' && resolvedIcon.trim().length > 0 ? (
            <Icon icon={resolvedIcon} width={iconSize} height={iconSize} aria-hidden="true" />
          ) : (
            <span style={{fontSize: `${iconSize}px`, lineHeight: 1}}>{defaultEmoji ?? '•'}</span>
          )}
          <span className={styles.nodeLabel}>{label}</span>
        </span>

        {badge ? <span className={styles.nodeBadge}>{badge}</span> : null}
      </div>

      {hasChildren && isExpanded ? (
        <div className={styles.nodeChildren}>
          {childElements.map((child, index) =>
            React.cloneElement(child as React.ReactElement<{level?: number}>, {
              key: index,
              level: level + 1,
            }),
          )}
        </div>
      ) : null}
    </div>
  );
}
