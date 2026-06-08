import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { UncontrolledForm } from './UncontrolledForm';
import { createFormSchema } from '../../../schemas/formSchema';
import { makeStore } from '../../../test-utils/renderWithStore';

// Мокаем модули целиком — vi.mock поднимается в начало файла (hoisted)
vi.mock('../../../schemas/formSchema');
vi.mock('../../../utils/imageToBase64', () => ({
  imageToBase64: vi.fn().mockResolvedValue('data:image/png;base64,mocked'),
}));

afterEach(() => {
  vi.clearAllMocks(); // очищает счётчики вызовов, но НЕ сбрасывает реализацию imageToBase64
});

function renderForm(onClose = vi.fn()) {
  const store = makeStore();
  render(
    <Provider store={store}>
      <UncontrolledForm onClose={onClose} />
    </Provider>
  );
  return { store, onClose };
}

// Хелпер: мок схемы с заданным результатом safeParse (one-shot, не ломает другие тесты)
function mockSchema(result: { success: boolean; data?: object; error?: object }) {
  vi.mocked(createFormSchema).mockReturnValueOnce({
    safeParse: vi.fn().mockReturnValueOnce(result),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}

describe('UncontrolledForm', () => {
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

  it('submit button is present and not disabled initially', () => {
    renderForm();
    expect(screen.getByRole('button', { name: 'Отправить' })).not.toBeDisabled();
  });

  it('shows validation error for empty name', async () => {
    renderForm();
    mockSchema({
      success: false,
      error: { issues: [{ path: ['name'], message: 'Имя обязательно' }] },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Отправить' }).closest('form')!);
    await waitFor(() => {
      expect(screen.getByText('Имя обязательно')).toBeInTheDocument();
    });
  });

  it('shows error when name starts with lowercase', async () => {
    renderForm();
    mockSchema({
      success: false,
      error: {
        issues: [{ path: ['name'], message: 'Первая буква должна быть заглавной' }],
      },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Отправить' }).closest('form')!);
    await waitFor(() => {
      expect(screen.getByText(/первая буква/i)).toBeInTheDocument();
    });
  });

  it('shows password mismatch error', async () => {
    renderForm();
    mockSchema({
      success: false,
      error: {
        issues: [{ path: ['confirmPassword'], message: 'Пароли не совпадают' }],
      },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Отправить' }).closest('form')!);
    await waitFor(() => {
      expect(screen.getByText('Пароли не совпадают')).toBeInTheDocument();
    });
  });

  it('shows password strength indicator when password is typed', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'Abc1!' } });
    expect(screen.getByText('Сильный')).toBeInTheDocument();
  });

  it('shows "Слабый" for a single lowercase letter', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'a' } });
    expect(screen.getByText('Слабый')).toBeInTheDocument();
  });

  it('hides strength indicator when password is cleared', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'a' } });
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: '' } });
    expect(screen.queryByText('Слабый')).not.toBeInTheDocument();
  });

  it('dispatches addSubmission and calls onClose on valid submit', async () => {
    const { store, onClose } = renderForm();
    const validFile = new File(['img'], 'photo.png', { type: 'image/png' });
    mockSchema({
      success: true,
      data: {
        name: 'Иван',
        age: 25,
        email: 'ivan@example.com',
        password: 'Pass1!',
        confirmPassword: 'Pass1!',
        gender: 'male',
        terms: true,
        country: 'Россия',
        image: validFile,
      },
    });

    fireEvent.submit(screen.getByRole('button', { name: 'Отправить' }).closest('form')!);

    await waitFor(() => {
      expect(store.getState().submissions).toHaveLength(1);
    });
    expect(store.getState().submissions[0].name).toBe('Иван');
    expect(store.getState().submissions[0].image).toBe('data:image/png;base64,mocked');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('labels are connected to inputs via htmlFor', () => {
    renderForm();
    expect(screen.getByLabelText('Имя')).toHaveAttribute('id', 'uc-name');
    expect(screen.getByLabelText('Возраст')).toHaveAttribute('id', 'uc-age');
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'uc-email');
    expect(screen.getByLabelText('Страна')).toHaveAttribute('id', 'uc-country');
  });
});
