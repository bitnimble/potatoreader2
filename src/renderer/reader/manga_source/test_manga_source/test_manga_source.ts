import { Chapter, Page } from '../../manga_types';
import { MangaSource } from '../manga_source';

const CHAPTER_COUNT = 10;
const CHAPTER_PAGE_COUNT = 30;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export class TestMangaSource extends MangaSource {
  async getMostPopularSeries() {
    return [
      { id: '1', name: 'Test Series 1', description: 'Magical beasts foo' },
      { id: '2', name: 'Test Series 2', description: 'Magical yoghurt foo' },
    ];
  }

  protected async requestChapters(id: string) {
    return Array(CHAPTER_COUNT).fill(0).map((_, i) => new Chapter(
      id,
      i,
      `/chapter-${i}`,
    ));
  }

  async getPages(chapter: Chapter) {
    if (chapter.chapterNumber < 0) {
      throw new Error('[TestPageProvider] cannot retrieve chapter before chapter 0');
    }

    // Simulate loading time
    await delay(1000);

    return Array(CHAPTER_PAGE_COUNT).fill(0).map((_, i) => new Page(
      chapter,
      i,
      i === CHAPTER_PAGE_COUNT - 1,
      () => this.createPage(chapter, i),
    ));
  }

  private async createPage(chapterRef: Chapter, pageNumber: number): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error("couldn't retrieve canvas context");
    }
    ctx.font = '16px serif';
    ctx.fillStyle = 'blue';
    ctx.fillText(`Chapter ${chapterRef.chapterNumber}, page ${pageNumber}`, 30, 30);

    const uri = canvas.toDataURL('image/png');

    // Simulate loading time
    await delay(1000);
    return uri;
  }
}
