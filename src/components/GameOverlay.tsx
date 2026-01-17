
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Game, User } from '../types';

interface HistoryItem {
  result: 'win' | 'loss' | 'tie';
  amount: number;
}

interface GameOverlayProps {
  game: Game;
  onClose: () => void;
  user: User;
  onResult: (win: boolean, bet: number, winAmount: number) => void;
}

interface SlotSymbol {
  char: string;
  weight: number;
  multiplier: { 3: number; 4: number; 5: number };
  label: string;
}

const SYMBOL_SETS: Record<string, SlotSymbol[]> = {
  slots: [
    { char: '🍒', weight: 60, multiplier: { 3: 5, 4: 15, 5: 50 }, label: 'Cherry' },
    { char: '⭐', weight: 25, multiplier: { 3: 20, 4: 50, 5: 200 }, label: 'Star' },
    { char: '💎', weight: 12, multiplier: { 3: 100, 4: 500, 5: 2500 }, label: 'Diamond' },
    { char: '🎁', weight: 6, multiplier: { 3: 0, 4: 0, 5: 0 }, label: 'Gift' },
  ],
  slots_retro: [
    { char: '👾', weight: 60, multiplier: { 3: 5, 4: 15, 5: 50 }, label: 'Invader' },
    { char: '🕹️', weight: 25, multiplier: { 3: 20, 4: 50, 5: 200 }, label: 'Joystick' },
    { char: '⚡', weight: 12, multiplier: { 3: 100, 4: 500, 5: 2500 }, label: 'Pulse' },
    { char: '🔋', weight: 6, multiplier: { 3: 0, 4: 0, 5: 0 }, label: 'Power' },
  ],
  slots_wild: [
    { char: '🦁', weight: 60, multiplier: { 3: 5, 4: 15, 5: 50 }, label: 'Lion' },
    { char: '🦓', weight: 25, multiplier: { 3: 20, 4: 50, 5: 200 }, label: 'Zebra' },
    { char: '🐊', weight: 12, multiplier: { 3: 100, 4: 500, 5: 2500 }, label: 'Croc' },
    { char: '🥩', weight: 6, multiplier: { 3: 0, 4: 0, 5: 0 }, label: 'Meat' },
  ],
  slots_gold: [
    { char: '🏛️', weight: 60, multiplier: { 3: 5, 4: 15, 5: 50 }, label: 'Temple' },
    { char: '🏺', weight: 25, multiplier: { 3: 20, 4: 50, 5: 200 }, label: 'Urn' },
    { char: '⚖️', weight: 12, multiplier: { 3: 100, 4: 500, 5: 2500 }, label: 'Scales' },
    { char: '☀️', weight: 6, multiplier: { 3: 0, 4: 0, 5: 0 }, label: 'Sun' },
  ],
  slots_arcane: [
    { char: '🔮', weight: 60, multiplier: { 3: 5, 4: 15, 5: 50 }, label: 'Orb' },
    { char: '📜', weight: 25, multiplier: { 3: 20, 4: 50, 5: 200 }, label: 'Scroll' },
    { char: '🍄', weight: 12, multiplier: { 3: 100, 4: 500, 5: 2500 }, label: 'Mushroom' },
    { char: '🧙', weight: 6, multiplier: { 3: 0, 4: 0, 5: 0 }, label: 'Wizard' },
  ]
};

type RPSChoice = 'rock' | 'paper' | 'scissors';
const RPS_MAP: Record<RPSChoice, string> = { rock: '✊', paper: '✋', scissors: '✌️' };

