import { observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { PageData, PageRef } from '../page_provider/page_provider';
import styles from './page_list.css';
import { PlaceholderPage } from './placeholder_page';

type Props = {
  pages: readonly PageData[];
  onListScroll(e: React.UIEvent<HTMLDivElement>): void;
  onMount(): void;
};

@observer
export class PageList extends React.Component<Props> {
  componentDidMount() {
    this.props.onMount();
  }

  render() {
    const { pages } = this.props;
    console.log('rendering page list');

    return (
      <div className={styles.pageList} onScroll={this.props.onListScroll}>
        {pages.map(page => (
          <PageView key={PageRef.toPageKey(page.pageRef)} page={page}/>
        ))}
      </div>
    );
  }
}

type PageViewProps = {
  page: PageData;
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
