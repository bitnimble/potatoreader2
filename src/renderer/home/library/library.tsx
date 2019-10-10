import { observer } from 'mobx-react';
import React from 'react';
import styles from './library.css';
import { Series } from 'renderer/reader/manga_types';

type LibraryProps = {
  series?: Series[];
  loadSeries(seriesId: string): void;
  onMount(): void;
};

type SeriesCardProps = {
  series: Series;
  loadSeries(seriesId: string): void;
};

@observer
export class Library extends React.Component<LibraryProps> {
  componentDidMount() {
    this.props.onMount();
  }

  private SeriesLoadingPlaceholder() {
    return <div>Loading series...</div>;
  }

  render() {
    const { series, loadSeries } = this.props;

    return (
      <div className={styles.library}>
        {!!series ? (
          <div className={styles.seriesCards}>
            {series.map(s => (
              <SeriesCard key={s.id} series={s} loadSeries={loadSeries} />
            ))}
          </div>
        ) : (
          <this.SeriesLoadingPlaceholder />
        )}
      </div>
    );
  }
}

@observer
class SeriesCard extends React.Component<SeriesCardProps> {
  private onClick = () => {
    this.props.loadSeries(this.props.series.id);
  };

  render() {
    const { series } = this.props;

    return (
      <div className={styles.seriesCard} onClick={this.onClick}>
        <img className={styles.seriesCardThumbnail} src={series.thumbnail} />
        <span>{series.name}</span>
      </div>
    );
  }
}
