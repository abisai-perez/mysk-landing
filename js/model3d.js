(function initJar3D(){
  const canvas = document.getElementById('jar3d');
  const fallbackImg = document.getElementById('jarFallback');
  if (typeof THREE === 'undefined' || !canvas) {
    if (canvas) canvas.style.display = 'none';
    if (fallbackImg) fallbackImg.style.display = 'block';
    return;
  }

  const loader = new THREE.TextureLoader();
  let loadedCount = 0;
  let loadFailed = false;
  const onTexError = () => {
    loadFailed = true;
    canvas.style.display = 'none';
    fallbackImg.style.display = 'block';
  };

  // ---- 1. Build a wrap-around label texture from the real product photos ----
  function buildBodyTexture(frontImg, sideImg, cb) {
    const W = 2048, H = 1024;
    const cnv = document.createElement('canvas');
    cnv.width = W; cnv.height = H;
    const ctx = cnv.getContext('2d');

    // base jar-body fill (sampled from the real burgundy label background)
    ctx.fillStyle = '#4a1220';
    ctx.fillRect(0, 0, W, H);

    let toLoad = 2;
    const done = () => { if (--toLoad === 0) cb(cnv); };

    const fImg = new Image();
    fImg.crossOrigin = 'anonymous';
    fImg.onload = () => {
      const w = W * 0.42, h = H;
      ctx.drawImage(fImg, W * 0.04, 0, w, h);
      done();
    };
    fImg.onerror = () => { onTexError(); done(); };
    fImg.src = frontImg;

    const sImg = new Image();
    sImg.crossOrigin = 'anonymous';
    sImg.onload = () => {
      const w = W * 0.40, h = H;
      ctx.drawImage(sImg, W * 0.50, 0, w, h);
      done();
    };
    sImg.onerror = () => { onTexError(); done(); };
    sImg.src = sideImg;
  }

  buildBodyTexture('img/jar-body-front.jpg', 'img/jar-body-side.jpg', function(atlasCanvas){
    if (loadFailed) return;

    const bodyTex = new THREE.CanvasTexture(atlasCanvas);
    bodyTex.wrapS = THREE.RepeatWrapping;
    bodyTex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;

    const topTex = loader.load('img/jar-top.jpg', undefined, undefined, onTexError);
    if (topTex.colorSpace !== undefined) topTex.colorSpace = THREE.SRGBColorSpace;

    // ---- 2. Scene setup ----
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.15, 5.2);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    function resize(){
      const size = canvas.clientWidth || 360;
      renderer.setSize(size, size, false);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    // lighting — warm gold key + soft burgundy rim, matching the hero palette
    scene.add(new THREE.AmbientLight(0x6b2030, 1.1));
    const key = new THREE.DirectionalLight(0xf3d9a0, 1.6);
    key.position.set(3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xc9a24b, 0.8);
    rim.position.set(-4, 1, -3);
    scene.add(rim);
    const fill = new THREE.PointLight(0xe9b9c1, 0.5);
    fill.position.set(0, -2, 3);
    scene.add(fill);

    // ---- 3. Jar geometry: body + screw cap, built from real proportions ----
    const group = new THREE.Group();

    const bodyGeo = new THREE.CylinderGeometry(1.05, 0.98, 1.5, 64, 1, false);
    const bodyMat = new THREE.MeshStandardMaterial({ map: bodyTex, roughness: 0.35, metalness: 0.08 });
    const bodyTopMat = new THREE.MeshStandardMaterial({ color: 0x3a0f1a, roughness: 0.4 });
    const body = new THREE.Mesh(bodyGeo, [bodyMat, bodyTopMat, bodyTopMat]);
    body.position.y = -0.35;
    group.add(body);

    const lidGeo = new THREE.CylinderGeometry(1.12, 1.1, 0.62, 64);
    const lidSideMat = new THREE.MeshStandardMaterial({ color: 0xb5281f, roughness: 0.25, metalness: 0.1 });
    const lidTopMat = new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.3, metalness: 0.1 });
    const lid = new THREE.Mesh(lidGeo, [lidSideMat, lidTopMat, lidSideMat]);
    lid.position.y = 0.71;
    group.add(lid);

    scene.add(group);
    group.rotation.y = -0.5;
    group.rotation.x = 0.05;

    // ---- 4. Interaction: drag to rotate + gentle auto-rotate ----
    let dragging = false, lastX = 0, autoSpin = 0.0028, velocity = 0;

    function pointerDown(x){ dragging = true; lastX = x; velocity = 0; canvas.style.cursor = 'grabbing'; }
    function pointerMove(x){
      if (!dragging) return;
      const dx = x - lastX;
      lastX = x;
      velocity = dx * 0.008;
      group.rotation.y += velocity;
    }
    function pointerUp(){ dragging = false; canvas.style.cursor = 'grab'; }

    canvas.addEventListener('mousedown', e => pointerDown(e.clientX));
    window.addEventListener('mousemove', e => pointerMove(e.clientX));
    window.addEventListener('mouseup', pointerUp);
    canvas.addEventListener('touchstart', e => pointerDown(e.touches[0].clientX), { passive: true });
    canvas.addEventListener('touchmove', e => { pointerMove(e.touches[0].clientX); }, { passive: true });
    canvas.addEventListener('touchend', pointerUp);

    function animate(){
      requestAnimationFrame(animate);
      if (!dragging) {
        group.rotation.y += autoSpin + velocity;
        velocity *= 0.92;
      }
      renderer.render(scene, camera);
    }
    animate();
  });
})();
