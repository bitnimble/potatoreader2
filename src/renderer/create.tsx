import { observer } from 'mobx-react';
import React from 'react';
import { AppPresenter, AppStore } from './app_presenter';
import { createHome } from './home/create';
import { createReader } from './reader/create';
import { MangaSourceId, MangaSources } from './reader/manga_source/manga_sources';

export function createApp() {
  const store = new AppStore();
  const presenter = new AppPresenter();
  
  const loadReader = (sourceId: MangaSourceId, seriesId: string) => {
    const source = MangaSources[sourceId];
    const Reader = createReader(source, seriesId);
    presenter.setContent(store, Reader);
  };

  const Home = createHome({
    loadReader,
  });
  presenter.setContent(store, Home);
  
  return observer(() => {
    return store.Content ? <store.Content/> : null;
  });
}
