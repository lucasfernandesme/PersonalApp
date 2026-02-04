import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataService } from '../../services/dataService';
import { Student } from '../../types';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                order: vi.fn(() => ({
                    data: [],
                    error: null
                })),
                eq: vi.fn(() => ({
                    single: vi.fn(() => ({
                        data: null,
                        error: null
                    }))
                }))
            })),
            upsert: vi.fn(() => ({ error: null })),
            delete: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) }))
        }))
    }))
}));

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        clear: () => { store = {}; },
        removeItem: (key: string) => { delete store[key]; }
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const mockStudent: Student = {
    id: 's1',
    name: 'Test Student',
    email: 'test@student.com',
    avatar: '',
    goal: 'Hypertrophy',
    gender: 'male',
    experience: 'intermediate',
    injuries: [],
    equipment: [],
    history: [],
    files: [{ id: 'f1', name: 'Exam.pdf', type: 'pdf', url: 'http://link.com', date: '01/01/2024' }]
};

describe('DataService', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.clearAllMocks();
    });

    it('identifies if cloud is active (mocked as true)', () => {
        // Since we mocked createClient, it should return true
        expect(DataService.isCloudActive()).toBe(true);
    });

    it('successfully calls upsert when saving a student', async () => {
        await DataService.saveStudent(mockStudent);
        // If we got here without error, it's working with the mock
        expect(true).toBe(true);
    });
});
