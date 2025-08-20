import { configureStore } from '@reduxjs/toolkit';
import resumeReducer from './resumeSlice';

// Configure Redux store using Redux Toolkit
export const store = configureStore({
  reducer: {
    resume: resumeReducer,
  },
  // Redux Toolkit includes redux-thunk by default
  // and sets up Redux DevTools Extension automatically
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
