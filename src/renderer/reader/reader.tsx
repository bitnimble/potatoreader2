import { observer } from 'mobx-react';
import React from 'react';

type Props = {
  PageList: React.ComponentType;
};

@observer
export class Reader extends React.Component<Props> {
  render() {
    return (
      <div>
        <this.props.PageList/>
      </div>
    )
  }
}
