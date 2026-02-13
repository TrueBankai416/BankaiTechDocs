import MDXComponents from '@theme-original/MDXComponents';
import type {MDXComponentsObject} from '@theme/MDXComponents';
import Trees from '@site/src/components/Trees';
import Folder from '@site/src/components/Trees/Folder';
import File from '@site/src/components/Trees/File';

const components: MDXComponentsObject = {
  ...MDXComponents,
  Trees,
  Folder,
  File,
};

export default components;
