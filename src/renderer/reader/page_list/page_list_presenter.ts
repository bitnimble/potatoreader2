import { action, observable, runInAction } from 'mobx';
import { Page, PageProvider } from '../page_provider/page_provider';

export class PageListStore {
  @observable.ref
  currentPageIndex: number = 0;

  /** Buffer distance, in pages */
  @observable.ref
  bufferDistance: number = 2;

  @observable.shallow
  pages: readonly Page[] = [];
}

export class PageListPresenter {
  constructor(private readonly pageProvider: PageProvider) { }

  async loadPages(store: PageListStore) {
    const pages = await this.pageProvider.getPages([0, 10]);
    runInAction(() => store.pages = pages);
  }

  @action
  onCurrentPageChange(store: PageListStore, pageIndex: number) {
    store.currentPageIndex = pageIndex;
  }
}
