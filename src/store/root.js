import { configureStore, createReducer } from '@reduxjs/toolkit';
import { wrapStore } from 'webext-redux';
import { increment } from './index';

const reducer = createReducer({count: 0}, {
  [increment]: state => { state.count++ }
})

const store = configureStore({
  reducer
});

wrapStore(store);

export { store }