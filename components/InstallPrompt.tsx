
import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado (standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone;

    if (isStandalone) return;

    // Detecta iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Mostra o prompt após 5 segundos para não ser invasivo
    const timer = setTimeout(() => setIsVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] animate-in slide-in-from-bottom duration-500">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-5 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4 pr-8">
          <div className="w-12 h-12 bg-zinc-900 dark:bg-zinc-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-white dark:text-zinc-900">
            <Download size={24} />
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-tight">Instale o PersonalFlow</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {isIOS
                ? 'Toque no ícone de compartilhar (seta pra cima) e selecione "Adicionar à Tela de Início".'
                : 'Instale nosso app para acesso rápido e melhor performance.'}
            </p>
          </div>
        </div>

        {isIOS && (
          <div className="mt-4 flex items-center justify-center gap-2 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 transition-colors">
            <Share size={14} className="text-zinc-900 dark:text-zinc-100" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Instrução para iPhone</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt;
