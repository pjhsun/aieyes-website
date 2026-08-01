/* =====================================================================
 *  AIEYES BOT — 3D 로봇 엔진 (Three.js, 자체 코드 · 워터마크 없음)
 *  ─────────────────────────────────────────────────────────────────
 *  ▶ 두 가지 모드
 *    1) GLB 모드: assets/models/robot.glb 파일이 있으면 자동 로드
 *       (Sketchfab 등에서 받은 전문가급 모델 — 사진급 품질)
 *       - 마우스 추적 회전 / 부유 / ON·OFF(조명 페이드 + BYE LED)
 *       - 모델에 애니메이션이 있으면: 좌클릭/우클릭 시 재생
 *    2) 코드 모드(폴백): robot.glb 이 없으면 자체 제작 로봇 표시
 *       - LED 얼굴(눈코입/BYE), 좌클릭 왼손 들기, 우클릭 오른손 흔들기
 *  ▶ 모델 교체법: robot.glb 파일만 assets/models/ 에 넣으면 끝.
 *     (라이선스가 CC-BY면 푸터 등에 제작자 표기 필요)
 * ===================================================================== */
(function () {
  "use strict";
  if (typeof THREE === "undefined") return;
  var mount = document.getElementById("heroRobot3D");
  if (!mount) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- 공통: 렌더러 / 카메라 / 조명 ---------------- */
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.2, 11.6);
  camera.lookAt(0, 0, 0);

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  mount.appendChild(renderer.domElement);

  try {
    if (THREE.RoomEnvironment && THREE.PMREMGenerator) {
      var pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
    }
  } catch (e) {}

  var amb = new THREE.AmbientLight(0x6b7899, 0.5); scene.add(amb);
  var key = new THREE.DirectionalLight(0xffffff, 1.35); key.position.set(4.5, 7, 6); scene.add(key);
  var fill = new THREE.DirectionalLight(0x9fb6ff, 0.5); fill.position.set(-5, 2, 5); scene.add(fill);
  var rimBlue = new THREE.PointLight(0x2f7bff, 2.4, 60); rimBlue.position.set(-6.5, 2, 3); scene.add(rimBlue);
  var rimCyan = new THREE.PointLight(0x3fe9ff, 1.6, 60); rimCyan.position.set(6.5, 0.5, 3); scene.add(rimCyan);

  function setLightPower(p) {
    key.intensity = 0.25 + 1.1 * p;
    rimBlue.intensity = 0.15 + 2.25 * p;
    rimCyan.intensity = 0.1 + 1.5 * p;
    amb.intensity = 0.18 + 0.32 * p;
  }

  /* ---------------- 공통: 상태 / 입력 ---------------- */
  var powerOn = true, powerT = 1;
  var tx = 0, ty = 0;
  var onPowerChange = null; // 모드별 콜백
  var onLeftClick = null, onRightClick = null;

  var visual = document.querySelector(".hero-visual") || mount;
  visual.addEventListener("mousemove", function (e) {
    var r = visual.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });
  visual.addEventListener("mouseleave", function () { tx = 0; ty = 0; });
  visual.addEventListener("mousedown", function (e) {
    if (!powerOn) return;
    if (e.target.closest && e.target.closest(".power3d")) return;
    if (e.button === 0 && onLeftClick) onLeftClick();
    else if (e.button === 2 && onRightClick) onRightClick();
  });
  visual.addEventListener("contextmenu", function (e) { e.preventDefault(); });

  // ---- 음성(TTS): 로봇이 켜지면 슬로건 낭독 ----
  // 음성 문구는 config.js(company.voiceSlogan / voiceSlogan_en)에서 관리
  //  현재 언어(window.AIEYES_LANG)에 맞춰 한/영 문장을 선택
  function currentSlogan() {
    var C = (window.AIEYES_CONFIG && window.AIEYES_CONFIG.company) || {};
    if (window.AIEYES_LANG === "en") {
      return C.voiceSlogan_en || "AIEYES sees the world differently, and changes it.";
    }
    return C.voiceSlogan || "에이아이즈는 세상을 다른 눈으로 바라 보고 세상을 바꿉니다.";
  }
  // 가장 자연스러운(Natural/Neural/Google/Online) 음성을 우선 선택
  function pickVoice(pref) {
    var vs = (window.speechSynthesis && window.speechSynthesis.getVoices()) || [];
    var cand = vs.filter(function (v) { return (v.lang || "").toLowerCase().indexOf(pref) === 0; });
    if (!cand.length) return null;
    function score(v) {
      var n = (v.name || "").toLowerCase(), l = (v.lang || "").toLowerCase(), s = 0;
      if (/natural|neural/.test(n)) s += 100;       // Edge/Win 뉴럴 음성 (최상)
      if (/google/.test(n)) s += 80;                // Chrome Google 음성 (자연스러움)
      if (/online/.test(n)) s += 45;                // Edge 온라인 음성
      if (/aria|jenny|guy|ava|emma|libby|michelle|sonia/.test(n)) s += 30;
      if (/samantha|alex|siri|karen|daniel/.test(n)) s += 25; // Apple
      if (/sunhi|heami|injoon|yuna|nara/.test(n)) s += 25;    // 좋은 한국어
      if (/david|zira|mark|hazel|george/.test(n)) s -= 25;   // 구형 로봇 음성
      if (pref === "en" && l === "en-us") s += 12;
      if (v.localService === false) s += 15;        // 온라인 음성은 대체로 더 자연스러움
      if (v.default) s += 2;
      return s;
    }
    cand.sort(function (a, b) { return score(b) - score(a); });
    return cand[0];
  }
  var greeted = false;
  if ("speechSynthesis" in window) {
    try { window.speechSynthesis.getVoices(); } catch (e) {}
    window.speechSynthesis.onvoiceschanged = function () {};
  }
  var ttsAudio = null; // Google TTS 재생 핸들
  // 재생 중인 음성(구글 오디오 + 브라우저 TTS)을 모두 중지
  function stopSpeak() {
    if (ttsAudio) { try { ttsAudio.pause(); ttsAudio.src = ""; } catch (e) {} ttsAudio = null; }
    if ("speechSynthesis" in window) { try { window.speechSynthesis.cancel(); } catch (e) {} }
  }
  // 폴백: 브라우저 내장 음성(speechSynthesis)
  function speakBrowser() {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      var isEn = (window.AIEYES_LANG === "en");
      var u = new SpeechSynthesisUtterance(currentSlogan());
      u.lang = isEn ? "en-US" : "ko-KR";
      u.rate = isEn ? 0.98 : 0.94; u.pitch = 1.0; u.volume = 1.0;
      var voice = pickVoice(isEn ? "en" : "ko");
      if (voice) { u.voice = voice; u.lang = voice.lang; }
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  // 우선 Google 번역 TTS(부드러운 음성, 무료)로 재생 → 실패 시 브라우저 음성 폴백
  function speakSlogan() {
    stopSpeak();
    var isEn = (window.AIEYES_LANG === "en");
    var text = currentSlogan();
    // StreamElements TTS(Amazon Polly 음성 · 무료 · CORS 지원) — 부드러운 음성
    var voice = isEn ? "Matthew" : "Seoyeon";
    try {
      var url = "https://api.streamelements.com/kappa/v2/speech?voice=" + voice +
        "&text=" + encodeURIComponent(text);
      var a = new Audio(url); // crossOrigin 설정 안 함 — 재생만 하므로 CORS 불필요
      a.volume = 1.0;
      ttsAudio = a;
      var fellBack = false;
      function fallback() { if (!fellBack) { fellBack = true; ttsAudio = null; speakBrowser(); } }
      a.onerror = fallback;
      var p = a.play();
      if (p && p.catch) p.catch(fallback);
    } catch (e) { speakBrowser(); }
  }
  // 최초 사용자 상호작용 시 1회 인사(자동재생 정책 대응)
  function firstGreet() {
    if (!greeted && powerOn) { greeted = true; speakSlogan(); }
    document.removeEventListener("pointerdown", firstGreet);
  }
  document.addEventListener("pointerdown", firstGreet);

  var btn = document.getElementById("robotPower");
  var statusEl = document.getElementById("robotStatus");
  if (btn) btn.addEventListener("click", function () {
    powerOn = !powerOn;
    btn.classList.toggle("off", !powerOn);
    var faceSpan = btn.querySelector(".p3d-face");
    if (faceSpan) faceSpan.lastChild.textContent = powerOn ? "ON" : "OFF";
    if (statusEl) statusEl.textContent = powerOn ? "ONLINE" : "OFFLINE";
    if (onPowerChange) onPowerChange(powerOn);
    if (powerOn) { greeted = true; speakSlogan(); }
    else { stopSpeak(); }
  });

  function resize() {
    var w = mount.clientWidth || 1, h = mount.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize(); window.addEventListener("resize", resize);
  function lerp(a, b, k) { return a + (b - a) * k; }

  /* ---------------- 공통: LED 캔버스 (얼굴/BYE) ---------------- */
  var faceCanvas = document.createElement("canvas");
  faceCanvas.width = 320; faceCanvas.height = 256;
  var faceTex = new THREE.CanvasTexture(faceCanvas);
  faceTex.anisotropy = 8; faceTex.encoding = THREE.sRGBEncoding;
  function rr(x, px, py, w, h, r) {
    x.beginPath();
    x.moveTo(px + r, py);
    x.arcTo(px + w, py, px + w, py + h, r);
    x.arcTo(px + w, py + h, px, py + h, r);
    x.arcTo(px, py + h, px, py, r);
    x.arcTo(px, py, px + w, py, r);
    x.closePath(); x.fill();
  }
  function drawFace(mode, blink, bright) {
    var x = faceCanvas.getContext("2d");
    x.clearRect(0, 0, 320, 256);
    if (mode !== "blank") {
      x.fillStyle = "rgba(79,240,255," + (bright == null ? 1 : bright) + ")";
      x.strokeStyle = x.fillStyle;
      x.shadowColor = "rgba(63,233,255,0.9)"; x.shadowBlur = 16;
      if (mode === "on") {
        var eh = blink ? 6 : 40;
        rr(x, 58, 96 - eh / 2, 52, eh, 10);
        rr(x, 210, 96 - eh / 2, 52, eh, 10);
        rr(x, 154, 140, 12, 12, 5);
        x.lineWidth = 11; x.lineCap = "round";
        x.beginPath(); x.moveTo(112, 182); x.quadraticCurveTo(160, 214, 208, 182); x.stroke();
      } else if (mode === "bye" || mode === "off") {
        x.textAlign = "center"; x.textBaseline = "middle";
        x.font = "800 92px 'Courier New', monospace";
        x.fillText(mode === "bye" ? "BYE" : "OFF", 160, 128);
      }
      x.shadowBlur = 0;
      x.globalCompositeOperation = "destination-out";
      x.fillStyle = "#000";
      for (var gy = 0; gy < 256; gy += 6) x.fillRect(0, gy, 320, 2);
      for (var gx = 0; gx < 320; gx += 6) x.fillRect(gx, 0, 2, 256);
      x.globalCompositeOperation = "source-over";
    }
    faceTex.needsUpdate = true;
  }

  /* ================================================================
   *  모드 1 — GLB 모델 (assets/models/robot.glb)
   * ================================================================ */
  function setupGLB(gltf) {
    var model = gltf.scene;

    // 크기 정규화: 최대 치수 기준 (기본 포즈가 누워있는 모델도 안전)
    // 로봇이 크거나 작게 보이면 아래 GLB_FIT 값만 조정하세요 (클수록 크게).
    var GLB_FIT = 7.0;   // 로봇 크기 (클수록 크게)
    var GLB_Y = -3.9;    // 세로 위치 (음수 = 아래로) — 전신 90% 구도
    camera.position.set(0, 0.2, 12.6); // 애니메이션 동작 여유
    camera.lookAt(0, 0, 0);
    var box = new THREE.Box3().setFromObject(model);
    var size = box.getSize(new THREE.Vector3());
    var maxDim = Math.max(size.x, size.y, size.z, 0.0001);
    var scale = GLB_FIT / maxDim;
    model.scale.setScalar(scale);
    box.setFromObject(model);
    var center = box.getCenter(new THREE.Vector3());
    model.position.x -= center.x;
    model.position.y -= center.y;
    model.position.z -= center.z;

    var pivot = new THREE.Group();
    pivot.add(model);
    scene.add(pivot);

    // ---- 가슴 AIEYES 마크 (척추 본에 따라 이동) ----
    // 가슴 척추 본 찾기 (Spine002 우선 → Spine001 → Spine)
    var chestBone = null;
    ["Spine002", "Spine001", "Spine_", "Spine"].forEach(function (key) {
      if (chestBone) return;
      model.traverse(function (o) { if (!chestBone && o.isBone && o.name.indexOf(key) === 0) chestBone = o; });
    });

    var markCanvas = document.createElement("canvas");
    markCanvas.width = 512; markCanvas.height = 240;
    (function () {
      var x = markCanvas.getContext("2d");
      function rrb(px, py, w, h, r) {
        x.beginPath(); x.moveTo(px + r, py);
        x.arcTo(px + w, py, px + w, py + h, r);
        x.arcTo(px + w, py + h, px, py + h, r);
        x.arcTo(px, py + h, px, py, r);
        x.arcTo(px, py, px + w, py, r); x.closePath();
      }
      rrb(20, 54, 472, 132, 30);
      x.fillStyle = "rgba(7,14,32,0.92)"; x.fill();
      x.lineWidth = 7; x.strokeStyle = "#2f7bff"; x.stroke();
      x.textAlign = "left"; x.textBaseline = "middle"; x.font = "800 82px Arial";
      var aiW = x.measureText("AI").width, eyesW = x.measureText("EYES").width;
      var sx = 256 - (aiW + eyesW) / 2;
      x.fillStyle = "#eef4ff"; x.fillText("AI", sx, 122);
      x.fillStyle = "#3fe9ff"; x.fillText("EYES", sx + aiW, 122);
    })();
    var markTex = new THREE.CanvasTexture(markCanvas);
    markTex.encoding = THREE.sRGBEncoding;
    var markMat = new THREE.MeshBasicMaterial({ map: markTex, transparent: true, depthTest: false, depthWrite: false });
    // ▼ 가슴 마크 조정값 (크기/앞으로띄우기/상하)
    var MARK_W = 0.86, MARK_FWD = 0.55, MARK_Y = 0.42;
    var chestMark = new THREE.Mesh(new THREE.PlaneGeometry(MARK_W, MARK_W * 0.4), markMat);
    chestMark.renderOrder = 10;
    chestMark.visible = false; // 본 위치 계산 후 표시
    pivot.add(chestMark);
    var _bw = new THREE.Vector3();

    // 반사 강도 보정
    model.traverse(function (o) {
      if (o.isMesh && o.material) {
        var mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach(function (m) { if ("envMapIntensity" in m) m.envMapIntensity = 0.9; });
      }
    });

    // 애니메이션
    var mixer = null, idleAction = null, clips = gltf.animations || [];
    var oneShot = null;
    if (clips.length) {
      mixer = new THREE.AnimationMixer(model);
      idleAction = mixer.clipAction(clips[0]);
      idleAction.play();
    }
    function playClip(i) {
      if (!mixer || !clips[i]) return false;
      if (oneShot) oneShot.stop();
      oneShot = mixer.clipAction(clips[i]);
      oneShot.reset();
      oneShot.setLoop(THREE.LoopOnce, 1);
      oneShot.clampWhenFinished = false;
      if (idleAction && clips.length > 1) idleAction.crossFadeTo(oneShot, 0.25, false);
      oneShot.play();
      setTimeout(function () {
        if (idleAction) { idleAction.reset().play(); if (oneShot) oneShot.crossFadeTo(idleAction, 0.3, false); }
      }, Math.min(clips[i].duration * 1000, 4000));
      return true;
    }
    // 클릭 제스처: 클립 여러 개면 순차 재생, 아니면 몸짓(기울임)
    var gesture = 0; // 절차식 제스처 타이머
    onLeftClick = function () { if (!playClip(1)) gesture = performance.now() + 900; };
    onRightClick = function () { if (!playClip(2) && !playClip(1)) gesture = performance.now() + 900; };

    // ---- 얼굴 스크린 재질 찾기 (모델의 'Screen' 계열 머티리얼) ----
    var screenMats = [], origScreen = [];
    model.traverse(function (o) {
      if (o.isMesh && o.material) {
        var mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach(function (m) {
          // 얼굴 스크린 + 발광(눈·입) 재질 모두 소등 대상
          if (/screen|face|display|monitor|glow|led|light|emissive/i.test(m.name || "")) {
            if (screenMats.indexOf(m) === -1) screenMats.push(m);
          }
        });
      }
    });
    var glbFaceCanvas = null, glbFaceTex = null;
    if (screenMats.length) {
      glbFaceCanvas = document.createElement("canvas");
      glbFaceCanvas.width = 512; glbFaceCanvas.height = 512;
      glbFaceTex = new THREE.CanvasTexture(glbFaceCanvas);
      glbFaceTex.flipY = false; glbFaceTex.encoding = THREE.sRGBEncoding;
      screenMats.forEach(function (m) {
        origScreen.push({ m: m, map: m.map, emissiveMap: m.emissiveMap, color: m.color ? m.color.clone() : null, emissive: m.emissive ? m.emissive.clone() : null, ei: m.emissiveIntensity });
      });
    }
    function drawScreen(text) {
      if (!glbFaceCanvas) return;
      var x = glbFaceCanvas.getContext("2d");
      x.setTransform(1, 0, 0, 1, 0, 0);
      x.fillStyle = "#06110d"; x.fillRect(0, 0, 512, 512);
      x.save();
      x.translate(0, 512); x.scale(1, -1); // flipY=false 보정
      x.fillStyle = "#49f0c8";
      x.shadowColor = "rgba(73,240,200,0.9)"; x.shadowBlur = 26;
      x.textAlign = "center"; x.textBaseline = "middle";
      x.font = "800 150px Arial";
      x.fillText(text, 256, 256);
      x.restore();
      glbFaceTex.needsUpdate = true;
    }
    function setScreen(on) {
      if (!screenMats.length) return;
      if (!on) {
        // 얼굴 스크린 소등 (블랙)
        screenMats.forEach(function (m) {
          m.map = null;
          m.emissiveMap = null;
          if (m.color) m.color.setHex(0x05080c);
          if (m.emissive) m.emissive.setHex(0x000000);
          m.needsUpdate = true;
        });
      } else {
        origScreen.forEach(function (o) {
          o.m.map = o.map;
          o.m.emissiveMap = o.emissiveMap;
          if (o.color) o.m.color.copy(o.color);
          if (o.emissive) o.m.emissive.copy(o.emissive);
          o.m.emissiveIntensity = o.ei;
          o.m.needsUpdate = true;
        });
      }
    }

    // BYE LED 스프라이트 (얼굴 스크린이 없는 모델용 폴백)
    var byeMat = new THREE.SpriteMaterial({ map: faceTex, transparent: true, depthTest: false });
    var bye = new THREE.Sprite(byeMat);
    bye.scale.set(1.7, 1.36, 1);
    bye.position.set(0, 1.35, 2.4); // 로봇 얼굴 위치 (OFF 정지 자세 기준)
    bye.visible = false;
    scene.add(bye);

    onPowerChange = function (on) {
      setScreen(on); // 얼굴 스크린 소등/복구
      if (!on) {
        // 얼굴 앞 LED: BYE (1.2초) → OFF (꺼져있는 동안 유지)
        drawFace("bye");
        bye.visible = true;
        setTimeout(function () { if (!powerOn) drawFace("off"); }, 1200);
      } else {
        bye.visible = false;
      }
      // OFF: 기립 자세(t=0)에서 정지 (웅크린 프레임에서 얼면 화면 밖으로 나가므로)
      if (idleAction) {
        if (!on) {
          setTimeout(function () {
            if (!powerOn && idleAction) { idleAction.time = 0.05; idleAction.paused = true; }
          }, 500);
        } else {
          idleAction.paused = false;
        }
      }
    };

    var clock = new THREE.Clock();
    function loop(t) {
      var s = t * 0.001;
      powerT = lerp(powerT, powerOn ? 1 : 0, 0.04);
      setLightPower(powerT);
      chestMark.material.opacity = 0.2 + 0.8 * powerT;
      if (mixer) {
        mixer.timeScale = powerT;
        mixer.update(clock.getDelta());
      }
      // 부유 + 마우스 추적
      pivot.position.y = GLB_Y + Math.sin(s * 1.2) * 0.06 * powerT;
      var gBoost = (gesture > performance.now()) ? 0.25 : 0; // 클릭 제스처(살짝 인사)
      pivot.rotation.y = lerp(pivot.rotation.y, tx * 0.55 * powerT, 0.05);
      pivot.rotation.x = lerp(pivot.rotation.x, ty * 0.16 * powerT + (1 - powerT) * 0.25 + gBoost, 0.05);
      // 가슴 마크: 척추 본 위치를 따라 이동 (애니메이션/부유에 밀착)
      if (chestBone) {
        pivot.updateMatrixWorld();
        chestBone.updateWorldMatrix(true, false);
        chestBone.getWorldPosition(_bw);
        pivot.worldToLocal(_bw);
        chestMark.position.set(_bw.x, _bw.y + MARK_Y, _bw.z + MARK_FWD);
        chestMark.visible = true;
      }
      renderer.render(scene, camera);
      if (!reduce) requestAnimationFrame(loop);
    }
    if (reduce) { renderer.render(scene, camera); }
    else requestAnimationFrame(loop);
  }

  /* ================================================================
   *  모드 2 — 자체 제작 로봇 (폴백)
   * ================================================================ */
  function buildCoded() {
    var mBody = new THREE.MeshPhysicalMaterial({ color: 0x0c0e13, metalness: 0.9, roughness: 0.18, clearcoat: 1.0, clearcoatRoughness: 0.06, envMapIntensity: 0.5 });
    var mPanel = new THREE.MeshPhysicalMaterial({ color: 0x12151c, metalness: 0.8, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.12, envMapIntensity: 0.4 });
    var mJoint = new THREE.MeshPhysicalMaterial({ color: 0x07090e, metalness: 0.6, roughness: 0.55, envMapIntensity: 0.25 });
    var mHead = new THREE.MeshPhysicalMaterial({ color: 0x0a0c11, metalness: 0.9, roughness: 0.1, clearcoat: 1.0, clearcoatRoughness: 0.04, envMapIntensity: 0.6 });

    function cap(r, len, m) { return new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 14, 30), m); }
    function sph(r, m) { return new THREE.Mesh(new THREE.SphereGeometry(r, 44, 44), m); }
    function cyl(rt, rb, h, m) { return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 30), m); }

    drawFace("on", false, 1);
    var mFace = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: faceTex, emissiveIntensity: 1.5, roughness: 0.4, metalness: 0.1, transparent: true, opacity: 0.98, envMapIntensity: 0.15 });

    var robot = new THREE.Group();
    var arms = [], fingers = [];

    var head = new THREE.Group();
    var skull = sph(0.52, mHead); skull.scale.set(0.82, 1.08, 0.9); head.add(skull);
    var face = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.45), mFace);
    face.position.set(0, 0.0, 0.5); head.add(face);
    var earL = sph(0.09, mPanel); earL.scale.set(0.5, 1, 1); earL.position.set(-0.44, -0.02, 0.05); head.add(earL);
    var earR = earL.clone(); earR.position.x = 0.44; head.add(earR);
    head.position.y = 3.42; robot.add(head);

    var neck = cyl(0.1, 0.13, 0.3, mJoint); neck.position.y = 2.95; robot.add(neck);

    var chestCap = cap(0.5, 0.34, mBody); chestCap.scale.set(1.3, 0.74, 0.62); chestCap.position.y = 2.5; robot.add(chestCap);
    var ribcage = cyl(0.64, 0.4, 1.05, mBody); ribcage.scale.z = 0.64; ribcage.position.y = 2.02; robot.add(ribcage);
    var abdomen = cyl(0.3, 0.4, 0.7, mPanel); abdomen.scale.z = 0.6; abdomen.position.y = 1.28; robot.add(abdomen);
    var waist = cyl(0.28, 0.31, 0.28, mJoint); waist.scale.z = 0.62; waist.position.y = 0.9; robot.add(waist);
    var pelvis = cap(0.4, 0.26, mBody); pelvis.scale.set(1.12, 0.7, 0.7); pelvis.position.y = 0.5; robot.add(pelvis);

    function makeLeg(side) {
      var g = new THREE.Group();
      var hip = sph(0.24, mJoint); hip.position.set(side * 0.38, 0.22, 0); g.add(hip);
      var thigh = cap(0.24, 0.95, mBody); thigh.position.set(side * 0.4, -0.55, 0); g.add(thigh);
      var knee = cyl(0.18, 0.18, 0.22, mJoint); knee.rotation.z = Math.PI / 2; knee.position.set(side * 0.4, -1.28, 0); g.add(knee);
      var shin = cap(0.19, 0.8, mPanel); shin.position.set(side * 0.4, -1.95, 0); g.add(shin);
      return g;
    }
    robot.add(makeLeg(-1), makeLeg(1));

    function makeFinger(len, r) {
      var g = new THREE.Group();
      var p1 = cap(r, len * 0.5, mPanel); p1.position.y = -len * 0.32; g.add(p1);
      var mid = new THREE.Group(); mid.position.y = -len * 0.6;
      var p2 = cap(r * 0.85, len * 0.4, mPanel); p2.position.y = -len * 0.27; mid.add(p2);
      g.add(mid); g.userData.mid = mid;
      return g;
    }
    function makeHand(side) {
      var g = new THREE.Group();
      var palm = sph(0.14, mBody); palm.scale.set(0.75, 1.2, 0.5); g.add(palm);
      var xs = [-0.085, -0.028, 0.028, 0.085];
      for (var i = 0; i < 4; i++) {
        var f = makeFinger(0.3 - Math.abs(xs[i]) * 0.4, 0.032);
        f.position.set(xs[i], -0.15, 0.01);
        g.add(f); fingers.push(f);
      }
      var thumb = makeFinger(0.2, 0.036);
      thumb.position.set(-side * 0.1, -0.02, 0.06);
      thumb.rotation.z = -side * 0.7; thumb.rotation.x = 0.4;
      g.add(thumb); fingers.push(thumb);
      g.rotation.y = side * Math.PI / 2 * 0.85;
      return g;
    }
    function makeArm(side) {
      var g = new THREE.Group();
      g.position.set(side * 0.98, 2.52, 0);
      var deltoid = sph(0.27, mBody); deltoid.scale.set(1.05, 1.2, 0.95); g.add(deltoid);
      var upper = cap(0.17, 0.72, mBody); upper.position.set(side * 0.06, -0.6, 0); g.add(upper);
      var fore = new THREE.Group(); fore.position.set(side * 0.06, -1.12, 0);
      var elbow = sph(0.15, mJoint); fore.add(elbow);
      var lower = cap(0.14, 0.66, mPanel); lower.position.y = -0.5; fore.add(lower);
      var wrist = cyl(0.1, 0.11, 0.1, mJoint); wrist.position.y = -0.94; fore.add(wrist);
      var hand = makeHand(side); hand.position.y = -1.12; fore.add(hand);
      g.add(fore);
      g.userData = { side: side, fore: fore, hand: hand };
      arms.push(g);
      return g;
    }
    robot.add(makeArm(-1), makeArm(1));

    robot.position.y = -1.42;
    scene.add(robot);

    var byeUntil = 0, action = null, blinkT = 0, faceTimer = 0, isBlink = false;
    onLeftClick = function () { action = { side: -1, type: "raise", until: performance.now() + 1800 }; };
    onRightClick = function () { action = { side: 1, type: "wave", until: performance.now() + 2600 }; };
    onPowerChange = function (on) {
      if (!on) { byeUntil = performance.now() + 1300; drawFace("bye"); action = null; }
      else drawFace("on", false, 1);
    };

    function loop(t) {
      var s = t * 0.001;
      powerT = lerp(powerT, powerOn ? 1 : 0, 0.04);
      setLightPower(powerT);
      mFace.emissiveIntensity = 0.05 + 1.45 * powerT;

      if (!powerOn && byeUntil && t > byeUntil) { drawFace("blank"); byeUntil = 0; }

      robot.position.y = -1.42 + Math.sin(s * 1.2) * 0.05 * powerT;

      var yaw = tx * 0.45 * powerT, pitch = ty * 0.2 * powerT;
      robot.rotation.y += (yaw * 0.5 - robot.rotation.y) * 0.05;
      robot.rotation.x += (pitch * 0.35 - robot.rotation.x) * 0.05;
      var headDropX = (1 - powerT) * 0.55;
      head.rotation.y += (yaw - head.rotation.y) * 0.09;
      head.rotation.x += ((pitch + headDropX) - head.rotation.x) * 0.06;
      head.rotation.z += (tx * -0.05 * powerT - head.rotation.z) * 0.05;

      var now = performance.now();
      if (action && now > action.until) action = null;
      for (var i = 0; i < arms.length; i++) {
        var a = arms[i], sd = a.userData.side, ph = i * 2.3;
        var tX = Math.sin(s * 0.8 + ph) * 0.05 * powerT;
        var tZ = sd * (0.06 + Math.sin(s * 0.65 + ph) * 0.03 * powerT);
        var tFX = 0.22 * powerT + Math.sin(s * 1.1 + ph) * 0.08 * powerT;
        var tFZ = 0;
        if (action && action.side === sd && powerOn) {
          if (action.type === "raise") { tX = -2.35; tZ = sd * 0.28; tFX = -0.25; }
          else { tZ = sd * 2.3; tX = -0.25; tFX = -0.5; tFZ = Math.sin(s * 9) * 0.4; }
        }
        a.rotation.x = lerp(a.rotation.x, tX, 0.09);
        a.rotation.z = lerp(a.rotation.z, tZ, 0.09);
        a.userData.fore.rotation.x = lerp(a.userData.fore.rotation.x, tFX, 0.1);
        a.userData.fore.rotation.z = lerp(a.userData.fore.rotation.z, tFZ, 0.14);
      }
      for (var f = 0; f < fingers.length; f++) {
        var fg = fingers[f];
        var curl = 0.16 + (Math.sin(s * 1.5 + f * 0.5) * 0.5 + 0.5) * 0.22 * powerT;
        fg.rotation.x = lerp(fg.rotation.x, curl, 0.08);
        if (fg.userData.mid) fg.userData.mid.rotation.x = lerp(fg.userData.mid.rotation.x, curl * 1.1, 0.08);
      }
      if (powerOn && t - faceTimer > 250) {
        faceTimer = t;
        blinkT += 0.25;
        var nb = (Math.sin(blinkT * 1.4) > 0.98);
        if (nb !== isBlink) { isBlink = nb; drawFace("on", isBlink, 0.9 + Math.sin(s * 2) * 0.1); }
      }
      renderer.render(scene, camera);
      if (!reduce) requestAnimationFrame(loop);
    }
    if (reduce) renderer.render(scene, camera);
    else requestAnimationFrame(loop);
  }

  /* ---------------- 부팅: GLB 시도 → 폴백 ---------------- */
  if (THREE.GLTFLoader) {
    var loader = new THREE.GLTFLoader();
    loader.load(
      "assets/models/robot.glb",
      function (gltf) { setupGLB(gltf); },
      undefined,
      function () {
        loader.load(
          "assets/models/robot.gltf",
          function (gltf) { setupGLB(gltf); },
          undefined,
          function () { buildCoded(); } // 파일 없음/오류 → 자체 로봇
        );
      }
    );
  } else {
    buildCoded();
  }

  // 로컬(file://) 더블클릭 시: 3D 모델은 브라우저 보안상 로드 불가 → 안내 표시
  if (location.protocol === "file:") {
    var note = document.createElement("div");
    note.className = "robot-note";
    note.innerHTML = "※ 로컬 미리보기(더블클릭)에서는 3D 로봇이 표시되지 않습니다.<br>서버(가비아)에 업로드하거나 로컬 웹서버로 열면 정상 표시됩니다.";
    if (mount.parentElement) mount.parentElement.appendChild(note);
  }
})();
