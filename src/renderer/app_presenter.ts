import { action, observable } from 'mobx';

type Page = 'home' | 'reader';

export class AppStore {
  @observable.ref
  activePage: Page = 'home';
}

export class AppPresenter {
  @action
  setActivePage(store: AppStore, page: Page) {
    store.activePage = page;
  }
}
