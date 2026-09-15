const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const projects = [
  { title: "F.A.X Electronics", category: "mobile", icon: "bi-cpu", type: "Mobile", description: "Konsep aplikasi Flutter untuk kebutuhan elektronik dengan autentikasi dan integrasi backend.", tags: ["Flutter", "Firebase", "PHP", "MySQL"] },
  { title: "AutoSafe", category: "web", icon: "bi-car-front", type: "Web", description: "Konsep layanan digital untuk membantu kebutuhan penitipan kendaraan dengan interface sederhana.", tags: ["HTML", "CSS", "JavaScript"] },
  { title: "Personal Web Project", category: "uiux", icon: "bi-grid-1x2", type: "UI/UX", description: "Website untuk mengeksplorasi frontend development dan responsive web design.", tags: ["HTML", "CSS", "JavaScript"] }
];

function renderProjects(filter = "all") {
  $("#projects-grid").innerHTML = projects.filter(item => filter === "all" || item.category === filter).map((item, index) => `<article class="project-card"><div class="project-visual project-visual--${item.category}"><span class="project-number">0${index + 1}</span><i class="bi ${item.icon}" aria-hidden="true"></i><span class="project-category">${item.type}</span></div><div class="project-content"><h3>${item.title}</h3><p>${item.description}</p><div class="tags">${item.tags.map(tag => `<span>${tag}</span>`).join("")}</div><div class="project-actions"><a href="#contact" class="project-demo" data-project="${item.title}">View Project <i class="bi bi-arrow-up-right"></i></a><a href="#contact" class="project-demo" data-project="Source Code — ${item.title}">Source Code <i class="bi bi-github"></i></a></div></div></article>`).join("");
}

