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

export interface PageProvider {
  getPages(range: PageRange): Promise<readonly PageData[]>;
}
