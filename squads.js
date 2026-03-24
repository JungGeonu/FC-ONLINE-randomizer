// squads.js
// Provides detailed squad data for major teams and a generic generator for others.

const SEASONS = ['DC', 'CC', '24TOTY', '23UCL', 'UT', 'CU', 'EU24', 'ICON', 'RTN', 'HG'];
const TOP_PLAYERS = {
  // 21: Real Madrid
  21: [
    { pos: 'ST', name: '호나우두', season: 'ICON', ovr: 125, enhance: 5 },
    { pos: 'LAM', name: 'V. 주니오르', season: '23UCL', ovr: 122, enhance: 6 },
    { pos: 'CAM', name: 'J. 벨링엄', season: '24TOTY', ovr: 125, enhance: 5 },
    { pos: 'RAM', name: '가레스 베일', season: 'CC', ovr: 123, enhance: 5 },
    { pos: 'LDM', name: 'T. 크로스', season: 'DC', ovr: 120, enhance: 8 },
    { pos: 'RDM', name: 'L. 모드리치', season: 'DC', ovr: 121, enhance: 8 },
    { pos: 'LB', name: 'R. 카를루스', season: 'ICON', ovr: 119, enhance: 8 },
    { pos: 'LCB', name: 'A. 뤼디거', season: '23UCL', ovr: 121, enhance: 7 },
    { pos: 'RCB', name: 'E. 밀리탕', season: '23UCL', ovr: 120, enhance: 8 },
    { pos: 'RB', name: '카푸', season: 'ICON', ovr: 121, enhance: 7 },
    { pos: 'GK', name: 'T. 쿠르투아', season: 'LIVE', ovr: 115, enhance: 8 },
  ],
  // 1: Man City
  1: [
    { pos: 'ST', name: 'E. 홀란', season: '24TOTY', ovr: 126, enhance: 5 },
    { pos: 'LAM', name: 'P. 포든', season: '23UCL', ovr: 121, enhance: 7 },
    { pos: 'CAM', name: 'K. 더브라위너', season: '24TOTY', ovr: 125, enhance: 5 },
    { pos: 'RAM', name: 'B. 실바', season: 'DC', ovr: 122, enhance: 6 },
    { pos: 'LDM', name: '로드리', season: '24TOTY', ovr: 124, enhance: 5 },
    { pos: 'RDM', name: 'I. 귄도안', season: 'CC', ovr: 121, enhance: 7 },
    { pos: 'LB', name: 'N. 아케', season: '23UCL', ovr: 119, enhance: 8 },
    { pos: 'LCB', name: 'R. 디아스', season: 'DC', ovr: 122, enhance: 7 },
    { pos: 'RCB', name: 'J. 스톤스', season: '23UCL', ovr: 120, enhance: 8 },
    { pos: 'RB', name: 'K. 워커', season: 'DC', ovr: 121, enhance: 7 },
    { pos: 'GK', name: '에데르송', season: 'LIVE', ovr: 114, enhance: 8 },
  ],
  // 37: Bayern Munich
  37: [
    { pos: 'ST', name: 'H. 케인', season: '24TOTY', ovr: 125, enhance: 5 },
    { pos: 'LAM', name: 'K. 코망', season: 'DC', ovr: 121, enhance: 7 },
    { pos: 'CAM', name: 'T. 뮐러', season: 'CC', ovr: 123, enhance: 6 },
    { pos: 'RAM', name: 'L. 자네', season: '23UCL', ovr: 122, enhance: 6 },
    { pos: 'LDM', name: 'J. 키미히', season: 'DC', ovr: 121, enhance: 7 },
    { pos: 'RDM', name: 'L. 고레츠카', season: 'CC', ovr: 120, enhance: 8 },
    { pos: 'LB', name: 'A. 데이비스', season: '23UCL', ovr: 120, enhance: 8 },
    { pos: 'LCB', name: '김민재', season: '24TOTY', ovr: 123, enhance: 5 },
    { pos: 'RCB', name: 'D. 우파메카노', season: '23UCL', ovr: 119, enhance: 8 },
    { pos: 'RB', name: 'J. 마즈라위', season: '23UCL', ovr: 118, enhance: 8 },
    { pos: 'GK', name: 'M. 노이어', season: 'LIVE', ovr: 115, enhance: 8 },
  ],
  // 67: Paris Saint-Germain
  67: [
    { pos: 'ST', name: 'K. 음바페', season: '24TOTY', ovr: 126, enhance: 5 },
    { pos: 'LAM', name: '이강인', season: '23UCL', ovr: 122, enhance: 6 },
    { pos: 'CAM', name: '네이마르 Jr.', season: 'CC', ovr: 123, enhance: 6 },
    { pos: 'RAM', name: 'O. 뎀벨레', season: '23UCL', ovr: 121, enhance: 7 },
    { pos: 'LDM', name: '마르키뉴스', season: 'DC', ovr: 122, enhance: 7 },
    { pos: 'RDM', name: 'V. 비티냐', season: '23UCL', ovr: 119, enhance: 8 },
    { pos: 'LB', name: 'N. 멘데스', season: '23UCL', ovr: 119, enhance: 8 },
    { pos: 'LCB', name: 'L. 에르난데스', season: '23UCL', ovr: 118, enhance: 8 },
    { pos: 'RCB', name: 'A. 하키미', season: 'DC', ovr: 121, enhance: 7 },
    { pos: 'RB', name: 'M. 슈크리니아르', season: '23UCL', ovr: 118, enhance: 8 },
    { pos: 'GK', name: 'G. 돈나룸마', season: 'LIVE', ovr: 116, enhance: 8 },
  ]
};

