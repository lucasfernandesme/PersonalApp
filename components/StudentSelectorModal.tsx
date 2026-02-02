
import React, { useState } from 'react';
import { X, Search, User, ChevronRight } from 'lucide-react';
import { Student } from '../types';

interface StudentSelectorModalProps {
    students: Student[];
    onSelect: (student: Student) => void;
    onClose: () => void;
}

const StudentSelectorModal: React.FC<StudentSelectorModalProps> = ({
    students,
    onSelect,
    onClose
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Selecionar Aluno</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1">Escolha o aluno para aplicar este treino</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-6 border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar aluno..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Student List */}
                <div className="max-h-[400px] overflow-y-auto p-4">
                    {filteredStudents.length > 0 ? (
                        <div className="space-y-2">
                            {filteredStudents.map((student) => (
                                <button
                                    key={student.id}
                                    onClick={() => onSelect(student)}
                                    className="w-full p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl flex items-center justify-between transition-all group border border-transparent hover:border-indigo-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={student.avatar}
                                            alt={student.name}
                                            className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                                        />
                                        <div className="text-left">
                                            <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                {student.name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] font-black uppercase text-slate-400 bg-white px-2 py-0.5 rounded-md">
                                                    {student.goal}
                                                </span>
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${student.isActive !== false
                                                        ? 'bg-emerald-50 text-emerald-600'
                                                        : 'bg-red-50 text-red-600'
                                                    }`}>
                                                    {student.isActive !== false ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-slate-300 group-hover:text-indigo-600 transition-colors" size={20} />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User size={32} className="text-slate-300" />
                            </div>
                            <p className="text-slate-400 font-bold">
                                {searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentSelectorModal;
