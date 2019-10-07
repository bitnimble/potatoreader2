import { observer } from 'mobx-react-lite';
import React from 'react';
import { PageList } from './page_list';
import { PageListPresenter, PageListStore } from './page_list_presenter';
import { MangaRock } from '../manga_source/web_manga_source/mangarock';
import { TestPageProvider } from '../manga_source/test_page_provider/test_page_provider';

export function createPageList() {
  const mangaSource = new MangaRock();
  // const mangaSource = new TestPageProvider();
  const store = new PageListStore();
  const presenter = new PageListPresenter(mangaSource);

  const onMount = () => presenter.loadPages(store);
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => presenter.onScroll(store, e);

  return observer(() => (
      <PageList
          pages={store.pages}
          topPage={store.topPage}
          onListScroll={onScroll}
          onMount={onMount}
      />
  ));
}
