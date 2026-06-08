import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from './Modal';

function renderModal(overrides: Partial<Parameters<typeof Modal>[0]> = {}) {
  const defaults = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Тестовый модал',
    children: <p>Содержимое модала</p>,
  };
  return { ...render(<Modal {...defaults} {...overrides} />), onClose: (overrides.onClose ?? defaults.onClose) as ReturnType<typeof vi.fn> };
}

describe('Modal', () => {
  it('renders dialog and content when isOpen is true', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Тестовый модал')).toBeInTheDocument();
    expect(screen.getByText('Содержимое модала')).toBeInTheDocument();
  });

  it('renders nothing when isOpen is false', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('has correct aria attributes on dialog', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('calls onClose when ESC key is pressed', () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the close button', () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    fireEvent.click(screen.getByLabelText('Закрыть'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the overlay (outside dialog)', () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    const overlay = screen.getByRole('dialog').parentElement!;
    fireEvent.click(overlay, { target: overlay });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onClose when clicking inside the dialog', () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('locks body scroll when open', () => {
    renderModal({ isOpen: true });
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when closed', () => {
    const { rerender } = render(
      <Modal isOpen onClose={vi.fn()} title="t">content</Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<Modal isOpen={false} onClose={vi.fn()} title="t">content</Modal>);
    expect(document.body.style.overflow).toBe('');
  });

  it('renders title text correctly', () => {
    renderModal({ title: 'React Hook Form' });
    expect(screen.getByText('React Hook Form')).toBeInTheDocument();
  });

  it('Tab on last focusable element wraps focus to first (close button)', () => {
    // Первый focusable в диалоге — кнопка закрытия (✕), последний — наш children
    renderModal({ children: <button id="btn-last">Last</button> });
    const last = document.getElementById('btn-last')!;
    last.focus();
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    // фокус переходит на первый элемент — кнопку «Закрыть»
    expect(document.activeElement).toBe(screen.getByLabelText('Закрыть'));
  });

  it('Shift+Tab on first focusable (close button) wraps focus to last', () => {
    renderModal({ children: <button id="btn-last">Last</button> });
    const closeBtn = screen.getByLabelText('Закрыть');
    closeBtn.focus();
    expect(document.activeElement).toBe(closeBtn);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    // фокус переходит на последний элемент
    expect(document.activeElement?.id).toBe('btn-last');
  });
});
