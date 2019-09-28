import { observer } from 'mobx-react';
import React from 'react';
import { AppPresenter, AppStore } from './app_presenter';
import { createHome } from './home/create';
import { createReader } from './reader/create';

export function createApp() {
  const store = new AppStore();
  const presenter = new AppPresenter();

  const loadReader = () => presenter.setActivePage(store, 'reader');

  const Home = createHome({
    loadReader,
  });
  const Reader = createReader();

  return observer(() => {
    const Content = store.activePage === 'home' ? Home : Reader;
    return <Content/>;
  });
}
