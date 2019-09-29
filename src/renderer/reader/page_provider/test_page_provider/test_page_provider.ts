import { PageData, PageProvider, PageRange, PageRef } from '../page_provider';

export class TestPageProvider implements PageProvider {
  async getPages(range: PageRange): Promise<readonly PageData[]> {
    const pageRefs = this.expandPageRange(range);
    return pageRefs.map(pageRef => this.createPage(pageRef));
  }

  /**
   * Takes a PageRange and expands it into a full array of PageRefs, for each
   * page in the range.
   */
  private expandPageRange(range: PageRange): PageRef[] {
    const pages = [];
    const firstPage = range[0] || new PageRef('', 0, 0);
    // Default to 10 pages past the first page if a null ending page was provided
    const lastPage = range[1] || PageRef.addPages(firstPage, 10);

    let currentPage = firstPage;
    let pageCount = 0;
    while (!PageRef.compare(currentPage, lastPage)) {
      pages.push(currentPage);
      // Increment page, moving to the next chapter if the pageNumber >= 30
      currentPage = PageRef.addPages(currentPage, 1);
      if (currentPage.pageNumber >= 30) {
        currentPage = new PageRef(currentPage.seriesId, currentPage.chapterNumber + 1, 0);
      }
      console.log(`Expanding page ${PageRef.toShortString(currentPage)}`);
      pageCount++;
      if (pageCount > 100) {
        throw new Error('requested too many pages');
      }
    }

    return pages;
  }

  private createPage(pageRef: PageRef): PageData {
    const loadImage = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error("couldn't retrieve canvas context");
      }
      ctx.font = '16px serif';
      ctx.fillStyle = 'blue';
      ctx.fillText(`Chapter ${pageRef.chapterNumber}, page ${pageRef.pageNumber}`, 30, 30);

      const uri = canvas.toDataURL('image/png');

      // Simulate loading time
      return new Promise<string>(res => {
        setTimeout(() => res(uri), 2000)
      });
    };

    return {
      pageRef,
      loadImage,
    };
  }
}
