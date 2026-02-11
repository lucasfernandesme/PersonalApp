import React, { useState, useRef, useEffect } from 'react';
import { User, Calendar, Edit2, CheckCircle2, ChevronRight, X, Camera, Eye, EyeOff, BarChart2, Loader2, ArrowLeft, CreditCard, RefreshCw, Zap } from 'lucide-react';
import { AuthUser, ScheduleEvent } from '../types'; // Import ScheduleEvent
import AgendaScreen from './AgendaScreen';
import ScheduleEventModal from './ScheduleEventModal';
import ClassDetailsModal from './ClassDetailsModal';
import ReportsScreen from './ReportsScreen';
import { DataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { formatPhone } from '../utils/formatters';

interface TrainerProfileProps {
    user: AuthUser;
    onUpdateProfile?: (updatedUser: Partial<AuthUser>) => void;
    onBack?: () => void;
}

const statusMap: Record<string, { label: string; color: string }> = {
    'active': { label: 'Ativo', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    'trial': { label: 'Teste Grátis', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    'past_due': { label: 'Pendente', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    'canceled': { label: 'Cancelado', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
    'unpaid': { label: 'Inativo', color: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' },
};

const TrainerProfile: React.FC<TrainerProfileProps> = ({ user, onUpdateProfile, onBack }) => {
    const { subscriptionStatus, subscriptionEndDate, refreshSubscription, session } = useAuth();
    const [activeModal, setActiveModal] = useState<'edit' | 'schedule' | 'reports' | 'subscription' | null>(null);
    const [isRedirecting, setIsRedirecting] = useState(false);

    // Agenda State
    const [events, setEvents] = useState<ScheduleEvent[]>([]);

    const [students, setStudents] = useState<any[]>([]); // Need to fetch students for the dropdown
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedDateForEvent, setSelectedDateForEvent] = useState<Date>(new Date());
    const [eventToEdit, setEventToEdit] = useState<ScheduleEvent | undefined>(undefined);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | undefined>(undefined);

    // Load initial data for students and agenda
    useEffect(() => {
        // Load Students for selector
        DataService.getStudents(user.id).then(setStudents);

        // Load Agenda Events from Cloud
        if (user?.id) {
            DataService.getScheduleEvents(user.id).then(setEvents);
        }
    }, [user?.id]);

    const handleAddEvent = (eventData: Partial<ScheduleEvent> & { recurringDays?: number[], recurrenceDuration?: number }) => {
        let newEvents: ScheduleEvent[] = [];

        if (eventData.isRecurring && eventData.recurringDays && eventData.recurrenceDuration) {
            // Generate recurring events
            const startDate = new Date(eventData.start!);
            const durationMonths = eventData.recurrenceDuration;
            const targetDays = eventData.recurringDays; // 0=Sun, 1=Mon, etc.

            // Calculate end date
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + durationMonths);

            let currentDate = new Date(startDate);

            // Loop through each day until end date
            while (currentDate <= endDate) {
                // date-fns getDay returns 0 for Sunday
                if (targetDays.includes(currentDate.getDay())) {
                    // Create event for this day
                    // Maintain the original time
                    const eventStart = new Date(currentDate);
                    const originalStart = new Date(eventData.start!);
                    eventStart.setHours(originalStart.getHours(), originalStart.getMinutes(), 0);

                    const eventEnd = new Date(currentDate);
                    const originalEnd = new Date(eventData.end!);
                    eventEnd.setHours(originalEnd.getHours(), originalEnd.getMinutes(), 0);

                    const newEvent: ScheduleEvent = {
                        ...eventData,
                        id: Math.random().toString(36).substr(2, 9),
                        trainerId: user.id,
                        start: eventStart.toISOString(),
                        end: eventEnd.toISOString(),
                        status: 'planned'
                    } as ScheduleEvent;

                    newEvents.push(newEvent);
                    // Non-blocking background save to cloud
                    DataService.saveScheduleEvent(newEvent).catch(err => console.error("Erro ao salvar evento recorrente:", err));
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }

            if (eventData.id) {
                setEvents(prev => {
                    const filtered = prev.filter(e => e.id !== eventData.id);
                    return [...filtered, ...newEvents];
                });
            } else {
                setEvents(prev => [...prev, ...newEvents]);
            }

        } else {
            // Single event logic
            if (eventData.id) {
                // Edit existing
                const updatedEvent = { ...eventData, trainerId: user.id } as ScheduleEvent;
                setEvents(prev => prev.map(e => e.id === eventData.id ? { ...e, ...updatedEvent } : e));
                DataService.saveScheduleEvent(updatedEvent).catch(err => console.error("Erro ao atualizar evento:", err));
            } else {
                // Add new
                const newEvent: ScheduleEvent = {
                    id: Math.random().toString(36).substr(2, 9),
                    trainerId: user.id,
                    ...eventData,
                    status: eventData.status || 'planned'
                } as ScheduleEvent;
                setEvents(prev => [...prev, newEvent]);
                DataService.saveScheduleEvent(newEvent).catch(err => console.error("Erro ao salvar novo evento:", err));
            }
        }

        setIsEventModalOpen(false);
        setEventToEdit(undefined);
    };

    const handleDeleteEvent = (eventId: string) => {
        setEvents(prev => prev.filter(e => e.id !== eventId));
        DataService.deleteScheduleEvent(eventId).catch(err => console.error("Erro ao deletar evento:", err));
        setIsEventModalOpen(false);
        setEventToEdit(undefined);
    };



    const handleSubscribe = async () => {
        setIsRedirecting(true);
        console.log('Iniciando handleSubscribe via Direct Fetch...');

        try {
            // Garante sessão fresca
            const { data: { session: freshSession } } = await supabase.auth.refreshSession();
            const sessionToUse = freshSession || session;
            if (!sessionToUse) throw new Error('Sessão não encontrada. Por favor, saia e entre novamente.');

            const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`;
            const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
            console.log('[DEBUG] URL:', functionUrl);
            console.log('[DEBUG] Key Prefix:', anonKey?.substring(0, 10));
            console.log('[DEBUG] Token Prefix:', sessionToUse.access_token.substring(0, 10));

            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToUse.access_token}`,
                    'apikey': anonKey
                },
                body: JSON.stringify({ priceId: 'price_1SxYEd2ZxwvErFzHuO5bLQLA' })
            });

            console.log('Status da resposta:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro do servidor (Status: ${response.status})`);
            }

            const data = await response.json();
            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error('Não recebi o link de pagamento do servidor.');
            }
        } catch (err: any) {
            console.error('Erro detalhado no checkout:', err);
            alert(`[DIRECT FETCH] Erro ao iniciar pagamento: ${err.message}`);
        } finally {
            setIsRedirecting(false);
        }
    };

    const handleManageSubscription = async () => {
        setIsSavingLocal(true);
        try {
            const { data: { session: freshSession } } = await supabase.auth.refreshSession();
            const sessionToUse = freshSession || session;
            if (!sessionToUse) throw new Error('Sessão não encontrada');

            const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`;
            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToUse.access_token}`,
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Erro ao abrir portal');
            }

            const data = await response.json();
            if (data?.url) {
                window.location.href = data.url;
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSavingLocal(false);
        }
    };
    const handleRefreshStatus = async () => {
        setIsSavingLocal(true);
        try {
            await refreshSubscription();
            alert('Status atualizado!');
        } finally {
            setIsSavingLocal(false);
        }
    };

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

    // Keep formData in sync with user prop
    useEffect(() => {
        setFormData({
            name: user.name || '',
            surname: user.surname || '',
            email: user.email || '',
            instagram: user.instagram || '',
            whatsapp: user.whatsapp || '',
            cref: user.cref || '',
            password: '',
            confirmPassword: ''
        });
    }, [user]);

    const [isSavingLocal, setIsSavingLocal] = useState(false);
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

            // Verificar tamanho (limitar a 2MB para base64)
            if (file.size > 2 * 1024 * 1024) {
                alert('[DIRECT FETCH] A imagem é muito grande. Escolha uma imagem de até 2MB.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                if (onUpdateProfile) {
                    onUpdateProfile({ avatar: base64String });
                }
                alert('Foto de perfil atualizada!');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        if (formData.password && formData.password !== formData.confirmPassword) {
            alert("As senhas não coincidem!");
            return;
        }

        if (onUpdateProfile) {
            setIsSavingLocal(true);
            try {
                await onUpdateProfile({
                    name: formData.name,
                    surname: formData.surname,
                    email: formData.email,
                    instagram: formData.instagram,
                    whatsapp: formData.whatsapp,
                    cref: formData.cref,
                    ...(formData.password ? { password: formData.password } : {})
                });
                setActiveModal(null);
            } catch (error) {
                console.error("Erro ao salvar perfil:", error);
                alert("Ocorreu um erro ao salvar as alterações. Tente novamente.");
            } finally {
                setIsSavingLocal(false);
            }
        }
    };

    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-300 transition-colors">
            {/* Header Profile */}
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col items-center transition-colors relative">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="absolute top-6 left-6 p-2 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white transition-colors bg-zinc-50 dark:bg-zinc-800 rounded-xl"
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}
                <div className="relative group cursor-pointer" onClick={() => activeModal === 'edit' && handlePhotoClick()}>
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-900 dark:border-zinc-100 shadow-xl mb-4 relative z-10 bg-zinc-100 dark:bg-zinc-800 transition-colors">
                        <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=18181b&color=fff`}
                            alt={user.name}
                            className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
                        />
                    </div>
                    {/* Edit Badge for main view */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setActiveModal('edit'); }}
                        className="absolute bottom-6 right-0 p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl shadow-lg hover:bg-zinc-800 dark:hover:bg-white transition-colors z-20"
                    >
                        <Edit2 size={16} />
                    </button>
                </div>
                <h2 className="text-2xl font-black text-zinc-800 dark:text-white text-center transition-colors">{user.name} {user.surname}</h2>
                <p className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide transition-colors">Personal Trainer {user.cref ? `• CREF: ${user.cref}` : ''}</p>
            </div>

            {/* Grid de Opções */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => setActiveModal('edit')}
                    className="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-colors">
                            <User size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-black text-zinc-900 dark:text-white text-lg transition-colors">Editar Perfil</h3>
                            <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 transition-colors">Alterar dados pessoais</p>
                        </div>
                    </div>
                    <ChevronRight className="text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                </button>

                <button
                    onClick={() => setActiveModal('schedule')}
                    className="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-colors">
                            <Calendar size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-black text-zinc-900 dark:text-white text-lg transition-colors">Agenda</h3>
                            <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 transition-colors">Gerenciar horários</p>
                        </div>
                    </div>
                    <ChevronRight className="text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                </button>

                <button
                    onClick={() => setActiveModal('reports')}
                    className="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-colors">
                            <BarChart2 size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-black text-zinc-900 dark:text-white text-lg transition-colors">Relatórios</h3>
                            <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 transition-colors">Analisar aulas</p>
                        </div>
                    </div>
                    <ChevronRight className="text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                </button>

                <button
                    onClick={() => setActiveModal('subscription')}
                    className="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-colors">
                            <CreditCard size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-black text-zinc-900 dark:text-white text-lg transition-colors">Assinatura</h3>
                            <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 transition-colors">Plano Pro</p>
                        </div>
                    </div>
                    <ChevronRight className="text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                </button>
            </div>

            {/* Modal Editar Perfil */}
            {activeModal === 'edit' && (
                <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
                    <div className="bg-white dark:bg-zinc-900 rounded-[32px] w-full max-w-lg shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto border dark:border-zinc-800 transition-colors">
                        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white dark:bg-zinc-900 z-10 pt-[env(safe-area-inset-top)] pb-4 border-b border-zinc-50 dark:border-zinc-800 transition-colors">
                            <button onClick={() => setActiveModal(null)} className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-bold text-xs uppercase tracking-widest transition-colors">
                                <ArrowLeft size={18} />
                                Voltar
                            </button>
                            <h3 className="text-xl font-black text-zinc-900 dark:text-white">Editar Perfil</h3>
                            <button onClick={() => setActiveModal(null)} className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Foto Upload */}
                            <div className="flex flex-col items-center justify-center mb-6">
                                <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-zinc-100 dark:border-zinc-800 group-hover:border-zinc-900 dark:group-hover:border-zinc-100 transition-all">
                                        <img
                                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 dark:bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white" size={24} />
                                    </div>
                                </div>
                                <p className="text-zinc-900 dark:text-zinc-100 mt-2 cursor-pointer transition-colors font-bold text-xs uppercase underline" onClick={handlePhotoClick}>Alterar Foto</p>
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
                                    <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1.5 ml-1 transition-colors">Nome</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
                                        placeholder="Seu nome"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1.5 ml-1 transition-colors">Sobrenome</label>
                                    <input
                                        type="text"
                                        name="surname"
                                        value={formData.surname}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
                                        placeholder="Sobrenome"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1.5 ml-1 transition-colors">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
                                    placeholder="seu@email.com"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1.5 ml-1 transition-colors">Instagram</label>
                                    <input
                                        type="text"
                                        name="instagram"
                                        value={formData.instagram}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
                                        placeholder="@usuario"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1.5 ml-1 transition-colors">CREF</label>
                                    <input
                                        type="text"
                                        name="cref"
                                        value={formData.cref}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
                                        placeholder="000000-G/UF"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1.5 ml-1 transition-colors">WhatsApp</label>
                                <input
                                    type="text"
                                    name="whatsapp"
                                    value={formData.whatsapp}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, whatsapp: formatPhone(e.target.value) }));
                                    }}
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1.5 ml-1 transition-colors">Senha</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 pr-10 transition-colors"
                                            placeholder="••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1.5 ml-1 transition-colors">Confirmar Senha</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
                                        placeholder="••••••"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSavingLocal}
                                    className="w-full py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black rounded-2xl shadow-lg shadow-zinc-900/20 dark:shadow-zinc-100/10 hover:bg-zinc-800 dark:hover:bg-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSavingLocal ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Salvando...
                                        </>
                                    ) : (
                                        'Salvar Alterações'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Relatórios */}
            {activeModal === 'reports' && (
                <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-[32px] w-full max-w-2xl shadow-2xl p-6 relative h-[80vh] flex flex-col border dark:border-zinc-800 transition-colors">
                        <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors z-10"><X size={24} /></button>
                        <ReportsScreen
                            events={events}
                            students={students}
                            onClose={() => setActiveModal(null)}
                        />
                    </div>
                </div>
            )}

            {/* Modal Agenda */}
            {activeModal === 'schedule' && (
                <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 md:rounded-[32px] w-full h-full md:max-w-4xl shadow-2xl p-6 relative flex flex-col border dark:border-zinc-800 transition-colors">
                        <AgendaScreen
                            events={events}
                            students={students}
                            onAddEvent={(date) => {
                                setSelectedDateForEvent(date);
                                setEventToEdit(undefined);
                                setIsEventModalOpen(true);
                            }}
                            onEditEvent={(event) => {
                                setSelectedEvent(event);
                                setIsDetailsModalOpen(true);
                            }}
                            onClose={() => setActiveModal(null)}
                        />

                        {isEventModalOpen && (
                            <ScheduleEventModal
                                initialDate={selectedDateForEvent}
                                existingEvent={eventToEdit}
                                students={students}
                                onSave={handleAddEvent}
                                onDelete={handleDeleteEvent}
                                onClose={() => setIsEventModalOpen(false)}
                            />
                        )}

                        {isDetailsModalOpen && selectedEvent && (
                            <ClassDetailsModal
                                event={selectedEvent}
                                onUpdate={(updates) => {
                                    const updatedEvent = { ...selectedEvent, ...updates };
                                    setEvents(prev => prev.map(e => e.id === selectedEvent.id ? updatedEvent : e));
                                    DataService.saveScheduleEvent(updatedEvent as ScheduleEvent).catch(err => console.error("Erro ao atualizar:", err));
                                }}
                                onEdit={() => {
                                    setEventToEdit(selectedEvent);
                                    setIsDetailsModalOpen(false);
                                    setIsEventModalOpen(true);
                                }}
                                onDelete={() => {
                                    handleDeleteEvent(selectedEvent.id);
                                    setIsDetailsModalOpen(false);
                                }}
                                onClose={() => setIsDetailsModalOpen(false)}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Modal Assinatura */}
            {activeModal === 'subscription' && (
                <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-[32px] w-full max-w-lg shadow-2xl relative overflow-hidden border dark:border-zinc-800 transition-colors">
                        <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors z-10"><X size={24} /></button>
                        <div className="p-8">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-900 dark:text-zinc-100 mb-6 mx-auto">
                                <CreditCard size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white text-center mb-2">Sua Assinatura</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 text-center mb-8">Gerencie seus detalhes de pagamento e plano.</p>

                            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 mb-8">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase">Status do Plano</span>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusMap[subscriptionStatus || 'unpaid']?.color || statusMap['unpaid'].color}`}>
                                        {statusMap[subscriptionStatus || 'unpaid']?.label || 'Inativo'}
                                    </span>
                                </div>
                                <div className="text-lg font-black text-zinc-900 dark:text-white">Plano Personal Pro</div>
                                {subscriptionEndDate && (
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Expira em: {new Date(subscriptionEndDate).toLocaleDateString('pt-BR')}</p>
                                )}
                            </div>

                            {subscriptionStatus === 'trial' && subscriptionEndDate && (
                                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50 text-center">
                                    <p className="text-sm text-blue-600 dark:text-blue-400 font-bold mb-1">Seu teste expira em</p>
                                    <div className="text-3xl font-black text-blue-700 dark:text-blue-300">
                                        {Math.ceil((new Date(subscriptionEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias
                                    </div>
                                    <p className="text-[10px] text-blue-500/70 dark:text-blue-400/70 mt-1 font-bold uppercase tracking-widest">Aproveite todos os recursos</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                {subscriptionStatus !== 'active' ? (
                                    <button
                                        onClick={handleSubscribe}
                                        disabled={isRedirecting}
                                        className="w-full py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {isRedirecting ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                Redirecionando...
                                            </>
                                        ) : (
                                            'ASSINAR PRO PLAN'
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleManageSubscription}
                                        disabled={isSavingLocal}
                                        className="w-full py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {isSavingLocal ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <Zap size={20} />
                                        )}
                                        {isSavingLocal ? 'Abrindo...' : 'GERENCIAR ASSINATURA'}
                                    </button>
                                )}

                                <button
                                    onClick={handleRefreshStatus}
                                    disabled={isSavingLocal}
                                    className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 text-xs uppercase"
                                >
                                    {isSavingLocal ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                                    Atualizar Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainerProfile;
