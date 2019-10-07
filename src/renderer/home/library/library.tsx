import { observer } from 'mobx-react';
import React from 'react';
import styles from './library.css';
import { MangaSourceId } from 'renderer/reader/manga_source/manga_sources';

type Props = {
  loadReader(sourceId: MangaSourceId, seriesId: string): void
};

@observer
export class Library extends React.Component<Props> {
  private onSeriesClick = () => {
    this.props.loadReader(MangaSourceId.MANGAROCK, 'mrs-serie-108915');
  };

  render() {
    return (
      <div className={styles.library}>
        Library
        <button onClick={this.onSeriesClick}>Load reader</button>
      </div>
    )
  }
}
