import { action, observable } from 'mobx';

export class AppStore {
  @observable.ref Content?: React.ComponentType;
}

export class AppPresenter {
  @action
  setContent(store: AppStore, Content: React.ComponentType) {
    store.Content = Content;
  }
}
