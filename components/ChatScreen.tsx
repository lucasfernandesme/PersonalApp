
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { UserRole, Student } from '../types';

interface ChatScreenProps {
  role: UserRole;
  student?: Student;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ role, student }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Olá! Sou seu assistente PersonalFlow. Como posso ajudar no seu ${role === UserRole.TRAINER ? 'trabalho com seus alunos' : 'treino'} hoje?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = role === UserRole.TRAINER
        ? "Você é um assistente especializado para Personal Trainers de alta performance. Ajude com fisiologia, variações de exercícios e gestão de alunos."
        : `Você é um Personal Trainer IA dedicado ao aluno ${student?.name || 'usuário'}. O objetivo dele é ${student?.goal || 'treinar'}. Seja motivador, técnico e prestativo.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: input,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || "Desculpe, não consegui processar sua dúvida agora.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Ops, tive um problema de conexão. Pode tentar novamente?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6 px-1 transition-colors">
        <div className="p-3 bg-zinc-900 dark:bg-zinc-100 rounded-2xl text-white dark:text-zinc-900 shadow-lg shadow-zinc-900/20 dark:shadow-zinc-100/10">
          <MessageSquare size={20} />
        </div>
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white leading-none transition-colors">PersonalFlow Assistant</h2>
          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1 transition-colors">Inteligência Artificial Ativa</p>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${msg.role === 'user' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'bg-zinc-900 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-[24px] text-sm leading-relaxed shadow-sm transition-all ${msg.role === 'user'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-tr-none'
                : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-zinc-100 dark:border-zinc-800 rounded-tl-none'
                }`}>
                {msg.content}
                <p className={`text-[9px] mt-2 font-bold uppercase opacity-40 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-[24px] rounded-tl-none flex items-center gap-2 transition-colors">
              <Loader2 size={16} className="animate-spin text-zinc-900 dark:text-zinc-100" />
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">IA pensando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Mensagem */}
      <div className="mt-4 pb-4 md:pb-0">
        <div className="relative group">
          <input
            type="text"
            placeholder="Pergunte qualquer coisa sobre seu treino..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[28px] pl-6 pr-16 py-5 font-bold text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-300 dark:placeholder:text-zinc-600 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-0 transition-all shadow-xl shadow-zinc-200/50 dark:shadow-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`absolute right-2 top-2 w-12 h-12 rounded-full flex items-center justify-center transition-all ${input.trim() ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-700'
              }`}
          >
            <Send size={20} className={input.trim() ? 'tranzinc-x-0.5' : ''} />
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 mt-3 transition-colors">
          <Sparkles size={12} className="text-zinc-400 dark:text-zinc-500" />
          <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Powered by Gemini 3 Flash</span>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
