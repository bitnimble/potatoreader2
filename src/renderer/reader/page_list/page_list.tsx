import { observable, runInAction, computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { Page } from '../manga_types';
import styles from './page_list.css';
import { PlaceholderPage } from './placeholder_page';

type Props = {
  pages: readonly Page[];
  topPage?: Page;
  onListScroll(e: React.UIEvent<HTMLDivElement>): void;
  onMount(): void;
};

@observer
export class PageList extends React.Component<Props> {
  componentDidMount() {
    this.props.onMount();
  }

  render() {
    const { pages, topPage } = this.props;
    console.log('rendering page list');

    return (
      <div className={styles.pageList} onScroll={this.props.onListScroll}>
        <div className={styles.debugPanel}>
          {topPage && 'Current page: ' + Page.toShortString(topPage)}
          <br></br>
          {Page.toShortString(pages[0])}
          <br></br>
          {Page.toShortString(pages[pages.length - 1])}
        </div>
        {pages.map(page => (
          <PageView key={Page.toPageKey(page)} page={page}/>
        ))}
      </div>
    );
  }
}

type PageViewProps = {
  page: Page;
};

@observer
class PageView extends React.Component<PageViewProps> {
  @observable.ref
  private imageUri?: string;

  async componentDidMount() {
    const { page } = this.props;

    // Resolve the page
    const image = await page.loadImage();
    runInAction(() => this.imageUri = image);
  }

  render() {
    return (
      <div className={styles.pageView}>
        {this.imageUri == null
            ? <PlaceholderPage/>
            : <img src={this.imageUri}/>
        }
      </div>
    )
  }
}
