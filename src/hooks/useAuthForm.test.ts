import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuthForm } from './useAuthForm';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: {} }),
}));

// Mock supabase-client
vi.mock('../supabase-client', () => ({
  signUp: vi.fn().mockResolvedValue({ error: null }),
  signIn: vi.fn().mockResolvedValue({ error: null }),
}));

describe('useAuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('password validation', () => {
    it('should reject passwords shorter than 12 characters on submit', async () => {
      const { result } = renderHook(() => useAuthForm());

      // Switch to signup mode
      act(() => {
        result.current.toggleMode();
      });

      // Fill required fields
      act(() => {
        result.current.handleInputChange({
          target: { name: 'studentName', value: 'Test Student' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleInputChange({
          target: { name: 'parentEmail', value: 'parent@test.com' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleInputChange({
          target: { name: 'password', value: 'Short1!' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleInputChange({
          target: { name: 'confirmPassword', value: 'Short1!' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      // Try to submit - validation happens internally
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
      });

      // Should have password error after submit attempt
      await waitFor(() => {
        expect(result.current.errors.password).toBeDefined();
        expect(result.current.errors.password).toContain('12 characters');
      });
    });

    it('should reject passwords without uppercase letters on submit', async () => {
      const { result } = renderHook(() => useAuthForm());

      act(() => {
        result.current.toggleMode();
      });

      act(() => {
        result.current.handleInputChange({
          target: { name: 'studentName', value: 'Test Student' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleInputChange({
          target: { name: 'parentEmail', value: 'parent@test.com' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleInputChange({
          target: { name: 'password', value: 'lowercaseonly1!' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleInputChange({
          target: { name: 'confirmPassword', value: 'lowercaseonly1!' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
      });

      await waitFor(() => {
        expect(result.current.errors.password).toBeDefined();
        expect(result.current.errors.password).toContain('uppercase');
      });
    });

    it('should accept strong passwords meeting all requirements', async () => {
      const { result } = renderHook(() => useAuthForm());

      act(() => {
        result.current.toggleMode();
      });

      act(() => {
        result.current.handleInputChange({
          target: { name: 'studentName', value: 'Test Student' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleInputChange({
          target: { name: 'parentEmail', value: 'parent@test.com' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      // Strong password: 12+ chars, uppercase, lowercase, number, special
      const strongPassword = 'StrongPass123!';

      act(() => {
        result.current.handleInputChange({
          target: { name: 'password', value: strongPassword },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleInputChange({
          target: { name: 'confirmPassword', value: strongPassword },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
      });

      // Should not have password error
      expect(result.current.errors.password).toBeUndefined();
    });
  });

  describe('form mode toggling', () => {
    it('should start in login mode', () => {
      const { result } = renderHook(() => useAuthForm());
      expect(result.current.isLogin).toBe(true);
    });

    it('should toggle to signup mode', () => {
      const { result } = renderHook(() => useAuthForm());

      act(() => {
        result.current.toggleMode();
      });

      expect(result.current.isLogin).toBe(false);
    });

    it('should reset form data when toggling modes', () => {
      const { result } = renderHook(() => useAuthForm());

      // Set some form data in login mode
      act(() => {
        result.current.handleInputChange({
          target: { name: 'email', value: 'test@example.com' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      // Toggle to signup mode
      act(() => {
        result.current.toggleMode();
      });

      // Form should be reset
      expect(result.current.formData.email).toBe('');
    });
  });

  describe('email validation', () => {
    it('should reject invalid email format in login mode on submit', async () => {
      const { result } = renderHook(() => useAuthForm());

      act(() => {
        result.current.handleInputChange({
          target: { name: 'email', value: 'invalid-email' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleInputChange({
          target: { name: 'password', value: 'somepassword' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
      });

      await waitFor(() => {
        expect(result.current.errors.email).toBeDefined();
        expect(result.current.errors.email).toContain('valid email');
      });
    });
  });
});
