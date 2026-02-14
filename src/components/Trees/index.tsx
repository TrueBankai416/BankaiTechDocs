import React, {Children, isValidElement, type ReactNode} from 'react';
import styles from './styles.module.css';

interface TreesProps {
  title?: string;
  children: ReactNode;
}

export default function Trees({title, children}: TreesProps): React.JSX.Element {
  return (
    <div className={styles.treeContainer}>
      {title ? <h3 className={styles.treeTitle}>{title}</h3> : null}
      <div className={styles.treeContent}>
        {Children.map(children, (child, index) => {
          if (!isValidElement(child)) {
            return null;
          }

          return React.cloneElement(child, {
            key: index,
            level: 0,
          });
        })}
      </div>
    </div>
  );
}
