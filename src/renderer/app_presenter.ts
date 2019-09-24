import { action, observable } from 'mobx';

export class AppStore {
  @observable.ref
  currentPage: 'home' | 'viewer' = 'home';
}

export class AppPresenter {
  @action
  changePage(store: AppStore) {
    if (store.currentPage === 'home') {
      store.currentPage = 'viewer';
    } else {
      store.currentPage = 'home';
    }
  }
}
