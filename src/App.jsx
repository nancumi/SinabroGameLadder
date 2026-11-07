import React, { useState } from 'react';
import PlayerSetup from './components/PlayerSetup';
import LadderBoard from './components/LadderBoard';
import { CHARACTERS } from './constants/characters';
import { generateLadder } from './utils/ladder';

export default function App() {
  const [playerCount, setPlayerCount] = useState(3);
  const [step, setStep] = useState(1); // 1: 설정, 2: 사다리 게임
  const [ladderData, setLadderData] = useState(null);

  const activePlayers = CHARACTERS.slice(0, playerCount);

  // 사다리 생성 및 게임 시작
  const handleStartGame = () => {
    const data = generateLadder(playerCount, 7);
    setLadderData(data);
    setStep(2);
  };

  // 동일 인원으로 새 사다리 재생성
  const handleResetLadder = () => {
    const data = generateLadder(playerCount, 7);
    setLadderData(data);
  };

  // 처음부터 다시 시작 (인원 설정 화면으로 이동)
  const handleRestartFromBeginning = () => {
    setStep(1);
  };

  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center p-4">
      {step === 1 && (
        <PlayerSetup
          playerCount={playerCount}
          setPlayerCount={setPlayerCount}
          onStartGame={handleStartGame}
        />
      )}

      {step === 2 && ladderData && (
        <LadderBoard
          players={activePlayers}
          ladderData={ladderData}
          onResetLadder={handleResetLadder}
          onRestart={handleRestartFromBeginning}
        />
      )}
    </main>
  );
}
