import { input, confirm, select } from "@inquirer/prompts";
import { DIFFICULTY_OPTIONS, DIFFICULTYS, DIFFICULTYS_MAP, LANGUAGES } from './consts.ts'

interface GameConfig {
    difficulty: string,
    language: string,
    wordLength: number,
    attempts: number
}

interface GuessedWords {
    difficulty: string,
    count: number
}

class HangmanGame {
    private guessedLetters: string[] = [];
    private guessedWords: GuessedWords[] = [];
    private config: GameConfig = { difficulty: '', language: '', wordLength: 0, attempts: 0 };
    private isNewGame = false

    constructor(private dictionary: typeof DIFFICULTYS_MAP) { }

    private async getRandomWord(): Promise<string> {
        const resp = await fetch(`https://random-word-api.herokuapp.com/word?lang=${this.config.language}&length=${this.config.wordLength}`);
        const data = await resp.json();
        return data[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    private displayWord(word: string): string {
        return word.split("").map(l => this.guessedLetters.includes(l) ? l : "_").join(" ");
    }

    async startGame() {
        await this.selectDifficulty()
        const word = await this.getRandomWord();
        console.log({ word })
        let attemptsLeft = this.config.attempts;

        while (attemptsLeft > 0) {
            this.showGuessedLetters()
            console.log(`Palabra: ${this.displayWord(word)}`);
            console.log(`Intentos restantes: ${attemptsLeft}`);
            const letter = await input({ message: "Escribe una letra: " });

            if (!/^[a-zA-Z]$/.test(letter)) {
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
                console.log(`Incorrecto! La letra ${letter} no está en la palabra.`);
            } else {
                console.log(`¡Bien! La letra ${letter} está en la palabra.`);
            }

            if (word.split("").every(l => this.guessedLetters.includes(l))) {
                console.log(`¡Ganaste! La palabra era: ${word}`);
                this.addGuessedWord()
                this.isNewGame = true
                return this.restartGame();
            }
        }
        console.log(`Perdiste. La palabra era: ${word}`);
        return this.restartGame();
    }

    private async restartGame() {
        const newGame = await confirm({ message: "¿Deseas volver a jugar?" });
        if (newGame) {
            this.guessedLetters = [];
            return this.startGame();
        } else {
            this.guessedWords.forEach(guessedWord => {
                console.log(`Palabras adivinadas con la dificultad ${guessedWord.difficulty}:${guessedWord.count}`);
            })
        }
    }

    async selectDifficulty() {
        let changeDifficulty = true
        if (this.isNewGame) {
            changeDifficulty = await confirm({ message: "Deseas cambiar la dificultad?" })
        }

        if (changeDifficulty) {
            const difficulty = await select({ choices: DIFFICULTY_OPTIONS, message: "¿Qué dificultad deseas usar?" });
            this.setDifficulty(difficulty)
        }
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
}

const hangmanGame = new HangmanGame(DIFFICULTYS_MAP)
console.log("Bienvenido al ahorcado!");
await hangmanGame.startGame()




