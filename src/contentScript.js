import { Store } from 'webext-redux';
import { detector } from './recipes';
import { setIcon, requestId } from './extensionUtils';

const main = (proxyStore) => () => {
  const recipeFound = detector.find(document);
  console.log(recipeFound);
  if (recipeFound) {
    setIcon('active', 'content_script');
  }
};

// guard against double injections
if (window._SOUS_CONTENT_SCRIPT_INJECTED !== true) {
  const proxyStore = new Store();
  window._SOUS_CONTENT_SCRIPT_INJECTED = true;
  requestId();
  proxyStore.ready().then(main(proxyStore));
}
