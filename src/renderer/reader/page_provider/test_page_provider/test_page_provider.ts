import {
  ChapterData,
  ChapterRef,
  PageData,
  PageProvider,
  PageRange,
  PageRef,
} from '../page_provider';

const CHAPTER_PAGE_COUNT = 30;

export class TestPageProvider extends PageProvider {
  async getPageRange(range: PageRange): Promise<readonly PageData[]> {
    const pageRefs = await this.expandPageRange(range);
    return pageRefs.map(pageRef => this.createPage(pageRef));
  }

  async getChapter(chapterRef: ChapterRef): Promise<ChapterData> {
    // Lookup chapter in the cache first
    const cached = this.chapterCache.get(ChapterRef.toChapterKey(chapterRef));
    if (cached) {
      return cached;
    }

    // Otherwise, return something generic with CHAPTER_PAGE_COUNT pages
    return {
      chapterRef,
      pages: Array(CHAPTER_PAGE_COUNT).fill(0).map((_, i) => new PageRef(chapterRef.seriesId, chapterRef.chapterNumber, i)),
    };
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
