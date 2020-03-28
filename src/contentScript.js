import { Store } from "webext-redux";
import { detector } from "./recipes";
import { requestId } from "./extensionUtils";
import { sousActive } from "./store/slices/browser";

const main = (proxyStore, tabId) => () => {
  const recipeFound = detector.find(document);
  if (recipeFound) {
    proxyStore.dispatch(sousActive(tabId));
  }
};

// guard against double injections
if (window._SOUS_CONTENT_SCRIPT_INJECTED !== true) {
  const proxyStore = new Store();
  window._SOUS_CONTENT_SCRIPT_INJECTED = true;
  requestId().then((tabId) => {
    proxyStore.ready().then(main(proxyStore, tabId));
  });
}
