import { action, observable, runInAction } from 'mobx';
import { PageData, PageProvider, PageRange, PageRef } from '../page_provider/page_provider';

export class PageListStore {
  @observable.ref
  viewportPageRange: PageRange = [null, null];

  /** Buffer distance, in pages */
  @observable.ref
  bufferDistance: number = 2;

  @observable.shallow
  pages: readonly PageData[] = [];
}

export class PageListPresenter {
  constructor(private readonly pageProvider: PageProvider) { }

  async loadPages(store: PageListStore) {
    const pages = await this.pageProvider.getPages([
      { seriesId: 'test-series', chapterNumber: 0, pageNumber: 0 },
      { seriesId: 'test-series', chapterNumber: 0, pageNumber: 10 },
    ]);
    runInAction(() => store.pages = pages);
  }

  @action
  onViewportPageRangeChange(store: PageListStore, range: PageRange) {
    store.viewportPageRange = range;
    console.log(`Now viewing pages ${PageRef.toShortString(range[0])}-${PageRef.toShortString(range[1])}`);
  }
}
