import { observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import styles from './home_skeleton.css';

export class HomeSkeleton {
  @observable.ref
  Header?: React.ComponentType;

  Library?: React.ComponentType;
}

@observer
export class HomeSkeletonView extends React.Component<{ skeleton: HomeSkeleton }> {
  render() {
    const { Header, Library } = this.props.skeleton;

    return (
      <div className={styles.home}>
        {Header && <Header/>}
        {Library && <Library/>}
      </div>
    );
  }
}
