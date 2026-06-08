import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import submissionsReducer from '../store/submissionsSlice';
import countriesReducer from '../store/countriesSlice';

export function makeStore() {
  return configureStore({
    reducer: {
      submissions: submissionsReducer,
      countries: countriesReducer,
    },
  });
}

export function renderWithStore(ui: ReactElement) {
  const store = makeStore();
  const result = render(<Provider store={store}>{ui}</Provider>);
  return { store, ...result };
}
