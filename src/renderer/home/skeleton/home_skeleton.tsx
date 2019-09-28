import { observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import styles from './home_skeleton.css';

export class HomeSkeleton {
  @observable.ref
  Header?: React.ComponentType;

  Library?: React.ComponentType<{ loadReader(): void }>;
}

type Props = {
  skeleton: HomeSkeleton;
  loadReader(): void;
};

@observer
export class HomeSkeletonView extends React.Component<Props> {
  render() {
    const { Header, Library } = this.props.skeleton;

    return (
      <div className={styles.home}>
        {Header && <Header/>}
        {Library && <Library loadReader={this.props.loadReader}/>}
      </div>
    );
  }
}
