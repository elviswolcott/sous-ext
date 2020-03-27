import { Store } from "webext-redux";
import { requestId } from "./extensionUtils";

const main = (proxyStore) => () => {};

// guard against double injections
if (window._SOUS_CONTENT_SCRIPT_INJECTED !== true) {
  const proxyStore = new Store();
  window._SOUS_CONTENT_SCRIPT_INJECTED = true;
  requestId();
  proxyStore.ready().then(main(proxyStore));
}
