import React, { useState } from 'react';
import { User, Edit2, X, GraduationCap, Target } from 'lucide-react';
import { Student } from '../types';

interface StudentProfileProps {
    student: Student;
    onUpdateProfile?: (updatedData: Partial<Student>) => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ student, onUpdateProfile }) => {
    const [activeModal, setActiveModal] = useState<'edit' | null>(null);
    const [name, setName] = useState(student.name);

    // Estados extras se quisermos permitir editar
    const [goal, setGoal] = useState(student.goal || '');

    const handleSaveProfile = () => {
        if (onUpdateProfile) {
            onUpdateProfile({
                name,
                goal: goal as any
            });
        }
        setActiveModal(null);
        alert('Perfil atualizado com sucesso!');
    };

    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-300">
            {/* Header Profile */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col items-center">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500 shadow-xl mb-4">
                        <img
                            src={student.avatar || `https://ui-avatars.com/api/?name=${student.name}&background=10b981&color=fff`}
                            alt={student.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <button
                        onClick={() => setActiveModal('edit')}
                        className="absolute bottom-2 right-2 p-2 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                </div>
                <h2 className="text-2xl font-black text-slate-800 text-center">{student.name}</h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Aluno</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                        <Target size={20} />
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Objetivo</p>
                        <p className="text-sm font-bold text-slate-800">{student.goal || 'Não definido'}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                        <GraduationCap size={20} />
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Nível</p>
                        <p className="text-sm font-bold text-slate-800">{student.experience || 'Iniciante'}</p>
                    </div>
                </div>
            </div>

            {/* Opções */}
            <div className="space-y-3">
                <button
                    onClick={() => setActiveModal('edit')}
                    className="w-full bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-4 hover:bg-slate-50 transition-all group"
                >
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <User size={24} />
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-black text-slate-900 text-lg">Editar Perfil</h3>
                        <p className="text-sm font-medium text-slate-400">Alterar nome e objetivo</p>
                    </div>
                </button>
            </div>

            {/* Modal Editar Perfil */}
            {activeModal === 'edit' && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl p-6 relative">
                        <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        <h3 className="text-xl font-black text-slate-900 mb-6">Editar Perfil</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome Completo</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Objetivo</label>
                                <select
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 appearance-none"
                                >
                                    <option value="Emagrecimento">Emagrecimento</option>
                                    <option value="Hipertrofia">Hipertrofia</option>
                                    <option value="Força">Força</option>
                                    <option value="Condicionamento">Condicionamento</option>
                                </select>
                            </div>

                            <button
                                onClick={handleSaveProfile}
                                className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProfile;
