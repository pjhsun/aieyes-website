/* =====================================================================
 *  AIEYES — 4대 솔루션 세부 소개 데이터 (Solution Detail Content)
 * ---------------------------------------------------------------------
 *  ▶ 내용 수정 방법 (Canva 등에서 편집 후 교체 워크플로우)
 *    1) 텍스트만 바꾸려면 → 아래 title/subtitle/desc/lists 값을 수정하세요.
 *    2) 슬라이드 이미지를 바꾸려면 →
 *       ① Canva 등에서 슬라이드를 편집 후 PNG/JPG로 내보내기
 *       ② 파일을 assets/img/solutions/ 폴더에 저장
 *       ③ 아래 images 배열의 src 경로만 그 파일명으로 바꾸면 끝!
 *    3) 새 이미지를 추가하려면 images 배열에 { src, cap } 항목을 추가하세요.
 *
 *  * cap = 이미지 아래 캡션, wide:true = 넓은 다이어그램(가로 꽉 채움)
 *  * 원본 자료: introduction of AI EYES.pptx (IR 소개자료)
 * ===================================================================== */
window.AIEYES_SOLUTIONS = {

  /* ───────────── 1. SQREAM ───────────── */
  sqream: {
    tag: "SQREAM · GPU DBMS",
    title: "GPU 기반 컬럼형 빅데이터 솔루션",
    title_en: "GPU-based Columnar Big Data Solution",
    subtitle: "SQREAM 솔루션",
    subtitle_en: "SQREAM Solution",
    desc:
      "SQREAM은 GPU 기반의 대용량 분석 컬럼형 데이터베이스로서, 대용량 데이터의 효율적 관리를 필요로 하는 고객에게 가장 적합한 솔루션입니다. 원본 데이터를 90% 이상 압축 저장·분석하며, 표준 SQL을 사용해 다양한 검색·분석 기능을 제공합니다. 빠른 투자회수(ROI)는 물론 높은 생산성과 함께 데이터 관리 시간·비용을 최소화합니다.",
    desc_en:
      "SQREAM is a GPU-based columnar database for large-scale analytics — the ideal solution for customers who need efficient management of massive data. It compresses, stores and analyzes source data at 90%+ and provides diverse search & analytics via standard SQL, delivering fast ROI, high productivity, and minimized data-management time and cost.",
    metrics: [
      { n: "20x", l: "데이터 처리량", l_en: "Data throughput" },
      { n: "100x", l: "쿼리 처리 속도", l_en: "Query speed" },
      { n: "90%↑", l: "데이터 압축률", l_en: "Data compression" },
    ],
    lists: [
      {
        h: "Features",
        items: [
          "GPU 기반의 빅데이터 분석 DBMS",
          "높은 압축율 (90% 이상)",
          "압축 해제 없이 압축파일 직접 조회",
          "ANSI 표준 SQL 지원 (테이블 조인 가능)",
          "ODBC / JDBC 를 통한 데이터 조회",
          "모듈화된 컴포넌트 제공",
          "사용자 정의 조회 화면 자동 생성 기능",
        ],
      },
      {
        h: "Benefit",
        items: [
          "데이터 레이아웃 변경 이력 관리",
          "데이터 정합성 자동 체크",
          "보존 기간 경과 데이터 자동 폐기 또는 백업",
          "데이터 아카이빙 전 과정 자동화 구현",
          "Chunking 기술 적용",
          "작업 스케줄링 및 모니터링",
        ],
      },
    ],
    lists_en: [
      {
        h: "Features",
        items: [
          "GPU-based big-data analytics DBMS",
          "High compression ratio (90%+)",
          "Query compressed files directly without decompression",
          "ANSI-standard SQL support (table joins available)",
          "Data access via ODBC / JDBC",
          "Modularized components",
          "Auto-generated custom query screens",
        ],
      },
      {
        h: "Benefit",
        items: [
          "Change-history management for data layouts",
          "Automatic data-integrity checks",
          "Auto-disposal or backup of expired data",
          "Fully automated data-archiving process",
          "Chunking technology applied",
          "Job scheduling and monitoring",
        ],
      },
    ],
    references:
      "삼성생명 · SK텔레콤 · LG유플러스 · 삼성디스플레이 · 삼성SDI · SK하이닉스 · LG전자 · KB국민카드 등",
    references_en:
      "Samsung Life · SK Telecom · LG U+ · Samsung Display · Samsung SDI · SK hynix · LG Electronics · KB Kookmin Card, and more",
    images: [
      { src: "assets/img/solutions/sqream-overview.png", cap: "SQREAM 솔루션 구성 및 주요 특징", cap_en: "SQREAM solution overview & key features", wide: true },
    ],
  },

  /* ───────────── 2. AE 플랫폼 ───────────── */
  "ae-platform": {
    tag: "AE PLATFORM",
    title: "AI · 빅데이터 플랫폼 서비스",
    title_en: "AI · Big Data Platform Service",
    subtitle: "AE 플랫폼 서비스",
    subtitle_en: "AE Platform Service",
    desc:
      "AE AI/빅데이터 플랫폼 서비스는 기업의 AX/DX 구축에 최적화된 플랫폼 서비스로, 기업의 AI Agent 적용 및 무인 자동화 구축에 용이한 플랫폼입니다. AI를 위한 빅데이터 기반 구축과 AI 활용의 극대화를 위한 서비스 플랫폼으로, 최신 트렌드 기술인 데이터 패브릭(Data Fabric), Ontology, AI Agent 핵심 기술이 탑재되어 있습니다.",
    desc_en:
      "The AE AI/Big Data Platform is optimized for enterprise AX/DX, making it easy to adopt AI Agents and build unmanned automation. As a service platform for AI-ready big-data foundations and maximized AI utilization, it is equipped with the latest core technologies — Data Fabric, Ontology, and AI Agent.",
    chips: ["Data Fabric", "AI Ontology", "AI Agent", "Lake House", "AX / DX"],
    images: [
      { src: "assets/img/solutions/ae-lakehouse.png", cap: "AI/빅데이터 플랫폼 서비스 — Lake House 아키텍처 & 6대 핵심 영역", cap_en: "AI/Big Data Platform — Lake House architecture & 6 core areas", wide: true },
      { src: "assets/img/solutions/ae-capabilities.png", cap: "AE 플랫폼 핵심 기술 상세 — Digital Twin · AI-FADC · 로봇 자동화 · AI 분석 · AI-MES", cap_en: "AE Platform core technologies — Digital Twin · AI-FADC · Robotic Automation · AI Analytics · AI-MES", wide: true },
    ],
  },

  /* ───────────── 3. 로봇 무인 자동화 ───────────── */
  robot: {
    tag: "AMR · QUADRUPED · HUMANOID",
    title: "로봇 무인 자동화 서비스",
    title_en: "Unmanned Robotic Automation Service",
    subtitle: "AE 로봇 무인 자동화 서비스",
    subtitle_en: "AE Robotic Automation Service",
    desc:
      "AE 로봇 무인 자동화 서비스는 AI 로봇(AMR, AMMR, 휴머노이드 등)과 다양한 인터페이스·관제 서비스를 최적화하여 기업의 무인 자동화를 구축합니다.",
    desc_en:
      "The AE Robotic Automation Service builds enterprise unmanned automation by optimizing AI robots (AMR, AMMR, humanoids, etc.) with diverse interfaces and control services.",
    quote:
      "AI 로봇을 활용한 AI 비전 검사, AMMR과 휴머노이드를 통한 완제품 카트리지 검사·적재·무인 이송 시스템 서비스",
    quote_en:
      "AI vision inspection with AI robots, plus finished-cartridge inspection, loading and unmanned transport via AMMR and humanoids.",
    chips: ["AMR / AGV", "AMMR", "휴머노이드", "사족보행 로봇", "AI 비전 검사"],
    chips_en: ["AMR / AGV", "AMMR", "Humanoid", "Quadruped robot", "AI vision inspection"],
    images: [
      { src: "assets/img/solutions/robot-1.png", cap: "AI 비전 검사 · 무인 자동화 공정", cap_en: "AI vision inspection · unmanned automation line", wide: true },
      { src: "assets/img/solutions/robot-2.png", cap: "AMR / AMMR 자율 이송 시스템", cap_en: "AMR / AMMR autonomous transport system", wide: true },
      { src: "assets/img/solutions/robot-3.png", cap: "휴머노이드 · 완제품 카트리지 검사/적재", cap_en: "Humanoid · finished-cartridge inspection/loading", wide: true },
      { src: "assets/img/solutions/robot-4.png", cap: "사족보행 로봇 기반 환경·안전 관제", cap_en: "Quadruped-robot environment & safety monitoring", wide: true },
    ],
  },

  /* ───────────── 4. 정부 사업 지원 ───────────── */
  gov: {
    tag: "GOV R&D · CONSORTIUM",
    title: "정부 사업 지원 서비스",
    title_en: "Government Project Support Service",
    subtitle: "AI 정부지원사업 컨설팅 & 컨소시엄",
    subtitle_en: "AI Government-project Consulting & Consortium",
    desc:
      "AI 정부지원사업의 기획·수요조사부터 최적의 컨소시엄 구성 및 사업관리까지 지원하여, 고객의 기업 가치 극대화를 위해 노력합니다.",
    desc_en:
      "We support AI government-funded projects end to end — from planning and demand surveys to building the optimal consortium and managing the project — to maximize our clients' corporate value.",
    quote:
      "AI 정부지원사업의 컨설팅 및 최적의 컨소시엄 구축을 통해 고객의 기업 가치 극대화를 위해 노력하겠습니다.",
    quote_en:
      "We are committed to maximizing our clients' corporate value through AI government-project consulting and building the optimal consortium.",
    chips: ["중소벤처기업부", "산업통상자원부", "과학기술정보통신부", "한국로봇융합연구원"],
    chips_en: ["Ministry of SMEs & Startups", "Ministry of Trade, Industry & Energy", "Ministry of Science & ICT", "Korea Institute of Robot & Convergence"],
    images: [
      { src: "assets/img/solutions/gov-4.png", cap: "정부 지원사업 컨소시엄 구성 및 사업 관리 체계", cap_en: "Government-project consortium structure & management system", wide: false },
      { src: "assets/img/solutions/gov-5.jpg", cap: "산·학·연 연계 협력 네트워크", cap_en: "Industry–academia–research collaboration network", wide: false },
      { src: "assets/img/solutions/gov-1.jpg", cap: "정부 R&D 지원 프로세스", cap_en: "Government R&D support process", wide: false },
    ],
  },
};
