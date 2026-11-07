import React from 'react';
import { Minus, Plus, Play } from 'lucide-react';
import { CHARACTERS } from '../constants/characters';

export default function PlayerSetup({ playerCount, setPlayerCount, onStartGame }) {
  const handleDecrease = () => {
    if (playerCount > 2) {
      setPlayerCount((prev) => prev - 1);
    }
  };

  const handleIncrease = () => {
    if (playerCount < 9) {
      setPlayerCount((prev) => prev + 1);
    }
  };

  const activePlayers = CHARACTERS.slice(0, playerCount);

  return (
    <div className="w-full max-w-sm flex flex-col items-center justify-center p-5 bg-[#13161f] border border-gray-800/80 rounded-3xl shadow-2xl backdrop-blur-md">
      {/* 헤더 */}
      <div className="flex items-center justify-center gap-2 mb-5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-[12px] font-semibold tracking-wider text-gray-300">
          참여 인원 설정
        </span>
      </div>

      {/* 인원 카운터 컨트롤러 */}
      <div className="flex items-center justify-center gap-6 mb-5">
        <button
          type="button"
          onClick={handleDecrease}
          disabled={playerCount <= 2}
          aria-label="인원 감소"
          className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#1c2230] text-gray-200 border border-gray-700/60 hover:bg-[#252d40] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md"
        >
          <Minus size={16} />
        </button>

        <div className="flex items-center justify-center min-w-[36px]">
          <div className="text-[28px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 leading-none">
            {playerCount}
          </div>
        </div>

        <button
          type="button"
          onClick={handleIncrease}
          disabled={playerCount >= 9}
          aria-label="인원 증가"
          className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#1c2230] text-gray-200 border border-gray-700/60 hover:bg-[#252d40] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* 자동 부여된 캐릭터 아바타 목록 (최대 9명 수용) */}
      <div className="w-full grid grid-cols-3 gap-2 mb-6 max-h-[340px] overflow-y-auto pr-0.5">
        {activePlayers.map((player) => (
          <div
            key={player.id}
            className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all duration-200 ${player.bgColor} ${player.borderColor}`}
          >
            <span className="text-[24px] mb-1 transform hover:scale-110 transition-transform">
              {player.emoji}
            </span>
            <span className="text-[11px] font-medium text-gray-300">
              {player.label}
            </span>
            <span
              className={`text-[11px] font-semibold mt-0.5 ${player.textColor}`}
            >
              {player.name}
            </span>
          </div>
        ))}
      </div>

      {/* 사다리 생성 시작 버튼 */}
      <button
        type="button"
        onClick={onStartGame}
        className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-[12px] flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] transition-all"
      >
        <Play size={14} className="fill-white" />
        <span>사다리 생성하기</span>
      </button>
    </div>
  );
}
