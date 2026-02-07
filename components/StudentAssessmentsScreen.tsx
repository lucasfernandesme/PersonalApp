import React, { useState } from 'react';
import { ArrowLeft, Plus, Activity, ChevronRight, Ruler, BrainCircuit, X, Image as ImageIcon, Trash2, Trophy, BarChart2, Pencil } from 'lucide-react';
import { Student, Assessment, Anamnesis, SkinfoldData, CircumferenceData } from '../types';
import { calculateAge, calculateBodyFat, calculateFatMass, calculateLeanMass, calculateIMC, calculateRCQ, sumCircumferences, sumSkinfolds, calculateIdealFat } from '../utils/assessmentCalculations';

interface StudentAssessmentsScreenProps {
    student: Student;
    onUpdate: (updatedStudent: Student) => Promise<void>;
    onBack: () => void;
    readOnly?: boolean;
}

const StudentAssessmentsScreen: React.FC<StudentAssessmentsScreenProps> = ({ student, onUpdate, onBack, readOnly = false }) => {
    const [expandedSection, setExpandedSection] = useState<'morphological' | 'anamnesis' | null>('morphological');
    const [showNewAssessmentModal, setShowNewAssessmentModal] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
    const [showNewAnamnesisModal, setShowNewAnamnesisModal] = useState(false);
    const [editingAssessmentId, setEditingAssessmentId] = useState<string | null>(null);
    const [selectedAnamnesis, setSelectedAnamnesis] = useState<Anamnesis | null>(null);

    // New Assessment State
    const [newAssessment, setNewAssessment] = useState<Partial<Assessment>>({
        date: new Date().toISOString().split('T')[0],
        protocol: 'pollock3',
        weight: 0,
        height: student.height ? parseFloat(student.height) : 0,
        skinfolds: {},
        circumferences: {},
        photos: [],
        targetBodyFat: 0,
        idealWeight: 0,
        notes: ''
    });

    // New Anamnesis State
    const [newAnamnesis, setNewAnamnesis] = useState<Partial<Anamnesis>>({
        date: new Date().toISOString().split('T')[0],
        answers: {}
    });

    const handleSaveAssessment = async () => {
        if (!newAssessment.weight || !newAssessment.protocol) {
            alert("Preencha peso e protocolo.");
            return;
        }

        const age = calculateAge(student.birthDate || '');
        const bodyFat = calculateBodyFat(newAssessment.skinfolds || {}, student.gender, age, newAssessment.protocol as any);
        const fatMass = calculateFatMass(newAssessment.weight, bodyFat);
        const leanMass = calculateLeanMass(newAssessment.weight, fatMass);

        const assessmentData: Assessment = {
            id: editingAssessmentId || Math.random().toString(36).substr(2, 9),
            date: newAssessment.date!,
            protocol: newAssessment.protocol as any,
            weight: newAssessment.weight,
            height: newAssessment.height,
            skinfolds: newAssessment.skinfolds || {},
            circumferences: newAssessment.circumferences || {},
            photos: newAssessment.photos || [],
            targetBodyFat: newAssessment.targetBodyFat,
            idealWeight: newAssessment.idealWeight,
            notes: newAssessment.notes,
            bodyFatPercentage: bodyFat,
            fatMass: fatMass,
            leanMass: leanMass
        };

        const updatedStudent = { ...student };

        if (editingAssessmentId) {
            updatedStudent.assessments = (student.assessments || []).map(a =>
                a.id === editingAssessmentId ? assessmentData : a
            );
        } else {
            updatedStudent.assessments = [...(student.assessments || []), assessmentData];
            updatedStudent.height = newAssessment.height ? newAssessment.height.toString() : student.height;
        }

        await onUpdate(updatedStudent);
        setShowNewAssessmentModal(false);
        setEditingAssessmentId(null);

        // Reset form
        setNewAssessment({
            date: new Date().toISOString().split('T')[0],
            protocol: 'pollock3',
            weight: 0,
            height: student.height ? parseFloat(student.height) : 0,
            skinfolds: {},
            circumferences: {},
            photos: [],
            targetBodyFat: 0,
            idealWeight: 0,
            notes: ''
        });
    };

    const handleEditAssessment = (assessment: Assessment) => {
        setEditingAssessmentId(assessment.id);
        setNewAssessment({
            date: assessment.date,
            protocol: assessment.protocol,
            weight: assessment.weight,
            height: assessment.height || 0,
            skinfolds: assessment.skinfolds || {},
            circumferences: assessment.circumferences || {},
            photos: assessment.photos || [],
            targetBodyFat: assessment.targetBodyFat || 0,
            idealWeight: assessment.idealWeight || 0,
            notes: assessment.notes || ''
        });
        setSelectedAssessment(null);
        setShowNewAssessmentModal(true);
    };

    const handleSaveAnamnesis = async () => {
        const anamnesis: Anamnesis = {
            id: Math.random().toString(36).substr(2, 9),
            date: newAnamnesis.date!,
            answers: newAnamnesis.answers || {}
        };

        const updatedStudent = {
            ...student,
            anamnesis: [anamnesis, ...(student.anamnesis || [])]
        };

        await onUpdate(updatedStudent);
        setShowNewAnamnesisModal(false);
        setNewAnamnesis({
            date: new Date().toISOString().split('T')[0],
            answers: {}
        });
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const remainingSlots = 4 - (newAssessment.photos?.length || 0);
            const filesToProcess = files.slice(0, remainingSlots);

            filesToProcess.forEach((file: File) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setNewAssessment(prev => ({
                        ...prev,
                        photos: [...(prev.photos || []), reader.result as string]
                    }));
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removePhoto = (index: number) => {
        setNewAssessment(prev => ({
            ...prev,
            photos: prev.photos?.filter((_, i) => i !== index)
        }));
    };

    const updateSkinfold = (key: keyof SkinfoldData, value: string) => {
        setNewAssessment(prev => ({
            ...prev,
            skinfolds: {
                ...prev.skinfolds,
                [key]: parseFloat(value) || 0
            }
        }));
    };

    const updateCircumference = (key: keyof CircumferenceData, value: string) => {
        setNewAssessment(prev => ({
            ...prev,
            circumferences: {
                ...prev.circumferences,
                [key]: parseFloat(value) || 0
            }
        }));
    };

    const skinfoldLabels: Record<string, string> = {
        chest: 'Peitoral',
        abdominal: 'Abdominal',
        thigh: 'Coxa',
        triceps: 'Tricipital',
        subscapular: 'Subescapular',
        iliacCrest: 'Supra-ilíaca',
        suprailiac: 'Supra-ilíaca', // mapping for safety
        supraspinale: 'Supra-espinhal',
        axilla: 'Axilar Média',
        biceps: 'Bíceps',
        calf: 'Panturrilha Medial'
    };

    const circumferenceLabels: Record<string, string> = {
        neck: 'Pescoço',
        shoulders: 'Ombro',
        chest: 'Tórax',
        waist: 'Cintura',
        abdomen: 'Abdômen',
        hips: 'Quadril',
        rightArm: 'Braço Direito',
        leftArm: 'Braço Esquerdo',
        rightForearm: 'Antebraço Direito',
        leftForearm: 'Antebraço Esquerdo',
        rightThigh: 'Coxa Direita',
        leftThigh: 'Coxa Esquerda',
        rightCalf: 'Perna Direita',
        leftCalf: 'Perna Esquerda'
    };

    const renderProtocolInputs = () => {
        const protocol = newAssessment.protocol;

        let fields: (keyof SkinfoldData)[] = [];
        if (protocol === 'pollock3') {
            fields = ['triceps', 'iliacCrest', 'thigh'];
        } else if (protocol === 'pollock7') {
            fields = ['chest', 'axilla', 'triceps', 'subscapular', 'abdominal', 'iliacCrest', 'thigh'];
        } else {
            fields = ['triceps', 'subscapular', 'biceps', 'iliacCrest', 'supraspinale', 'abdominal', 'thigh', 'calf', 'chest', 'axilla'];
        }

        return (
            <div className="grid grid-cols-2 gap-4">
                {fields.map(field => (
                    <div key={field}>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
                            {skinfoldLabels[field] || field}
                        </label>
                        <input
                            type="number"
                            className="w-full p-3 rounded-xl bg-zinc-50 border-none font-bold text-slate-900"
                            onChange={(e) => updateSkinfold(field, e.target.value)}
                            value={newAssessment.skinfolds?.[field] || ''}
                            placeholder="mm"
                        />
                    </div>
                ))}
            </div>
        );
    };

    const renderCircumferenceInputs = () => {
        const fields: (keyof CircumferenceData)[] = [
            'neck', 'shoulders', 'chest', 'waist', 'abdomen', 'hips',
            'rightArm', 'leftArm', 'rightThigh', 'leftThigh', 'rightCalf', 'leftCalf'
        ];

        return (
            <div className="grid grid-cols-2 gap-4">
                {fields.map(field => (
                    <div key={field}>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
                            {circumferenceLabels[field] || field}
                        </label>
                        <input
                            type="number"
                            className="w-full p-3 rounded-xl bg-zinc-50 border-none font-bold text-slate-900"
                            onChange={(e) => updateCircumference(field, e.target.value)}
                            value={newAssessment.circumferences?.[field] || ''}
                            placeholder="cm"
                        />
                    </div>
                ))}
            </div>
        );
    };

    const standardQuestions = [
        "Possui alguma restrição médica?",
        "Toma algum medicamento de uso contínuo?",
        "Já realizou cirurgias? Quais?",
        "Sente dores articulares?",
        "Qual seu objetivo principal?",
        "Como é sua rotina de sono?",
        "Como é sua alimentação atual?"
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-2xl hover:bg-zinc-200 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Avaliações</h2>
                    <p className="text-slate-500 text-sm font-medium">Gerencie avaliações e anamneses</p>
                </div>
            </div>

            {/* Content - Vertical Layout */}
            <div className="space-y-4">
                {/* Avaliação Morfológica */}
                <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800 overflow-hidden transition-all duration-300">
                    <button
                        onClick={() => setExpandedSection(expandedSection === 'morphological' ? null : 'morphological')}
                        className="w-full p-6 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
                                <Ruler size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Morfológica</h3>
                                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Composição Corporal</p>
                            </div>
                        </div>
                        <ChevronRight
                            size={20}
                            className={`text-zinc-400 transition-transform duration-300 ${expandedSection === 'morphological' ? 'rotate-90' : ''}`}
                        />
                    </button>

                    {expandedSection === 'morphological' && (
                        <div className="p-6 pt-0 animate-in slide-in-from-top-4 fade-in duration-300">
                            {/* Create Button area */}
                            {!readOnly && (
                                <div className="pl-16 mb-6">
                                    <button
                                        onClick={() => {
                                            setEditingAssessmentId(null); // Ensure we're creating a new one
                                            setNewAssessment({
                                                date: new Date().toISOString().split('T')[0],
                                                protocol: 'pollock3',
                                                weight: 0,
                                                height: student.height ? parseFloat(student.height) : 0,
                                                skinfolds: {},
                                                circumferences: {},
                                                photos: [],
                                                targetBodyFat: 0,
                                                idealWeight: 0,
                                                notes: ''
                                            });
                                            setShowNewAssessmentModal(true);
                                        }}
                                        className="w-full py-4 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors shadow-sm"
                                    >
                                        <Plus size={18} />
                                        NOVA AVALIAÇÃO DE DOBRAS
                                    </button>
                                </div>
                            )}

                            {/* Assessments List */}
                            <div className="space-y-3 pl-4 border-l-2 border-zinc-100 dark:border-zinc-800 ml-6">
                                {(student.assessments || []).map((assessment, index) => (
                                    <div key={assessment.id || index} className="pl-6 relative group">
                                        <div className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-zinc-900 group-hover:scale-125 transition-transform"></div>
                                        <button
                                            onClick={() => setSelectedAssessment(assessment)}
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl flex items-center justify-between border border-zinc-100 dark:border-zinc-800/50 hover:border-emerald-200 dark:hover:border-emerald-900/30 transition-colors text-left"
                                        >
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{assessment.date}</p>
                                                <div className="flex gap-2 items-center">
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase">{assessment.protocol}</p>
                                                    {assessment.photos && assessment.photos.length > 0 && (
                                                        <span className="text-[9px] bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                                                            <ImageIcon size={10} /> {assessment.photos.length}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-slate-900 dark:text-white text-lg">{assessment.weight}kg</p>
                                                {assessment.bodyFatPercentage && <p className="text-[10px] font-bold text-emerald-500">{assessment.bodyFatPercentage}% BF</p>}
                                            </div>
                                        </button>
                                    </div>
                                ))}
                                {(!student.assessments || student.assessments.length === 0) && (
                                    <p className="text-zinc-400 text-xs pl-6 py-2 font-medium">Nenhuma avaliação registrada.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Avaliação Anamnese */}
                <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800 overflow-hidden transition-all duration-300">
                    <button
                        onClick={() => setExpandedSection(expandedSection === 'anamnesis' ? null : 'anamnesis')}
                        className="w-full p-6 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/10">
                                <Activity size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Anamnese</h3>
                                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Histórico e Saúde</p>
                            </div>
                        </div>
                        <ChevronRight
                            size={20}
                            className={`text-zinc-400 transition-transform duration-300 ${expandedSection === 'anamnesis' ? 'rotate-90' : ''}`}
                        />
                    </button>

                    {expandedSection === 'anamnesis' && (
                        <div className="p-6 pt-0 animate-in slide-in-from-top-4 fade-in duration-300">
                            {!readOnly && (
                                <div className="pl-16 mb-6">
                                    <button
                                        onClick={() => setShowNewAnamnesisModal(true)}
                                        className="w-full py-4 bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-800 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors shadow-sm"
                                    >
                                        <Plus size={18} />
                                        NOVA ANAMNESE PADRÃO
                                    </button>
                                </div>
                            )}

                            <div className="space-y-4 pl-4 border-l-2 border-zinc-100 dark:border-zinc-800 ml-6">
                                {(student.anamnesis || []).map((anam, index) => (
                                    <div key={anam.id || index} className="pl-6 relative group">
                                        <div className="absolute -left-[7px] top-6 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-white dark:ring-zinc-900 group-hover:scale-125 transition-transform"></div>
                                        <button
                                            onClick={() => setSelectedAnamnesis(anam)}
                                            className="w-full text-left bg-zinc-50 dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 hover:border-purple-200 dark:hover:border-purple-900/30 transition-colors group-active:scale-[0.99] duration-200"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{anam.date}</h4>
                                                <span className="text-[9px] font-black uppercase text-purple-500 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-md">Completa</span>
                                            </div>
                                            <div className="space-y-2 max-h-32 overflow-hidden relative">
                                                {Object.entries(anam.answers).slice(0, 2).map(([q, a]) => (
                                                    <div key={q} className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                                        <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1 truncate">{q}</p>
                                                        <p className="text-xs text-zinc-800 dark:text-zinc-300 font-medium truncate">{a}</p>
                                                    </div>
                                                ))}
                                                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-zinc-50 dark:from-zinc-950 to-transparent flex items-end justify-center pb-1">
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Ver detalhes</span>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                ))}
                                {(!student.anamnesis || student.anamnesis.length === 0) && (
                                    <p className="text-zinc-400 text-xs pl-6 py-2 font-medium">Nenhuma anamnese registrada.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Nova Avaliação */}
            {showNewAssessmentModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[32px] p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">{editingAssessmentId ? 'Editar Avaliação' : 'Nova Avaliação'}</h3>
                            <button onClick={() => {
                                setShowNewAssessmentModal(false);
                                setEditingAssessmentId(null);
                            }}><X className="text-zinc-400" /></button>
                        </div>

                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Data</label>
                                    <input
                                        type="date"
                                        value={newAssessment.date}
                                        onChange={e => setNewAssessment({ ...newAssessment, date: e.target.value })}
                                        className="w-full p-3 rounded-xl bg-zinc-50 border-none font-bold text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Peso (kg)</label>
                                    <input
                                        type="number"
                                        value={newAssessment.weight || ''}
                                        onChange={e => setNewAssessment({ ...newAssessment, weight: parseFloat(e.target.value) })}
                                        className="w-full p-3 rounded-xl bg-zinc-50 border-none font-bold text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Estatura (m)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newAssessment.height || ''}
                                        onChange={e => setNewAssessment({ ...newAssessment, height: parseFloat(e.target.value) })}
                                        className="w-full p-3 rounded-xl bg-zinc-50 border-none font-bold text-slate-900"
                                        placeholder="Ex: 1.75"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Gênero</label>
                                    <select
                                        value={student.gender}
                                        onChange={async (e) => {
                                            const newGender = e.target.value as 'male' | 'female' | 'other';
                                            await onUpdate({ ...student, gender: newGender });
                                        }}
                                        className="w-full p-3 rounded-xl bg-zinc-50 border-none font-bold text-slate-900"
                                    >
                                        <option value="male">Masculino</option>
                                        <option value="female">Feminino</option>
                                        <option value="other">Outro</option>
                                    </select>
                                </div>
                            </div>


                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Protocolo</label>
                                <select
                                    value={newAssessment.protocol}
                                    onChange={e => setNewAssessment({ ...newAssessment, protocol: e.target.value as any })}
                                    className="w-full p-3 rounded-xl bg-zinc-50 border-none font-bold text-slate-900"
                                >
                                    <option value="pollock3">Pollock 3 Dobras</option>
                                    <option value="pollock7">Pollock 7 Dobras</option>
                                    <option value="guedes">Guedes</option>
                                </select>
                            </div>

                            {/* Skinfolds */}
                            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
                                <h4 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Ruler size={16} className="text-emerald-500" />
                                    Dobras Cutâneas (mm)
                                </h4>
                                {renderProtocolInputs()}
                            </div>

                            {/* Circumferences */}
                            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
                                <h4 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Activity size={16} className="text-blue-500" />
                                    Perímetros (cm)
                                </h4>
                                {renderCircumferenceInputs()}
                            </div>

                            {/* Goals */}
                            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
                                <h4 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <BrainCircuit size={16} className="text-purple-500" />
                                    Metas e Projeções
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">% Gordura Alvo</label>
                                        <input
                                            type="number"
                                            value={newAssessment.targetBodyFat || ''}
                                            onChange={e => setNewAssessment({ ...newAssessment, targetBodyFat: parseFloat(e.target.value) })}
                                            className="w-full p-3 rounded-xl bg-zinc-50 border-none font-bold text-slate-900"
                                            placeholder="Ex: 18"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Peso Ideal (kg)</label>
                                        <input
                                            type="number"
                                            value={newAssessment.idealWeight || ''}
                                            onChange={e => setNewAssessment({ ...newAssessment, idealWeight: parseFloat(e.target.value) })}
                                            className="w-full p-3 rounded-xl bg-zinc-50 border-none font-bold text-slate-900"
                                            placeholder="Ex: 75"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Observações</label>
                                <textarea
                                    value={newAssessment.notes || ''}
                                    onChange={e => setNewAssessment({ ...newAssessment, notes: e.target.value })}
                                    className="w-full p-3 rounded-xl bg-zinc-50 border-none font-medium text-slate-900 min-h-[80px]"
                                    placeholder="Alguma observação sobre a avaliação?"
                                />
                            </div>

                            {/* Photos */}
                            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
                                <h4 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <ImageIcon size={16} className="text-amber-500" />
                                    Fotos Comparativas <span className="text-xs font-normal text-zinc-400 ml-2">({newAssessment.photos?.length || 0}/4)</span>
                                </h4>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                    {(newAssessment.photos || []).map((photo, index) => (
                                        <div key={index} className="relative aspect-[3/4] bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden group">
                                            <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}

                                    {(!newAssessment.photos || newAssessment.photos.length < 4) && (
                                        <label className="aspect-[3/4] bg-zinc-50 dark:bg-zinc-800 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-zinc-600">
                                            <Plus size={24} className="mb-2" />
                                            <span className="text-[10px] font-bold uppercase">Adicionar</span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handlePhotoUpload}
                                                disabled={newAssessment.photos && newAssessment.photos.length >= 4}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleSaveAssessment}
                                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black mt-6 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                SALVAR AVALIAÇÃO
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nova Anamnese */}
            {showNewAnamnesisModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[32px] p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Nova Anamnese</h3>
                            <button onClick={() => setShowNewAnamnesisModal(false)}><X className="text-zinc-400" /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Data</label>
                                <input
                                    type="date"
                                    value={newAnamnesis.date}
                                    onChange={e => setNewAnamnesis({ ...newAnamnesis, date: e.target.value })}
                                    className="w-full p-3 rounded-xl bg-zinc-50 border-none font-bold text-slate-900"
                                />
                            </div>

                            <div className="space-y-4">
                                {standardQuestions.map((q) => (
                                    <div key={q}>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">{q}</label>
                                        <textarea
                                            className="w-full p-3 rounded-xl bg-zinc-50 border-none font-medium min-h-[80px] text-slate-900"
                                            onChange={(e) => setNewAnamnesis(prev => ({
                                                ...prev,
                                                answers: { ...prev.answers, [q]: e.target.value }
                                            }))}
                                        />
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleSaveAnamnesis}
                                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black mt-6 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                SALVAR ANAMNESE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detalhes da Anamnese */}
            {selectedAnamnesis && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[32px] p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">Detalhes da Anamnese</h3>
                                <p className="text-zinc-500 text-xs font-bold">{selectedAnamnesis.date}</p>
                            </div>
                            <button onClick={() => setSelectedAnamnesis(null)}><X className="text-zinc-400" /></button>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(selectedAnamnesis.answers).map(([q, a]) => (
                                <div key={q} className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">{q}</p>
                                    <p className="text-sm text-zinc-800 dark:text-zinc-300 font-medium leading-relaxed">{a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detalhes da Avaliação */}
            {selectedAssessment && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[32px] p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">Detalhes da Avaliação</h3>
                                <p className="text-zinc-500 text-xs font-bold">{selectedAssessment.date}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {!readOnly && (
                                    <button
                                        onClick={() => handleEditAssessment(selectedAssessment)}
                                        className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                        title="Editar Avaliação"
                                    >
                                        <Pencil size={20} />
                                    </button>
                                )}
                                <button onClick={() => setSelectedAssessment(null)}><X className="text-zinc-400" /></button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl">
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Peso</p>
                                    <p className="font-black text-slate-900 dark:text-white text-lg">{selectedAssessment.weight}kg</p>
                                </div>
                                {selectedAssessment.height && (
                                    <div>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Estatura</p>
                                        <p className="font-black text-slate-900 dark:text-white text-lg">{selectedAssessment.height}m</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Protocolo</p>
                                    <p className="font-bold text-slate-900 dark:text-white">{selectedAssessment.protocol}</p>
                                </div>
                            </div>

                            {/* Skinfolds */}
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2 text-sm">
                                    <Ruler size={14} className="text-emerald-500" />
                                    Dobras Cutâneas
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(selectedAssessment.skinfolds).map(([key, value]) => (
                                        <div key={key} className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl flex justify-between items-center">
                                            <span className="text-xs font-bold text-zinc-500 uppercase">{skinfoldLabels[key] || key}</span>
                                            <span className="font-black text-slate-900 dark:text-white">{value}mm</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Circumferences */}
                            {selectedAssessment.circumferences && Object.keys(selectedAssessment.circumferences).length > 0 && (
                                <div>
                                    <h4 className="font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2 text-sm">
                                        <Activity size={14} className="text-blue-500" />
                                        Perímetros
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(selectedAssessment.circumferences).map(([key, value]) => (
                                            <div key={key} className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl flex justify-between items-center">
                                                <span className="text-xs font-bold text-zinc-500 uppercase">{circumferenceLabels[key] || key}</span>
                                                <span className="font-black text-slate-900 dark:text-white">{value}cm</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Goals */}
                            {(selectedAssessment.targetBodyFat || selectedAssessment.idealWeight) && (
                                <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/20">
                                    <h4 className="font-black text-purple-700 dark:text-purple-400 mb-2 flex items-center gap-2 text-sm">
                                        <BrainCircuit size={14} />
                                        Metas
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedAssessment.targetBodyFat && (
                                            <div>
                                                <p className="text-[10px] font-bold text-purple-400 uppercase">% Alvo</p>
                                                <p className="font-black text-purple-900 dark:text-purple-100 text-lg">{selectedAssessment.targetBodyFat}%</p>
                                            </div>
                                        )}
                                        {selectedAssessment.idealWeight && (
                                            <div>
                                                <p className="text-[10px] font-bold text-purple-400 uppercase">Peso Ideal</p>
                                                <p className="font-black text-purple-900 dark:text-purple-100 text-lg">{selectedAssessment.idealWeight}kg</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Photos */}
                            {selectedAssessment.photos && selectedAssessment.photos.length > 0 && (
                                <div>
                                    <h4 className="font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2 text-sm">
                                        <ImageIcon size={14} className="text-amber-500" />
                                        Fotos
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectedAssessment.photos.map((photo, i) => (
                                            <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                                <img src={photo} alt={`Foto ${i}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {selectedAssessment.notes && (
                                <div>
                                    <h4 className="font-black text-slate-900 dark:text-white mb-2 text-sm">Observações</h4>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl italic">
                                        "{selectedAssessment.notes}"
                                    </p>
                                </div>
                            )}

                            {/* Results & Graphs */}
                            <div className="border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 pt-6 mt-2">
                                <h4 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-lg">
                                    <Trophy size={20} className="text-yellow-500" />
                                    Resultados
                                </h4>

                                {(() => {
                                    // Calculate metrics on the fly if missing from stored object
                                    const calcAge = calculateAge(student.birthDate || '');
                                    const displayBodyFat = selectedAssessment.bodyFatPercentage || calculateBodyFat(selectedAssessment.skinfolds || {}, student.gender, calcAge, selectedAssessment.protocol);
                                    const displayFatMass = selectedAssessment.fatMass || calculateFatMass(selectedAssessment.weight, displayBodyFat);
                                    const displayLeanMass = selectedAssessment.leanMass || calculateLeanMass(selectedAssessment.weight, displayFatMass);

                                    return (
                                        <>
                                            <div className="grid grid-cols-2 gap-3 mb-6">
                                                <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl">
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase">IMC</p>
                                                    <p className="font-black text-slate-900 dark:text-white">{calculateIMC(selectedAssessment.weight, selectedAssessment.height || 0)}</p>
                                                </div>
                                                <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl">
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase">RCQ</p>
                                                    <p className="font-black text-slate-900 dark:text-white">{calculateRCQ(selectedAssessment.circumferences?.waist || 0, selectedAssessment.circumferences?.hips || 0) || '-'}</p>
                                                </div>
                                                <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl">
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Soma Perímetros</p>
                                                    <p className="font-black text-slate-900 dark:text-white">{sumCircumferences(selectedAssessment.circumferences || {}).toFixed(1)} cm</p>
                                                </div>
                                                <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl">
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Soma Dobras</p>
                                                    <p className="font-black text-slate-900 dark:text-white">{sumSkinfolds(selectedAssessment.skinfolds).toFixed(1)} mm</p>
                                                </div>
                                                <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-xl border border-purple-100 dark:border-purple-900/20">
                                                    <p className="text-[10px] font-bold text-purple-400 uppercase">Gordura Ideal</p>
                                                    <p className="font-black text-purple-900 dark:text-purple-100">
                                                        {selectedAssessment.idealWeight && selectedAssessment.targetBodyFat
                                                            ? calculateIdealFat(selectedAssessment.idealWeight, selectedAssessment.targetBodyFat)
                                                            : '-'
                                                        } kg
                                                    </p>
                                                </div>
                                                <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-xl border border-purple-100 dark:border-purple-900/20">
                                                    <p className="text-[10px] font-bold text-purple-400 uppercase">Massa Magra Ideal</p>
                                                    <p className="font-black text-purple-900 dark:text-purple-100">
                                                        {selectedAssessment.idealWeight && selectedAssessment.targetBodyFat
                                                            ? (selectedAssessment.idealWeight - calculateIdealFat(selectedAssessment.idealWeight, selectedAssessment.targetBodyFat)).toFixed(2)
                                                            : '-'
                                                        } kg
                                                    </p>
                                                </div>
                                                <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-xl border border-purple-100 dark:border-purple-900/20">
                                                    <p className="text-[10px] font-bold text-purple-400 uppercase">Peso Ideal</p>
                                                    <p className="font-black text-purple-900 dark:text-purple-100">{selectedAssessment.idealWeight || '-'} kg</p>
                                                </div>
                                                <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/20">
                                                    <p className="text-[10px] font-bold text-red-400 uppercase">Gordura Excedente</p>
                                                    <p className="font-black text-red-900 dark:text-red-100">
                                                        {calculateFatMass(selectedAssessment.weight, displayBodyFat) && selectedAssessment.idealWeight && selectedAssessment.targetBodyFat
                                                            ? (calculateFatMass(selectedAssessment.weight, displayBodyFat) - calculateIdealFat(selectedAssessment.idealWeight, selectedAssessment.targetBodyFat)).toFixed(2)
                                                            : '-'
                                                        } kg
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Graphs */}
                                            {displayBodyFat > 0 && (
                                                <div className="space-y-8">
                                                    <h4 className="font-black text-slate-900 dark:text-white text-center mb-6 flex items-center justify-center gap-2">
                                                        <BarChart2 size={20} className="text-blue-500" />
                                                        Gráficos
                                                    </h4>

                                                    {/* Donut Chart - Body Fat % */}
                                                    <div className="flex flex-col items-center">
                                                        <h5 className="font-bold text-sm text-zinc-500 mb-4">% de Gordura</h5>
                                                        <div className="flex justify-center gap-8 mb-4 text-xs font-bold">
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                                                                <div>
                                                                    <p className="text-emerald-500">Massa Magra</p>
                                                                    <p className="text-slate-900 dark:text-white text-sm">{(100 - displayBodyFat).toFixed(1)}%</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                                                                <div>
                                                                    <p className="text-amber-500">Gordura</p>
                                                                    <p className="text-slate-900 dark:text-white text-sm">{displayBodyFat.toFixed(1)}%</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="relative w-48 h-48 rounded-full flex items-center justify-center"
                                                            style={{
                                                                background: `conic-gradient(#f59e0b 0% ${displayBodyFat}%, #10b981 ${displayBodyFat}% 100%)`
                                                            }}
                                                        >
                                                            <div className="absolute inset-0 rounded-full bg-white dark:bg-zinc-900 m-8 flex items-center justify-center flex-col">
                                                                <span className="text-sm font-bold text-amber-500">{displayBodyFat.toFixed(1)}%</span>
                                                                <span className="text-[10px] font-bold text-zinc-400 uppercase">Gordura</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Bar Chart - Mass Comparison */}
                                                    <div className="flex flex-col items-center w-full">
                                                        <h5 className="font-bold text-sm text-zinc-500 mb-6">Massa Magra x Massa Gorda</h5>

                                                        <div className="flex justify-center gap-8 mb-4 text-xs font-bold w-full max-w-xs">
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                                                                <div>
                                                                    <p className="text-emerald-500">Massa Magra</p>
                                                                    <p className="text-slate-900 dark:text-white text-sm">{displayLeanMass} kg</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                                                                <div>
                                                                    <p className="text-amber-500">Massa Gorda</p>
                                                                    <p className="text-slate-900 dark:text-white text-sm">{displayFatMass} kg</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="w-full max-w-xs h-64 border-b border-zinc-200 dark:border-zinc-700 flex items-end justify-around pb-1 relative">
                                                            {/* Lean Mass Bar */}
                                                            <div className="flex flex-col items-center gap-2 group w-1/3 h-full justify-end">
                                                                <span className="text-xs font-black text-white bg-emerald-500 px-2 py-1 rounded hidden group-hover:block mb-1 transition-all">{displayLeanMass}kg</span>
                                                                <div
                                                                    className="w-full bg-emerald-500 rounded-t-lg transition-all duration-500 hover:brightness-110 flex items-center justify-center text-white font-bold text-xs relative"
                                                                    style={{ height: `${(displayLeanMass / Math.max(displayLeanMass, displayFatMass)) * 90}%` }}
                                                                >
                                                                    {displayLeanMass}kg
                                                                </div>
                                                            </div>

                                                            {/* Fat Mass Bar */}
                                                            <div className="flex flex-col items-center gap-2 group w-1/3 h-full justify-end">
                                                                <span className="text-xs font-black text-white bg-amber-500 px-2 py-1 rounded hidden group-hover:block mb-1 transition-all">{displayFatMass}kg</span>
                                                                <div
                                                                    className="w-full bg-amber-500 rounded-t-lg transition-all duration-500 hover:brightness-110 flex items-center justify-center text-white font-bold text-xs relative"
                                                                    style={{ height: `${(displayFatMass / Math.max(displayLeanMass, displayFatMass)) * 90}%` }}
                                                                >
                                                                    {displayFatMass}kg
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>

                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default StudentAssessmentsScreen;
