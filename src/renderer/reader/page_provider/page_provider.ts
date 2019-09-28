export type PageRange = [number, number];
export type Page = {
  // Returns an image URI
  loadImage(): Promise<string>;
};

export interface PageProvider {
  getPages(range: PageRange): Promise<readonly Page[]>;
}
