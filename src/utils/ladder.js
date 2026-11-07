/**
 * 사다리 생성 및 경로 계산 유틸리티
 */

export function generateLadder(colCount, rowCount = 7) {
  // bridges[r][c]: 레벨 r에서 col과 col+1 사이의 가로 연결선 여부 (c는 0 ~ colCount-2)
  const bridges = [];

  for (let r = 0; r < rowCount; r++) {
    const row = [];
    for (let c = 0; c < colCount - 1; c++) {
      // 바로 이전 열에 다리가 이미 놓여있으면 연결 금지
      if (c > 0 && row[c - 1]) {
        row.push(false);
      } else {
        // 약 50% 확률로 가로 다리 생성
        const hasBridge = Math.random() < 0.55;
        row.push(hasBridge);
      }
    }
    bridges.push(row);
  }

  // 각 세로선 간에 최소 1개 이상의 가로선이 보장되도록 보정
  for (let c = 0; c < colCount - 1; c++) {
    const bridgeCount = bridges.filter((row) => row[c]).length;
    if (bridgeCount === 0) {
      const randomRow = Math.floor(Math.random() * rowCount);
      // 인접 충돌 검사 후 배치
      if (
        (c === 0 || !bridges[randomRow][c - 1]) &&
        (c + 1 >= colCount - 1 || !bridges[randomRow][c + 1])
      ) {
        bridges[randomRow][c] = true;
      } else {
        // 충돌 없는 다른 행 찾기
        for (let r = 0; r < rowCount; r++) {
          if (
            (c === 0 || !bridges[r][c - 1]) &&
            (c + 1 >= colCount - 1 || !bridges[r][c + 1])
          ) {
            bridges[r][c] = true;
            break;
          }
        }
      }
    }
  }

  // 꽝(벌칙) 위치 설정 - 단 1곳만 꽝, 나머지는 안전
  const bombIndex = Math.floor(Math.random() * colCount);
  const goals = Array.from({ length: colCount }, (_, idx) => ({
    id: idx,
    isBomb: idx === bombIndex,
    label: idx === bombIndex ? '벌칙 (꽝!)' : '안전 (통과)',
    revealed: false,
  }));

  return { bridges, goals, rowCount, colCount };
}

/**
 * 특정 시작 열(playerCol)에서 출발할 때 사다리 이동 경로의 좌표 리스트 산출
 */
export function getPlayerPath(startCol, bridges, rowCount, width, height, padding = 40) {
  const colCount = bridges[0].length + 1;
  const colGap = (width - padding * 2) / (colCount - 1);
  const rowGap = (height - padding * 2) / (rowCount + 1);

  const getX = (col) => padding + col * colGap;
  const getY = (row) => padding + (row + 1) * rowGap;

  let currentCol = startCol;
  const points = [];

  // 사다리 최상단 시작점
  points.push({ x: getX(currentCol), y: padding, col: currentCol, row: -1 });

  for (let r = 0; r < rowCount; r++) {
    const currentY = getY(r);
    // 현재 레벨의 세로선 지점
    points.push({ x: getX(currentCol), y: currentY, col: currentCol, row: r });

    // 오른쪽으로 가는 다리가 있는가?
    if (currentCol < colCount - 1 && bridges[r][currentCol]) {
      currentCol += 1;
      points.push({ x: getX(currentCol), y: currentY, col: currentCol, row: r });
    }
    // 왼쪽으로 가는 다리가 있는가?
    else if (currentCol > 0 && bridges[r][currentCol - 1]) {
      currentCol -= 1;
      points.push({ x: getX(currentCol), y: currentY, col: currentCol, row: r });
    }
  }

  // 최하단 끝점
  points.push({ x: getX(currentCol), y: height - padding, col: currentCol, row: rowCount });

  return { points, endCol: currentCol };
}

