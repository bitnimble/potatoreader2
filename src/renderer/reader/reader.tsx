import { observer } from 'mobx-react';
import React from 'react';
import styles from './reader.css';

type Props = {
  PageList: React.ComponentType;
};

@observer
export class Reader extends React.Component<Props> {
  render() {
    return (
      <div className={styles.reader}>
        <this.props.PageList />
      </div>
    );
  }
}
