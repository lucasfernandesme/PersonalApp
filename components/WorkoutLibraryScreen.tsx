
import React, { useState } from 'react';
import {
    ArrowLeft,
    Plus,
    Dumbbell,
    Search,
    Trash2,
    Edit3,
    Copy,
    ChevronRight,
    BookOpen
} from 'lucide-react';
import { WorkoutTemplate } from '../types';
import ManualWorkoutBuilder from './ManualWorkoutBuilder';

interface WorkoutLibraryScreenProps {
    templates: WorkoutTemplate[];
    onSaveTemplate: (template: WorkoutTemplate) => Promise<void>;
    onDeleteTemplate: (id: string) => Promise<void>;
    onBack: () => void;
    onUseInStudent?: (template: WorkoutTemplate) => void;
}

const WorkoutLibraryScreen: React.FC<WorkoutLibraryScreenProps> = ({
    templates,
    onSaveTemplate,
    onDeleteTemplate,
    onBack,
    onUseInStudent
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isAdding || editingTemplate) {
        return (
            <ManualWorkoutBuilder
                onSave={async (program) => {
                    await onSaveTemplate(program as WorkoutTemplate);
                    setIsAdding(false);
                    setEditingTemplate(null);
                }}
                onCancel={() => {
                    setIsAdding(false);
                    setEditingTemplate(null);
                }}
                initialProgram={editingTemplate || undefined}
            />
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm mb-2"
                    >
                        <ArrowLeft size={18} /> Voltar
                    </button>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Biblioteca de Treinos</h2>
                    <p className="text-slate-400 font-medium">Seus modelos salvos para facilitar a prescrição.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus size={20} />
                    <span className="hidden md:inline font-black uppercase text-xs tracking-widest">Novo Template</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input
                    type="text"
                    placeholder="Buscar template por nome..."
                    className="w-full pl-12 pr-6 py-5 bg-white border border-slate-200 rounded-[24px] text-sm font-bold shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Template List */}
            <div className="space-y-4">
                {filteredTemplates.length > 0 ? (
                    filteredTemplates.map(template => (
                        <div
                            key={template.id}
                            className="bg-white p-5 rounded-[32px] border border-slate-200 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                        <BookOpen size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{template.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                                                {template.split.length} Dias
                                            </span>
                                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                            <span className="text-[10px] font-black uppercase text-slate-400">
                                                {template.split.reduce((acc, current) => acc + current.exercises.length, 0)} Exercícios
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setEditingTemplate(template)}
                                        className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                        title="Editar Template"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    <button
                                        onClick={() => onDeleteTemplate(template.id)}
                                        className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                                        title="Excluir Template"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {onUseInStudent && (
                                <button
                                    onClick={() => onUseInStudent(template)}
                                    className="w-full py-3 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <Copy size={16} />
                                    Usar no Aluno
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="py-16 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Dumbbell size={32} />
                        </div>
                        <p className="text-slate-400 font-bold">Nenhum template encontrado.</p>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline"
                        >
                            Criar meu primeiro template
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkoutLibraryScreen;
