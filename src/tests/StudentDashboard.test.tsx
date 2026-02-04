import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import StudentDashboard from '../../components/StudentDashboard';
import { Student } from '../../types';

const mockStudent: Student = {
    id: '1',
    name: 'Test Student',
    email: 'test@student.com',
    avatar: '',
    goal: 'Hypertrophy',
    gender: 'male',
    experience: 'intermediate',
    injuries: [],
    equipment: [],
    history: [],
    files: []
};

describe('StudentDashboard', () => {
    it('renders all main category buttons', () => {
        render(
            <StudentDashboard
                student={mockStudent}
                onNavigateToWorkout={() => { }}
                onNavigateToProgress={() => { }}
            />
        );

        expect(screen.getByText('Meus Treinos')).toBeInTheDocument();
        expect(screen.getByText('Avaliações')).toBeInTheDocument();
        expect(screen.getByText('Evolução')).toBeInTheDocument();
        expect(screen.getByText('Pagamentos')).toBeInTheDocument();
        expect(screen.getByText('Arquivos')).toBeInTheDocument();
    });

    it('opens the files modal when Arquivos is clicked', () => {
        render(
            <StudentDashboard
                student={mockStudent}
                onNavigateToWorkout={() => { }}
                onNavigateToProgress={() => { }}
            />
        );

        const filesButton = screen.getByText('Arquivos').closest('button');
        if (filesButton) fireEvent.click(filesButton);

        expect(screen.getByText('Enviar Arquivo')).toBeInTheDocument();
    });

    it('applies the correct emerald color to Treinos button', () => {
        render(
            <StudentDashboard
                student={mockStudent}
                onNavigateToWorkout={() => { }}
                onNavigateToProgress={() => { }}
            />
        );

        const treinosIconContainer = screen.getByText('Meus Treinos').previousSibling;
        expect(treinosIconContainer).toHaveClass('bg-emerald-50');
    });
});
