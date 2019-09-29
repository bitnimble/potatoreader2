import { action, observable, runInAction } from 'mobx';
import { PageData, PageProvider, PageRange, PageRef } from '../page_provider/page_provider';

export class PageListStore {
  /** Buffer distance, in pages */
  bufferDistance: number = 2;

  @observable.ref
  viewportPageRange: PageRange = [null, null];

  @observable.shallow
  pages: PageData[] = [];

  // If multiple fetches were requested, it's possible that we might be adding a page that has already
  // been added in a different async call. This set is used to prevent duplicate pages from being added.
  pageKeySet: Set<string> = new Set();
}

export class PageListPresenter {
  constructor(private readonly pageProvider: PageProvider) { }

  async loadPages(store: PageListStore) {
    const pages = await this.pageProvider.getPageRange([
      { seriesId: 'test-series', chapterNumber: 0, pageNumber: 0 },
      { seriesId: 'test-series', chapterNumber: 0, pageNumber: 10 },
    ]);
    runInAction(() => {
      store.pages = [...pages];
      this.addToPageKeySet(store, pages);
    });
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

  @action
  async onViewportPageRangeChange(store: PageListStore, range: PageRange) {
    store.viewportPageRange = range;

    // If we're near the start of our loaded page list, request more pages.
    if (range[0] && this.isNearStart(store, range[0])) {
      console.log('Requesting more pages to beginning');
      console.log(`Requesting ${-1 * store.bufferDistance} from ${PageRef.toShortString(store.pages[0].pageRef)}`);
      const pageRefs = await this.pageProvider.getMorePages(store.pages[0].pageRef, -1 * store.bufferDistance);
      const pages = await this.pageProvider.getPages(pageRefs);
      runInAction(() => {
        // If multiple fetches were requested, it's possible that we might be adding a page that has already
        // been added in a different async call. We filter pages here that already exist to prevent accidental
        // duplicate pages.
        const filteredPages = pages.filter(page => !store.pageKeySet.has(PageRef.toPageKey(page.pageRef)));
        store.pages.unshift(...filteredPages);
        // Trim the same number of pages from the end
        const removed = store.pages.splice(store.pages.length - filteredPages.length);

        // Update key set
        this.addToPageKeySet(store, filteredPages);
        this.removeFromPageKeySet(store, removed);

        console.log('Adding', filteredPages.map(p => PageRef.toShortString(p.pageRef)).join(','));
      });
    }

    // If we're near the end of our loaded page list, request more pages.
    if (range[1] && this.isNearEnd(store, range[1])) {
      console.log('Requesting more pages to end');
      const pageRefs = await this.pageProvider.getMorePages(store.pages[store.pages.length - 1].pageRef, store.bufferDistance);
      const pages = await this.pageProvider.getPages(pageRefs);
      runInAction(() => {
        const filteredPages = pages.filter(page => !store.pageKeySet.has(PageRef.toPageKey(page.pageRef)));
        store.pages.push(...filteredPages);
        // Trim the same number of pages from the start
        const removed = store.pages.splice(0, filteredPages.length);

        this.addToPageKeySet(store, filteredPages);
        this.removeFromPageKeySet(store, removed);
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

  /**
   * Returns true if the provided PageRef is within the first `bufferDistance` pages.
   */
  private isNearStart(store: PageListStore, page: PageRef) {
    for (let i = 0; i < store.bufferDistance; i++) {
      if (PageRef.compare(store.pages[i].pageRef, page)) {
        return true;
      }
    }
    return false;
  }

  private addToPageKeySet(store: PageListStore, pages: readonly PageData[]) {
    pages.map(page => PageRef.toPageKey(page.pageRef)).forEach(key => store.pageKeySet.add(key));
  }

  private removeFromPageKeySet(store: PageListStore, pages: readonly PageData[]) {
    pages.forEach(p => store.pageKeySet.delete(PageRef.toPageKey(p.pageRef)));
  }
}
