import React from 'react';
import TreeItem from '../utils/TreeItem';

interface FileProps {
  label: string;
  icon?: string | null;
  iconSize?: number;
  badge?: string;
  level?: number;
}

export default function File({
  icon = 'vscode-icons:default-file',
  iconSize = 20,
  badge,
  label,
  level = 0,
}: FileProps): React.JSX.Element {
  return (
    <TreeItem
      icon={icon}
      iconSize={iconSize}
      badge={badge}
      label={label}
      expanded={false}
      level={level}
      defaultEmoji="📄"
    />
  );
}
