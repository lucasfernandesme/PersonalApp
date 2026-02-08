import React, { useState } from 'react';
import { User, Edit2, X, GraduationCap, Target, Camera, Mail, Instagram, Phone } from 'lucide-react';
import { Student } from '../types';
import { formatPhone } from '../utils/formatters';

interface StudentProfileProps {
    student: Student;
    onUpdateProfile?: (updatedData: Partial<Student>) => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ student, onUpdateProfile }) => {
    const [activeModal, setActiveModal] = useState<'edit' | null>(null);
    const [name, setName] = useState(student.name);

    // Estados extras se quisermos permitir editar
    const [goal, setGoal] = useState(student.goal || '');
    const [email, setEmail] = useState(student.email);
    const [instagram, setInstagram] = useState(student.instagram || '');
    const [whatsapp, setWhatsapp] = useState(student.whatsapp || '');

    const handleSaveProfile = () => {
        if (onUpdateProfile) {
            onUpdateProfile({
                name,
                goal: goal as any,
                email,
                instagram,
                whatsapp,
                phone: whatsapp // Ensure phone is also updated
            });
        }
        setActiveModal(null);
        alert('Perfil atualizado com sucesso!');
    };

    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-300">
            {/* Header Profile */}
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col items-center transition-colors">
                <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500 shadow-xl mb-4 relative">
                        <img
                            src={student.avatar || `https://ui-avatars.com/api/?name=${student.name}&background=10b981&color=fff`}
                            alt={student.name}
                            className="w-full h-full object-cover transition-opacity group-hover:opacity-75"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={32} className="text-white" />
                        </div>
                    </div>
                    <button
                        className="absolute bottom-2 right-2 p-2 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition-colors pointer-events-none"
                    >
                        <Edit2 size={16} />
                    </button>
                    <input
                        type="file"
                        id="avatar-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && onUpdateProfile) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    onUpdateProfile({ avatar: reader.result as string });
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                </div>
                <h2 className="text-2xl font-black text-zinc-800 dark:text-white text-center transition-colors">{student.name}</h2>
                <p className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">Aluno</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-[28px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center gap-2 transition-colors">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-colors">
                        <Target size={20} />
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase">Objetivo</p>
                        <p className="text-sm font-bold text-zinc-800 dark:text-white transition-colors">{student.goal || 'Não definido'}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-[28px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center gap-2 transition-colors">
                    <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-900 dark:text-zinc-100 transition-colors">
                        <GraduationCap size={20} />
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase">Nível</p>
                        <p className="text-sm font-bold text-zinc-800 dark:text-white transition-colors">{student.experience || 'Iniciante'}</p>
                    </div>
                </div>
            </div>

            {/* Opções */}
            <div className="space-y-3">
                <button
                    onClick={() => setActiveModal('edit')}
                    className="w-full bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group"
                >
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <User size={24} />
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-black text-zinc-900 dark:text-white text-lg transition-colors">Editar Perfil</h3>
                        <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500">Alterar nome e objetivo</p>
                    </div>
                </button>
            </div>

            {/* Modal Editar Perfil */}
            {activeModal === 'edit' && (
                <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-[32px] w-full max-w-sm shadow-2xl p-6 relative border dark:border-zinc-800 transition-colors">
                        <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-6 transition-colors">Editar Perfil</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Nome Completo</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Objetivo</label>
                                <select
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white focus:ring-2 focus:ring-emerald-500 appearance-none transition-all"
                                >
                                    <option value="Emagrecimento">Emagrecimento</option>
                                    <option value="Hipertrofia">Hipertrofia</option>
                                    <option value="Força">Força</option>
                                    <option value="Condicionamento">Condicionamento</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Instagram</label>
                                <div className="relative">
                                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                    <input
                                        type="text"
                                        value={instagram}
                                        onChange={(e) => setInstagram(e.target.value)}
                                        placeholder="@usuario"
                                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">WhatsApp</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                    <input
                                        type="tel"
                                        value={whatsapp}
                                        onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                                        placeholder="(00) 00000-0000"
                                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                                    />
                                </div>
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