const GameOverlay: React.FC<GameOverlayProps> = ({ game, onClose, user, onResult }) => {
  const currentSymbols = useMemo(() => SYMBOL_SETS[game.id] || SYMBOL_SETS['slots'], [game.id]);

  // --- General Game State ---
  const [bet, setBet] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<'win' | 'loss' | 'tie' | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [displayedWinAmount, setDisplayedWinAmount] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // --- Slots Specific State ---
  const [slotGrid, setSlotGrid] = useState<string[][]>([
    [currentSymbols[0].char, currentSymbols[1].char, currentSymbols[2].char, currentSymbols[0].char, currentSymbols[0].char],
    [currentSymbols[3].char, currentSymbols[0].char, currentSymbols[1].char, currentSymbols[2].char, currentSymbols[0].char],
    [currentSymbols[0].char, currentSymbols[3].char, currentSymbols[0].char, currentSymbols[1].char, currentSymbols[2].char]
  ]);
  const [isFreeSpins, setIsFreeSpins] = useState(false);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState(0);
  const [winningCells, setWinningCells] = useState<Set<string>>(new Set());
  const [spinningReels, setSpinningReels] = useState<boolean[]>([false, false, false, false, false]);
  const [justStopped, setJustStopped] = useState(false);

  // --- Mines Specific State ---
  const [minesCount, setMinesCount] = useState(3);
  const [minePositions, setMinePositions] = useState<Set<number>>(new Set());
  const [revealedTiles, setRevealedTiles] = useState<Set<number>>(new Set());
  const [isMinesActive, setIsMinesActive] = useState(false);
  const [currentMinesMultiplier, setCurrentMinesMultiplier] = useState(1.0);

  // --- HiLo State ---
  const [hiloCard, setHiloCard] = useState<number>(7);
  const [hiloMultiplier, setHiloMultiplier] = useState<number>(1.0);
  const [isHiloActive, setIsHiloActive] = useState<boolean>(false);
  const [hiloHistory, setHiloHistory] = useState<number[]>([]);
  const [hiloAnimating, setHiloAnimating] = useState(false);

  // --- RPS State ---
  const [rpsPlayerChoice, setRpsPlayerChoice] = useState<RPSChoice | null>(null);
  const [rpsAIChoice, setRpsAIChoice] = useState<RPSChoice | null>(null);

  // --- Other Games (Dice/Coin) State ---
  const [betTarget, setBetTarget] = useState<string | number>(game.id === 'coinflip' ? 'heads' : 1);
  const [actualOutcome, setActualOutcome] = useState<string | number | null>(null);

  const totalBet = useMemo(() => bet, [bet]);

  const generateRandomSymbol = useCallback((boostBonus = false) => {
    const weights = boostBonus 
      ? currentSymbols.map(s => s.multiplier[3] === 0 || s.multiplier[5] > 500 ? s.weight * 4 : s.weight)
      : currentSymbols.map(s => s.weight);
    
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < weights.length; i++) {
      if (random < weights[i]) return currentSymbols[i].char;
      random -= weights[i];
    }
    return currentSymbols[0].char;
  }, [currentSymbols]);

  // --- Slots Logic ---
  const handleSlotsPlay = async () => {
    if (!isFreeSpins && user.balance < totalBet) return;
    
    setIsPlaying(true);
    setResult(null);
    setShowCelebration(false);
    setWinningCells(new Set());
    setJustStopped(false);
    setSpinningReels([true, true, true, true, true]);

    const finalGrid = [
      Array.from({ length: 5 }, () => generateRandomSymbol(isFreeSpins)),
      Array.from({ length: 5 }, () => generateRandomSymbol(isFreeSpins)),
      Array.from({ length: 5 }, () => generateRandomSymbol(isFreeSpins)),
    ];

    const spinInterval = setInterval(() => {
      setSlotGrid(prev => prev.map((row, rIdx) => row.map((sym, cIdx) => 
        spinningReels[cIdx] ? generateRandomSymbol(isFreeSpins) : sym
      )));
    }, 50);

    await new Promise(r => setTimeout(r, 1800));
    clearInterval(spinInterval);
    setSpinningReels([false, false, false, false, false]);
    setJustStopped(true);
    setSlotGrid(finalGrid);

    let totalWin = 0;
    const wonCells = new Set<string>();
    let scatterCount = 0;
    const scatterChar = currentSymbols.find(s => s.multiplier[3] === 0)?.char;

    finalGrid.forEach((row, rIdx) => {
      row.forEach((sym, cIdx) => {
        if (sym === scatterChar) {
          scatterCount++;
          wonCells.add(`${rIdx}-${cIdx}`);
        }
      });
    });

    finalGrid.forEach((row, rowIndex) => {
      const firstSym = row[0];
      if (firstSym === scatterChar) return; 
      let matchCount = 1;
      for (let i = 1; i < 5; i++) {
        if (row[i] === firstSym) matchCount++;
        else break;
      }
      if (matchCount >= 3) {
        const symbolData = currentSymbols.find(s => s.char === firstSym);
        if (symbolData) {
          const mult = (symbolData.multiplier as any)[matchCount] || 0;
          totalWin += totalBet * mult;
          for(let i = 0; i < matchCount; i++) wonCells.add(`${rowIndex}-${i}`);
        }
      }
    });

    if (scatterCount >= 3) {
      setFreeSpinsLeft(prev => prev + 10);
      setIsFreeSpins(true);
    }

    const isWinOutcome = totalWin > 0 || scatterCount >= 3;
    
    setTimeout(() => {
      if (isWinOutcome) {
        setResult('win');
        setDisplayedWinAmount(totalWin);
        setWinningCells(wonCells);
        setShowCelebration(true);
      } else {
        setResult('loss');
      }
      onResult(isWinOutcome, isFreeSpins ? 0 : totalBet, totalWin);
      if (isFreeSpins) {
        setFreeSpinsLeft(prev => {
          const next = prev - 1;
          if (next <= 0) setIsFreeSpins(false);
          return next;
        });
      }
      setIsPlaying(false);
      setJustStopped(false);
    }, 450);
  };

  // --- RPS Logic ---
  const handleRPSPlay = async (playerChoice: RPSChoice) => {
    if (user.balance < totalBet) return;
    setIsPlaying(true);
    setResult(null);
    setRpsPlayerChoice(playerChoice);
    setRpsAIChoice(null);
    setShowCelebration(false);

    // AI thinking delay
    await new Promise(r => setTimeout(r, 1200));

    const choices: RPSChoice[] = ['rock', 'paper', 'scissors'];
    const aiChoice = choices[Math.floor(Math.random() * 3)];
    setRpsAIChoice(aiChoice);

    let res: 'win' | 'loss' | 'tie';
    if (playerChoice === aiChoice) res = 'tie';
    else if (
      (playerChoice === 'rock' && aiChoice === 'scissors') ||
      (playerChoice === 'paper' && aiChoice === 'rock') ||
      (playerChoice === 'scissors' && aiChoice === 'paper')
    ) {
      res = 'win';
    } else {
      res = 'loss';
    }

    const winAmount = res === 'win' ? totalBet * 2 : res === 'tie' ? totalBet : 0;
    
    setTimeout(() => {
      setResult(res);
      if (res === 'win') {
        setShowCelebration(true);
        setDisplayedWinAmount(winAmount);
      }
      onResult(res === 'win', totalBet, winAmount);
      setIsPlaying(false);
    }, 600);
  };

  // --- HiLo Logic ---
  const handleHiLoStart = () => {
    if (user.balance < totalBet) return;
    setIsHiloActive(true);
    setHiloMultiplier(1.0);
    setHiloCard(Math.floor(Math.random() * 13) + 2);
    setHiloHistory([]);
    setResult(null);
    setShowCelebration(false);
  };

  const handleHiLoGuess = async (guess: 'higher' | 'lower') => {
    if (hiloAnimating) return;
    setHiloAnimating(true);
    const nextVal = Math.floor(Math.random() * 13) + 2;
    
    await new Promise(r => setTimeout(r, 600));

    const isWin = guess === 'higher' ? nextVal > hiloCard : nextVal < hiloCard;

    if (isWin) {
      const cardsAbove = 14 - hiloCard;
      const cardsBelow = hiloCard - 2;
      const prob = guess === 'higher' ? cardsAbove / 13 : cardsBelow / 13;
      const multBoost = parseFloat((0.95 / prob).toFixed(2));
      
      setHiloMultiplier(prev => parseFloat((prev * multBoost).toFixed(2)));
      setHiloHistory(prev => [hiloCard, ...prev].slice(0, 5));
      setHiloCard(nextVal);
      setResult('win');
    } else {
      setIsHiloActive(false);
      setResult('loss');
      onResult(false, totalBet, 0);
    }
    setHiloAnimating(false);
  };

  const handleHiLoCashOut = () => {
    if (!isHiloActive) return;
    const winAmount = Math.floor(totalBet * hiloMultiplier);
    setIsHiloActive(false);
    setResult('win');
    setDisplayedWinAmount(winAmount);
    onResult(true, totalBet, winAmount);
    setShowCelebration(true);
  };

  const getCardLabel = (val: number) => {
    if (val <= 10) return val.toString();
    if (val === 11) return 'J';
    if (val === 12) return 'Q';
    if (val === 13) return 'K';
    if (val === 14) return 'A';
    return val.toString();
  };

  // --- Mines Logic ---
  const handleMinesStart = () => {
    if (user.balance < totalBet) return;
    const newMines = new Set<number>();
    while (newMines.size < minesCount) {
      newMines.add(Math.floor(Math.random() * 25));
    }
    setMinePositions(newMines);
    setRevealedTiles(new Set());
    setIsMinesActive(true);
    setCurrentMinesMultiplier(1.0);
    setResult(null);
    setShowCelebration(false);
  };

  const handleTileClick = (index: number) => {
    if (!isMinesActive || revealedTiles.has(index)) return;
    if (minePositions.has(index)) {
      setIsMinesActive(false);
      setResult('loss');
      onResult(false, totalBet, 0);
      setRevealedTiles(new Set(Array.from({ length: 25 }, (_, i) => i)));
    } else {
      const newRevealed = new Set(revealedTiles);
      newRevealed.add(index);
      setRevealedTiles(newRevealed);
      const totalTiles = 25;
      const safeTiles = totalTiles - minesCount;
      let prob = 1.0;
      for (let i = 0; i < newRevealed.size; i++) {
        prob *= (safeTiles - i) / (totalTiles - i);
      }
      const nextMult = parseFloat((0.98 / prob).toFixed(2));
      setCurrentMinesMultiplier(nextMult);
      if (newRevealed.size === safeTiles) handleMinesCashOut(nextMult);
    }
  };

  const handleMinesCashOut = (finalMult?: number) => {
    if (!isMinesActive || revealedTiles.size === 0) return;
    const mult = finalMult || currentMinesMultiplier;
    const winPayout = Math.floor(totalBet * mult);
    setIsMinesActive(false);
    setResult('win');
    setDisplayedWinAmount(winPayout);
    setShowCelebration(true);
    onResult(true, totalBet, winPayout);
    setRevealedTiles(new Set(Array.from({ length: 25 }, (_, i) => i)));
  };

  // --- Generic Logic (Coin/Dice) ---
  const handleGenericPlay = () => {
    if (user.balance < totalBet) return;
    setIsPlaying(true);
    setResult(null);
    setActualOutcome(null);
    setShowCelebration(false);
    setTimeout(() => {
      let isWin = false;
      let outcome: string | number;
      if (game.id === 'coinflip') {
        outcome = Math.random() > 0.5 ? 'heads' : 'tails';
        isWin = outcome === betTarget;
      } else {
        outcome = Math.floor(Math.random() * 6) + 1;
        isWin = outcome === Number(betTarget);
      }
      const winAmount = isWin ? totalBet * 2 : 0;
      setActualOutcome(outcome);
      onResult(isWin, totalBet, winAmount);
      setResult(isWin ? 'win' : 'loss');
      if (isWin) {
        setShowCelebration(true);
        setDisplayedWinAmount(winAmount);
      }
      setIsPlaying(false);
    }, 1500);
  };

  // --- Renders ---
  const renderSlots = () => (
    <div className={`p-8 rounded-[3rem] border-4 transition-all duration-700 relative overflow-hidden ${isFreeSpins ? 'border-purple-500 bg-purple-950/20 shadow-[0_0_60px_rgba(168,85,247,0.5)]' : 'border-slate-800 bg-slate-950/50 shadow-2xl'}`}>
      {isFreeSpins && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-8 py-2 bg-purple-600 text-white text-[12px] font-black uppercase rounded-full animate-pulse shadow-[0_0_20px_#a855f7] border border-purple-400">
            OVERDRIVE PULSE: {freeSpinsLeft} REMAINING
          </div>
          <div className="absolute inset-0 animate-flash opacity-20 bg-purple-500" />
        </div>
      )}
      <div className="grid grid-rows-3 gap-5">
        {slotGrid.map((row, rIdx) => (
          <div key={rIdx} className="grid grid-cols-5 gap-5 relative">
            {row.map((symbol, cIdx) => (
              <div key={cIdx} className={`w-16 h-16 md:w-24 md:h-24 flex items-center justify-center text-4xl md:text-6xl rounded-[2rem] bg-slate-900 border transition-all transform shadow-inner ${spinningReels[cIdx] ? 'animate-slot-spin opacity-40 border-slate-700' : 'opacity-100'} ${justStopped && !spinningReels[cIdx] ? 'animate-slot-stop' : ''} ${winningCells.has(`${rIdx}-${cIdx}`) && !isPlaying ? 'animate-symbol-win z-10 border-yellow-400 bg-yellow-400/20' : 'border-slate-800'}`}>
                <span>{symbol}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  const renderRPS = () => (
    <div className="flex flex-col items-center gap-10">
      <div className="flex justify-between w-full max-w-sm gap-8">
        {/* Player Side */}
        <div className="flex flex-col items-center gap-4">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Player Protocol</span>
          <div className={`w-32 h-32 rounded-[2.5rem] bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-6xl shadow-inner transition-all transform ${rpsPlayerChoice && !isPlaying ? 'scale-110 border-cyan-500 neon-text' : ''}`}>
             {rpsPlayerChoice ? RPS_MAP[rpsPlayerChoice] : '?'}
          </div>
        </div>
        
        <div className="flex items-center text-slate-700 font-orbitron text-2xl">VS</div>

        {/* AI Side */}
        <div className="flex flex-col items-center gap-4">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nova AI</span>
          <div className={`w-32 h-32 rounded-[2.5rem] bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-6xl shadow-inner transition-all transform ${isPlaying ? 'animate-dice-roll' : rpsAIChoice ? 'scale-110 border-rose-500 neon-text' : ''}`}>
             {isPlaying ? '⚡' : rpsAIChoice ? RPS_MAP[rpsAIChoice] : '?'}
          </div>
        </div>
      </div>

      {!isPlaying && !result && (
        <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
           {(['rock', 'paper', 'scissors'] as RPSChoice[]).map((choice) => (
             <button
               key={choice}
               onClick={() => handleRPSPlay(choice)}
               className="py-6 rounded-3xl bg-slate-900 border-2 border-slate-800 hover:border-cyan-500 transition-all flex flex-col items-center group active:scale-95"
             >
               <span className="text-4xl group-hover:scale-125 transition-transform">{RPS_MAP[choice]}</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-cyan-400 mt-2">{choice}</span>
             </button>
           ))}
        </div>
      )}
    </div>
  );

  const renderHiLo = () => (
    <div className="flex flex-col items-center gap-10">
      <div className="flex gap-4 mb-4">
        {hiloHistory.map((val, i) => (
          <div key={i} className="w-12 h-16 bg-slate-900/50 border border-slate-800 rounded-lg flex items-center justify-center text-slate-500 font-bold opacity-50 scale-90">
            {getCardLabel(val)}
          </div>
        ))}
      </div>
      
      <div className={`w-48 h-64 bg-slate-900 border-4 border-slate-700 rounded-[2.5rem] flex items-center justify-center text-8xl font-orbitron font-bold shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all transform ${hiloAnimating ? 'animate-slot-stop scale-110 border-cyan-500' : 'border-slate-800'}`}>
        <span className={`${hiloAnimating ? 'opacity-0' : 'opacity-100'} transition-opacity text-white neon-text`}>
          {getCardLabel(hiloCard)}
        </span>
      </div>

      {isHiloActive && (
        <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
          <button 
            disabled={hiloAnimating}
            onClick={() => handleHiLoGuess('higher')}
            className="group py-6 rounded-[2rem] bg-slate-900 border-2 border-slate-800 hover:border-emerald-500 transition-all active:scale-95 flex flex-col items-center"
          >
            <span className="text-3xl mb-1">▲</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-emerald-400">Higher</span>
          </button>
          <button 
            disabled={hiloAnimating}
            onClick={() => handleHiLoGuess('lower')}
            className="group py-6 rounded-[2rem] bg-slate-900 border-2 border-slate-800 hover:border-rose-500 transition-all active:scale-95 flex flex-col items-center"
          >
            <span className="text-3xl mb-1">▼</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-rose-400">Lower</span>
          </button>
        </div>
      )}

      {isHiloActive && hiloMultiplier > 1 && (
        <div className="w-full max-w-sm flex justify-between items-center px-8 py-6 bg-slate-950 border-2 border-slate-800 rounded-[2.5rem] animate-in slide-in-from-bottom-5">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Multiplier</span>
            <span className="text-3xl font-orbitron font-bold text-cyan-400 neon-text">{hiloMultiplier}x</span>
          </div>
          <button 
            onClick={handleHiLoCashOut}
            className="px-8 py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl neon-glow transition-all active:scale-90 uppercase text-xs tracking-widest"
          >
            Cash Out
          </button>
        </div>
      )}
    </div>
  );

  const renderMines = () => (
    <div className="flex flex-col items-center gap-10">
      <div className="grid grid-cols-5 gap-4 p-8 bg-slate-950/90 rounded-[3.5rem] border border-slate-800 shadow-[0_0_70px_rgba(0,0,0,0.8)] relative">
        {Array.from({ length: 25 }).map((_, i) => (
          <button
            key={i}
            disabled={!isMinesActive || revealedTiles.has(i)}
            onClick={() => handleTileClick(i)}
            className={`w-14 h-14 md:w-20 md:h-20 rounded-3xl border-2 transition-all flex items-center justify-center text-3xl ${revealedTiles.has(i) ? (minePositions.has(i) ? 'bg-rose-500/50 border-rose-500' : 'bg-emerald-500/50 border-emerald-500') : isMinesActive ? 'bg-slate-800 border-slate-700 hover:border-cyan-500 hover:scale-110' : 'bg-slate-900 border-slate-800 opacity-30'}`}
          >
            {revealedTiles.has(i) ? (minePositions.has(i) ? '💣' : '💎') : <div className="w-2 h-2 bg-slate-700 rounded-full" />}
          </button>
        ))}
      </div>
      {isMinesActive && (
        <div className="w-full max-w-md flex justify-between items-center px-10 py-6 bg-slate-900 border-2 border-slate-700 rounded-[3rem]">
           <div className="flex flex-col">
             <span className="text-[11px] text-slate-500 uppercase font-black tracking-widest">Secured Profit</span>
             <span className="text-4xl font-orbitron font-bold text-emerald-400">{(totalBet * currentMinesMultiplier).toFixed(0)} GC</span>
           </div>
           <button onClick={() => handleMinesCashOut()} disabled={revealedTiles.size === 0} className="px-12 py-5 bg-emerald-500 text-slate-950 font-black rounded-3xl neon-glow">Cash Out</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-3xl animate-in fade-in duration-300 overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-[4.5rem] shadow-[0_0_150px_rgba(34,211,238,0.2)] overflow-hidden relative flex flex-col my-auto border-t-cyan-500/40">
        <button onClick={onClose} className="absolute top-12 right-12 text-slate-500 hover:text-white transition-colors z-30 p-2 group">
          <span className="text-4xl transform group-hover:rotate-90 transition-transform block">✕</span>
        </button>
        
        <div className="p-12 flex flex-col items-center">
          <div className="mb-6 px-6 py-2 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-black uppercase tracking-[0.6em] text-cyan-400 shadow-inner">
            Direct Nexus Transmission
          </div>
          <h2 className={`text-5xl font-orbitron font-bold mb-12 tracking-tight text-center ${isFreeSpins ? 'text-purple-400 neon-text' : 'text-white'}`}>
            {isFreeSpins ? 'GALACTIC OVERDRIVE' : game.name.toUpperCase()}
          </h2>
          
          <div className="mb-14 w-full flex justify-center">
            {game.id.includes('slots') && renderSlots()}
            {game.id === 'mines' && renderMines()}
            {game.id === 'hilo' && renderHiLo()}
            {game.id === 'rps' && renderRPS()}
            {(!game.id.includes('slots') && game.id !== 'mines' && game.id !== 'hilo' && game.id !== 'rps') && (
              <div className="flex flex-col items-center py-20">
                {!isPlaying && actualOutcome !== null ? (
                  <div className="text-[12rem] mb-6 animate-victory filter drop-shadow-[0_0_60px_rgba(255,255,255,0.4)]">
                    {game.id === 'coinflip' ? (actualOutcome === 'heads' ? '🪙' : '🔘') : ['⚀','⚁','⚂','⚃','⚄','⚅'][(actualOutcome as number)-1]}
                  </div>
                ) : (
                  <div className={`text-[12rem] mb-6 ${isPlaying ? (game.id === 'coinflip' ? 'animate-coin-flip' : 'animate-dice-roll') : 'opacity-10'}`}>
                    {game.icon}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="w-full max-w-md space-y-12 pb-8">
            {!isMinesActive && !isHiloActive && !isPlaying && !result && (game.id !== 'rps' || true) && (
              <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                {game.id === 'coinflip' && (
                  <div className="grid grid-cols-2 gap-6">
                    {['heads', 'tails'].map(t => (
                      <button key={t} onClick={() => setBetTarget(t)} className={`py-6 rounded-[2rem] border-4 text-[13px] font-black uppercase tracking-[0.4em] transition-all ${betTarget === t ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-2xl scale-105' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                )}
                
                {game.id === 'dice' && (
                  <div className="grid grid-cols-6 gap-4">
                    {[1,2,3,4,5,6].map(n => (
                      <button key={n} onClick={() => setBetTarget(n)} className={`h-16 rounded-3xl border-2 text-xl font-black transition-all ${betTarget === n ? 'bg-purple-500 text-white border-purple-400 shadow-2xl scale-110' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-10 bg-slate-950/90 rounded-[3rem] border border-slate-800 text-center shadow-2xl group">
                  <label className="block text-[12px] font-black text-slate-600 uppercase tracking-[0.6em] mb-6 group-hover:text-cyan-500 transition-colors">Wager Authorization</label>
                  <div className="flex items-center justify-center gap-12">
                    <button onClick={() => setBet(Math.max(10, bet - 100))} className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border-4 border-slate-700 font-bold hover:bg-slate-700 hover:border-slate-500 transition-all active:scale-90 shadow-xl text-xl">-</button>
                    <span className="text-6xl font-orbitron font-bold text-cyan-400 neon-text">{bet}</span>
                    <button onClick={() => setBet(bet + 100)} className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border-4 border-slate-700 font-bold hover:bg-slate-700 hover:border-slate-500 transition-all active:scale-90 shadow-xl text-xl">+</button>
                  </div>
                </div>
              </div>
            )}

            {!isMinesActive && !isHiloActive && !isPlaying && !result && game.id !== 'rps' && (
              <button 
                disabled={isPlaying || (!isFreeSpins && user.balance < totalBet)}
                onClick={game.id.includes('slots') ? handleSlotsPlay : game.id === 'mines' ? handleMinesStart : game.id === 'hilo' ? handleHiLoStart : handleGenericPlay}
                className={`w-full py-8 rounded-[3.5rem] font-black text-3xl transition-all border-b-[16px] active:border-b-0 active:translate-y-2 shadow-[0_0_60px_rgba(0,0,0,0.5)] ${
                  isPlaying ? 'bg-slate-800 text-slate-600 border-slate-950 cursor-wait' : 
                  (!isFreeSpins && user.balance < totalBet) ? 'bg-slate-900 text-slate-700 border-slate-950 cursor-not-allowed opacity-50' : 
                  isFreeSpins ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-900 shadow-[0_0_80px_rgba(168,85,247,0.6)]' : 
                  'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-900 shadow-[0_0_80px_rgba(34,211,238,0.6)]'
                }`}
              >
                <span className="font-orbitron tracking-[0.4em]">{isPlaying ? 'TRANSMITTING...' : isFreeSpins ? 'PULSE' : 'INITIATE'}</span>
              </button>
            )}

            {(isMinesActive || isHiloActive) && (
              <button 
                disabled={isPlaying}
                onClick={isMinesActive ? () => {
                  setIsMinesActive(false);
                  setResult(null);
                  setRevealedTiles(new Set());
                } : () => {
                  setIsHiloActive(false);
                  setResult(null);
                  setHiloMultiplier(1.0);
                }}
                className="w-full py-6 rounded-[3rem] font-black text-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-slate-700 transition-all uppercase tracking-widest"
              >
                Back to Lobby
              </button>
            )}

            {result && !isPlaying && !isMinesActive && !isHiloActive && (
              <div className={`text-center p-12 rounded-[4rem] border-4 animate-victory mt-10 ${result === 'win' ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_80px_rgba(16,185,129,0.5)]' : result === 'tie' ? 'bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_80px_rgba(234,179,8,0.5)]' : 'bg-rose-500/10 border-rose-500/50 shadow-[0_0_80px_rgba(244,63,94,0.5)]'}`}>
                <p className={`text-[14px] font-black uppercase tracking-[0.8em] mb-4 ${result === 'win' ? 'text-emerald-400' : result === 'tie' ? 'text-yellow-400' : 'text-rose-400'}`}>
                  {result === 'win' ? 'SYNC SUCCESSFUL' : result === 'tie' ? 'PROTOCOL COLLISION' : 'NODE SEVERED'}
                </p>
                <p className={`text-7xl font-orbitron font-bold ${result === 'win' ? 'text-emerald-400' : result === 'tie' ? 'text-yellow-400' : 'text-rose-400'} neon-text`}>
                  {result === 'win' ? `+${displayedWinAmount.toLocaleString()}` : result === 'tie' ? `RETURNED` : `-${totalBet.toLocaleString()}`} <span className="text-xl">GC</span>
                </p>
                <button 
                  onClick={() => { setResult(null); setShowCelebration(false); setRpsPlayerChoice(null); setRpsAIChoice(null); }} 
                  className="mt-12 px-20 py-6 bg-slate-800 hover:bg-slate-700 text-white rounded-[2.5rem] text-[13px] font-black uppercase tracking-[0.4em] transition-all border-2 border-slate-700 shadow-2xl hover:shadow-cyan-500/40"
                >
                  RE-SYNC
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverlay;
