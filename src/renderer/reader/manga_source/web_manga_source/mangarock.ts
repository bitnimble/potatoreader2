import { Chapter, ChapterData, Page } from 'renderer/reader/manga_types';
import { PageProvider as MangaSource } from 'renderer/reader/page_provider/page_provider';
import { HttpClient } from './network';

const baseUrl = 'https://mangarock.com';
const apiUrl = 'https://api.mangarockhd.com/query/web401';
const lang = 'en';

export class MangaRock extends MangaSource {
  private http: HttpClient = new HttpClient();

  private async getMostPopularManga(): Promise<string> {
    const resp = await this.http.get(`${apiUrl}/mrs_latest`).then(r => r.json());
    const mostPopular = resp.data.filter((manga: any) => manga.rank === 1);
    return mostPopular.oid;
  }

  private async getChapters(oid: string): Promise<Chapter[]> {
    const mangaInfo = await this.http.get(`${apiUrl}/info?oid=${oid}&Country=`).then(r => r.json());
    const chapterData: any[] = mangaInfo.data.chapters;

    chapterData.map((chapter, i) => new Chapter(oid, i, chapter.oid, chapterData[i - 1] || null, chapterData[i + 1] || null)).reverse();
  }

  async getChapter(chapterRef: Chapter): Promise<ChapterData | null> {
    const resp = await this.http.get(`${apiUrl}/${this.getChapterUrl(chapterRef)}`).then(r => r.json());
    const pageUrls: string[] = resp.data.map((page: any) => page.url);

    const chapter: ChapterData = {
      chapterRef,
      pages: [],
    }
    chapter.pages = pageUrls.map((url, i) => new Page(chapter, i, () => this.fetchAndDecodeMri(url)));
    return chapter;
  }

  // Decoding taken from Tachiyomi: https://github.com/inorichi/tachiyomi-extensions/blob/master/src/en/mangarock/src/eu/kanade/tachiyomi/extension/en/mangarock/MangaRock.kt#L264
  private async fetchAndDecodeMri(url: string) {
    const resp = await this.http.get(url);
    const mriBytes = new Uint8Array(await resp.arrayBuffer());
    if (mriBytes[0] !== 69) {
      return '';
    }
    const webpBytes = new Uint8Array(mriBytes.length + 15);
    const size = mriBytes.length + 7;
    // Construct webp header
    webpBytes[0] = 82; // R
    webpBytes[1] = 73; // I
    webpBytes[2] = 70; // F
    webpBytes[3] = 70; // F
    webpBytes[4] = 255 & size;
    webpBytes[5] = size >> 8 & 255;
    webpBytes[6] = size >> 16 & 255;
    webpBytes[7] = size >> 24 & 255;
    webpBytes[8] = 87; // W
    webpBytes[9] = 69; // E
    webpBytes[10] = 66; // B
    webpBytes[11] = 80; // P
    webpBytes[12] = 86; // V
    webpBytes[13] = 80; // P
    webpBytes[14] = 56; // 8

    // Decrypt file content using XOR cipher with 101 as the key
    for (let i = 0; i < mriBytes.length; i++) {
        webpBytes[i + 15] = 101 ^ mriBytes[i];
    }

    // Encode
    const encoded = [];
    for (let i = 0; i < webpBytes.length; i += 32768) {
      encoded.push(String.fromCharCode(...webpBytes.subarray(i, i + 32768)));
    }

    return `data:image/webp;base64,${btoa(encoded.join(''))}`;
  }

  private getChapterUrl(chapterRef: Chapter) {
    return `${chapterRef.seriesId}/${chapterRef.chapterNumber}`;
  }
}
