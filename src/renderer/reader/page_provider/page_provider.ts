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
  abstract getChapter(chapter: ChapterRef): Promise<ChapterData>;

  /**
   * Takes a starting PageRef and a number of additional pages to request, and expands it into a full
   * array of PageRefs for each page in the range.
   * @param origin
   * @param morePageCount
   */
  async getMorePages(origin: PageRef, morePageCount: number): Promise<readonly PageRef[]> {
    const pages = [];
    let currentPage: PageRef = origin;
    for (let i = 0; i < morePageCount; i++) {
      currentPage = await this.getNextPageRef(currentPage);
      pages.push(currentPage);
    }
    return pages;
  }

  /**
   * Takes a PageRange and expands it into a full array of PageRefs, for each
   * page in the range.
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
      currentPage = await this.getNextPageRef(currentPage);
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
  private async getNextPageRef(p: PageRef): Promise<PageRef> {
    // If the pageRef overflows, move to the next chapter
    const chapter = await this.getChapter(ChapterRef.fromPageRef(p));
    if (p.pageNumber + 1 >= chapter.pages.length) {
      return new PageRef(p.seriesId, p.chapterNumber + 1, 0);
    }
    return PageRef.addPages(p, 1);
  }
}
