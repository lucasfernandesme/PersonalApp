
import React, { useState } from 'react';
import {
    ArrowLeft,
    Plus,
    Dumbbell,
    Search,
    Trash2,
    Edit3,
    Copy,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    FolderPlus,
    Folder,
    MoreVertical,
    ExternalLink
} from 'lucide-react';
import { WorkoutTemplate, WorkoutFolder } from '../types';
import ManualWorkoutBuilder from './ManualWorkoutBuilder';

interface WorkoutLibraryScreenProps {
    templates: WorkoutTemplate[];
    folders: WorkoutFolder[];
    onSaveTemplate: (template: WorkoutTemplate) => Promise<void>;
    onDeleteTemplate: (id: string) => Promise<void>;
    onSaveFolder: (folder: WorkoutFolder) => Promise<void>;
    onDeleteFolder: (id: string) => Promise<void>;
    onBack: () => void;
    onUseInStudent?: (template: WorkoutTemplate) => void;
}

const WorkoutLibraryScreen: React.FC<WorkoutLibraryScreenProps> = ({
    templates,
    folders,
    onSaveTemplate,
    onDeleteTemplate,
    onSaveFolder,
    onDeleteFolder,
    onBack,
    onUseInStudent
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isAddingFolder, setIsAddingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);

    const currentFolder = currentFolderId ? folders.find(f => f.id === currentFolderId) : null;

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFolder = t.folderId === currentFolderId;
        return matchesSearch && matchesFolder;
    });

    const currentFolders = folders.filter(f => !currentFolderId); // Simplificação: pastas apenas na raiz por enquanto

    if (isAdding || editingTemplate) {
        return (
            <ManualWorkoutBuilder
                onSave={async (program) => {
                    await onSaveTemplate({ ...program, folderId: currentFolderId } as WorkoutTemplate);
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
                        onClick={currentFolderId ? () => setCurrentFolderId(null) : onBack}
                        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-bold text-sm mb-2"
                    >
                        <ArrowLeft size={18} /> {currentFolderId ? 'Voltar para Raiz' : 'Voltar'}
                    </button>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {currentFolder ? currentFolder.name : 'Biblioteca de Treinos'}
                    </h2>
                    <p className="text-slate-400 dark:text-slate-500 font-medium">
                        {currentFolder ? 'Treinos organizados nesta pasta.' : 'Seus modelos salvos para facilitar a prescrição.'}
                    </p>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowAddMenu(!showAddMenu)}
                        className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2 hover:bg-indigo-500"
                    >
                        <Plus size={20} />
                        <span className="font-black uppercase text-xs tracking-widest">Adicionar</span>
                    </button>

                    {showAddMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <button
                                onClick={() => {
                                    setIsAdding(true);
                                    setShowAddMenu(false);
                                }}
                                className="w-full px-4 py-3 text-left text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                            >
                                <Dumbbell size={18} className="text-indigo-600 dark:text-indigo-400" />
                                Novo Treino
                            </button>
                            {!currentFolderId && (
                                <button
                                    onClick={() => {
                                        setIsAddingFolder(true);
                                        setShowAddMenu(false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border-t border-slate-50 dark:border-slate-700 flex items-center gap-3 transition-colors"
                                >
                                    <Folder size={18} className="text-amber-500" />
                                    Nova Pasta
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isAddingFolder && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border-2 border-amber-100 dark:border-amber-900/50 shadow-xl shadow-amber-500/5 animate-in slide-in-from-top duration-300">
                    <h3 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Folder size={20} className="text-amber-500" />
                        Nome da Nova Pasta
                    </h3>
                    <div className="flex gap-3">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Ex: Treinos de Iniciantes"
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 font-bold focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            value={newFolderName}
                            onChange={e => setNewFolderName(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && newFolderName.trim()) {
                                    onSaveFolder({ id: Math.random().toString(36).substring(2), name: newFolderName });
                                    setNewFolderName('');
                                    setIsAddingFolder(false);
                                }
                            }}
                        />
                        <button
                            onClick={() => {
                                if (newFolderName.trim()) {
                                    onSaveFolder({ id: Math.random().toString(36).substring(2), name: newFolderName });
                                    setNewFolderName('');
                                    setIsAddingFolder(false);
                                }
                            }}
                            className="bg-amber-500 text-white px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all hover:bg-amber-600"
                        >
                            Criar
                        </button>
                        <button
                            onClick={() => setIsAddingFolder(false)}
                            className="px-4 text-slate-400 dark:text-slate-500 font-bold hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={20} />
                <input
                    type="text"
                    placeholder="Buscar"
                    className="w-full pl-12 pr-6 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] text-sm font-bold shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Content List (Folders + Templates) */}
            <div className="space-y-4">
                {/* Folders first */}
                {!searchTerm && currentFolders.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {currentFolders.map(folder => (
                            <div
                                key={folder.id}
                                className="bg-white dark:bg-slate-900 p-5 rounded-[28px] border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-amber-200 dark:hover:border-amber-900 transition-all group cursor-pointer shadow-sm"
                                onClick={() => setCurrentFolderId(folder.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
                                        <Folder size={24} />
                                    </div>
                                    <span className="font-black text-slate-800 dark:text-white">{folder.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Excluir esta pasta? Os treinos dentro dela ficarão sem pasta.')) {
                                                onDeleteFolder(folder.id);
                                            }
                                        }}
                                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <ChevronRight size={18} className="text-slate-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {filteredTemplates.length > 0 ? (
                    filteredTemplates.map(template => (
                        <div
                            key={template.id}
                            className="bg-white dark:bg-slate-900 p-5 rounded-[32px] border border-slate-200 dark:border-slate-800 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900 transition-all group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                                        <BookOpen size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{template.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                                {template.split.length} Dias
                                            </span>
                                            <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full"></span>
                                            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">
                                                {template.split.reduce((acc, current) => acc + current.exercises.length, 0)} Exercícios
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {currentFolderId && (
                                        <button
                                            onClick={() => onSaveTemplate({ ...template, folderId: null })}
                                            className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                                            title="Mover para fora da pasta"
                                        >
                                            <ExternalLink size={18} className="rotate-180" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setEditingTemplate(template)}
                                        className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                                        title="Editar Template"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    <button
                                        onClick={() => onDeleteTemplate(template.id)}
                                        className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 transition-all"
                                        title="Excluir Template"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {onUseInStudent && (
                                <button
                                    onClick={() => onUseInStudent(template)}
                                    className="w-full py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white hover:border-indigo-600 dark:hover:border-indigo-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <Copy size={16} />
                                    Usar no Aluno
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 text-slate-200 dark:text-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Dumbbell size={32} />
                        </div>
                        <p className="text-slate-400 dark:text-slate-500 font-bold">
                            {searchTerm ? 'Nenhum resultado para sua busca.' : 'Esta pasta está vazia.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkoutLibraryScreen;
