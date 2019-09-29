import { action, observable, runInAction } from 'mobx';
import { PageData, PageProvider, PageRange, PageRef } from '../page_provider/page_provider';

const BUFFER_DISTANCE = 2;
const BUFFER_AMOUNT = 5;
const MAX_PAGES = 40;

export class PageListStore {
  @observable.ref
  viewportPageRange: PageRange = [null, null];

  @observable.shallow
  pages: PageData[] = [];
}

export class PageListPresenter {
  // If multiple fetches were requested, it's possible that we might be adding a page that has already
  // been added in a different async call. This set is used to prevent duplicate pages from being added.
  pageKeySet: Set<string> = new Set();

  constructor(private readonly pageProvider: PageProvider) { }

  async loadPages(store: PageListStore) {
    const pages = await this.pageProvider.getPageRange([
      { seriesId: 'test-series', chapterNumber: 0, pageNumber: 0 },
      { seriesId: 'test-series', chapterNumber: 0, pageNumber: 10 },
    ]);
    runInAction(() => {
      store.pages = [...pages];
      this.addToPageKeySet(pages);
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
      console.log(`[start] Requesting ${-1 * BUFFER_AMOUNT} from ${PageRef.toShortString(store.pages[0].pageRef)}`);
      const pageRefs = await this.pageProvider.getMorePages(store.pages[0].pageRef, -1 * BUFFER_AMOUNT);
      const pages = await this.pageProvider.getPages(pageRefs);
      runInAction(() => {
        // If multiple fetches were requested, it's possible that we might be adding a page that has already
        // been added in a different async call. We filter pages here that already exist to prevent accidental
        // duplicate pages.
        const filteredPages = pages.filter(page => !this.pageKeySet.has(PageRef.toPageKey(page.pageRef)));
        store.pages.unshift(...filteredPages);
        this.addToPageKeySet(filteredPages);

        if (store.pages.length > MAX_PAGES) {
          // Cull pages from the end if there are too many pages loaded
          const removed = store.pages.splice(MAX_PAGES);
          this.removeFromPageKeySet(removed);
        }

        console.log('Adding', filteredPages.map(p => PageRef.toShortString(p.pageRef)).join(','));
      });
    }

    // If we're near the end of our loaded page list, request more pages.
    if (range[1] && this.isNearEnd(store, range[1])) {
      console.log(`[end] Requesting ${BUFFER_AMOUNT} from ${PageRef.toShortString(store.pages[store.pages.length - 1].pageRef)}`);
      const origin = store.pages[store.pages.length - 1].pageRef;
      const pageRefs = await this.pageProvider.getMorePages(origin, BUFFER_AMOUNT);
      const pages = await this.pageProvider.getPages(pageRefs);
      runInAction(() => {
        const filteredPages = pages.filter(page => !this.pageKeySet.has(PageRef.toPageKey(page.pageRef)));
        store.pages.push(...filteredPages);
        this.addToPageKeySet(filteredPages);

        // Cull pages from the start if there are too many pages loaded
        if (store.pages.length > MAX_PAGES) {
          const removed = store.pages.splice(0, MAX_PAGES - store.pages.length);
          this.removeFromPageKeySet(removed);
        }
      });
    }
  }

  /**
   * Returns true if the provided PageRef is within the last `bufferDistance` pages.
   */
  private isNearEnd(store: PageListStore, page: PageRef) {
    for (let i = store.pages.length - 1; i >= store.pages.length - BUFFER_DISTANCE; i--) {
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
    for (let i = 0; i < BUFFER_DISTANCE; i++) {
      if (PageRef.compare(store.pages[i].pageRef, page)) {
        return true;
      }
    }
    return false;
  }

  private addToPageKeySet(pages: readonly PageData[]) {
    pages.map(page => PageRef.toPageKey(page.pageRef)).forEach(key => this.pageKeySet.add(key));
  }

  private removeFromPageKeySet(pages: readonly PageData[]) {
    pages.forEach(p => this.pageKeySet.delete(PageRef.toPageKey(p.pageRef)));
  }
}
