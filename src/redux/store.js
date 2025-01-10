// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import trfReducer from './trfSlice';

const store = configureStore({
  reducer: {
    trf: trfReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,  // Disable serializability checks in development
    }),
});

export default store;
