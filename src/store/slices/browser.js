import { createSlice, createSelector } from '@reduxjs/toolkit';

// keeps an internal representation of the state of the browser (tabs & windows)
// and additional extension tab related info (i.e. is the content script injected)
const { reducer: browser, actions } = createSlice({
  name: 'browser',
  initialState: {
    allTabs: [], // list of all tab ids
    tabsById: {}, // tabs and related info (status, content, script status)
    allWindows: [], // list of all window ids
    windowsById: {} // windows and related info (tabs, active tab)
  },
  reducers: {
    // fired in response to chrome.tabs.onActivated
    tabActivated: (state, { payload: { tabId, windowId } }) => {
      // if a new window was created, the event may have not fired yet
      if (!state.windowsById.hasOwnProperty(windowId)) {
        state.allWindows.push(windowId);
        state.windowsById[windowId] = {
          active: null,
          tabs: [],
        };
      }
      // change the active tab for the window
      let window = state.windowsById[windowId];
      window.active = tabId;
    },
    // fired in response to chrome.tabs.onRemoved
    tabClosed: (state, { payload: { tabId, windowId } }) => {
      // remove the tab
      const tabIndex = state.allTabs.indexOf(tabId);
      if (tabIndex > -1) state.allTabs.splice(tabIndex, 1);
      delete state.tabsById[tabId];
      // remove from the window it belonged to
      // if the window was closed, it might not exist
      if (state.windowsById.hasOwnProperty(windowId)) {
        let window = state.windowsById[windowId];
        const windowIndex = window.tabs.indexOf(tabId, 1);
        if (windowIndex > -1) window.tabs.splice(windowIndex, 1);
      }
    },
    // fired in response to chrome.windows.onRemoved
    windowClosed: (state, { payload: windowId } ) => {
      // remove the window
      const windowIndex = state.allTabs.indexOf(windowId);
      if (windowIndex > -1) state.allTabs.splice(windowIndex, 1);
      delete state.windowsById[windowId];
    },
    // fired in response to chrome.tabs.onCreated
    tabOpened: (state, { payload: {windowId, tabId} } ) => {
      if (state.tabsById.hasOwnProperty(tabId)) return state;
      state.allTabs.push(tabId);
      state.tabsById[tabId] = {
        url: null,
        contentScriptInjected: false,
      };
      state.windowsById[windowId].tabs.push(tabId);
    },
    // fired in response to chrome.windows.onCreated
    windowOpened: (state, { payload: windowId } ) => {
      if (state.windowsById.hasOwnProperty(windowId)) return state;
      state.allWindows.push(windowId);
      state.windowsById[windowId] = {
        active: null,
        tabs: [],
      };
    },
    // fired in response to chrome.tabs.onDetached
    tabDetached: (state, { payload: { tabId, windowId } } ) => {
      // remove from the window it belonged to
      // if the window was closed, it might not exist
      if (state.windowsById.hasOwnProperty(windowId)) {
        const windowIndex = state.windowsById[windowId].tabs.indexOf(tabId, 1);
        if (windowIndex > -1) state.windowsById[windowId].tabs.splice(windowIndex, 1);
      }
    },
    // fired in response to chrome.tabs.onAttached
    tabAttached: (state, { payload: { tabId, windowId } } ) => {
      // add to the new window
      // if a new window was created, the event may have not fired yet
      if (!state.windowsById.hasOwnProperty(windowId)) {
        state.allWindows.push(windowId);
        state.windowsById[windowId] = {
          active: null,
          tabs: [],
        };
      }
      let window = state.windowsById[windowId];
      window.tabs.push(tabId);
    },
    // fired in response to chrome.windows.onUpdated when the url changes
    tabNavigated: (state, { payload: { tabId, url } } ) => {
      let tab = state.tabsById[tabId];
      tab.url = url;
      tab.contentScriptInjected = false;
    },
    // fired when the content script is injected
    scriptInjected: (state, { payload: tabId }) => {
      let tab = state.tabsById[tabId];
      tab.contentScriptInjected = true;
    },
    tabReloaded: (state, { payload: tabId }) => {
      let tab = state.tabsById[tabId];
      tab.contentScriptInjected = false;
    }
  }
});

// slice selector
const getBrowserSlice = state => state.browser;

// get the active tab for each window
const getActiveTabs = createSelector(
  getBrowserSlice,
  browser => {
    return browser.allWindows.map(id => browser.windowsById[id].active)
  }
);

const isInjected = (state, tabId) => {
  return getBrowserSlice(state).tabsById[tabId].contentScriptInjected;
};

const getNotInjected = (state) => {
  return getBrowserSlice(state).allTabs.filter(tabId => !isInjected(state, tabId));
}

// destructure actions
const { tabActivated, tabClosed, windowClosed, tabOpened, windowOpened, tabDetached, tabAttached, tabNavigated, scriptInjected, tabReloaded } = actions;

export { browser, tabActivated, tabClosed, windowClosed, tabOpened, windowOpened, tabDetached, tabAttached, tabNavigated, scriptInjected, tabReloaded, getBrowserSlice, getActiveTabs, isInjected, getNotInjected };