import { observer } from 'mobx-react';
import React from 'react';
import { AppPresenter, AppStore } from './app_presenter';
import { createHome } from './home/create';
import { createViewer } from './viewer/create';

export function createApp() {
  const store = new AppStore();
  const presenter = new AppPresenter();

  const changePage = () => presenter.changePage(store);

  const Home = createHome();
  const Viewer = createViewer();

  return observer(() => {
    const Content = store.currentPage === 'home' ? Home : Viewer;
    return <Content/>;
  });
}
