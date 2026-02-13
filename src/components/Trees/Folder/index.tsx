import React, {type ReactNode} from 'react';
import TreeItem from '../utils/TreeItem';

interface FolderProps {
  label: string;
  icon?: string | null;
  iconSize?: number;
  badge?: string;
  expanded?: boolean;
  children?: ReactNode;
  level?: number;
}

export default function Folder({
  icon = 'vscode-icons:default-folder',
  iconSize = 24,
  badge,
  label,
  expanded = false,
  children,
  level = 0,
}: FolderProps): React.JSX.Element {
  return (
    <TreeItem
      icon={icon}
      iconSize={iconSize}
      badge={badge}
      label={label}
      expanded={expanded}
      level={level}
      defaultEmoji="📁"
    >
      {children}
    </TreeItem>
  );
}
