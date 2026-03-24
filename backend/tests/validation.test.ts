import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Test validation schemas used in the application
// These mirror the schemas in routes/*.ts

const saveResultSchema = z.object({
  quiz_id: z.string().min(1),
  quiz_name: z.string().min(1),
  category: z.enum(['mind', 'oral', 'academic']),
  subcategory: z.string().min(1),
  score: z.number().int().min(0),
  total_questions: z.number().int().min(1),
  time_spent: z.number().int().min(0).optional(),
  grade_level: z.string().optional().nullable(),
  additional_data: z.record(z.any()).optional(),
});

const roleSchema = z.object({
  role: z.enum(['student', 'teacher', 'admin']),
});

const generateReportSchema = z.object({
  report_type: z.enum(['mind', 'oral', 'academic', 'full']).default('full'),
  send_email: z.boolean().optional().default(false),
  email_recipients: z.array(z.string().email()).optional(),
});

describe('Quiz Result Validation', () => {
  describe('saveResultSchema', () => {
    it('should accept valid quiz result', () => {
      const validResult = {
        quiz_id: 'quiz-123',
        quiz_name: 'Attention Test',
        category: 'mind',
        subcategory: 'attention',
        score: 8,
        total_questions: 10,
        time_spent: 120,
        grade_level: 'Grade 1',
      };

      const result = saveResultSchema.safeParse(validResult);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidResult = {
        quiz_id: 'quiz-123',
        // missing quiz_name, category, subcategory, score, total_questions
      };

      const result = saveResultSchema.safeParse(invalidResult);
      expect(result.success).toBe(false);
    });

    it('should reject invalid category', () => {
      const invalidResult = {
        quiz_id: 'quiz-123',
        quiz_name: 'Test',
        category: 'invalid_category',
        subcategory: 'test',
        score: 5,
        total_questions: 10,
      };

      const result = saveResultSchema.safeParse(invalidResult);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('category');
      }
    });

    it('should reject negative scores', () => {
      const invalidResult = {
        quiz_id: 'quiz-123',
        quiz_name: 'Test',
        category: 'mind',
        subcategory: 'test',
        score: -1,
        total_questions: 10,
      };

      const result = saveResultSchema.safeParse(invalidResult);
      expect(result.success).toBe(false);
    });

    it('should reject zero total_questions', () => {
      const invalidResult = {
        quiz_id: 'quiz-123',
        quiz_name: 'Test',
        category: 'mind',
        subcategory: 'test',
        score: 5,
        total_questions: 0,
      };

      const result = saveResultSchema.safeParse(invalidResult);
      expect(result.success).toBe(false);
    });

    it('should allow optional fields to be omitted', () => {
      const minimalResult = {
        quiz_id: 'quiz-123',
        quiz_name: 'Test',
        category: 'oral',
        subcategory: 'phonics',
        score: 5,
        total_questions: 10,
      };

      const result = saveResultSchema.safeParse(minimalResult);
      expect(result.success).toBe(true);
    });

    it('should accept additional_data as any object', () => {
      const resultWithData = {
        quiz_id: 'quiz-123',
        quiz_name: 'Test',
        category: 'academic',
        subcategory: 'writing',
        score: 5,
        total_questions: 10,
        additional_data: {
          responses: ['a', 'b', 'c'],
          difficulty: 'medium',
          nested: { key: 'value' },
        },
      };

      const result = saveResultSchema.safeParse(resultWithData);
      expect(result.success).toBe(true);
    });
  });
});

describe('Role Validation', () => {
  describe('roleSchema', () => {
    it('should accept student role', () => {
      const result = roleSchema.safeParse({ role: 'student' });
      expect(result.success).toBe(true);
    });

    it('should accept teacher role', () => {
      const result = roleSchema.safeParse({ role: 'teacher' });
      expect(result.success).toBe(true);
    });

    it('should accept admin role', () => {
      const result = roleSchema.safeParse({ role: 'admin' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const result = roleSchema.safeParse({ role: 'superadmin' });
      expect(result.success).toBe(false);
    });

    it('should reject missing role', () => {
      const result = roleSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

describe('Report Generation Validation', () => {
  describe('generateReportSchema', () => {
    it('should accept empty object with defaults', () => {
      const result = generateReportSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.report_type).toBe('full');
        expect(result.data.send_email).toBe(false);
      }
    });

    it('should accept all report types', () => {
      const types = ['mind', 'oral', 'academic', 'full'];
      
      for (const type of types) {
        const result = generateReportSchema.safeParse({ report_type: type });
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid report type', () => {
      const result = generateReportSchema.safeParse({ report_type: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('should validate email recipients format', () => {
      const validEmails = generateReportSchema.safeParse({
        email_recipients: ['valid@email.com', 'another@test.org'],
      });
      expect(validEmails.success).toBe(true);

      const invalidEmails = generateReportSchema.safeParse({
        email_recipients: ['invalid-email', 'valid@email.com'],
      });
      expect(invalidEmails.success).toBe(false);
    });
  });
});
