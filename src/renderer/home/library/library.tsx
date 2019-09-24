import { observer } from 'mobx-react';
import React from 'react';
import styles from './library.css';

@observer
export class Library extends React.Component {
  render() {
    return (
      <div className={styles.library}>
        Library
      </div>
    )
  }
}
