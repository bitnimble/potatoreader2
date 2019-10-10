import { runInAction } from 'mobx';
import { HomeSkeleton } from '../skeleton/home_skeleton';
import { Header } from './header';

export function installHeader(skeleton: HomeSkeleton) {
  runInAction(() => (skeleton.Header = Header));
}
