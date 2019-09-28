import { observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { Page } from '../page_provider/page_provider';
import styles from './page_list.css';
import { PlaceholderPage } from './placeholder_page';

type Props = {
  pages: readonly Page[];
  onMount(): void;
};

export class PageList extends React.Component<Props> {
  private currentPageIndex = 0;

  componentDidMount() {
    this.props.onMount();
  }

  private onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const list = e.target as HTMLDivElement;
    const currentScroll = list.scrollTop;
    // const totalHeight = list.scrollHeight;

    const pageIndex = -1 + [...list.children].findIndex(page => {
      const top = (page as HTMLElement).offsetTop;
      if (top > currentScroll) {
        return true;
      }
      return false;
    });

    if (this.currentPageIndex != pageIndex) {
      console.log(`Now on page ${pageIndex}`);
      this.currentPageIndex = pageIndex;
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
