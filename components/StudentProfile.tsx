import React, { useState, useRef } from 'react';
import { User, Phone, Instagram, Edit2, X, Camera, MessageSquare } from 'lucide-react';
import { Student } from '../types';
import { formatPhone } from '../utils/formatters';

interface StudentProfileProps {
    student: Student;
    onUpdateProfile: (updatedStudent: Partial<Student>) => void;
    onBack?: () => void;
    initialModal?: 'edit' | null;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ student, onUpdateProfile, onBack, initialModal = null }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(student.name);
    const [instagram, setInstagram] = useState(student.instagram || '');
    const [whatsapp, setWhatsapp] = useState(student.whatsapp || '');
    const [activeModal, setActiveModal] = useState<'edit' | null>(initialModal);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (file.size > 2 * 1024 * 1024) {
                alert('A imagem é muito grande. Escolha uma imagem de até 2MB.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                onUpdateProfile({ avatar: base64String });
                alert('Foto de perfil atualizada!');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = () => {
        onUpdateProfile({
            name,
            instagram,
            whatsapp,
            phone: whatsapp // Ensure phone is also updated
        });

        if (initialModal === 'edit' && onBack) {
            onBack();
        } else {
            setActiveModal(null);
        }
        alert('Perfil atualizado com sucesso!');
    };

    const handleCloseEditModal = () => {
        if (initialModal === 'edit' && onBack) {
            onBack();
        } else {
            setActiveModal(null);
        }
    };

    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-300">
            {/* Header Profile */}
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col items-center transition-colors">
                <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500 shadow-xl mb-4 relative">
                        <img
                            src={student.avatar || `https://ui-avatars.com/api/?name=${student.name}&background=10b981&color=fff`}
                            alt={student.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-1">{student.name}</h2>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-6">Aluno</p>

                <div className="flex gap-3">
                    <button
                        onClick={() => setActiveModal('edit')}
                        className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl font-bold text-sm shadow-lg hover:opacity-90 transition-all active:scale-95"
                    >
                        <Edit2 size={16} /> Editar Perfil
                    </button>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
                            <MessageSquare size={20} />
                        </div>
                        <h3 className="font-bold text-zinc-800 dark:text-zinc-200">Contato</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400">WhatsApp</span>
                            <span className="text-sm font-bold text-zinc-800 dark:text-white">{student.whatsapp || student.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400">Instagram</span>
                            <span className="text-sm font-bold text-zinc-800 dark:text-white">@{student.instagram || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-zinc-100 dark:border-zinc-800 shadow-sm transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                            <User size={20} />
                        </div>
                        <h3 className="font-bold text-zinc-800 dark:text-zinc-200">Meus Dados</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400">Altura</span>
                            <span className="text-sm font-bold text-zinc-800 dark:text-white">{student.height}m</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400">Peso</span>
                            <span className="text-sm font-bold text-zinc-800 dark:text-white">{student.weight}kg</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Editar Perfil */}
            {activeModal === 'edit' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md" onClick={handleCloseEditModal} />
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <h3 className="text-xl font-black text-zinc-900 dark:text-white">Editar Perfil</h3>
                            <button onClick={handleCloseEditModal} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                <X size={20} className="text-zinc-500" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            {/* Foto Upload */}
                            <div className="flex flex-col items-center justify-center mb-6">
                                <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-zinc-100 dark:border-zinc-800 group-hover:border-emerald-500 transition-all">
                                        <img
                                            src={student.avatar || `https://ui-avatars.com/api/?name=${student.name}&background=10b981&color=fff`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 dark:bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white" size={24} />
                                    </div>
                                </div>
                                <p className="text-emerald-600 dark:text-emerald-400 mt-2 cursor-pointer transition-colors font-bold text-xs uppercase underline" onClick={handlePhotoClick}>Alterar Foto</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Nome Completo</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                                        <User size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Instagram (@)</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                                        <Instagram size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        value={instagram}
                                        onChange={(e) => setInstagram(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">WhatsApp</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                                        <Phone size={20} />
                                    </div>
                                    <input
                                        type="text"
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

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoChange}
            />
        </div>
    );
};

export default StudentProfile;
