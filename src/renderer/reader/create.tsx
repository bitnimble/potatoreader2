import React from 'react';
import { createPageList } from './page_list/create';
import { TestPageProvider } from './page_provider/test_page_provider/test_page_provider';
import { Reader } from './reader';
import { ReaderPresenter, ReaderStore } from './reader_presenter';

export function createReader() {
  const pageProvider = new TestPageProvider();

  const store = new ReaderStore();
  const presenter = new ReaderPresenter();

  const PageList = createPageList();

  return React.memo(() => <Reader PageList={PageList}/>);
}
