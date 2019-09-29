export class PageRef {
  constructor(
    readonly seriesId: string,
    readonly chapterNumber: number, // zero-based index
    readonly pageNumber: number, // zero-based index
  ) { }
}

/**
 * Some static helper methods that are useful when handling PageRefs.
 */
export namespace PageRef {
  export function compare(p1: PageRef | null, p2: PageRef | null): boolean {
    if (p1 == null && p2 == null) {
      return true;
    }
    if (p1 != null && p2 != null
       && p1.seriesId === p2.seriesId
       && p1.chapterNumber === p2.chapterNumber
       && p1.pageNumber === p2.pageNumber
    ) {
      return true;
    }
    return false;
  }

  export function addPages(p: PageRef, pageCount: number): PageRef {
    return {
      seriesId: p.seriesId,
      chapterNumber: p.chapterNumber,
      pageNumber: p.pageNumber + pageCount,
    };
  }

  export function toShortString(p: PageRef | null) {
    if (!p) {
      return 'nullPage';
    }
    return `${p.chapterNumber}:${p.pageNumber}`;
  }

  export function toPageKey(p: PageRef) {
    return `${p.seriesId}-${p.chapterNumber}-${p.pageNumber}`;
  }
}

// Page ranges are inclusive lower, exclusive upper.
// Both [N, N] and [N, N+1] will return page [N].
export type PageRange = [PageRef | null, PageRef | null];
export namespace PageRange {
  export const compare = (p1: PageRange, p2: PageRange) => {
    if (PageRef.compare(p1[0], p2[0]) && PageRef.compare(p1[1], p2[1])) {
      return true;
    }
    return false;
  }
}

export type PageData = {
  pageRef: PageRef;
  // Returns an image URI
  loadImage(): Promise<string>;
};

export class ChapterRef {
  constructor(
    readonly seriesId: string,
    readonly chapterNumber: number, // zero-based index
    // TODO: chapter title, etc
  ) { }
}

export namespace ChapterRef {
  export function fromPageRef(p: PageRef) {
    return new ChapterRef(p.seriesId, p.chapterNumber);
  }

  export function toChapterKey(c: ChapterRef) {
    return `${c.seriesId}-${c.chapterNumber}`;
  }
}

export type ChapterData = {
  chapterRef: ChapterRef;
  pages: readonly PageRef[];
};

const PAGE_REQUEST_LIMIT = 100;

export abstract class PageProvider {
  // Map from chapter key to ChapterData
  protected chapterCache: Map<string, ChapterData> = new Map();

  abstract getPages(pages: readonly PageRef[]): Promise<readonly PageData[]>;
  abstract getChapter(chapter: ChapterRef): Promise<ChapterData | null>;

  /**
   * Takes a starting PageRef and a number of additional pages to request, and expands it into a full
   * array of PageRefs for each page in the range.
   *
   * Requesting a negative number of pages will return pages before `origin`.
   * @param origin
   * @param morePageCount
   */
  async getMorePages(origin: PageRef, morePageCount: number): Promise<readonly PageRef[]> {
    const pages = [];
    let currentPage: PageRef = origin;

    if (morePageCount > 0) {
      for (let i = 0; i < morePageCount; i++) {
        const nextPage = await this.getNextPageRef(currentPage);
        if (!nextPage) {
          // No more pages.
          break;
        }
        currentPage = nextPage;
        pages.push(currentPage);
      }
    } else {
      for (let i = 0; i > morePageCount; i--) {
        const previousPage = await this.getPreviousPageRef(currentPage);
        if (!previousPage) {
          // No more pages.
          break;
        }
        currentPage = previousPage;
        pages.push(currentPage);
      }
    }
    return pages;
  }

  /**
   * Takes a PageRange and expands it into a full array of PageRefs, for each
   * page in the range.
   *
   * This function requires that range[0] comes before range[1].
   */
  async expandPageRange(range: PageRange): Promise<PageRef[]> {
    const pages = [];
    const firstPage = range[0] || new PageRef('', 0, 0);
    // Default to 10 pages past the first page if a null ending page was provided
    const lastPage = range[1] || PageRef.addPages(firstPage, 10);

    let currentPage: PageRef = firstPage;
    let pageCount = 0;
    while (!PageRef.compare(currentPage, lastPage)) {
      pages.push(currentPage);
      const nextPage = await this.getNextPageRef(currentPage);
      if (!nextPage) {
        // No more pages.
        break;
      }
      currentPage = nextPage;
      console.log(`Expanding page ${PageRef.toShortString(currentPage)}`);

      // Safeguard against accidentally requesting too many pages (e.g. passing invalid PageRanges)
      pageCount++;
      if (pageCount > PAGE_REQUEST_LIMIT) {
        throw new Error('requested too many pages');
      }
    }

    return pages;
  }

  async getPageRange(range: PageRange): Promise<readonly PageData[]> {
    const pages = await this.expandPageRange(range);
    return this.getPages(pages);
  }

  /**
   * Increments a PageRef, resolving to the next chapter if there are no more pages in the current
   * chapter.
   */
  private async getNextPageRef(p: PageRef): Promise<PageRef | null> {
    // If the pageRef overflows, move to the next chapter
    const chapter = await this.getChapter(ChapterRef.fromPageRef(p));
    if (!chapter) {
      return null;
    }
    if (p.pageNumber + 1 >= chapter.pages.length) {
      // Check if the next chapter exists
      const nextChapter = await this.getChapter(new ChapterRef(p.seriesId, p.chapterNumber + 1));
      if (nextChapter) {
        return new PageRef(p.seriesId, p.chapterNumber + 1, 0);
      }
    }
    return PageRef.addPages(p, 1);
  }

  /**
   * Decrements a PageRef, resolving to the previous chapter if the specified page is the first page.
   */
  private async getPreviousPageRef(p: PageRef): Promise<PageRef | null> {
    if (p.pageNumber === 0) {
      // There are no chapters before the first one.
      if (p.chapterNumber === 0) {
        return null;
      }

      const previousChapter = await this.getChapter(new ChapterRef(p.seriesId, p.chapterNumber - 1));
      if (!previousChapter) {
        return null;
      }
      return new PageRef(p.seriesId, p.chapterNumber - 1, previousChapter.pages.length - 1);
    }
    return PageRef.addPages(p, -1);
  }
}
