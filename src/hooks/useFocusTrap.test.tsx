import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { useFocusTrap } from './useFocusTrap';

function TestModal({ isActive, onEscape }: { isActive: boolean; onEscape: () => void }) {
  const containerRef = useFocusTrap<HTMLDivElement>({ isActive, onEscape });
  return (
    <div ref={containerRef} tabIndex={-1} data-testid="modal">
      <button data-testid="btn-first">First</button>
      <button data-testid="btn-middle">Middle</button>
      <button data-testid="btn-last">Last</button>
    </div>
  );
}

describe('useFocusTrap', () => {
  afterEach(() => {
    cleanup();
  });
  it('automatically focuses first focusable element when active', () => {
    const onEscape = vi.fn();
    const { getByTestId } = render(<TestModal isActive={true} onEscape={onEscape} />);
    const firstBtn = getByTestId('btn-first');

    expect(document.activeElement).toBe(firstBtn);
  });

  it('triggers onEscape when Escape key is pressed', () => {
    const onEscape = vi.fn();
    render(<TestModal isActive={true} onEscape={onEscape} />);

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(event);

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('wraps focus from last to first on Tab press', () => {
    const onEscape = vi.fn();
    const { getByTestId } = render(<TestModal isActive={true} onEscape={onEscape} />);
    const firstBtn = getByTestId('btn-first');
    const lastBtn = getByTestId('btn-last');

    lastBtn.focus();
    expect(document.activeElement).toBe(lastBtn);

    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false, bubbles: true });
    document.dispatchEvent(event);

    expect(document.activeElement).toBe(firstBtn);
  });

  it('wraps focus from first to last on Shift+Tab press', () => {
    const onEscape = vi.fn();
    const { getByTestId } = render(<TestModal isActive={true} onEscape={onEscape} />);
    const firstBtn = getByTestId('btn-first');
    const lastBtn = getByTestId('btn-last');

    firstBtn.focus();
    expect(document.activeElement).toBe(firstBtn);

    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true });
    document.dispatchEvent(event);

    expect(document.activeElement).toBe(lastBtn);
  });
});
