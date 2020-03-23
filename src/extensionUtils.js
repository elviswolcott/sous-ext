/* global chrome */

// change the extension icon for a tab or all tabs
const setIcon = (name, tabId) => {
  if (tabId === "content_script") {
    chrome.runtime.sendMessage({
      _UTIL_ACTION: '_UTILS_SET_ICON',
      _UTIL_PAYLOAD: name,
    });
  } else {
    const path = [128,64,48,32,24,16].reduce( (dict, size) => { 
      return {
        ...dict, 
        [size]: `icons/${name}/icon-${size}.png` 
      } 
    });
  
    chrome.browserAction.setIcon({
      path: path,
      tabId,
    });
  }
};

// inject a script (won't inject if already injected)
const injection = updateState => tabId => {
  chrome.tabs.get(tabId, ({url}) => {
    // only inject into webpages
    if (url.startsWith('https://') || url.startsWith('http://')) {
      updateState(tabId);
      chrome.tabs.executeScript(tabId, {
        file: 'contentScript.js'
      });
    }
  });
};

// listen for requests coming from content scripts and popup
const listen = () => {
  chrome.runtime.onMessage.addListener( (message, sender, reply) => {
    const tabId = sender.tab.id;
    const payload = message._UTIL_PAYLOAD;
    switch (message._UTIL_ACTION) {
      case '_UTILS_SET_ICON':
          setIcon(payload, tabId);
        break;
      
      case '_UTILS_ECHO_ID':
          chrome.tabs.sendMessage(tabId, {_UTIL_ACTION: '_UTILS_ECHO_ID', _UTIL_PAYLOAD: tabId });
        break;


      default:
        break;
    }
  });
};

const requestId = () => {
  chrome.runtime.sendMessage({_UTIL_ACTION: '_UTILS_ECHO_ID'})
  chrome.runtime.onMessage.addListener( (message) => {
    if(message._UTIL_ACTION === '_UTILS_ECHO_ID') {
      console.log(message._UTIL_PAYLOAD);
      window._SOUS_CONTENT_SCRIPT_SELF_ID = message._UTIL_PAYLOAD;
    }
  });
};

const getId = () => window._SOUS_CONTENT_SCRIPT_SELF_ID;

export { setIcon, injection, listen, requestId, getId };
