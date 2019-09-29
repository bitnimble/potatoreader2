import { observer } from 'mobx-react-lite';
import React from 'react';
import { PageRange } from '../page_provider/page_provider';
import { TestPageProvider } from '../page_provider/test_page_provider/test_page_provider';
import { PageList } from './page_list';
import { PageListPresenter, PageListStore } from './page_list_presenter';

export function createPageList() {
  const pageProvider = new TestPageProvider();
  const store = new PageListStore();
  const presenter = new PageListPresenter(pageProvider);

  const onMount = () => presenter.loadPages(store);
  const onViewportPageRangeChange = (range: PageRange) => presenter.onViewportPageRangeChange(store, range);

  return observer(() => (
      <PageList
          viewportPageRange={store.viewportPageRange}
          pages={store.pages}
          onViewportPageRangeChange={onViewportPageRangeChange}
          onMount={onMount}
      />
  ));
}
