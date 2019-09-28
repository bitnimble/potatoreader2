import { observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { Page } from '../page_provider/page_provider';
import styles from './page_list.css';
import { PlaceholderPage } from './placeholder_page';

type Props = {
  currentPageIndex: number;
  pages: readonly Page[];
  onCurrentPageChange(pageIndex: number): void;
  onMount(): void;
};

@observer
export class PageList extends React.Component<Props> {
  componentDidMount() {
    this.props.onMount();
  }

  private onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { currentPageIndex, onCurrentPageChange } = this.props;
    const list = e.target as HTMLDivElement;
    const currentScroll = list.scrollTop;

    const pageIndex = -1 + [...list.children].findIndex(page => {
      const top = (page as HTMLElement).offsetTop;
      if (top > currentScroll) {
        return true;
      }
      return false;
    });

    if (currentPageIndex != pageIndex) {
      console.log(`Now on page ${pageIndex}`);
      onCurrentPageChange(pageIndex);
    }
  }

  render() {
    const { pages } = this.props;

    return (
      <div className={styles.pageList} onScroll={this.onScroll}>
        {pages.map((page, i) => (
          <PageView key={i} page={page}/>
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
