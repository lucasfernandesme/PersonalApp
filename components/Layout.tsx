
import React, { useState } from 'react';
import { UserRole } from '../types';
import {
    Dumbbell,
    Users,
    LayoutDashboard,
    LogOut,
    TrendingUp,
    MessageSquare,
    LogOut as LogoutIcon,
    Instagram,
    MessageCircle,
    User,
    Moon,
    Sun,
    Calendar,
    FileText,
    CreditCard,
    DollarSign
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
    children: React.ReactNode;
    role: UserRole;
    onSwitchRole: () => void;
    onNavigate: (tab: 'home' | 'students' | 'evolution' | 'chat' | 'workout' | 'profile' | 'agenda' | 'reports' | 'finance' | 'subscription') => void;
    activeTab: string;
    userName?: string;
    userAvatar?: string;
    trainerSocials?: { instagram?: string; whatsapp?: string };
}

const Layout: React.FC<LayoutProps> = ({ children, role, onSwitchRole, onNavigate, activeTab, userName, userAvatar, trainerSocials }) => {
    const { theme, toggleTheme } = useTheme();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleSocialClick = (type: 'instagram' | 'whatsapp') => {
        if (!trainerSocials) return;
        let link = type === 'instagram' ? trainerSocials.instagram : trainerSocials.whatsapp;

        if (link) {
            if (type === 'instagram' && !link.startsWith('http')) {
                link = `https://instagram.com/${link.replace('@', '')}`;
            } else if (type === 'whatsapp' && !link.startsWith('http')) {
                link = `https://wa.me/${link.replace(/\D/g, '')}`;
            }
            window.open(link, '_blank');
        } else {
            alert(`O personal ainda não cadastrou o ${type === 'instagram' ? 'Instagram' : 'WhatsApp'}.`);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-20 md:pb-0 transition-colors duration-300">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 bg-zinc-950 dark:bg-white flex-col fixed inset-y-0 left-0 z-50 shadow-2xl">
                <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
                    <img src={theme === 'dark' ? "/logo10.png" : "/logo9.png"} alt="PersonalFlow" className="w-16 h-16 object-contain drop-shadow-md" />
                    <span className="font-outfit font-black italic tracking-tighter text-2xl bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 dark:from-zinc-950 dark:to-zinc-500">PersonalFlow</span>
                </div>

                <div className="px-6 pb-2 -mt-4 mb-2 text-center">
                    <p className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-600">Frequência de treinos</p>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-200">Segunda a Domingo</p>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    {role === UserRole.TRAINER ? (
                        <>
                            <NavItem icon={<LayoutDashboard size={20} />} label="Início" active={activeTab === 'home'} onClick={() => onNavigate('home')} />
                            <NavItem icon={<Users size={20} />} label="Meus Alunos" active={activeTab === 'students'} onClick={() => onNavigate('students')} />
                            <NavItem icon={<Calendar size={20} />} label="Agenda" active={activeTab === 'agenda'} onClick={() => onNavigate('agenda')} />
                            <NavItem icon={<TrendingUp size={20} />} label="Evolução" active={activeTab === 'evolution'} onClick={() => onNavigate('evolution')} />
                            <NavItem icon={<User size={20} />} label="Perfil" active={activeTab === 'profile'} onClick={() => onNavigate('profile')} />
                        </>
                    ) : (
                        <>
                            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'home'} onClick={() => onNavigate('home')} />
                            <NavItem icon={<TrendingUp size={20} />} label="Evolução" active={activeTab === 'evolution'} onClick={() => onNavigate('evolution')} />
                            <NavItem icon={<Instagram size={20} />} label="Instagram" onClick={() => handleSocialClick('instagram')} />
                            <NavItem icon={<WhatsAppIcon size={20} />} label="WhatsApp" onClick={() => handleSocialClick('whatsapp')} />
                            <NavItem icon={<MessageSquare size={20} />} label="Chat IA" active={activeTab === 'chat'} onClick={() => onNavigate('chat')} />
                            <NavItem icon={<User size={20} />} label="Perfil" active={activeTab === 'profile'} onClick={() => onNavigate('profile')} />
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 transition-colors space-y-4">
                    <div className="flex items-center justify-between px-2 mb-2">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-600">Tema</span>
                        <button
                            onClick={toggleTheme}
                            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                    </div>

                    <div className="flex items-center gap-3 px-2 py-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                        <img src={userAvatar || `https://picsum.photos/seed/${role}/40/40`} className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 object-cover" alt="User" />
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-black truncate text-zinc-900 dark:text-zinc-200 uppercase tracking-tight font-outfit">{userName || 'Usuário'}</p>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-bold uppercase">{role === UserRole.TRAINER ? 'Personal' : 'Aluno'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Top Header */}
            <header className="flex-none w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 px-4 flex items-center justify-between sticky top-0 pb-4 pt-[calc(1rem+env(safe-area-inset-top))]">
                <div className="flex items-center gap-2">
                    <button onClick={toggleTheme} className="text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full p-2 w-10">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <img src={theme === 'dark' ? "/logo10.png" : "/logo9.png"} alt="PersonalFlow" className="h-8 w-auto object-contain drop-shadow-sm" />
                    <span className="font-outfit font-black italic tracking-tighter text-xl bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 uppercase">PersonalFlow</span>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="relative group focus:outline-none"
                    >
                        <div className={`w-10 h-10 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-black uppercase text-sm shadow-lg border-2 transition-all active:scale-95 overflow-hidden ${showProfileMenu ? 'border-zinc-500 dark:border-zinc-400 ring-2 ring-zinc-500/20' : 'border-transparent group-hover:border-zinc-500 dark:group-hover:border-zinc-400'}`}>
                            {userAvatar ? (
                                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span>{userName?.charAt(0).toUpperCase() || 'U'}</span>
                            )}
                        </div>
                    </button>

                    {showProfileMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowProfileMenu(false)}
                            />
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-[24px] shadow-2xl border border-zinc-100 dark:border-zinc-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                                    <p className="text-sm font-black text-zinc-950 dark:text-white truncate font-outfit uppercase">
                                        {userName || 'Usuário'}
                                    </p>
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate uppercase tracking-widest font-bold mt-0.5">
                                        {role === UserRole.TRAINER ? 'Personal Trainer' : 'Aluno'}
                                    </p>
                                </div>

                                <div className="p-1 max-h-[70vh] overflow-y-auto no-scrollbar">
                                    <MenuButton
                                        onClick={() => {
                                            setShowProfileMenu(false);
                                            onNavigate('profile');
                                        }}
                                        icon={<User size={16} strokeWidth={2.5} />}
                                        label="Meu Perfil"
                                    />

                                    {role === UserRole.TRAINER && (
                                        <>
                                            <MenuButton
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    onNavigate('agenda');
                                                }}
                                                icon={<Calendar size={16} strokeWidth={2.5} />}
                                                label="Agenda"
                                            />
                                            <MenuButton
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    onNavigate('reports');
                                                }}
                                                icon={<FileText size={16} strokeWidth={2.5} />}
                                                label="Relatórios"
                                            />
                                            <MenuButton
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    onNavigate('finance');
                                                }}
                                                icon={<DollarSign size={16} strokeWidth={2.5} />}
                                                label="Financeiro"
                                            />
                                            <MenuButton
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    onNavigate('subscription');
                                                }}
                                                icon={<CreditCard size={16} strokeWidth={2.5} />}
                                                label="Assinatura"
                                            />
                                            <MenuButton
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    onNavigate('evolution');
                                                }}
                                                icon={<TrendingUp size={16} strokeWidth={2.5} />}
                                                label="Evolução"
                                            />
                                        </>
                                    )}

                                    <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

                                    <MenuButton
                                        onClick={() => {
                                            setShowProfileMenu(false);
                                            onSwitchRole();
                                        }}
                                        icon={<LogOut size={16} strokeWidth={2.5} />}
                                        label="Sair do Sistema"
                                        variant="danger"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 lg:p-8 pt-[calc(1rem+env(safe-area-inset-top))]">
                <div className="max-w-4xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200/50 dark:border-zinc-800/50 px-6 py-3 flex justify-between items-center z-40 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] dark:shadow-none transition-all duration-300 safe-bottom">
                <BottomNavItem icon={<LayoutDashboard size={24} />} active={activeTab === 'home'} onClick={() => onNavigate('home')} />
                {
                    role === UserRole.TRAINER ? (
                        <>
                            <BottomNavItem icon={<Users size={24} />} active={activeTab === 'students'} onClick={() => onNavigate('students')} />
                            <BottomNavItem icon={<Calendar size={24} />} active={activeTab === 'agenda'} onClick={() => onNavigate('agenda')} />
                        </>
                    ) : (
                        <>
                            <BottomNavItem icon={<Instagram size={24} />} onClick={() => handleSocialClick('instagram')} />
                            <BottomNavItem icon={<WhatsAppIcon size={24} />} onClick={() => handleSocialClick('whatsapp')} />
                            <BottomNavItem icon={<MessageSquare size={24} />} active={activeTab === 'chat'} onClick={() => onNavigate('chat')} />
                        </>
                    )
                }
            </nav >
        </div >
    );
};

