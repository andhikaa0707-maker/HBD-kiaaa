// ============================================================
// model.js — Fixed: center, lighting, camera, pivot rotation
// ============================================================

let scene, camera, renderer, pivot;
let isDragging = false, prevMouse = { x: 0, y: 0 };

const modelColors = {
  mat_dress: '#dfdfdf',
  mat_bag:   '#111111',
  mat_shoes: '#f5f5f5',
  mat_hair:  '#1a0a00',
  mat_body:  '#FFDBB5',
  mat_eyes:  '#3a2000',
  mat_mouth: '#FF9999'
};

const materialRefs = {};

function initModel() {
  const wrap   = document.getElementById('model-canvas-wrap');
  const canvas = document.getElementById('model-canvas');
  if (!wrap || !canvas) return;

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(wrap.clientWidth, wrap.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scene = new THREE.Scene();

  // Camera — FOV kecil = tidak distorsi, posisi jauh dan sedikit ke bawah
  camera = new THREE.PerspectiveCamera(30, wrap.clientWidth / wrap.clientHeight, 0.01, 100);
  camera.position.set(0, 0, 5.5);
  camera.lookAt(0, 0, 0);

  // Lighting — sangat soft, tidak ada highlight keras
  // Ambient tinggi = cahaya dasar merata ke semua sisi
  scene.add(new THREE.AmbientLight(0xffffff, 0.85));

  // 3 lampu lemah dari berbagai arah = tidak ada sisi gelap/terang ekstrem
  const l1 = new THREE.DirectionalLight(0xffffff, 0.35);
  l1.position.set(2, 3, 4);
  scene.add(l1);

  const l2 = new THREE.DirectionalLight(0xffffff, 0.25);
  l2.position.set(-2, 1, -2);
  scene.add(l2);

  const l3 = new THREE.DirectionalLight(0xffffff, 0.15);
  l3.position.set(0, -2, 2);
  scene.add(l3);

  // PIVOT di origin — model akan di-center ke sini
  pivot = new THREE.Group();
  scene.add(pivot);

  loadGLB('kia.glb');

  // Drag mouse
  canvas.addEventListener('mousedown', e => {
    isDragging = true;
    prevMouse = { x: e.clientX, y: e.clientY };
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    pivot.rotation.y += (e.clientX - prevMouse.x) * 0.012;
    prevMouse = { x: e.clientX, y: e.clientY };
  });
  window.addEventListener('mouseup', () => isDragging = false);

  // Drag touch
  canvas.addEventListener('touchstart', e => {
    isDragging = true;
    prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (!isDragging) return;
    pivot.rotation.y += (e.touches[0].clientX - prevMouse.x) * 0.012;
    prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  window.addEventListener('touchend', () => isDragging = false);

  // Resize
  window.addEventListener('resize', () => {
    if (!renderer) return;
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);
    camera.aspect = wrap.clientWidth / wrap.clientHeight;
    camera.updateProjectionMatrix();
  });

  // Color swatches
  document.querySelectorAll('.swatch').forEach(swatch => {
    swatch.addEventListener('click', function () {
      const part  = this.dataset.part;
      const color = this.dataset.color;
      document.querySelectorAll(`[data-part="${part}"]`).forEach(s => s.classList.remove('active'));
      this.classList.add('active');
      setPartColor(part, color);
    });
  });

  animate();
}

function loadGLB(url) {
  fetch(url)
    .then(r => { if (!r.ok) throw new Error('GLB tidak ditemukan'); return r.arrayBuffer(); })
    .then(buffer => {
      const group = parseGLB(buffer);
      if (!group) throw new Error('Parse gagal');

      // Step 1: hitung bounding box SEBELUM scale
      const box    = new THREE.Box3().setFromObject(group);
      const size   = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      // Step 2: scale proporsional dulu
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale  = 1.8 / maxDim;
      group.scale.setScalar(scale);

      // Step 3: recalculate center setelah scale
      const box2    = new THREE.Box3().setFromObject(group);
      const center2 = box2.getCenter(new THREE.Vector3());

      // Step 4: geser model supaya center-nya tepat di origin pivot (0,0,0)
      group.position.x = -center2.x;
      group.position.y = -center2.y;
      group.position.z = -center2.z;

      pivot.add(group);

      const loading = document.getElementById('model-loading');
      if (loading) loading.style.display = 'none';
    })
    .catch(err => {
      console.warn('GLB gagal load:', err);
      const loading = document.getElementById('model-loading');
      if (loading) loading.textContent = ' Model belum tersedia, reload halaman';
    });
}

function parseGLB(buffer) {
  try {
    const view = new DataView(buffer);
    if (view.getUint32(0, true) !== 0x46546C67) return null;

    const jsonLen  = view.getUint32(12, true);
    const jsonText = new TextDecoder().decode(new Uint8Array(buffer, 20, jsonLen));
    const gltf     = JSON.parse(jsonText);
    const binStart = 20 + jsonLen + 8;
    const binBuf   = buffer.slice(binStart);
    const group    = new THREE.Group();

    (gltf.meshes || []).forEach(mesh => {
      (mesh.primitives || []).forEach(prim => {
        const geo     = buildGeometry(gltf, prim, binBuf);
        if (!geo) return;
        const matDef  = gltf.materials && gltf.materials[prim.material];
        const matName = matDef ? matDef.name : 'mat_body';
        const color   = modelColors[matName] || '#cccccc';
        const mat     = new THREE.MeshLambertMaterial({
          // MeshLambertMaterial lebih soft dari Phong, tidak ada highlight keras
          color: new THREE.Color(color)
        });
        if (!materialRefs[matName]) materialRefs[matName] = [];
        materialRefs[matName].push(mat);
        group.add(new THREE.Mesh(geo, mat));
      });
    });

    return group;
  } catch (e) { console.warn('Parse error:', e); return null; }
}

function buildGeometry(gltf, primitive, binBuf) {
  try {
    const geo = new THREE.BufferGeometry();
    const a   = primitive.attributes;
    if (a.POSITION !== undefined) {
      const d = getAccessor(gltf, gltf.accessors[a.POSITION], binBuf);
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(d), 3));
    }
    if (a.NORMAL !== undefined) {
      const d = getAccessor(gltf, gltf.accessors[a.NORMAL], binBuf);
      geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(d), 3));
    }
    if (primitive.indices !== undefined) {
      const acc = gltf.accessors[primitive.indices];
      const d   = getAccessor(gltf, acc, binBuf);
      const Arr = acc.componentType === 5123 ? Uint16Array : Uint32Array;
      geo.setIndex(new THREE.BufferAttribute(new Arr(d), 1));
    }
    if (!geo.attributes.normal) geo.computeVertexNormals();
    return geo;
  } catch (e) { return null; }
}

function getAccessor(gltf, acc, binBuf) {
  const bv     = gltf.bufferViews[acc.bufferView];
  const offset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
  const cSize  = { 5120:1,5121:1,5122:2,5123:2,5125:4,5126:4 }[acc.componentType];
  const tCount = { SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16 }[acc.type];
  return binBuf.slice(offset, offset + cSize * tCount * acc.count);
}

function setPartColor(matName, hexColor) {
  modelColors[matName] = hexColor;
  (materialRefs[matName] || []).forEach(mat => mat.color.set(hexColor));
}

function animate() {
  requestAnimationFrame(animate);
  if (pivot && !isDragging) pivot.rotation.y += 0.004;
  if (renderer) renderer.render(scene, camera);
}

window.addEventListener('load', initModel);