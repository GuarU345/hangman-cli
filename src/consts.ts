export const LANGUAGES = {
    SPANISH: 'es',
    ENGLISH: 'en'
}

export const DIFFICULTYS = {
    FACIL: { name: "Fácil", value: 0, lengthRange: [4, 7], attempts: 10, rarityLevels: [1] },
    INTERMEDIO: { name: "Intermedio", value: 1, lengthRange: [6, 7], attempts: 6, rarityLevels: [1, 2] },
    DIFICIL: { name: "Difícil", value: 2, lengthRange: [8, 10], attempts: 4, rarityLevels: [3, 4] },
    IMPOSIBLE: { name: "Imposible", value: 3, lengthRange: [11, 15], attempts: 1, rarityLevels: [4, 5] },
};

export const DIFFICULTYS_MAP = new Map(
    Object.values(DIFFICULTYS).map(({ value, name, lengthRange, attempts, rarityLevels }) => [
        value,
        { name, lengthRange, attempts, rarityLevels },
    ])
);


export const MENU_OPTIONS = [
    {
        name: 'Jugar',
        value: 0
    },
    {
        name: 'Salir',
        value: 1
    }
]


export const DIFFICULTY_OPTIONS = Object.values(DIFFICULTYS).map(({ name, value }) => ({
    name,
    value
}));
