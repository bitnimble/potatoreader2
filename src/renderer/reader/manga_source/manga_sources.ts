import { MangaSource } from "./manga_source";
import { TestMangaSource } from "./test_manga_source/test_manga_source";
import { MangaRock } from "./web_manga_source/mangarock";

export enum MangaSourceId {
  TEST,
  MANGAROCK,
}

export const MangaSources: Record<MangaSourceId, MangaSource> = {
  [MangaSourceId.TEST]: new TestMangaSource(),
  [MangaSourceId.MANGAROCK]: new MangaRock(),
};
