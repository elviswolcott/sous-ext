import { Store } from 'webext-redux';
import { countSelector } from './store';

const proxyStore = new Store();

proxyStore.ready().then(() => {
  proxyStore.subscribe(() => {
    const state = proxyStore.getState();
    const count = countSelector(state);
    console.log(count);
  });
});