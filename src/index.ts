import { input, confirm, select } from "@inquirer/prompts";
import { DIFFICULTY_OPTIONS, DIFFICULTYS, DIFFICULTYS_MAP, LANGUAGES, MENU_OPTIONS } from './consts.js'
import { getRandomLength } from "./functions.js";

interface GameConfig {
    difficulty: string,
    language: string,
    lengthRange: number[],
    attempts: number,
    rarityLevels: number[]
}

interface GuessedWords {
    difficulty: string,
    count: number
}

class HangmanGame {
    private guessedLetters: string[] = [];
    private guessedWords: GuessedWords[] = [];
    private config: GameConfig = { difficulty: '', language: '', lengthRange: [0, 0], attempts: 0, rarityLevels: [0] };
    private isNewGame = false

    constructor(private dictionary: typeof DIFFICULTYS_MAP) { }

    async mainMenu() {
        console.log("¡Bienvenido al Ahorcado!");

        while (true) {
            const option = await select({
                message: "Menú Principal",
                choices: MENU_OPTIONS
            });

            if (option === 0) {
                this.isNewGame = false;
                await this.startGame();
            } else if (option === 1) {
                console.log("¡Gracias por jugar!");
                process.exit(0);
            }
        }
    }

    private async getRandomWord(): Promise<string> {
        const { language, lengthRange, rarityLevels } = this.config

        const [minLen, maxLen] = lengthRange;
        const wordLength = getRandomLength(minLen!, maxLen!);

        const wordRarity = this.selectRandomRarity(rarityLevels!)
        const resp = await fetch(`https://random-word-api.herokuapp.com/word?lang=${language}&length=${wordLength}&diff=${wordRarity}`);
        const data = await resp.json();
        const secretWord = data[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        return secretWord;
    }

    private displayWord(word: string): string {
        return word.split("").map(l => this.guessedLetters.includes(l) ? l : "_").join(" ");
    }

    async startGame() {
        this.guessedLetters = [];

        const continueGame = await this.selectDifficulty();
        if (!continueGame) return;

        const word = await this.getRandomWord();
        let attemptsLeft = this.config.attempts;

        while (attemptsLeft > 0) {
            this.showGuessedLetters();
            console.log(`Palabra: ${this.displayWord(word)}`);
            console.log(`Intentos restantes: ${attemptsLeft}`);

            const rawInput = await input({ message: "Escribe una letra (o 'salir' para abandonar): " });
            const letter = rawInput.toLowerCase().trim();

            if (letter === 'salir') {
                this.printStats()
                console.log("\nAbandonando el juego... ¡Hasta pronto!");
                process.exit(0);
            }

            if (!/^[a-zñ]$/.test(letter)) {
                console.log("Solo puedes introducir una letra válida.");
                continue;
            }
            if (this.guessedLetters.includes(letter)) {
                console.log("Ya has introducido esa letra.");
                continue;
            }

            this.guessedLetters.push(letter);
            if (!word.includes(letter)) {
                attemptsLeft--;
                console.log(`¡Incorrecto! La letra ${letter} no está en la palabra.\n`);
            } else {
                console.log(`¡Bien! La letra ${letter} está en la palabra.\n`);
            }

            if (word.split("").every(l => this.guessedLetters.includes(l))) {
                console.log(`¡Ganaste! La palabra era: ${word}\n`);
                this.addGuessedWord();
                this.isNewGame = true;
                return this.restartGame();
            }
        }
        console.log(`Perdiste. La palabra era: ${word}\n`);
        return this.restartGame();
    }

    private async restartGame() {
        const nextAction = await select({
            message: "¿Qué deseas hacer ahora?",
            choices: [
                { name: "Jugar de nuevo", value: "play" },
                { name: "Volver al menú principal", value: "menu" },
                { name: "Salir del juego", value: "exit" }
            ]
        });

        if (nextAction === "play") {
            return this.startGame()
        } else if (nextAction === "menu") {
            this.printStats()
            return
        } else {
            this.printStats()
            console.log("¡Gracias por jugar! Hasta luego.");
            process.exit(0)
        }
    }

    async selectDifficulty() {
        if (this.isNewGame) {
            const action = await select({
                message: "¿Deseas cambiar la dificultad?",
                choices: [
                    { name: "No, mantener la misma", value: "keep" },
                    { name: "Sí, cambiarla", value: "change" },
                    { name: "Salir del juego", value: "exit" }
                ]
            });

            if (action === "exit") process.exit(0);
            if (action === "keep") return true;
        }

        const difficulty = await select({
            message: "¿Qué dificultad deseas usar?",
            choices: [
                ...DIFFICULTY_OPTIONS,
                { name: 'Salir del juego', value: -1 }
            ]
        });

        if (difficulty === -1) {
            console.log("¡Hasta luego!");
            process.exit(0);
        }

        this.setDifficulty(difficulty as number);
        return true;
    }

    setDifficulty(difficulty: number) {
        const difficultyConfig = this.dictionary.get(difficulty);
        if (difficultyConfig) {
            this.config = { ...difficultyConfig, difficulty: difficultyConfig.name, language: LANGUAGES.SPANISH };
        }
    }

    showGuessedLetters() {
        const difficultys = [DIFFICULTYS.FACIL.name, DIFFICULTYS.INTERMEDIO.name]
        if (difficultys.includes(this.config.difficulty!)) {
            console.log(`Letras: ${this.guessedLetters}`)
        }
    }

    addGuessedWord() {
        const currentDifficulty = this.config.difficulty
        const countExists = this.guessedWords.find(guessedWord => guessedWord.difficulty === currentDifficulty)
        if (!countExists) {
            this.guessedWords.push({
                difficulty: currentDifficulty,
                count: 1
            })
        } else {
            countExists.count += 1
        }
    }

    selectRandomRarity(rarityLevels: number[]) {
        const randomIndex = Math.floor(Math.random() * rarityLevels.length);
        return rarityLevels[randomIndex];
    }

    private printStats() {
        if (this.guessedWords.length > 0) {
            this.guessedWords.forEach(guessedWord => {
                console.log(`Palabras adivinadas con la dificultad ${guessedWord.difficulty}: ${guessedWord.count}`);
            });
        }
        console.log("-------------------------------\n");
    }
}

const hangmanGame = new HangmanGame(DIFFICULTYS_MAP)
await hangmanGame.mainMenu()




