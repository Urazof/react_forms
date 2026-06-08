import { configureStore } from '@reduxjs/toolkit';
import submissionsReducer from './submissionsSlice';
import countriesReducer from './countriesSlice';

export const store = configureStore({
  reducer: {
    submissions: submissionsReducer,
    countries: countriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
