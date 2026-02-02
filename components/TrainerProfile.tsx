import React, { useState, useRef } from 'react';
import { User, Calendar, Edit2, CheckCircle2, ChevronRight, X, Camera, Eye, EyeOff } from 'lucide-react';
import { AuthUser } from '../types';

interface TrainerProfileProps {
    user: AuthUser;
    onUpdateProfile?: (updatedUser: Partial<AuthUser>) => void;
}

const TrainerProfile: React.FC<TrainerProfileProps> = ({ user, onUpdateProfile }) => {
    const [activeModal, setActiveModal] = useState<'edit' | 'schedule' | null>(null);

    // Form States
    const [formData, setFormData] = useState({
        name: user.name || '',
        surname: user.surname || '',
        email: user.email || '',
        instagram: user.instagram || '',
        whatsapp: user.whatsapp || '',
        cref: user.cref || '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            if (onUpdateProfile) {
                onUpdateProfile({ avatar: imageUrl });
            }
            alert('Foto de perfil atualizada!');
        }
    };

    const handleSaveProfile = () => {
        if (formData.password && formData.password !== formData.confirmPassword) {
            alert("As senhas não coincidem!");
            return;
        }

        if (onUpdateProfile) {
            onUpdateProfile({
                name: formData.name,
                surname: formData.surname,
                email: formData.email,
                instagram: formData.instagram,
                whatsapp: formData.whatsapp,
                cref: formData.cref
            });
        }
        setActiveModal(null);
    };

    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-300">
            {/* Header Profile */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col items-center">
                <div className="relative group cursor-pointer" onClick={() => activeModal === 'edit' && handlePhotoClick()}>
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500 shadow-xl mb-4 relative z-10 bg-slate-100">
                        <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                            alt={user.name}
                            className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
                        />
                    </div>
                    {/* Edit Badge for main view */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setActiveModal('edit'); }}
                        className="absolute bottom-6 right-0 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-colors z-20"
                    >
                        <Edit2 size={16} />
                    </button>
                </div>
                <h2 className="text-2xl font-black text-slate-800 text-center">{user.name} {user.surname}</h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">Personal Trainer {user.cref ? `• CREF: ${user.cref}` : ''}</p>
            </div>

            {/* Grid de Opções */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => setActiveModal('edit')}
                    className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between hover:bg-slate-50 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <User size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-black text-slate-900 text-lg">Editar Perfil</h3>
                            <p className="text-sm font-medium text-slate-400">Alterar dados pessoais</p>
                        </div>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </button>

                <button
                    onClick={() => setActiveModal('schedule')}
                    className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between hover:bg-slate-50 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Calendar size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-black text-slate-900 text-lg">Agenda</h3>
                            <p className="text-sm font-medium text-slate-400">Gerenciar horários</p>
                        </div>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </button>
            </div>

            {/* Modal Editar Perfil */}
            {activeModal === 'edit' && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
                    <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        <h3 className="text-xl font-black text-slate-900 mb-6 sticky top-0 bg-white z-10 pb-2 border-b border-transparent">Editar Perfil</h3>

                        <div className="space-y-4">
                            {/* Foto Upload */}
                            <div className="flex flex-col items-center justify-center mb-6">
                                <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-100 group-hover:border-indigo-200 transition-all">
                                        <img
                                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white" size={24} />
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-indigo-600 mt-2 cursor-pointer" onClick={handlePhotoClick}>Alterar Foto</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Nome</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Seu nome"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Sobrenome</label>
                                    <input
                                        type="text"
                                        name="surname"
                                        value={formData.surname}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Sobrenome"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                    placeholder="seu@email.com"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Instagram</label>
                                    <input
                                        type="text"
                                        name="instagram"
                                        value={formData.instagram}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                        placeholder="@usuario"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">CREF</label>
                                    <input
                                        type="text"
                                        name="cref"
                                        value={formData.cref}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                        placeholder="000000-G/UF"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">WhatsApp</label>
                                <input
                                    type="text"
                                    name="whatsapp"
                                    value={formData.whatsapp}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Senha</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 pr-10"
                                            placeholder="••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Confirmar Senha</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                        placeholder="••••••"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleSaveProfile}
                                    className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
                                >
                                    Salvar Alterações
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Agenda (Placeholder) */}
            {activeModal === 'schedule' && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl p-6 relative h-[600px] flex flex-col">
                        <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Agenda</h3>
                        <p className="text-sm font-medium text-slate-400 mb-6">Seus próximos compromissos.</p>

                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4">
                            <Calendar size={64} className="opacity-20" />
                            <p className="font-bold">Funcionalidade de Agenda em breve</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainerProfile;
