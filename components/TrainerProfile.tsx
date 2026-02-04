import React, { useState, useRef, useEffect } from 'react';
import { User, Calendar, Edit2, CheckCircle2, ChevronRight, X, Camera, Eye, EyeOff, BarChart2 } from 'lucide-react';
import { AuthUser, ScheduleEvent } from '../types'; // Import ScheduleEvent
import AgendaScreen from './AgendaScreen';
import ScheduleEventModal from './ScheduleEventModal';
import ReportsScreen from './ReportsScreen';
import { DataService } from '../services/dataService'; // Assuming DataService will handle fetching students

interface TrainerProfileProps {
    user: AuthUser;
    onUpdateProfile?: (updatedUser: Partial<AuthUser>) => void;
    onBack?: () => void;
}

const TrainerProfile: React.FC<TrainerProfileProps> = ({ user, onUpdateProfile, onBack }) => {
    const [activeModal, setActiveModal] = useState<'edit' | 'schedule' | 'reports' | null>(null);

    // Agenda State
    const [events, setEvents] = useState<ScheduleEvent[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('fitai_pro_events');
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    const [students, setStudents] = useState<any[]>([]); // Need to fetch students for the dropdown
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedDateForEvent, setSelectedDateForEvent] = useState<Date>(new Date());
    const [eventToEdit, setEventToEdit] = useState<ScheduleEvent | undefined>(undefined);

    // Load initial data for students
    useEffect(() => {
        // Load Students for selector
        DataService.getStudents().then(setStudents);
    }, []);

    // Save events to local storage whenever they change
    useEffect(() => {
        localStorage.setItem('fitai_pro_events', JSON.stringify(events));
    }, [events]);

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

                    newEvents.push({
                        ...eventData,
                        id: Math.random().toString(36).substr(2, 9),
                        trainerId: user.id,
                        start: eventStart.toISOString(),
                        end: eventEnd.toISOString(),
                        status: 'planned'
                    } as ScheduleEvent);
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }

            if (eventData.id) {
                // If editing and converting to recurring, we might want to keep the original ID for the first one, 
                // but for simplicity, allow generating new set. 
                // NOTE: This simple logic creates NEW events. Updating a series is complex.
                // We will update the state by adding these new ones.
                setEvents(prev => {
                    const filtered = prev.filter(e => e.id !== eventData.id); // Remove the one being edited if exists
                    return [...filtered, ...newEvents];
                });
            } else {
                setEvents(prev => [...prev, ...newEvents]);
            }

        } else {
            // Single event logic (existing)
            if (eventData.id) {
                // Edit existing
                setEvents(prev => prev.map(e => e.id === eventData.id ? { ...e, ...eventData } as ScheduleEvent : e));
            } else {
                // Add new
                const newEvent: ScheduleEvent = {
                    id: Math.random().toString(36).substr(2, 9),
                    trainerId: user.id,
                    ...eventData
                } as ScheduleEvent;
                setEvents(prev => [...prev, newEvent]);
            }
        }

        setIsEventModalOpen(false);
        setEventToEdit(undefined);
    };

    const handleDeleteEvent = (eventId: string) => {
        setEvents(prev => prev.filter(e => e.id !== eventId));
        setIsEventModalOpen(false);
        setEventToEdit(undefined);
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
        <div className="space-y-6 pb-24 animate-in fade-in duration-300 transition-colors">
            {/* Header Profile */}
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col items-center transition-colors relative">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="absolute top-6 left-6 p-2 text-zinc-400 hover:text-indigo-600 dark:text-zinc-500 dark:hover:text-white transition-colors"
                    >
                        {/* We need to import ArrowLeft first, but it is not imported. I will just use text or assume ArrowLeft is available? 
                            Wait, ArrowLeft is likely NOT imported. 
                            I should check imports. 
                            Line 2 has imports.
                            I will check if ArrowLeft is imported.
                          */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                    </button>
                )}
                <div className="relative group cursor-pointer" onClick={() => activeModal === 'edit' && handlePhotoClick()}>
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500 shadow-xl mb-4 relative z-10 bg-zinc-100 dark:bg-zinc-800 transition-colors">
                        <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                            alt={user.name}
                            className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
                        />
                    </div>
                    {/* Edit Badge for main view */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setActiveModal('edit'); }}
                        className="absolute bottom-6 right-0 p-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors z-20"
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
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white dark:group-hover:text-white transition-colors">
                            <User size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-black text-zinc-900 dark:text-white text-lg transition-colors">Editar Perfil</h3>
                            <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 transition-colors">Alterar dados pessoais</p>
                        </div>
                    </div>
                    <ChevronRight className="text-zinc-300 dark:text-zinc-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                </button>

                <button
                    onClick={() => setActiveModal('schedule')}
                    className="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white dark:group-hover:text-white transition-colors">
                            <Calendar size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-black text-zinc-900 dark:text-white text-lg transition-colors">Agenda</h3>
                            <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 transition-colors">Gerenciar horários</p>
                        </div>
                    </div>
                    <ChevronRight className="text-zinc-300 dark:text-zinc-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                </button>

                <button
                    onClick={() => setActiveModal('reports')}
                    className="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group md:col-span-2"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white dark:group-hover:text-white transition-colors">
                            <BarChart2 size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-black text-zinc-900 dark:text-white text-lg transition-colors">Relatórios de Aulas</h3>
                            <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 transition-colors">Filtrar e analisar atendimentos</p>
                        </div>
                    </div>
                    <ChevronRight className="text-zinc-300 dark:text-zinc-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                </button>
            </div>

            {/* Modal Editar Perfil */}
            {activeModal === 'edit' && (
                <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
                    <div className="bg-white dark:bg-zinc-900 rounded-[32px] w-full max-w-lg shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto border dark:border-zinc-800 transition-colors">
                        <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"><X size={24} /></button>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-6 sticky top-0 bg-white dark:bg-zinc-900 z-10 pb-2 border-b border-transparent transition-colors">Editar Perfil</h3>

                        <div className="space-y-4">
                            {/* Foto Upload */}
                            <div className="flex flex-col items-center justify-center mb-6">
                                <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-100 dark:border-indigo-900/50 group-hover:border-indigo-200 dark:group-hover:border-indigo-500 transition-all">
                                        <img
                                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 dark:bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white" size={24} />
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-2 cursor-pointer transition-colors" onClick={handlePhotoClick}>Alterar Foto</p>
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
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500 transition-colors"
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
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500 transition-colors"
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
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500 transition-colors"
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
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500 transition-colors"
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
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500 transition-colors"
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
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500 transition-colors"
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
                                            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500 pr-10 transition-colors"
                                            placeholder="••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -tranzinc-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
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
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500 transition-colors"
                                        placeholder="••••••"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleSaveProfile}
                                    className="w-full py-4 bg-indigo-600 dark:bg-indigo-500 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all active:scale-95"
                                >
                                    Salvar Alterações
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

                        <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors z-10"><X size={24} /></button>

                        <AgendaScreen
                            events={events}
                            students={students}
                            onAddEvent={(date) => {
                                setSelectedDateForEvent(date);
                                setEventToEdit(undefined);
                                setIsEventModalOpen(true);
                            }}
                            onEditEvent={(event) => {
                                setEventToEdit(event);
                                setIsEventModalOpen(true);
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

                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainerProfile;
