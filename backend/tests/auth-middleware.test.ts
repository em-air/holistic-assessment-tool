import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { requireRole, isAdmin, isTeacher, isStudent } from '../src/middleware/auth.js';

// We test `requireRole`, `isAdmin`, `isTeacher`, `isStudent` — these are pure
// functions that don't need Supabase. `verifySupabaseToken` requires a live
// Supabase connection and is best covered by integration tests.

function mockRequest(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    user: undefined,
    ...overrides,
  } as unknown as Request;
}

function mockResponse(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

function mockNext(): NextFunction {
  return vi.fn();
}

describe('requireRole middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when user is not authenticated', () => {
    const middleware = requireRole(['admin']);
    const req = mockRequest({ user: undefined });
    const res = mockResponse();
    const next = mockNext();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 when user role is not in allowedRoles', () => {
    const middleware = requireRole(['admin']);
    const req = mockRequest({
      user: { id: '123', role: 'student', email: 'test@test.com', grade: null, profile: {} },
    } as Partial<Request>);
    const res = mockResponse();
    const next = mockNext();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Insufficient permissions',
        required: ['admin'],
        current: 'student',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next when user has an allowed role', () => {
    const middleware = requireRole(['admin', 'teacher']);
    const req = mockRequest({
      user: { id: '123', role: 'teacher', email: 'test@test.com', grade: null, profile: {} },
    } as Partial<Request>);
    const res = mockResponse();
    const next = mockNext();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should work with a single allowed role', () => {
    const middleware = requireRole(['student']);
    const req = mockRequest({
      user: { id: '123', role: 'student', email: 'test@test.com', grade: null, profile: {} },
    } as Partial<Request>);
    const res = mockResponse();
    const next = mockNext();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should reject when user role is teacher but only admin is allowed', () => {
    const middleware = requireRole(['admin']);
    const req = mockRequest({
      user: { id: '123', role: 'teacher', email: 'test@test.com', grade: null, profile: {} },
    } as Partial<Request>);
    const res = mockResponse();
    const next = mockNext();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('Role helper functions', () => {
  it('isAdmin should return true only for admin role', () => {
    const adminReq = mockRequest({
      user: { id: '1', role: 'admin', email: 'a@b.com', grade: null, profile: {} },
    } as Partial<Request>);
    const studentReq = mockRequest({
      user: { id: '2', role: 'student', email: 'a@b.com', grade: null, profile: {} },
    } as Partial<Request>);
    const noUserReq = mockRequest();

    expect(isAdmin(adminReq)).toBe(true);
    expect(isAdmin(studentReq)).toBe(false);
    expect(isAdmin(noUserReq)).toBe(false);
  });

  it('isTeacher should return true only for teacher role', () => {
    const teacherReq = mockRequest({
      user: { id: '1', role: 'teacher', email: 'a@b.com', grade: null, profile: {} },
    } as Partial<Request>);
    const studentReq = mockRequest({
      user: { id: '2', role: 'student', email: 'a@b.com', grade: null, profile: {} },
    } as Partial<Request>);

    expect(isTeacher(teacherReq)).toBe(true);
    expect(isTeacher(studentReq)).toBe(false);
  });

  it('isStudent should return true only for student role', () => {
    const studentReq = mockRequest({
      user: { id: '1', role: 'student', email: 'a@b.com', grade: null, profile: {} },
    } as Partial<Request>);
    const adminReq = mockRequest({
      user: { id: '2', role: 'admin', email: 'a@b.com', grade: null, profile: {} },
    } as Partial<Request>);

    expect(isStudent(studentReq)).toBe(true);
    expect(isStudent(adminReq)).toBe(false);
  });
});
