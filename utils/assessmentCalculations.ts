
import { SkinfoldData, CircumferenceData } from '../types';

export const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
    }
    return age;
};

export const calculateIMC = (weight: number, height: number): number => {
    if (!weight || !height) return 0;
    return parseFloat((weight / (height * height)).toFixed(2));
};

export const calculateRCQ = (waist: number, hips: number): number => {
    if (!waist || !hips) return 0;
    return parseFloat((waist / hips).toFixed(2));
};

export const sumCircumferences = (circumferences: CircumferenceData): number => {
    if (!circumferences) return 0;
    return Object.values(circumferences).reduce((acc, curr) => acc + (curr || 0), 0);
};

export const sumSkinfolds = (skinfolds: SkinfoldData): number => {
    if (!skinfolds) return 0;
    return Object.values(skinfolds).reduce((acc, curr) => acc + (curr || 0), 0);
};

export const calculateBodyFat = (
    skinfolds: SkinfoldData,
    gender: 'male' | 'female' | 'other',
    age: number,
    protocol: 'pollock3' | 'pollock7' | 'guedes' | 'custom'
): number => {
    if (!skinfolds || !age) return 0;

    let density = 0;
    const sum3 = (skinfolds.chest || 0) + (skinfolds.abdominal || 0) + (skinfolds.thigh || 0); // Standard Pollock 3 sites?
    // Wait, Pollock 3 sites differ by gender.
    // Male: Chest, Abdominal, Thigh
    // Female: Triceps, Suprailiac, Thigh

    // Pollock 7 sites: Chest, Axilla, Triceps, Subscapular, Abdominal, Suprailiac, Thigh

    const sum7 = (skinfolds.chest || 0) + (skinfolds.axilla || 0) + (skinfolds.triceps || 0) + (skinfolds.subscapular || 0) + (skinfolds.abdominal || 0) + (skinfolds.iliacCrest || 0) + (skinfolds.thigh || 0);

    if (protocol === 'pollock3') {
        // Standard Female Pollock 3 (Tri + Sup + Thigh)
        const sum3Fem = (skinfolds.triceps || 0) + (skinfolds.iliacCrest || 0) + (skinfolds.thigh || 0);
        // Standard Male Pollock 3 (Chest + Abd + Thigh)
        const sum3Male = (skinfolds.chest || 0) + (skinfolds.abdominal || 0) + (skinfolds.thigh || 0);

        if (gender === 'female') {
            if (sum3Fem > 0) {
                density = 1.0994921 - (0.0009929 * sum3Fem) + (0.0000023 * (sum3Fem * sum3Fem)) - (0.0001392 * age);
            }
        } else {
            // Male
            if (sum3Male > 0) {
                density = 1.10938 - (0.0008267 * sum3Male) + (0.0000016 * (sum3Male * sum3Male)) - (0.0002574 * age);
            } else if (sum3Fem > 0) {
                // Fallback: If male but using Tri/Sup/Thigh sites (as requested by user modification to UI)
                // This is technically incorrect but better than 0 if data is there.
                // We'll use a modified male formula or just warn?
                // Let's use the female sum in the male formula logic? No, sites are different.
                // We will return 0 if correct sites are missing.
            }
        }
    } else if (protocol === 'pollock7') {
        if (sum7 === 0) return 0;
        if (gender === 'female') {
            density = 1.097 - (0.00046971 * sum7) + (0.00000056 * (sum7 * sum7)) - (0.00012828 * age);
        } else {
            density = 1.112 - (0.00043499 * sum7) + (0.00000055 * (sum7 * sum7)) - (0.00028826 * age);
        }
    }

    if (density === 0) return 0;

    // Siri Equation
    return parseFloat((((4.95 / density) - 4.50) * 100).toFixed(2));
};

export const calculateFatMass = (weight: number, bodyFat: number): number => {
    return parseFloat((weight * (bodyFat / 100)).toFixed(2));
};

export const calculateLeanMass = (weight: number, fatMass: number): number => {
    return parseFloat((weight - fatMass).toFixed(2));
};

export const calculateIdealFat = (idealWeight: number, targetBodyFat: number): number => {
    // Fat amount at ideal weight with target BF
    return parseFloat((idealWeight * (targetBodyFat / 100)).toFixed(2));
};
