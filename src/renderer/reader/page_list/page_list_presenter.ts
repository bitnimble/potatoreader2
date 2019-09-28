import { observable, runInAction } from 'mobx';
import { Page, PageProvider } from '../page_provider/page_provider';

export class PageListStore {
  /** Buffer distance, in pages */
  @observable.ref
  bufferDistance: number = 2;

  @observable.shallow
  pages: readonly Page[] = [];
}

export class PageListPresenter {
  constructor(private readonly pageProvider: PageProvider) { }

  async loadPages(store: PageListStore) {
    const pages = await this.pageProvider.getPages([0, store.bufferDistance]);
    runInAction(() => store.pages = pages);
  }
}
