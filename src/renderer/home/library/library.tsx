import { observer } from 'mobx-react';
import React from 'react';
import styles from './library.css';

type Props = {
  loadReader(): void;
};

@observer
export class Library extends React.Component<Props> {
  render() {
    return (
      <div className={styles.library}>
        Library
        <button onClick={this.props.loadReader}>Load reader</button>
      </div>
    )
  }
}
