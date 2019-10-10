import { observer } from 'mobx-react-lite';
import React from 'react';
import { PageList } from './page_list';
import { PageListPresenter, PageListStore } from './page_list_presenter';
import { MangaSource } from '../manga_source/manga_source';

export function createPageList(source: MangaSource, seriesId: string) {
  const store = new PageListStore();
  const presenter = new PageListPresenter(source);

  const onMount = () => presenter.loadPages(store, seriesId);
  const onScroll = (e: React.UIEvent<HTMLDivElement>) =>
    presenter.onScroll(store, e);

  return observer(() => (
    <PageList
      pages={store.pages}
      topPage={store.topPage}
      onListScroll={onScroll}
      onMount={onMount}
    />
  ));
}
