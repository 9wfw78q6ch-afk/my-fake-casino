// src/geminiService.ts

export const getDailyFortune = async (username: string): Promise<string> => {
  // mock funkce – prozatím vrací náhodný text
  const fortunes = [
    "Today is your lucky day!",
    "Beware of the cosmic mines.",
    "A jackpot may be near!",
    "Keep spinning, the universe is on your side.",
    "Fortune favors the bold!"
  ];
  const randomIndex = Math.floor(Math.random() * fortunes.length);
  return fortunes[randomIndex];
};