const MenuButton = ({ onClick, icon, label, variant = 'default' }: { onClick: () => void, icon: React.ReactNode, label: string, variant?: 'default' | 'danger' }) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-4 py-3 text-xs font-black tracking-tight rounded-2xl transition-all flex items-center gap-3 ${variant === 'danger'
            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'
            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-950 dark:hover:text-white'
            }`}
    >
        {icon}
        {label}
    </button>
);

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${active
        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xl shadow-black/10'
        : 'text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'
        }`}>
        {icon}
        <span className="font-black text-xs tracking-tight">{label}</span>
    </button>
);

const BottomNavItem = ({ icon, active = false, onClick }: { icon: React.ReactNode, active?: boolean, onClick?: () => void }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center p-2 transition-colors ${active
        ? 'text-zinc-900 dark:text-white'
        : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400'
        }`}>
        {icon}
        <div className={`w-1 h-1 mt-1 rounded-full transition-all ${active
            ? 'bg-zinc-900 dark:bg-white opacity-100 scale-100'
            : 'bg-transparent opacity-0 scale-0'
            }`}></div>
    </button>
);

const WhatsAppIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.232-.298.347-.497.115-.198.058-.372-.029-.546-.087-.173-.78-1.886-1.07-2.585-.283-.681-.57-.594-.78-.605-.198-.01-.424-.01-.65-.01-.226 0-.594.085-.905.425-.311.34-1.192 1.166-1.192 2.844 0 1.678 1.221 3.296 1.391 3.527.17.23 2.404 3.67 5.823 5.145.813.351 1.448.561 1.944.718.824.26 1.574.223 2.167.135.662-.098 1.758-.718 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
);

export default Layout;
