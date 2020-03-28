import { Store } from "webext-redux";
import { detector } from "./recipes";
import { requestId } from "./extensionUtils";
import { sousActive } from "./store/slices/browser";

const main = (proxyStore, tabId) => () => {
  console.log("ready");
  const recipeFound = detector.find(document);
  console.log(recipeFound);
  if (recipeFound) {
    console.log(tabId);
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
