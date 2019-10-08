import { runInAction } from 'mobx';
import { HomeSkeleton } from '../skeleton/home_skeleton';
import { Library } from './library';
import { LibraryStore, LibraryPresenter } from './library_presenter';
import { observer } from 'mobx-react';
import { MangaSourceId } from 'renderer/reader/manga_source/manga_sources';
import React from 'react';

export function installLibrary({
  skeleton,
  loadReader,
}: {
  skeleton: HomeSkeleton;
  loadReader(sourceId: MangaSourceId, seriesId: string): void;
}) {
  const store = new LibraryStore();
  const presenter = new LibraryPresenter();
  
  const onMount = () => presenter.loadSeries(store);
  const loadSeries = (seriesId: string) => loadReader(store.mangaSourceId, seriesId);

  const LibraryImpl = observer(() => (
    <Library
        onMount={onMount}
        series={store.series}
        loadSeries={loadSeries}
    />
  ));

  runInAction(() => skeleton.Library = LibraryImpl);
}
