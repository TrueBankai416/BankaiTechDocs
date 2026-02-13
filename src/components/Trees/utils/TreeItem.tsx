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
          {icon === null ? null : typeof icon === 'string' && icon.trim().length > 0 ? (
            <Icon icon={icon} width={iconSize} height={iconSize} aria-hidden="true" />
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
