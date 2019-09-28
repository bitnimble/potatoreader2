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
  componentDidMount() {
    this.props.onMount();
  }

  render() {
    const { pages } = this.props;

    return (
      <div className={styles.pageList}>
        {pages.map((page, i) => (
          <PageView page={page}/>
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
