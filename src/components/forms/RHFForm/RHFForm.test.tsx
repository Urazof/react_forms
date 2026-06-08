import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { describe, it, expect, vi } from 'vitest';
import { RHFForm } from './RHFForm';
import { makeStore } from '../../../test-utils/renderWithStore';

vi.mock('../../../utils/imageToBase64', () => ({
  imageToBase64: vi.fn().mockResolvedValue('data:image/png;base64,mocked'),
}));

function renderForm(onClose = vi.fn()) {
  const store = makeStore();
  render(
    <Provider store={store}>
      <RHFForm onClose={onClose} />
    </Provider>
  );
  return { store, onClose };
}

// Заполняет все поля валидными данными
async function fillAllValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Имя'), 'Иван');
  await user.type(screen.getByLabelText('Возраст'), '25');
  await user.type(screen.getByLabelText('Email'), 'ivan@example.com');
  await user.click(screen.getByLabelText('Мужской'));
  await user.type(screen.getByLabelText('Пароль'), 'Pass1!');
  await user.type(screen.getByLabelText('Подтвердите пароль'), 'Pass1!');
  await user.type(screen.getByLabelText('Страна'), 'Россия');
  await user.click(screen.getByLabelText(/условия использования/i));
  const file = new File(['img'], 'photo.png', { type: 'image/png' });
  await user.upload(screen.getByLabelText(/изображение/i), file);
}

describe('RHFForm', () => {
  it('renders all form fields', () => {
    renderForm();
    expect(screen.getByLabelText('Имя')).toBeInTheDocument();
    expect(screen.getByLabelText('Возраст')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Мужской')).toBeInTheDocument();
    expect(screen.getByLabelText('Женский')).toBeInTheDocument();
    expect(screen.getByLabelText('Другой')).toBeInTheDocument();
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument();
    expect(screen.getByLabelText('Подтвердите пароль')).toBeInTheDocument();
    expect(screen.getByLabelText('Страна')).toBeInTheDocument();
    expect(screen.getByLabelText(/изображение/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/условия использования/i)).toBeInTheDocument();
  });

  it('submit button is disabled initially (form is invalid)', () => {
    renderForm();
    expect(screen.getByRole('button', { name: 'Отправить' })).toBeDisabled();
  });

  it('shows live validation error for invalid name (lowercase first letter)', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText('Имя'), 'иван');
    await waitFor(() => {
      expect(screen.getByText(/первая буква/i)).toBeInTheDocument();
    });
  });

  it('shows live validation error for invalid email', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText('Email'), 'notanemail');
    await waitFor(() => {
      expect(screen.getByText(/некорректный email/i)).toBeInTheDocument();
    });
  });

  it('shows password strength indicator when password is typed', async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText('Пароль'), 'Abc1!');
    expect(screen.getByText('Сильный')).toBeInTheDocument();
  });

  // cross-field refine: несовпадение паролей не даёт включиться кнопке submit
  it('submit stays disabled when passwords mismatch (all other fields valid)', async () => {
    const user = userEvent.setup();
    renderForm();

    const file = new File(['img'], 'photo.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText(/изображение/i), file);
    await user.type(screen.getByLabelText('Имя'), 'Иван');
    await user.type(screen.getByLabelText('Возраст'), '25');
    await user.type(screen.getByLabelText('Email'), 'ivan@example.com');
    await user.click(screen.getByLabelText('Мужской'));
    await user.type(screen.getByLabelText('Страна'), 'Россия');
    await user.click(screen.getByLabelText(/условия использования/i));
    await user.type(screen.getByLabelText('Пароль'), 'Pass1!');
    await user.type(screen.getByLabelText('Подтвердите пароль'), 'Different!');

    expect(screen.getByRole('button', { name: 'Отправить' })).toBeDisabled();
  });

  it('submit button enables when all fields are valid', async () => {
    const user = userEvent.setup();
    renderForm();
    await fillAllValid(user);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Отправить' })).not.toBeDisabled();
    });
  });

  it('dispatches addSubmission and calls onClose on valid submit', async () => {
    const user = userEvent.setup();
    const { store, onClose } = renderForm();

    await fillAllValid(user);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Отправить' })).not.toBeDisabled();
    });

    await user.click(screen.getByRole('button', { name: 'Отправить' }));

    await waitFor(() => {
      expect(store.getState().submissions).toHaveLength(1);
    });
    expect(store.getState().submissions[0].name).toBe('Иван');
    expect(store.getState().submissions[0].image).toBe('data:image/png;base64,mocked');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('labels are connected to inputs via htmlFor', () => {
    renderForm();
    expect(screen.getByLabelText('Имя')).toHaveAttribute('id', 'rhf-name');
    expect(screen.getByLabelText('Возраст')).toHaveAttribute('id', 'rhf-age');
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'rhf-email');
    expect(screen.getByLabelText('Страна')).toHaveAttribute('id', 'rhf-country');
  });
});