// THREE.JS INITIALIZATION / EARTH / CLOUDS / STARS
function initEarth() {
  const canvas = $("#earth-canvas");
  const fallback = $("#earth-fallback");
  const loading = $("#earth-loading");
  const finishEarthLoading = () => {
    canvas.classList.add("earth-ready");
    loading?.classList.add("is-hidden");
  };
  const showFallback = message => {
    console.error(`[Earth] ${message}`);
    fallback.classList.add("visible");
    canvas.style.display = "none";
    loading?.classList.add("is-hidden");
  };
  const getWebGLContext = () => {
    try {
      // Do not reject a usable context just because the browser reports a performance caveat.
      return canvas.getContext("webgl2", { antialias: true, alpha: true })
        || canvas.getContext("webgl", { antialias: true, alpha: true })
        || canvas.getContext("experimental-webgl", { antialias: true, alpha: true });
    } catch (error) {
      console.error("[Earth] WebGL context creation failed.", error);
      return null;
    }
  };
  if (!window.THREE) {
    showFallback("Three.js failed to load. Check the CDN script and network connection.");
    return;
  }
  const webglContext = getWebGLContext();
  if (!webglContext) {
    showFallback("WebGL/WebGL2 is not supported or was blocked by the browser.");
    return;
  }
  const webglVersion = typeof WebGL2RenderingContext !== "undefined" && webglContext instanceof WebGL2RenderingContext
    ? "WebGL2"
    : "WebGL1";
  console.info(`[Earth] WebGL ready (${webglVersion}).`);
  const frame = $("#earth-frame");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  camera.position.z = 4.55;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      context: webglContext,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
  } catch (error) {
    showFallback(`WebGLRenderer initialization failed: ${error.message}`);
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  canvas.addEventListener("webglcontextlost", event => {
    event.preventDefault();
    console.error("[Earth] WebGL context lost.");
  });
  canvas.addEventListener("webglcontextrestored", () => {
    console.info("[Earth] WebGL context restored.");
  });
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  const configureTexture = (texture, isColor = false) => {
    if (isColor) texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = maxAnisotropy;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
    return texture;
  };
  // Edge/Chrome cannot upload file:// images as WebGL textures, so when the real map is
  // missing the Bumi would render as a plain ball. This draws a stylized planet instead,
  // using a seeded noise so the fallback always looks the same.
  const createFallbackEarthTexture = () => {
    const width = 1024, height = 512;
    const surface = document.createElement("canvas");
    surface.width = width; surface.height = height;
    const ctx = surface.getContext("2d");
    let seed = 20260215;
    const random = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
    const ocean = ctx.createLinearGradient(0, 0, 0, height);
    ocean.addColorStop(0, "#16456e"); ocean.addColorStop(.5, "#1181c0"); ocean.addColorStop(1, "#16456e");
    ctx.fillStyle = ocean; ctx.fillRect(0, 0, width, height);
    const land = ["#3d9452", "#4ea364", "#74a055", "#b8a05e"];
    const continents = 11;
    for (let continent = 0; continent < continents; continent++) {
      // Spread the continents over the whole longitude so every visible face shows land.
      const centerX = ((continent + .5) / continents) * width + (random() - .5) * 70;
      const centerY = height * (.2 + random() * .6);
      for (let blob = 0; blob < 18; blob++) {
        const x = centerX + (random() - .5) * 200, y = centerY + (random() - .5) * 165;
        const radius = 18 + random() * 40;
        const patch = ctx.createRadialGradient(x, y, radius * .1, x, y, radius);
        const shade = random() < .84 ? land[Math.floor(random() * 3)] : land[3];
        patch.addColorStop(0, shade);
        patch.addColorStop(.5, shade);
        patch.addColorStop(1, "rgba(61,148,82,0)");
        ctx.fillStyle = patch;
        ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
      }
    }
    const northPole = ctx.createLinearGradient(0, 0, 0, 86);
    northPole.addColorStop(0, "rgba(232,244,255,.95)"); northPole.addColorStop(1, "rgba(232,244,255,0)");
    ctx.fillStyle = northPole; ctx.fillRect(0, 0, width, 86);
    const southPole = ctx.createLinearGradient(0, height, 0, height - 86);
    southPole.addColorStop(0, "rgba(232,244,255,.95)"); southPole.addColorStop(1, "rgba(232,244,255,0)");
    ctx.fillStyle = southPole; ctx.fillRect(0, height - 86, width, 86);
    return new THREE.CanvasTexture(surface);
  };
  const group = new THREE.Group();
  scene.add(group);
  scene.add(new THREE.AmbientLight(0x91b5cb, 0.22));
  scene.add(new THREE.HemisphereLight(0xb9eaff, 0x07101a, 0.28));
  const sun = new THREE.DirectionalLight(0xffffff, 2.8);
  sun.position.set(-4, 2.5, 4.5); scene.add(sun);
  const loader = new THREE.TextureLoader();
  const textureUrl = "assets/images/earth/";
  // Chromium browsers (Edge/Chrome) treat images opened from file:// as cross-origin,
  // so they cannot be uploaded as WebGL textures. The Bumi textures therefore only load
  // when the page is served over http(s), for example with VS Code Live Server.
  let toastTimer, textureWarningShown = false;
  const notify = message => {
    const toast = $("#toast");
    if (!toast) return;
    $("span", toast).textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 5000);
  };
  const handleTextureError = (label, error) => {
    console.error(`[Earth] ${label} texture failed to load.`, error);
    if (textureWarningShown) return;
    textureWarningShown = true;
    notify(location.protocol === "file:"
      ? "Texture Bumi tidak bisa dimuat dari file:// — jalankan lewat Live Server / local server."
      : "Texture Bumi gagal dimuat — periksa folder assets/images/earth.");
  };
  const earth = new THREE.Mesh(
    // A clean, conventional Earth material: the satellite image remains untouched and
    // readable, while native Phong lighting provides the day/night terminator.
    new THREE.SphereGeometry(1, 128, 128),
    new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: new THREE.Color(0x183b5a),
      shininess: 16
    })
  );
  group.add(earth);
  // No colour-altering shader is applied: land, ocean, deserts, and polar regions
  // are shown exactly as they appear in the satellite texture.
  // This is a high-coverage cloud mask. Keep it deliberately subtle so the real
  // satellite land/ocean map remains the hero, instead of becoming a white shell.
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.012, 128, 128), new THREE.MeshPhongMaterial({ color: 0xe9f4ff, transparent: true, opacity: .22, shininess: 0, depthWrite: false, alphaTest: .04 }));
  group.add(clouds);
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.035, 64, 64),
    new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color(0x4aaeff) }, glowStrength: { value: .13 } },
      vertexShader: "varying vec3 vNormal; varying vec3 vViewDirection; void main(){vec4 mvPosition=modelViewMatrix*vec4(position,1.0);vNormal=normalize(normalMatrix*normal);vViewDirection=normalize(-mvPosition.xyz);gl_Position=projectionMatrix*mvPosition;}",
      fragmentShader: "uniform vec3 glowColor; uniform float glowStrength; varying vec3 vNormal; varying vec3 vViewDirection; void main(){float rim=pow(1.0-max(dot(vNormal,vViewDirection),0.0),4.0);gl_FragColor=vec4(glowColor,rim*glowStrength);}",
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    })
  );
  group.add(atmosphere);
  const cityLights = new THREE.Mesh(
    new THREE.SphereGeometry(1.003, 128, 128),
    new THREE.ShaderMaterial({
      uniforms: { nightMap: { value: null }, sunDirection: { value: sun.position.clone().normalize() } },
      vertexShader: "varying vec2 vUv; varying vec3 vWorldNormal; void main(){vUv=uv;vWorldNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
      fragmentShader: "uniform sampler2D nightMap; uniform vec3 sunDirection; varying vec2 vUv; varying vec3 vWorldNormal; void main(){vec3 lights=texture2D(nightMap,vUv).rgb;float luminance=max(max(lights.r,lights.g),lights.b);float night=smoothstep(0.08,-0.28,dot(normalize(vWorldNormal),normalize(sunDirection)));gl_FragColor=vec4(lights*1.15,luminance*night*.72);}",
      transparent: true,
      depthWrite: false
    })
  );
  group.add(cityLights);
  loader.load(`${textureUrl}earth_atmos_2048.jpg`, map => {
    earth.material.map = configureTexture(map, true);
    earth.material.needsUpdate = true;
    console.info("[Earth] Color texture loaded.");
    finishEarthLoading();
  }, undefined, error => {
    handleTextureError("Color", error);
    // Keep an Earth-like surface instead of the plain (and easily invisible) white sphere.
    try {
      earth.material.map = configureTexture(createFallbackEarthTexture(), true);
      earth.material.needsUpdate = true;
    } catch (fallbackError) {
      console.error("[Earth] Procedural fallback surface failed.", fallbackError);
      earth.material.color.set(0x3d7fb8);
    }
    // Do not let a successful cloud mask disguise a failed satellite base map.
    clouds.visible = false;
    finishEarthLoading();
  });
  loader.load(`${textureUrl}earth_normal_2048.jpg`, map => {
    earth.material.normalMap = configureTexture(map);
    earth.material.normalScale.set(.18, .18);
    earth.material.needsUpdate = true;
  }, undefined, error => handleTextureError("Normal", error));
  loader.load(`${textureUrl}earth_specular_2048.jpg`, map => {
    // Bright pixels in this NASA/Three.js map are ocean, so only water catches light.
    earth.material.specularMap = configureTexture(map);
    earth.material.needsUpdate = true;
  }, undefined, error => handleTextureError("Specular", error));
  loader.load(`${textureUrl}earth_clouds_1024.png`, map => {
    clouds.material.map = configureTexture(map, true);
    clouds.material.alphaMap = map;
    clouds.material.needsUpdate = true;
  }, undefined, error => {
    handleTextureError("Cloud", error);
    // A cloud layer without its alpha map would render as a milky white shell.
    clouds.visible = false;
  });
  loader.load(`${textureUrl}earth_lights_2048.png`, map => {
    cityLights.material.uniforms.nightMap.value = configureTexture(map, true);
    console.info("[Earth] Night-light texture loaded.");
  }, undefined, error => {
    console.warn("[Earth] Night-light texture failed to load.", error);
    cityLights.visible = false;
  });
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(900 * 3);
  for (let i = 0; i < starPositions.length; i += 3) {
    const radius = 7 + Math.random() * 5, theta = Math.random() * Math.PI * 2, phi = Math.acos(2 * Math.random() - 1);
    starPositions[i] = radius * Math.sin(phi) * Math.cos(theta); starPositions[i + 1] = radius * Math.cos(phi); starPositions[i + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0x9edfff, size: .018, transparent: true, opacity: .75 })));

  const state = {
    // Face the Atlantic at launch: Africa, Europe, and both Americas are visible,
    // making the first frame read immediately as Earth rather than a blue ocean ball.
    targetX: 0, targetY: 0, rotationX: .08, rotationY: 0, rotationZ: 0,
    zoom: 4.55, targetZoom: 4.55, dragging: false, lastX: 0, lastY: 0, pinch: 0,
    sensorEnabled: false, sensorHasReading: false, sensorCalibrated: false,
    sensorReference: { alpha: 0, beta: 0, gamma: 0 },
    sensorTarget: { x: 0, y: 0, z: 0 },
    sensorCurrent: { x: 0, y: 0, z: 0 },
    lastOrientationEvent: 0
  };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const degreesToRadians = value => value * Math.PI / 180;
  const shortestAngle = value => ((value + 180) % 360 + 360) % 360 - 180;
  const screenAngle = () => {
    const orientation = screen.orientation && screen.orientation.angle;
    return typeof orientation === "number" ? orientation : (window.orientation || 0);
  };
  const calibrateSensor = () => {
    if (!state.sensorHasReading) return;
    state.sensorReference = { ...state.sensorReference, ...state.latestSensor };
    state.sensorTarget.x = 0; state.sensorTarget.y = 0; state.sensorTarget.z = 0;
    state.sensorCurrent.x = 0; state.sensorCurrent.y = 0; state.sensorCurrent.z = 0;
    state.sensorCalibrated = true;
  };
  const pointerPosition = event => { const rect = frame.getBoundingClientRect(); state.targetY = ((event.clientX - rect.left) / rect.width - .5) * .42; state.targetX = ((event.clientY - rect.top) / rect.height - .5) * .22; };
  frame.addEventListener("pointermove", event => {
    if (!state.dragging) { pointerPosition(event); return; }
    state.rotationY += (event.clientX - state.lastX) * .008;
    state.rotationX = clamp(state.rotationX + (event.clientY - state.lastY) * .006, -.7, .7);
    state.lastX = event.clientX; state.lastY = event.clientY;
  });
  frame.addEventListener("pointerdown", event => { state.dragging = true; state.lastX = event.clientX; state.lastY = event.clientY; frame.setPointerCapture(event.pointerId); });
  frame.addEventListener("pointerup", event => { state.dragging = false; frame.releasePointerCapture(event.pointerId); });
  frame.addEventListener("pointercancel", () => { state.dragging = false; });
  frame.addEventListener("wheel", event => { event.preventDefault(); state.targetZoom = clamp(state.targetZoom + event.deltaY * .0025, 3.85, 5.35); }, { passive: false });
  frame.addEventListener("dblclick", event => {
    event.preventDefault();
    state.rotationX = .08; state.rotationY = 0; state.rotationZ = 0;
    state.targetX = 0; state.targetY = 0;
    if (state.sensorEnabled) calibrateSensor();
    state.targetZoom = 4.55;
  });
  let touches = new Map();
  frame.addEventListener("touchstart", event => { for (const touch of event.changedTouches) touches.set(touch.identifier, touch); if (touches.size === 2) state.pinch = Math.hypot(touches.get(0).clientX - touches.get(1).clientX, touches.get(0).clientY - touches.get(1).clientY); }, { passive: true });
  frame.addEventListener("touchmove", event => { if (touches.size < 2) return; event.preventDefault(); for (const touch of event.changedTouches) touches.set(touch.identifier, touch); const points = [...touches.values()]; const distance = Math.hypot(points[0].clientX - points[1].clientX, points[0].clientY - points[1].clientY); state.targetZoom = clamp(state.targetZoom - (distance - state.pinch) * .006, 3.2, 4.4); state.pinch = distance; }, { passive: false });
  frame.addEventListener("touchend", event => { for (const touch of event.changedTouches) touches.delete(touch.identifier); });
  window.addEventListener("mousemove", pointerPosition, { passive: true });
  const handleOrientation = event => {
    const alpha = Number.isFinite(event.alpha) ? event.alpha : null;
    const beta = Number.isFinite(event.beta) ? event.beta : null;
    const gamma = Number.isFinite(event.gamma) ? event.gamma : null;
    if (alpha === null || beta === null || gamma === null) return;
    state.latestSensor = { alpha, beta, gamma };
    state.sensorHasReading = true;
    state.lastOrientationEvent = performance.now();
    if (!state.sensorEnabled) return;
    if (!state.sensorCalibrated) calibrateSensor();
    const relativeAlpha = shortestAngle(alpha - state.sensorReference.alpha);
    const relativeBeta = beta - state.sensorReference.beta;
    const relativeGamma = gamma - state.sensorReference.gamma;
    const orientationCorrection = screenAngle() * .35;
    state.sensorTarget.x = clamp(degreesToRadians(relativeBeta) * .72, -degreesToRadians(30), degreesToRadians(30));
    state.sensorTarget.y = clamp(degreesToRadians(relativeAlpha) * .48 + degreesToRadians(relativeGamma) * .2, -Math.PI, Math.PI);
    state.sensorTarget.z = clamp(degreesToRadians(relativeGamma + orientationCorrection) * .58, -degreesToRadians(30), degreesToRadians(30));
  };
  window.addEventListener("deviceorientation", handleOrientation);
  window.addEventListener("deviceorientationabsolute", handleOrientation);
  const handleScreenOrientation = () => { if (state.sensorEnabled) calibrateSensor(); };
  window.addEventListener("orientationchange", handleScreenOrientation);
  if (screen.orientation) screen.orientation.addEventListener("change", handleScreenOrientation);
  const resize = () => {
    const size = Math.max(1, frame.clientWidth || frame.getBoundingClientRect().width);
    renderer.setSize(size, size, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(frame); resize();
  let visible = true; document.addEventListener("visibilitychange", () => { visible = document.visibilityState === "visible"; });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animate = () => {
    requestAnimationFrame(animate);
    if (!visible) return;
    const easing = reducedMotion ? .1 : .075;
    const userInteracting = state.dragging || touches.size > 0;
    if (!userInteracting && (!state.sensorEnabled || !state.sensorHasReading) && !reducedMotion) state.rotationY += .00035;
    const sensorX = userInteracting ? 0 : state.sensorCurrent.x += (state.sensorTarget.x - state.sensorCurrent.x) * easing;
    const sensorY = userInteracting ? 0 : state.sensorCurrent.y += (state.sensorTarget.y - state.sensorCurrent.y) * easing;
    const sensorZ = userInteracting ? 0 : state.sensorCurrent.z += (state.sensorTarget.z - state.sensorCurrent.z) * easing;
    const targetRotationY = state.rotationY + state.targetY + sensorY;
    const targetRotationX = clamp(state.rotationX + state.targetX + sensorX, -.95, .95);
    const targetRotationZ = state.rotationZ + sensorZ;
    group.rotation.y += (targetRotationY - group.rotation.y) * easing;
    group.rotation.x += (targetRotationX - group.rotation.x) * easing;
    group.rotation.z += (targetRotationZ - group.rotation.z) * easing;
    camera.position.z += (state.targetZoom - camera.position.z) * .08;
    clouds.rotation.y += reducedMotion ? 0 : .00045;
    renderer.render(scene, camera);
  };
  animate();
  window.earthState = state;
}

// DEVICE ORIENTATION
function initMotionPermission() {
  const panel = $("#motion-panel"), button = $("#motion-button"), status = $("#motion-status");
  const supportsOrientation = "DeviceOrientationEvent" in window;
  const needsPermission = supportsOrientation
    && typeof DeviceOrientationEvent.requestPermission === "function";
  if (!supportsOrientation) {
    panel.style.display = "none";
    return;
  }
  if (!needsPermission) {
    if (window.earthState) window.earthState.sensorEnabled = true;
    button.style.display = "none";
    status.textContent = "Motion sensor ready";
    return;
  }
  button.addEventListener("click", async () => {
    try {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== "granted") {
          status.textContent = "Permission denied — gunakan drag / touch";
          return;
        }
      }
      if (window.earthState) {
        window.earthState.sensorEnabled = true;
        window.earthState.sensorCalibrated = false;
      }
      button.textContent = "Motion enabled";
      status.textContent = "Tilt your device to move Earth";
      button.disabled = true;
    } catch (error) {
      console.error("[Earth] Device orientation permission request failed.", error);
      status.textContent = "Sensor tidak tersedia — gunakan drag / touch";
    }
  });
}

