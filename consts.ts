import { getRandomLength } from "./functions";

export const LANGUAGES = {
    SPANISH: 'es',
    ENGLISH: 'en'
}

export const DIFFICULTYS = {
    FACIL: { name: "Fácil", value: 0, wordLength: getRandomLength(1, 5), attempts: 10 },
    INTERMEDIO: { name: "Intermedio", value: 1, wordLength: getRandomLength(6, 7), attempts: 6 },
    DIFICIL: { name: "Difícil", value: 2, wordLength: getRandomLength(8, 10), attempts: 4 },
    IMPOSIBLE: { name: "Imposible", value: 3, wordLength: getRandomLength(11, 15), attempts: 1 },
};

export const DIFFICULTYS_MAP = new Map(
    Object.values(DIFFICULTYS).map(({ value, name, wordLength, attempts }) => [
        value,
        { name, wordLength, attempts },
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
