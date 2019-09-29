import { observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { PageData, PageRange, PageRef } from '../page_provider/page_provider';
import styles from './page_list.css';
import { PlaceholderPage } from './placeholder_page';

type Props = {
  viewportPageRange: PageRange;
  pages: readonly PageData[];
  onViewportPageRangeChange(newRange: PageRange): void;
  onMount(): void;
};

@observer
export class PageList extends React.Component<Props> {
  private listRef = React.createRef<HTMLDivElement>();

  componentDidMount() {
    this.props.onMount();
  }

  private onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!this.listRef || !this.listRef.current) {
      return;
    }

    const { viewportPageRange, onViewportPageRangeChange, pages } = this.props;
    const listScrollTop = this.listRef.current.scrollTop;
    const listClientHeight = this.listRef.current.clientHeight;

    // Loop through the pages to figure out the current top and bottom pages
    const pageDivs = [...this.listRef.current.children];
    let topPage: PageRef | null = null;
    let bottomPage: PageRef | null = null;

    for (let i = 0; i < pageDivs.length; i++) {
      const pageDiv = pageDivs[i];

      // The first page positioned below the current scroll height is our second page:
      //   |-------|
      //   |       |
      //---|-------|--- scroll boundary (scrollTop of our list)
      //   |       |
      //   |-------|
      //   |       |
      //   |       | <-- the first page positioned below the scrollTop of our list
      //
      // So, we pick `i - 1` to retrieve the first page.
      if (topPage == null && (pageDiv as HTMLElement).offsetTop > listScrollTop) {
        topPage = pages[i - 1].pageRef;
      }
      // The bottom page is the first page where it is positioned below the bottom of our viewport,
      // i.e. below (scrollTop + clientHeight). Similar to topPage, we pick the previous one since
      // the page with offsetTop > viewportBottom will actually be the next page.
      if (bottomPage == null && (pageDiv as HTMLElement).offsetTop > (listScrollTop + listClientHeight)) {
        bottomPage = pages[i - 1].pageRef;
      }
      // If we've found both pages already, we can early-exit
      if (topPage != null && bottomPage != null) {
        break;
      }
    }
    // If no page had its top boundary past the viewport, that means we've scrolled to the bottom.
    if (bottomPage == null) {
      bottomPage = pages[pages.length - 1].pageRef;
    }

    const range: PageRange = [topPage, bottomPage];
    if (!PageRange.compare(viewportPageRange, range)) {
      onViewportPageRangeChange(range);
    }
  }

  render() {
    const { pages } = this.props;

    return (
      <div className={styles.pageList} onScroll={this.onScroll} ref={this.listRef}>
        {pages.map((page, i) => (
          <PageView key={i} page={page}/>
        ))}
      </div>
    );
  }
}

type PageViewProps = {
  page: PageData;
};

@observer
class PageView extends React.Component<PageViewProps> {
  @observable.ref
  private imageUri?: string;

  async componentDidMount() {
    const { page } = this.props;

    // Resolve the page
    const image = await page.loadImage();
    runInAction(() => this.imageUri = image);
  }

  render() {
    return (
      <div className={styles.pageView}>
        {this.imageUri == null
            ? <PlaceholderPage/>
            : <img src={this.imageUri}/>
        }
      </div>
    )
  }
}
