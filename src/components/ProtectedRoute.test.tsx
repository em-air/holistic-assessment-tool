import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Mock the AuthContext
const mockAuthValues = {
  user: null as unknown,
  profile: null as unknown,
  loading: false,
  signOut: vi.fn(),
  refreshProfile: vi.fn(),
  studentName: null,
  grade: null,
  isStudent: false,
  isTeacher: false,
  isAdmin: false,
};

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockAuthValues,
}));

function renderWithRouter(ui: React.ReactElement, initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to defaults
    mockAuthValues.user = null;
    mockAuthValues.profile = null;
    mockAuthValues.loading = false;
  });

  describe('loading state', () => {
    it('should show loading spinner when auth is loading', () => {
      mockAuthValues.loading = true;

      renderWithRouter(
        <ProtectedRoute allowedRoles={['student']}>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('unauthenticated', () => {
    it('should redirect when user is not logged in', () => {
      mockAuthValues.user = null;

      renderWithRouter(
        <ProtectedRoute allowedRoles={['student']}>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      // Content should not be shown
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('role checking', () => {
    it('should render children when user has allowed role', () => {
      mockAuthValues.user = { id: '123', email: 'test@test.com' };
      mockAuthValues.profile = { role: 'admin' };

      renderWithRouter(
        <ProtectedRoute allowedRoles={['admin']}>
          <div>Admin Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('should render children when user has one of multiple allowed roles', () => {
      mockAuthValues.user = { id: '123', email: 'test@test.com' };
      mockAuthValues.profile = { role: 'teacher' };

      renderWithRouter(
        <ProtectedRoute allowedRoles={['admin', 'teacher']}>
          <div>Teacher Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Teacher Content')).toBeInTheDocument();
    });

    it('should show Access Denied when user role is not allowed', () => {
      mockAuthValues.user = { id: '123', email: 'test@test.com' };
      mockAuthValues.profile = { role: 'student' };

      renderWithRouter(
        <ProtectedRoute allowedRoles={['admin']}>
          <div>Admin Only</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
    });

    it('should show Access Denied with correct role names', () => {
      mockAuthValues.user = { id: '123', email: 'test@test.com' };
      mockAuthValues.profile = { role: 'student' };

      renderWithRouter(
        <ProtectedRoute allowedRoles={['admin', 'teacher']}>
          <div>Restricted</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText(/admins and teachers/i)).toBeInTheDocument();
    });

    it('should default to student role when profile has no role', () => {
      mockAuthValues.user = { id: '123', email: 'test@test.com' };
      mockAuthValues.profile = {}; // no role set

      renderWithRouter(
        <ProtectedRoute allowedRoles={['student']}>
          <div>Student Content</div>
        </ProtectedRoute>
      );

      // Default role is 'student', so this should render
      expect(screen.getByText('Student Content')).toBeInTheDocument();
    });

    it('should show Return to Home link on access denied', () => {
      mockAuthValues.user = { id: '123', email: 'test@test.com' };
      mockAuthValues.profile = { role: 'student' };

      renderWithRouter(
        <ProtectedRoute allowedRoles={['admin']}>
          <div>Admin Only</div>
        </ProtectedRoute>
      );

      const link = screen.getByText('Return to Home');
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', '/');
    });
  });
});
