import React from 'react';
import { installHeader } from './header/install';
import { installLibrary } from './library/install';
import { HomeSkeleton, HomeSkeletonView } from './skeleton/home_skeleton';

export function createHome({
  loadReader,
}: {
  loadReader(): void,
}) {
  const skeleton = new HomeSkeleton();

  installHeader(skeleton);
  installLibrary(skeleton);

  return React.memo(() => <HomeSkeletonView skeleton={skeleton} loadReader={loadReader}/>);
}
