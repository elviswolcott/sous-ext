/* global chrome */
// eslint-disable-next-line no-unused-vars
import { store } from "./store/root";
import { countSelector } from "./store";

// only inject into a page once
const injected = {};
const inject = tabId => {
  if (! injected.hasOwnProperty(tabId)) {
    injected[tabId] = true;
    chrome.tabs.get(tabId, ({url}) => {
      // can't inject into pages with the chrome:// protocol
      if (url.startsWith('https://') || url.startsWith('http://')) {
        chrome.tabs.executeScript(tabId, {
          file: 'contentScript.js'
        });
      }
    });
  }
};
const free = tabId => {
  delete injected[tabId];
}

// inject when navigation occurs
chrome.tabs.onUpdated.addListener((tabId, change) => {
  // inject on navigation
  if (change.status && change.status === "complete") {
    free(tabId);
  }
  inject(tabId);
});

// inject into a tab when it becomes active
chrome.tabs.onActivated.addListener(info => {
  inject(info.tabId);
});

store.subscribe(() => {
  const state = store.getState();
  const count = countSelector(state);
  console.log(count);
});