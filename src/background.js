/* global chrome */
// eslint-disable-next-line no-unused-vars
import { store } from "./store";
import { listen, injection } from "./extensionUtils";
import { tabActivated, tabAttached, tabNavigated, scriptInjected, tabOpened, tabReloaded, getActiveTabs, isInjected, getNotInjected, tabClosed, windowClosed, windowOpened, tabDetached } from "./store/slices/browser";
import { wrapSelector, arrayEqual, arrayChanged } from "./reduxUtils";

// listen for requests to interact with chrome APIs from content scripts
listen();

// get all tabs and windows set up
// redux-batch ensures this all calls the subscriber once
chrome.tabs.query({}, allTabs => {
  const initActions = allTabs.reduce( (actions, { active, id: tabId, windowId, url }) => {
    const items = [tabAttached({ tabId, windowId }), tabOpened({tabId, windowId}), tabNavigated({ tabId, url })];
    active && items.push(tabActivated({ tabId, windowId }));
    return [...actions, ...items];
  }, []);
  store.dispatch(initActions);
})

// dispatch actions based on changes to tabs & windows
chrome.tabs.onActivated.addListener(event => {
  store.dispatch(tabActivated(event));
});

chrome.tabs.onUpdated.addListener((tabId, change) => {
  switch (change.status) {
    case 'loading':
      if (change.url) {
        // navigated to new page
        /* 
        TODO: still fires when the page hash changes, 
        even though the content script is not reloaded 
        this could be detected using a port (connection won't close)
        or by comparing urls
        */
        store.dispatch(tabNavigated({ tabId, url: change.url }))
      } else {
        // reloaded page
        store.dispatch(tabReloaded(tabId));
      }
      break;
  
    default:
      break;
  }
});

chrome.tabs.onRemoved.addListener( (tabId, { windowId }) => {
  store.dispatch(tabClosed({tabId, windowId}));
});

chrome.windows.onRemoved.addListener(windowId => {
  store.dispatch(windowClosed(windowId))
});

chrome.tabs.onCreated.addListener( ({id: tabId, windowId}) => {
  store.dispatch(tabOpened({ tabId, windowId }));
});

chrome.windows.onCreated.addListener( ({id: windowId}) => {
  store.dispatch(windowOpened(windowId));
});

chrome.tabs.onDetached.addListener( (tabId, {oldWindowId: windowId}) => {
  store.dispatch(tabDetached({tabId, windowId}));
});

chrome.tabs.onAttached.addListener((tabId, {newWindowId: windowId}) => {
  store.dispatch(tabAttached({tabId, windowId}));
});


// create an inject function that will update the state by dispatching scriptInjected
const inject = injection(tabId => store.dispatch(scriptInjected(tabId)));


// wrap selectors so that we can respond to changes
const selectNotInjected = wrapSelector(getNotInjected, arrayEqual);
// find changed elements in the array
const monitorNotInjected = arrayChanged();

// respond to all state changes
store.subscribe(() => {
  const state = store.getState();
  const [notInjected, notInjectedChanged] = selectNotInjected(state);

  if (notInjectedChanged) {
    // inject to the tab which was just unloaded
    monitorNotInjected(notInjected).forEach(inject);
  }
});