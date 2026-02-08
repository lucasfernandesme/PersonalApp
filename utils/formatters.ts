export const formatPhone = (value: string | undefined | null) => {
    if (!value) return '';

    // Remove non-numeric characters
    const numbers = value.replace(/\D/g, '');

    // Limit to 11 digits
    const limited = numbers.slice(0, 11);

    let formatted = limited;

    if (limited.length > 2) {
        formatted = `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    }

    if (limited.length > 7) {
        formatted = `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7, 11)}`;
    }

    return formatted;
};

export const translateExperience = (level: string | undefined) => {
    if (!level) return 'Iniciante';

    const map: Record<string, string> = {
        'beginner': 'Iniciante',
        'intermediate': 'Intermediário',
        'advanced': 'Avançado'
    };

    return map[level.toLowerCase()] || level;
};
