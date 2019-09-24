import React from 'react';
import { HomeSkeleton, HomeSkeletonView } from './skeleton/home_skeleton';
import { installHeader } from './header/install';
import { installLibrary } from './library/install';

export function createHome() {
  const skeleton = new HomeSkeleton();

  installHeader(skeleton);
  installLibrary(skeleton);

  return React.memo(() => <HomeSkeletonView skeleton={skeleton}/>);
}
