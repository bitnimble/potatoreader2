import { observer } from 'mobx-react-lite';
import React from 'react';
import { TestPageProvider } from '../page_provider/test_page_provider/test_page_provider';
import { PageList } from './page_list';
import { PageListPresenter, PageListStore } from './page_list_presenter';

export function createPageList() {
  const pageProvider = new TestPageProvider();
  const store = new PageListStore();
  const presenter = new PageListPresenter(pageProvider);

  const onMount = () => presenter.loadPages(store);

  return observer(() => (
      <PageList pages={store.pages} onMount={onMount} />
  ));
}
