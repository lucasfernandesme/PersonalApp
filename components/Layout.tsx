
import React from 'react';
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
  Sun
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  onSwitchRole: () => void; // Atua como Logout agora
  onNavigate: (tab: 'home' | 'students' | 'evolution' | 'chat' | 'workout' | 'profile') => void;
  activeTab: string;
  userName?: string;
  userAvatar?: string;
  trainerSocials?: { instagram?: string; whatsapp?: string };
}

const Layout: React.FC<LayoutProps> = ({ children, role, onSwitchRole, onNavigate, activeTab, userName, userAvatar, trainerSocials }) => {
  const { theme, toggleTheme } = useTheme();

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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 md:pb-0 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900 dark:bg-slate-900 text-white flex-shrink-0 flex-col hidden md:flex h-screen sticky top-0 border-r border-transparent dark:border-slate-800">
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Dumbbell className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">FitAI <span className="text-indigo-400">Pro</span></span>
        </div>

        {/* Frequency Info */}
        <div className="px-6 pb-2 -mt-4 mb-2">
          <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-600">Frequência de treinos</p>
          <p className="text-xs font-bold text-white dark:text-slate-200">Segunda a Domingo</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {role === UserRole.TRAINER ? (
            <>
              <NavItem icon={<LayoutDashboard size={20} />} label="Início" active={activeTab === 'home'} onClick={() => onNavigate('home')} />
              <NavItem icon={<Users size={20} />} label="Meus Alunos" active={activeTab === 'students'} onClick={() => onNavigate('students')} />
              <NavItem icon={<TrendingUp size={20} />} label="Evolução" active={activeTab === 'evolution'} onClick={() => onNavigate('evolution')} />
              <NavItem icon={<MessageSquare size={20} />} label="Chat IA" active={activeTab === 'chat'} onClick={() => onNavigate('chat')} />
              <NavItem icon={<User size={20} />} label="Perfil" active={activeTab === 'profile'} onClick={() => onNavigate('profile')} />
            </>
          ) : (
            <>
              <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'home'} onClick={() => onNavigate('home')} />
              <NavItem icon={<Instagram size={20} />} label="Instagram" onClick={() => handleSocialClick('instagram')} />
              <NavItem icon={<WhatsAppIcon size={20} />} label="WhatsApp" onClick={() => handleSocialClick('whatsapp')} />
              <NavItem icon={<MessageSquare size={20} />} label="Chat IA" active={activeTab === 'chat'} onClick={() => onNavigate('chat')} />
              <NavItem icon={<User size={20} />} label="Perfil" active={activeTab === 'profile'} onClick={() => onNavigate('profile')} />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 dark:border-slate-800 transition-colors space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-600">Tema</span>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-slate-800 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:text-white dark:hover:text-slate-200 hover:bg-slate-700 dark:hover:bg-slate-700transition-colors"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          <div className="flex items-center gap-3 px-2 py-3 bg-slate-800/50 dark:bg-slate-800/30 rounded-2xl border border-transparent dark:border-slate-800/50">
            <img src={userAvatar || `https://picsum.photos/seed/${role}/40/40`} className="w-10 h-10 rounded-xl border border-slate-700 dark:border-slate-800 object-cover" alt="User" />
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black truncate text-white dark:text-slate-200 uppercase tracking-tight">{userName || 'Usuário'}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-600 font-bold uppercase">{role === UserRole.TRAINER ? 'Personal' : 'Aluno'}</p>
            </div>
            <button onClick={onSwitchRole} className="text-slate-500 dark:text-slate-600 hover:text-red-400 dark:hover:text-red-500 transition-colors p-1">
              <LogoutIcon size={18} />
            </button>
          </div>

          <div className="px-2">
            <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-600">Frequência de treinos</p>
            <p className="text-xs font-bold text-white dark:text-slate-200 transition-colors">Segunda a Domingo</p>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-14 flex items-center justify-between px-4 sticky top-0 z-40 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 rounded-md">
            <Dumbbell className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">FitAI <span className="text-indigo-600 dark:text-indigo-400">Pro</span></span>
        </div>
        <button onClick={onSwitchRole} className="text-slate-400 p-2">
          <LogoutIcon size={20} />
        </button>
        <button onClick={toggleTheme} className="text-slate-400 p-2 ml-auto md:hidden">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-40 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] dark:shadow-none transition-all duration-300">
        <BottomNavItem icon={<LayoutDashboard size={24} />} active={activeTab === 'home'} onClick={() => onNavigate('home')} />
        {
          role === UserRole.TRAINER ? (
            <BottomNavItem icon={<Users size={24} />} active={activeTab === 'students'} onClick={() => onNavigate('students')} />
          ) : (
            <BottomNavItem icon={<Instagram size={24} />} onClick={() => handleSocialClick('instagram')} />
          )
        }
        {
          role === UserRole.TRAINER ? (
            <>
              <BottomNavItem icon={<TrendingUp size={24} />} active={activeTab === 'evolution'} onClick={() => onNavigate('evolution')} />
              <BottomNavItem icon={<MessageSquare size={24} />} active={activeTab === 'chat'} onClick={() => onNavigate('chat')} />
              <BottomNavItem icon={<User size={24} />} active={activeTab === 'profile'} onClick={() => onNavigate('profile')} />
            </>
          ) : (
            <>
              <BottomNavItem icon={<WhatsAppIcon size={24} />} onClick={() => handleSocialClick('whatsapp')} />
              <BottomNavItem icon={<MessageSquare size={24} />} active={activeTab === 'chat'} onClick={() => onNavigate('chat')} />
              <BottomNavItem icon={<User size={24} />} active={activeTab === 'profile'} onClick={() => onNavigate('profile')} />
            </>
          )
        }
      </nav >
    </div >
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
    : 'text-slate-400 dark:text-slate-500 hover:bg-slate-800 dark:hover:bg-slate-800/50 hover:text-white dark:hover:text-slate-200'
    }`}>
    {icon}
    <span className="font-bold text-sm uppercase tracking-tight">{label}</span>
  </button>
);

const BottomNavItem = ({ icon, active = false, onClick }: { icon: React.ReactNode, active?: boolean, onClick?: () => void }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center p-2 transition-colors ${active
    ? 'text-indigo-600 dark:text-indigo-400'
    : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
    }`}>
    {icon}
    <div className={`w-1 h-1 mt-1 rounded-full transition-all ${active
      ? 'bg-indigo-600 dark:bg-indigo-400 opacity-100 scale-100'
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
