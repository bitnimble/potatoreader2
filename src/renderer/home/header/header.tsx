import { observer } from 'mobx-react';
import React from 'react';
import styles from './header.css';

@observer
export class Header extends React.Component {
  render() {
    return (
      <div className={styles.header}>
        Header
      </div>
    );
  }
}
