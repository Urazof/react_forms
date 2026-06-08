import { render, screen, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { SubmissionCard } from './SubmissionCard';
import { makeStore } from '../../../test-utils/renderWithStore';
import { addSubmission } from '../../../store/submissionsSlice';
import type { Submission } from '../../../types';

const base: Submission = {
  id: 'test-id-1',
  name: 'Иван Иванов',
  age: 30,
  email: 'ivan@example.com',
  gender: 'male',
  terms: true,
  country: 'Россия',
  image: 'data:image/png;base64,abc',
  password: 'secret',
  isNew: false,
};

afterEach(() => {
  vi.useRealTimers();
});

describe('SubmissionCard', () => {
  it('renders name, age, email, gender, country', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <SubmissionCard submission={base} />
      </Provider>
    );
    expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('ivan@example.com')).toBeInTheDocument();
    expect(screen.getByText('Мужской')).toBeInTheDocument();
    expect(screen.getByText('Россия')).toBeInTheDocument();
  });

  it('renders the image with correct src and alt', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <SubmissionCard submission={base} />
      </Provider>
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', base.image);
    expect(img).toHaveAttribute('alt', 'Фото Иван Иванов');
  });

  it('shows "Новая" badge when isNew is true', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <SubmissionCard submission={{ ...base, isNew: true }} />
      </Provider>
    );
    expect(screen.getByText('Новая')).toBeInTheDocument();
  });

  it('does not show badge when isNew is false', () => {
    const store = makeStore();
    render(
      <Provider store={store}>
        <SubmissionCard submission={base} />
      </Provider>
    );
    expect(screen.queryByText('Новая')).not.toBeInTheDocument();
  });

  it('renders correct gender labels', () => {
    const store = makeStore();
    const { rerender } = render(
      <Provider store={store}>
        <SubmissionCard submission={{ ...base, gender: 'female' }} />
      </Provider>
    );
    expect(screen.getByText('Женский')).toBeInTheDocument();

    rerender(
      <Provider store={store}>
        <SubmissionCard submission={{ ...base, gender: 'other' }} />
      </Provider>
    );
    expect(screen.getByText('Другой')).toBeInTheDocument();
  });

  it('dispatches markAsRead after 3 seconds when isNew is true', async () => {
    vi.useFakeTimers();
    const store = makeStore();

    store.dispatch(
      addSubmission({
        name: base.name,
        age: base.age,
        email: base.email,
        gender: base.gender,
        terms: base.terms,
        country: base.country,
        image: base.image,
        password: base.password,
      })
    );
    const submission = store.getState().submissions[0];
    expect(submission.isNew).toBe(true);

    render(
      <Provider store={store}>
        <SubmissionCard submission={submission} />
      </Provider>
    );

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(store.getState().submissions[0].isNew).toBe(false);
  });

  it('does not dispatch markAsRead when isNew is false', async () => {
    vi.useFakeTimers();
    const store = makeStore();
    const dispatch = vi.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <SubmissionCard submission={base} />
      </Provider>
    );

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    const markAsReadCalls = dispatch.mock.calls.filter(
      (args) => (args[0] as { type: string }).type === 'submissions/markAsRead'
    );
    expect(markAsReadCalls).toHaveLength(0);
  });
});