function initNavigation() {
  const header = $("#site-header"), menu = $("#menu-toggle"), nav = $("#nav-wrap"), back = $("#back-to-top"), links = $$(".nav-link"), sections = $$("main section[id]");
  const update = () => { header.classList.toggle("scrolled", scrollY > 20); back.style.opacity = scrollY > 500 ? "1" : ".35"; const current = sections.find(section => { const box = section.getBoundingClientRect(); return box.top <= 150 && box.bottom > 150; }); if (current) links.forEach(link => link.classList.toggle("active", link.hash === `#${current.id}`)); };
  menu.addEventListener("click", () => { const open = nav.classList.toggle("open"); menu.classList.toggle("open", open); menu.setAttribute("aria-expanded", String(open)); });
  links.forEach(link => link.addEventListener("click", () => nav.classList.remove("open")));
  addEventListener("scroll", update, { passive: true }); update();
}
function initTyping() { const target = $("#typing-text"), words = ["Student", "Software Developer", "Creative Learner"]; let word = 0, char = 0, deleting = false; const tick = () => { const value = words[word]; target.textContent = deleting ? value.slice(0, char--) : value.slice(0, char++); let delay = deleting ? 48 : 90; if (!deleting && char > value.length) { deleting = true; delay = 1500; } if (deleting && char < 0) { deleting = false; char = 0; word = (word + 1) % words.length; delay = 350; } setTimeout(tick, delay); }; tick(); }
function initReveal() { const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); } }), { threshold: .12 }); $$(".reveal").forEach(item => observer.observe(item)); }
function initInteractions() {
  $$(".filter-button").forEach(button => button.addEventListener("click", () => { $$(".filter-button").forEach(item => item.classList.toggle("active", item === button)); renderProjects(button.dataset.filter); }));
  $("#projects-grid").addEventListener("click", event => { const link = event.target.closest(".project-demo"); if (link) { event.preventDefault(); const toast = $("#toast"); $("span", toast).textContent = `${link.dataset.project} akan segera tersedia.`; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 2800); } });
  $$(".contact-card").forEach(card => card.addEventListener("click", event => {
    if (/your@email|username|xxxxxxxxxx/i.test(card.getAttribute("href") || "")) {
      event.preventDefault();
      const toast = $("#toast");
      $("span", toast).textContent = "Ganti placeholder kontak di index.html terlebih dahulu.";
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2800);
    }
  }));
}
document.addEventListener("DOMContentLoaded", () => { renderProjects(); initEarth(); initNavigation(); initTyping(); initReveal(); initInteractions(); setTimeout(() => $("#loader").classList.add("is-hidden"), 650); });
