import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { wrapStore } from "webext-redux";
import { browser } from "./slices/browser";
import devToolsEnhancer from "remote-redux-devtools";
import { reduxBatch } from "@manaflair/redux-batch";

const store = configureStore({
  reducer: {
    browser,
  },
  devTools: false,
  middleware: getDefaultMiddleware({ thunk: false }),
  enhancers: [
    reduxBatch,
    devToolsEnhancer({
      realtime: true,
      port: 8000,
      hostname: "localhost",
      secure: false,
    }),
  ],
});

wrapStore(store);

export { store };
