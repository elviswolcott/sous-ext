import { createAction } from '@reduxjs/toolkit';

const countSelector = state => state.count;

const increment = createAction('INCREMENT');

export { countSelector, increment };