import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Check, RotateCcw, Skull } from 'lucide-react';

// 안전한 폭죽 호출 헬퍼 (모듈 호환성 방어)
const fireConfetti = (options) => {
  try {
    if (typeof confetti === 'function') {
      confetti(options);
    } else if (confetti && typeof confetti.default === 'function') {
      confetti.default(options);
    }
  } catch (err) {
    console.warn('Confetti error:', err);
  }
};

export default function LadderBoard({
  players,
  ladderData,
  onRestart,
}) {
  const { bridges, goals, rowCount, colCount } = ladderData;

  const [playerResults, setPlayerResults] = useState({});
  const [activePlayerIndex, setActivePlayerIndex] = useState(null);
  const [currentRunner, setCurrentRunner] = useState(null);
  const [activeTracePoints, setActiveTracePoints] = useState([]);
  const [revealedGoals, setRevealedGoals] = useState({});

  const [isGameOver, setIsGameOver] = useState(false);
  const [bombVictim, setBombVictim] = useState(null);
  const [isShaking, setIsShaking] = useState(false);

  const [dimensions, setDimensions] = useState({ width: 380, height: 420 });
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);

  // 반응형 크기 계산
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const clientW = containerRef.current.clientWidth || 380;
        const width = Math.min(clientW, 480);
        const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
        const height = Math.max(380, Math.min(winH * 0.54, 460));
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const safeColCount = Math.max(colCount || 1, 2);
  const paddingX = Math.max(20, dimensions.width / (safeColCount * 2.3));
  const paddingY = 24;
  const colGap = safeColCount > 1 ? (dimensions.width - paddingX * 2) / (safeColCount - 1) : 0;
  const rowGap = (dimensions.height - paddingY * 2) / (rowCount + 1);

  const getColX = (col) => paddingX + col * colGap;
  const getRowY = (row) => paddingY + (row + 1) * rowGap;

  const handleSelectPlayer = (playerIndex) => {
    // 유효성 및 중복 선택 방어
    if (
      playerIndex === undefined ||
      playerIndex === null ||
      !players[playerIndex] ||
      playerResults[playerIndex] ||
      isGameOver ||
      activePlayerIndex !== null
    ) {
      return;
    }

    setActivePlayerIndex(playerIndex);
    setActiveTracePoints([]);

    let currentCol = playerIndex;
    const path = [];
    path.push({ x: getColX(currentCol), y: paddingY });

    for (let r = 0; r < rowCount; r++) {
      const currentY = getRowY(r);
      path.push({ x: getColX(currentCol), y: currentY });

      if (bridges && bridges[r]) {
        if (currentCol < safeColCount - 1 && bridges[r][currentCol]) {
          currentCol += 1;
          path.push({ x: getColX(currentCol), y: currentY });
        } else if (currentCol > 0 && bridges[r][currentCol - 1]) {
          currentCol -= 1;
          path.push({ x: getColX(currentCol), y: currentY });
        }
      }
    }

    const endPoint = { x: getColX(currentCol), y: dimensions.height - paddingY };
    path.push(endPoint);

    animatePath(playerIndex, path, currentCol);
  };

  const animatePath = (playerIndex, path, endCol) => {
    const totalSegments = path.length - 1;
    if (totalSegments <= 0) {
      handleArrival(playerIndex, path, endCol);
      return;
    }

    const segmentDuration = 170;
    const totalDuration = totalSegments * segmentDuration;
    let startTime = null;

    const tick = (now) => {
      if (!startTime) {
        startTime = now;
      }

      const elapsed = Math.max(0, now - startTime);
      const progress = Math.min(elapsed / totalDuration, 1);

      const currentProgressScaled = progress * totalSegments;
      const segmentIndex = Math.max(
        0,
        Math.min(Math.floor(currentProgressScaled), totalSegments - 1)
      );
      const segmentProgress = currentProgressScaled - segmentIndex;

      const p1 = path[segmentIndex];
      const p2 = path[segmentIndex + 1];

      // 안전 방어
      if (!p1 || !p2) {
        handleArrival(playerIndex, path, endCol);
        return;
      }

      const currentX = p1.x + (p2.x - p1.x) * segmentProgress;
      const currentY = p1.y + (p2.y - p1.y) * segmentProgress;

      const visitedPoints = path.slice(0, segmentIndex + 1);
      visitedPoints.push({ x: currentX, y: currentY });

      setActiveTracePoints(visitedPoints);
      setCurrentRunner({
        x: currentX,
        y: currentY,
        playerIndex,
        emoji: players[playerIndex]?.emoji || '🐾',
        color: players[playerIndex]?.color || '#ffffff',
      });

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        handleArrival(playerIndex, path, endCol);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  };

  const handleArrival = (playerIndex, path, endCol) => {
    const isBomb = Boolean(goals[endCol]?.isBomb);
    const player = players[playerIndex];

    const nextResults = {
      ...playerResults,
      [playerIndex]: {
        completed: true,
        endCol,
        isBomb,
        pathPoints: path,
      },
    };
    setPlayerResults(nextResults);

    setRevealedGoals((prev) => ({
      ...prev,
      [endCol]: true,
    }));

    setActivePlayerIndex(null);
    setCurrentRunner(null);
    setActiveTracePoints([]);

    if (isBomb) {
      setIsGameOver(true);
      setBombVictim(player);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 800);

      // 화려한 붉은 폭죽 연속 발사
      const end = Date.now() + 1200;
      const colors = ['#ff0033', '#ff4d4d', '#ff8533', '#ffcc00'];

      (function frame() {
        fireConfetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        fireConfetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } else {
      fireConfetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });

      if (Object.keys(nextResults).length === players.length) {
        setIsGameOver(true);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const pointsToSvgPath = (points) => {
    if (!points || !Array.isArray(points) || points.length === 0) return '';
    return points
      .filter((pt) => pt && typeof pt.x === 'number' && typeof pt.y === 'number' && !isNaN(pt.x) && !isNaN(pt.y))
      .map((pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `L ${pt.x} ${pt.y}`))
      .join(' ');
  };

  const isMany = safeColCount >= 7;

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-md flex flex-col items-center justify-center select-none transition-transform duration-100 ${
        isShaking ? 'animate-shake' : ''
      }`}
    >
      {/* 1. 상단: 플레이어 아바타 선택 영역 */}
      <div className="w-full flex items-center justify-between px-1 mb-2 gap-1">
        {players.map((player, idx) => {
          const isDone = Boolean(playerResults[idx]);
          const isRunning = activePlayerIndex === idx;
          const isVictim = bombVictim && bombVictim.id === player.id;
          const isDisabled = activePlayerIndex !== null || isDone || isGameOver;

          return (
            <button
              key={player.id}
              type="button"
              onClick={() => handleSelectPlayer(idx)}
              disabled={isDisabled}
              aria-label={`${player.label} 선택`}
              className={`relative flex flex-col items-center justify-center rounded-2xl border transition-all duration-200 active:scale-95 flex-1 min-w-0 ${
                isMany ? 'py-1.5 px-0.5' : 'p-2'
              } ${
                isVictim
                  ? 'border-rose-500 bg-rose-500/30 ring-2 ring-rose-500 animate-pulse'
                  : isRunning
                  ? 'border-indigo-400 bg-indigo-500/20 ring-2 ring-indigo-400/50 scale-105'
                  : isDone
                  ? 'border-gray-800 bg-[#12151d] opacity-40 cursor-not-allowed'
                  : isGameOver
                  ? 'border-gray-800 bg-[#12151d] opacity-30 cursor-not-allowed'
                  : `${player.bgColor} ${player.borderColor} hover:scale-105 hover:bg-opacity-25 shadow-md cursor-pointer`
              }`}
            >
              <div
                className={`leading-none mb-1 ${
                  isMany ? 'text-[16px] sm:text-[18px]' : 'text-[20px] sm:text-[24px]'
                }`}
              >
                {isVictim ? '💥' : player.emoji}
              </div>
              <span className="font-semibold text-gray-200 truncate w-full text-center text-[11px]">
                {player.name}
              </span>

              {isDone && !isVictim && (
                <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
                  <Check size={14} className="text-emerald-400 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. 중앙: 사다리 SVG 영역 */}
      <div className="relative w-full rounded-3xl bg-[#12151e]/90 border border-gray-800/80 shadow-2xl p-2 my-2 overflow-hidden flex justify-center items-center backdrop-blur-sm">
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="overflow-visible block"
        >
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 세로 기둥 선들 */}
          {Array.from({ length: safeColCount }).map((_, c) => {
            const x = getColX(c);
            return (
              <line
                key={`col-${c}`}
                x1={x}
                y1={paddingY}
                x2={x}
                y2={dimensions.height - paddingY}
                stroke="#2a3245"
                strokeWidth={isMany ? '2.5' : '3.5'}
                strokeLinecap="round"
              />
            );
          })}

          {/* 가로 연결 다리 선들 */}
          {bridges &&
            bridges.map((row, r) => {
              const y = getRowY(r);
              return (
                row &&
                row.map((hasBridge, c) => {
                  if (!hasBridge) return null;
                  const x1 = getColX(c);
                  const x2 = getColX(c + 1);
                  return (
                    <line
                      key={`bridge-${r}-${c}`}
                      x1={x1}
                      y1={y}
                      x2={x2}
                      y2={y}
                      stroke="#38435c"
                      strokeWidth={isMany ? '2.2' : '3'}
                      strokeLinecap="round"
                    />
                  );
                })
              );
            })}

          {/* 이미 완료된 경로 선들 */}
          {Object.entries(playerResults).map(([pIdx, result]) => {
            const p = players[pIdx];
            if (!p || !result?.pathPoints) return null;
            return (
              <path
                key={`completed-path-${pIdx}`}
                d={pointsToSvgPath(result.pathPoints)}
                fill="none"
                stroke={result.isBomb ? '#f43f5e' : p.color}
                strokeWidth={result.isBomb ? '4' : isMany ? '2.5' : '3.2'}
                strokeOpacity={result.isBomb ? '0.9' : '0.45'}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={result.isBomb ? 'url(#glow)' : undefined}
              />
            );
          })}

          {/* 현재 이동 중인 경로 */}
          {activeTracePoints.length > 1 &&
            activePlayerIndex !== null &&
            players[activePlayerIndex] && (
              <path
                d={pointsToSvgPath(activeTracePoints)}
                fill="none"
                stroke={players[activePlayerIndex].color}
                strokeWidth={isMany ? '3.5' : '4'}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
              />
            )}

          {/* 현재 이동 중인 아바타 마커 */}
          {currentRunner &&
            !isNaN(currentRunner.x) &&
            !isNaN(currentRunner.y) && (
              <g
                transform={`translate(${currentRunner.x}, ${currentRunner.y})`}
                className="transition-transform pointer-events-none"
              >
                <circle
                  r={isMany ? '12' : '15'}
                  fill="#181c26"
                  stroke={currentRunner.color}
                  strokeWidth="2.5"
                  filter="url(#glow)"
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={isMany ? '13' : '16'}
                  y="0.5"
                >
                  {currentRunner.emoji}
                </text>
              </g>
            )}
        </svg>

        {/* 4. 벌칙 당첨 및 게임 종료 시 중앙 임팩트 오버레이 */}
        {isGameOver && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 backdrop-blur-md p-4 transition-all duration-300">
            {bombVictim ? (
              <div className="flex flex-col items-center mb-5 animate-[bounce_1s_infinite]">
                <div className="relative mb-2">
                  <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-[34px] shadow-[0_0_30px_rgba(244,63,94,0.5)]">
                    💣
                  </div>
                  <span className="absolute -top-2 -right-2 text-[20px] animate-spin">
                    💥
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 mb-1.5">
                  <Skull size={13} className="text-rose-400" />
                  <span className="text-[12px] font-bold text-rose-300">
                    벌칙 당첨! 게임 종료
                  </span>
                </div>
                <p className="text-[13px] font-extrabold text-white text-center">
                  <span className="text-rose-400">
                    {bombVictim.label} ({bombVictim.name})
                  </span>{' '}
                  당첨!
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center mb-5">
                <span className="text-[34px] mb-2">🎉</span>
                <span className="text-[13px] font-bold text-emerald-400 mb-1">
                  모든 플레이어 통과!
                </span>
                <span className="text-[12px] text-gray-300">
                  벌칙 없이 게임이 끝났습니다.
                </span>
              </div>
            )}

            {/* 다시 시작 버튼 */}
            <button
              type="button"
              onClick={onRestart}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 hover:from-rose-600 hover:to-indigo-600 text-white font-semibold text-[12px] flex items-center justify-center gap-2 shadow-2xl active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw size={15} />
              <span>처음부터 다시 시작하기</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. 하단: 사다리 결과 슬롯 (카드) */}
      <div className="w-full flex items-center justify-between px-1 mt-1 mb-2 gap-1">
        {goals &&
          goals.map((goal, idx) => {
            const isRevealed = Boolean(revealedGoals[idx]);
            return (
              <div
                key={goal.id}
                className={`flex flex-col items-center justify-center rounded-2xl border transition-all duration-300 shadow-md flex-1 min-w-0 ${
                  isMany ? 'py-1.5 px-0.5' : 'p-2'
                } ${
                  isRevealed
                    ? goal.isBomb
                      ? 'border-rose-500 bg-rose-500/30 text-rose-200 scale-105 shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse'
                      : 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300'
                    : 'border-gray-800 bg-[#131620] text-gray-500'
                }`}
              >
                <div
                  className={`mb-0.5 ${
                    isMany
                      ? 'text-[15px] sm:text-[17px]'
                      : 'text-[18px] sm:text-[20px]'
                  }`}
                >
                  {isRevealed ? (goal.isBomb ? '💣' : '🍀') : '❓'}
                </div>
                <span
                  className={`font-bold truncate w-full text-center text-[11px] ${
                    isRevealed
                      ? goal.isBomb
                        ? 'text-rose-300 font-extrabold'
                        : 'text-emerald-400'
                      : 'text-gray-400'
                  }`}
                >
                  {isRevealed ? (goal.isBomb ? '벌칙' : '통과') : `목표 ${idx + 1}`}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
