export class Page {
  constructor(
    readonly chapter: Chapter,
    readonly pageNumber: number, // zero-based index
    readonly isLastPage: boolean,
    readonly loadImage: () => Promise<string>, // function which returns a URI to display
  ) { }

  get seriesId() {
    return this.chapter.seriesId;
  }

  get chapterNumber() {
    return this.chapter.chapterNumber;
  }
}

/**
 * Some static helper methods that are useful when handling PageRefs.
 */
export namespace Page {
  export function compare(p1: Page | null, p2: Page | null): boolean {
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

  export function toShortString(p: Page | null) {
    if (!p) {
      return 'nullPage';
    }
    return `${p.chapterNumber}:${p.pageNumber}`;
  }

  export function toPageKey(p: Page) {
    return `${p.seriesId}-${p.chapterNumber}-${p.pageNumber}`;
  }
}

// Page ranges are inclusive lower, exclusive upper.
// Both [N, N] and [N, N+1] will return page [N].
export type PageRange = [Page, Page];
export namespace PageRange {
  export const compare = (p1: PageRange, p2: PageRange) => {
    if (Page.compare(p1[0], p2[0]) && Page.compare(p1[1], p2[1])) {
      return true;
    }
    return false;
  }
}

export class Chapter {
  constructor(
    readonly seriesId: string,
    readonly chapterNumber: number, // zero-based index
    readonly chapterUrl: string,
    // TODO: chapter title, etc
  ) { }
}

export namespace Chapter {
  export function toChapterKey(c: Chapter) {
    return `${c.seriesId}-${c.chapterNumber}`;
  }
}

export type Series = {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
};
