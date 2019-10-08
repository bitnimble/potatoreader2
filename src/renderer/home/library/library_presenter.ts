import { observable, runInAction } from "mobx";
import { MangaSourceId, MangaSources } from "renderer/reader/manga_source/manga_sources";
import { Series } from "renderer/reader/manga_types";

export class LibraryStore {
  @observable.shallow
  series?: Series[];

  @observable.ref
  mangaSourceId: MangaSourceId = MangaSourceId.MANGAROCK;
}

export class LibraryPresenter{
  private getMangaSource(store: LibraryStore) {
    return MangaSources[store.mangaSourceId];
  }

  loadSeries = async (store: LibraryStore) => {
    const source = this.getMangaSource(store);
    const series = await source.getMostPopularSeries();
    runInAction(() => store.series = series);
  }
}
