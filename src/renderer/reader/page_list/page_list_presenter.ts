import { action, observable, runInAction } from 'mobx';
import { PageData, PageProvider, PageRange, PageRef } from '../page_provider/page_provider';

export class PageListStore {
  /** Buffer distance, in pages */
  bufferDistance: number = 2;

  @observable.ref
  viewportPageRange: PageRange = [null, null];

  @observable.shallow
  pages: PageData[] = [];
}

export class PageListPresenter {
  constructor(private readonly pageProvider: PageProvider) { }

  async loadPages(store: PageListStore) {
    const pages = await this.pageProvider.getPageRange([
      { seriesId: 'test-series', chapterNumber: 0, pageNumber: 0 },
      { seriesId: 'test-series', chapterNumber: 0, pageNumber: 10 },
    ]);
    runInAction(() => store.pages = [...pages]);
  }

  @action
  async onViewportPageRangeChange(store: PageListStore, range: PageRange) {
    store.viewportPageRange = range;

    // If we're near the end of our loaded page list, request more pages.
    if (range[1] && this.isNearEnd(store, range[1])) {
      console.log('Requesting more pages');
      const pageRefs = await this.pageProvider.getMorePages(store.pages[store.pages.length - 1].pageRef, store.bufferDistance);
      const pages = await this.pageProvider.getPages(pageRefs);
      runInAction(() => {
        store.pages.push(...pages);
        // Trim the same number of pages from the start
        store.pages.splice(0, store.bufferDistance);
      });
      console.log(`Pushed pages ${PageRef.toShortString(pages[0].pageRef)}-${PageRef.toShortString(pages[pages.length - 1].pageRef)}`);
    }

    console.log(`Now viewing pages ${PageRef.toShortString(range[0])}-${PageRef.toShortString(range[1])}`);
  }

  /**
   * Returns true if the provided PageRef is within the last `bufferDistance` pages.
   */
  private isNearEnd(store: PageListStore, page: PageRef) {
    for (let i = store.pages.length - store.bufferDistance - 1; i < store.pages.length; i++) {
      if (PageRef.compare(store.pages[i].pageRef, page)) {
        return true;
      }
    }
    return false;
  }

  onScroll(store: PageListStore, e: React.UIEvent<HTMLDivElement>) {
    const target = e.target as HTMLDivElement;
    const listScrollTop = target.scrollTop;
    const listClientHeight = target.clientHeight;

    // Loop through the pages to figure out the current top and bottom pages
    const pageDivs = [...target.children];
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
        topPage = store.pages[i - 1].pageRef;
      }
      // The bottom page is the first page where it is positioned below the bottom of our viewport,
      // i.e. below (scrollTop + clientHeight). Similar to topPage, we pick the previous one since
      // the page with offsetTop > viewportBottom will actually be the next page.
      if (bottomPage == null && (pageDiv as HTMLElement).offsetTop > (listScrollTop + listClientHeight)) {
        bottomPage = store.pages[i - 1].pageRef;
      }
      // If we've found both pages already, we can early-exit
      if (topPage != null && bottomPage != null) {
        break;
      }
    }
    // If no page had its top boundary past the viewport, that means we've scrolled to the bottom.
    if (bottomPage == null) {
      bottomPage = store.pages[store.pages.length - 1].pageRef;
    }

    const range: PageRange = [topPage, bottomPage];
    if (!PageRange.compare(store.viewportPageRange, range)) {
      this.onViewportPageRangeChange(store, range);
    }
  }
}
