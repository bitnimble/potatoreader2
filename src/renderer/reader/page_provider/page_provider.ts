// Page ranges are inclusive lower, exclusive upper.
// Both [N, N] and [N, N+1] will return page [N].
export type PageRange = [number, number];
export type Page = {
  // Returns an image URI
  loadImage(): Promise<string>;
};

export interface PageProvider {
  getPages(range: PageRange): Promise<readonly Page[]>;
}
