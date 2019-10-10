import { Chapter, Page, Series } from '../manga_types';

export abstract class MangaSource {
  // Map from series ID to chapters
  protected chapterCache: Map<string, Chapter[]> = new Map();

  abstract getMostPopularSeries(): Promise<Series[]>;
  abstract getPages(chapter: Chapter): Promise<Page[]>;
  protected abstract requestChapters(id: string): Promise<Chapter[]>;

  async getChapters(id: string): Promise<Chapter[]> {
    const cached = this.chapterCache.get(id);
    if (cached) {
      return cached;
    }
    const chapters = await this.requestChapters(id);
    this.chapterCache.set(id, chapters);
    return chapters;
  }

  async getChapter(seriesId: string, chapterNumber: number) {
    const chapters = await this.getChapters(seriesId);
    const chapter = chapters[chapterNumber];
    if (chapter == null) {
      throw new Error(
        `Found invalid chapter number ${chapterNumber} for series ${seriesId}`
      );
    }
    return chapter;
  }
}
