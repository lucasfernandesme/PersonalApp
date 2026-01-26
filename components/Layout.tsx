
import React from 'react';
import { UserRole } from '../types';
import { 
  Dumbbell, 
  Users, 
  LayoutDashboard, 
  LogOut,
  TrendingUp,
  MessageSquare,
  LogOut as LogoutIcon
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  onSwitchRole: () => void; // Atua como Logout agora
  onNavigate: (tab: 'home' | 'students' | 'evolution' | 'chat') => void;
  activeTab: string;
  userName?: string;
  userAvatar?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, role, onSwitchRole, onNavigate, activeTab, userName, userAvatar }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex-col hidden md:flex h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Dumbbell className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">FitAI <span className="text-indigo-400">Pro</span></span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {role === UserRole.TRAINER ? (
            <>
              <NavItem icon={<LayoutDashboard size={20} />} label="Início" active={activeTab === 'home'} onClick={() => onNavigate('home')} />
              <NavItem icon={<Users size={20} />} label="Meus Alunos" active={activeTab === 'students'} onClick={() => onNavigate('students')} />
              <NavItem icon={<TrendingUp size={20} />} label="Evolução" active={activeTab === 'evolution'} onClick={() => onNavigate('evolution')} />
              <NavItem icon={<MessageSquare size={20} />} label="Chat IA" active={activeTab === 'chat'} onClick={() => onNavigate('chat')} />
            </>
          ) : (
            <>
              <NavItem icon={<LayoutDashboard size={20} />} label="Meu Treino" active={activeTab === 'home'} onClick={() => onNavigate('home')} />
              <NavItem icon={<TrendingUp size={20} />} label="Progresso" active={activeTab === 'evolution'} onClick={() => onNavigate('evolution')} />
              <NavItem icon={<MessageSquare size={20} />} label="Chat IA" active={activeTab === 'chat'} onClick={() => onNavigate('chat')} />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3 px-2 py-3 bg-slate-800/50 rounded-2xl">
            <img src={userAvatar || `https://picsum.photos/seed/${role}/40/40`} className="w-10 h-10 rounded-xl border border-slate-700 object-cover" alt="User" />
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black truncate text-white uppercase tracking-tight">{userName || 'Usuário'}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase">{role === UserRole.TRAINER ? 'Personal' : 'Aluno'}</p>
            </div>
            <button onClick={onSwitchRole} className="text-slate-500 hover:text-red-400 transition-colors p-1">
              <LogoutIcon size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-slate-200 h-14 flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 rounded-md">
            <Dumbbell className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight">FitAI <span className="text-indigo-600">Pro</span></span>
        </div>
        <button onClick={onSwitchRole} className="text-slate-400 p-2">
          <LogoutIcon size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-40 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
        <BottomNavItem icon={<LayoutDashboard size={24} />} active={activeTab === 'home'} onClick={() => onNavigate('home')} />
        {role === UserRole.TRAINER ? (
          <BottomNavItem icon={<Users size={24} />} active={activeTab === 'students'} onClick={() => onNavigate('students')} />
        ) : (
          <BottomNavItem icon={<Dumbbell size={24} />} active={activeTab === 'home'} onClick={() => onNavigate('home')} />
        )}
        <BottomNavItem icon={<TrendingUp size={24} />} active={activeTab === 'evolution'} onClick={() => onNavigate('evolution')} />
        <BottomNavItem icon={<MessageSquare size={24} />} active={activeTab === 'chat'} onClick={() => onNavigate('chat')} />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
    active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
  }`}>
    {icon}
    <span className="font-bold text-sm uppercase tracking-tight">{label}</span>
  </button>
);

const BottomNavItem = ({ icon, active = false, onClick }: { icon: React.ReactNode, active?: boolean, onClick?: () => void }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center p-2 transition-colors ${active ? 'text-indigo-600' : 'text-slate-400'}`}>
    {icon}
    <div className={`w-1 h-1 mt-1 rounded-full transition-all ${active ? 'bg-indigo-600 opacity-100 scale-100' : 'bg-transparent opacity-0 scale-0'}`}></div>
  </button>
);

export default Layout;
