import React from 'react';
import { createPageList } from './page_list/create';
import { Reader } from './reader';
import { ReaderPresenter, ReaderStore } from './reader_presenter';

export function createReader() {
  const store = new ReaderStore();
  const presenter = new ReaderPresenter();

  const PageList = createPageList();

  return React.memo(() => <Reader PageList={PageList}/>);
}