// Generic naming fallbacks
const POS_NAMES = {
  'ST': ['핵심 스트라이커', '타겟맨', '골잡이', '주전 톱'],
  'LAM': ['주전 좌측 윙어', '크랙 (L)', '테크니션'],
  'CAM': ['플레이메이커', '공격형 미드', '키패서'],
  'RAM': ['주전 우측 윙어', '크랙 (R)', '테크니션'],
  'LDM': ['박스투박스', '살림꾼', '육각형 미드'],
  'RDM': ['홀딩 미드필더', '수비형 미드', '진공청소기'],
  'LB': ['공격형 풀백 (L)', '주전 풀백', '오버래퍼'],
  'LCB': ['핵심 센터백', '파이터형 수비', '커맨더'],
  'RCB': ['주전 센터백', '스위퍼', '벽'],
  'RB': ['주전 풀백 (R)', '오버래퍼', '수비형 풀백'],
  'GK': ['주전 수문장', '슈퍼 세이브', '핵심 키퍼']
};

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSquad(team) {
  if (TOP_PLAYERS[team.id]) {
    return TOP_PLAYERS[team.id];
  }

  // Generate generic
  const squad = [];
  const positions = ['ST', 'LAM', 'CAM', 'RAM', 'LDM', 'RDM', 'LB', 'LCB', 'RCB', 'RB', 'GK'];
  
  positions.forEach(pos => {
    let season = getRandomItem(SEASONS);
    if (pos === 'GK') season = 'LIVE'; // keepers are usually live
    
    // Generic OVR based on tier
    let baseOvr = 113;
    if (team.tier === 'S') baseOvr = 120;
    if (team.tier === 'A') baseOvr = 117;
    if (team.tier === 'B') baseOvr = 115;
    
    const ovr = baseOvr + Math.floor(Math.random() * 5);
    const enhance = pos === 'GK' ? 8 : (Math.random() > 0.5 ? 8 : (Math.random() > 0.5 ? 7 : 5));
    const name = getRandomItem(POS_NAMES[pos]);

    squad.push({ pos, name, season, ovr, enhance });
  });

  return squad;
}
