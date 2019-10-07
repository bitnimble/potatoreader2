import { MangaSource } from "./manga_source";
import { TestPageProvider } from "./test_page_provider/test_page_provider";
import { MangaRock } from "./web_manga_source/mangarock";

export enum MangaSourceId {
  TEST,
  MANGAROCK,
}

export const MangaSources: Record<MangaSourceId, MangaSource> = {
  [MangaSourceId.TEST]: new TestPageProvider(),
  [MangaSourceId.MANGAROCK]: new MangaRock(),
};
