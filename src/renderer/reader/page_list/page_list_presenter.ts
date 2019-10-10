import { action, observable, runInAction } from 'mobx';
import { MangaSource } from '../manga_source/manga_source';
import { Page, PageRange } from '../manga_types';

const BUFFER_DISTANCE = 3;
const MAX_PAGES = 50;

export class PageListStore {
  @observable.ref
  viewportPageRange?: PageRange;

  @observable.shallow
  pages: Page[] = [];

  @observable.ref
  topPage?: Page;
}

export class PageListPresenter {
  // If multiple fetches were requested, it's possible that we might be adding a page that has already
  // been added in a different async call. This set is used to prevent duplicate pages from being added.
  private pageKeySet: Set<string> = new Set();
  // Store current inflight requests to help prevent double-requesting
  private currentRequests: Set<string> = new Set();

  constructor(private readonly mangaSource: MangaSource) {}

  async loadPages(store: PageListStore, seriesId: string) {
    const chapter = await this.mangaSource.getChapter(seriesId, 0);
    if (!chapter) {
      return;
    }
    const pages = await this.mangaSource.getPages(chapter);
    runInAction(() => {
      store.pages = [...pages];
      this.addToPageKeySet(pages);
    });
  }

  async onScroll(store: PageListStore, e: React.UIEvent<HTMLDivElement>) {
    const target = e.target as HTMLDivElement;
    const listScrollTop = target.scrollTop;
    const listClientHeight = target.clientHeight;

    // Loop through the pages to figure out the current top and bottom pages
    const pageDivs = [...target.children];
    let topPage: Page | null = null;
    let bottomPage: Page | null = null;
    let topPageDiv: HTMLElement | null = null;

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
      if (
        topPage == null &&
        (pageDiv as HTMLElement).offsetTop > listScrollTop
      ) {
        topPage = store.pages[i - 1];
        topPageDiv = pageDiv as HTMLElement;
      }
      // The bottom page is the first page where it is positioned below the bottom of our viewport,
      // i.e. below (scrollTop + clientHeight). Similar to topPage, we pick the previous one since
      // the page with offsetTop > viewportBottom will actually be the next page.
      if (
        bottomPage == null &&
        (pageDiv as HTMLElement).offsetTop > listScrollTop + listClientHeight
      ) {
        bottomPage = store.pages[i - 1];
      }
      // If we've found both pages already, we can early-exit
      if (topPage != null && bottomPage != null) {
        break;
      }
    }
    // If no page had its top boundary past the viewport, that means we've scrolled to the bottom.
    if (bottomPage == null) {
      bottomPage = store.pages[store.pages.length - 1];
    }
    if (topPage == null || topPageDiv == null) {
      topPage = store.pages[0];
      topPageDiv = pageDivs[0] as HTMLElement;
    }

    const range: PageRange = [topPage, bottomPage];
    if (store.viewportPageRange == null) {
      store.viewportPageRange = range;
    }
    if (!PageRange.compare(store.viewportPageRange, range)) {
      runInAction(() => (store.topPage = topPage || undefined));
      this.onViewportPageRangeChange(store, range, target, topPageDiv);
    }
  }

  @action
  async onViewportPageRangeChange(
    store: PageListStore,
    range: PageRange,
    target: HTMLElement,
    topPageDiv: HTMLElement
  ) {
    store.viewportPageRange = range;

    const maybeAppendChapter = async (direction: 'before' | 'after') => {
      const origin =
        direction === 'before'
          ? store.pages[0]
          : store.pages[store.pages.length - 1];
      const currentRequestKey = this.getCurrentRequestKey(origin, direction);
      if (
        !this.currentRequests.has(currentRequestKey) &&
        // Avoid requesting pages before the first page of the series
        !(
          origin.chapterNumber === 0 &&
          origin.pageNumber === 0 &&
          direction === 'before'
        )
      ) {
        this.currentRequests.add(currentRequestKey);
        console.log(
          `Requesting '${direction}' from ${Page.toShortString(origin)}`
        );
        let pageOffset: number | undefined;
        await runInAction(async () => {
          await this.requestAdditionalChapter(store, origin, direction).then(
            () => this.currentRequests.delete(currentRequestKey)
          );

          // Calculate current position before action exits
          pageOffset = target.scrollTop - topPageDiv.offsetTop;
        });
        // Now reset scroll position to the original page
        if (pageOffset == null) {
          throw new Error('weird async shit');
        }
        target.scrollTop = topPageDiv.offsetTop + pageOffset;
        console.log(`Scrolling to ${topPageDiv.offsetTop + pageOffset}`);
      }
      console.log('Already requesting, ignoring request');
    };

    // If we're near the start of our loaded page list, request more pages.
    if (range[0] && this.isNearStart(store, range[0])) {
      maybeAppendChapter('before');
    }

    // If we're near the end of our loaded page list, request more pages.
    if (range[1] && this.isNearEnd(store, range[1])) {
      maybeAppendChapter('after');
    }
  }

  private async requestAdditionalChapter(
    store: PageListStore,
    origin: Page,
    direction: 'before' | 'after'
  ) {
    const chapterNumber =
      direction === 'before'
        ? origin.pageNumber === 0
          ? origin.chapterNumber - 1
          : origin.chapterNumber
        : origin.isLastPage
        ? origin.chapterNumber + 1
        : origin.chapterNumber;
    const chapter = await this.mangaSource.getChapter(
      origin.seriesId,
      chapterNumber
    );
    const pages = await this.mangaSource.getPages(chapter);
    runInAction(() => {
      const filteredPages = pages.filter(
        page => !this.pageKeySet.has(Page.toPageKey(page))
      );
      if (direction === 'before') {
        store.pages.unshift(...filteredPages);
      } else {
        store.pages.push(...filteredPages);
      }
      this.addToPageKeySet(filteredPages);
      console.log(
        'Adding',
        filteredPages.map(p => Page.toShortString(p)).join(',')
      );

      if (store.pages.length > MAX_PAGES) {
        console.log('removing pages');
        // Cull pages from the end if there are too many pages loaded
        const removed =
          direction === 'before'
            ? store.pages.splice(MAX_PAGES)
            : store.pages.splice(0, store.pages.length - MAX_PAGES);
        this.removeFromPageKeySet(removed);
      }
    });
  }

  /**
   * Returns true if the provided PageRef is within the last `bufferDistance` pages.
   */
  private isNearEnd(store: PageListStore, page: Page) {
    for (
      let i = store.pages.length - 1;
      i >= store.pages.length - BUFFER_DISTANCE;
      i--
    ) {
      if (Page.compare(store.pages[i], page)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns true if the provided PageRef is within the first `bufferDistance` pages.
   */
  private isNearStart(store: PageListStore, page: Page) {
    for (let i = 0; i < BUFFER_DISTANCE; i++) {
      if (Page.compare(store.pages[i], page)) {
        return true;
      }
    }
    return false;
  }

  private addToPageKeySet(pages: readonly Page[]) {
    pages
      .map(page => Page.toPageKey(page))
      .forEach(key => this.pageKeySet.add(key));
  }

  private removeFromPageKeySet(pages: readonly Page[]) {
    pages.forEach(p => this.pageKeySet.delete(Page.toPageKey(p)));
  }

  private getCurrentRequestKey(origin: Page, direction: 'before' | 'after') {
    return `${Page.toPageKey(origin)}-${direction}`;
  }
}
