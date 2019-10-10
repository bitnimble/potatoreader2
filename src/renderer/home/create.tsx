import React from 'react';
import { installHeader } from './header/install';
import { installLibrary } from './library/install';
import { HomeSkeleton, HomeSkeletonView } from './skeleton/home_skeleton';
import { MangaSourceId } from 'renderer/reader/manga_source/manga_sources';

export function createHome({
  loadReader,
}: {
  loadReader(sourceId: MangaSourceId, seriesId: string): void;
}) {
  const skeleton = new HomeSkeleton();

  installHeader(skeleton);
  installLibrary({ skeleton, loadReader });

  return React.memo(() => (
    <HomeSkeletonView skeleton={skeleton} loadReader={loadReader} />
  ));
}
