import React from 'react';
import DocItem from '@theme-original/DocItem';
import type DocItemType from '@theme/DocItem';
import type {WrapperProps} from '@docusaurus/types';

type Props = WrapperProps<typeof DocItemType>;
import GiscusComponent from '@site/src/components/GiscusComponent';
function DocItemContent({ sidebar, children }) {
    const { metadata, toc } = useDocItem();
    const { nextItem, prevItem, frontMatter, unlisted } = metadata;
    const {
        hide_table_of_contents: hideTableOfContents,
        toc_min_heading_level: tocMinHeadingLevel,
        toc_max_heading_level: tocMaxHeadingLevel,
    } = frontMatter;
    return (
        <DocLayout
            sidebar={sidebar}
            toc={
                !hideTableOfContents && toc.length > 0 ? (
                    <TOC toc={toc} minHeadingLevel={tocMinHeadingLevel} maxHeadingLevel={tocMaxHeadingLevel} />
                ) : undefined
            }
        >
            {unlisted && <Unlisted />}
            <DocItem>{children}</DocItem>
            <GiscusComponent />
            {(nextItem || prevItem) && <DocPaginator nextItem={nextItem} prevItem={prevItem} />}
        </DocLayout>
    );
}

export default function DocItemWrapper(props) {
    const DocItemContent = props.content;
    return (
        <DocItemProvider content={props.content} isDocItemPage>
            <HtmlClassNameProvider
                className={clsx(ThemeClassNames.wrapper.docPages, ThemeClassNames.page.docItemPage)}
            >
                <DocItemMetadata />
                <DocItemContent sidebar={props.sidebar}>
                    <DocItemContent />
                </DocItemContent>
            </HtmlClassNameProvider>
        </DocItemProvider>
    );
}
