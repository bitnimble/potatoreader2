import { runInAction } from 'mobx';
import { HomeSkeleton } from '../skeleton/home_skeleton';
import { Library } from './library';

export function installLibrary(skeleton: HomeSkeleton) {
  runInAction(() => skeleton.Library = Library);
}
