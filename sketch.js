var flg_auto_camera = true;
var isExporting = false;
var timer;
var easycam;
var gui;
var canvas;
var params = {
  animation: false,
  lightColor: '#ffffff',
  materialColor: '#ffffff',
  backgroundColor: '#000000',
  transparent: false,
  ambientIntensity: 120,
  lightDirX: 0.9,
  lightDirY: -0.9,
  lightDirZ: -1,
  zoom: 1.0,
  save: function () {
    const modal = document.getElementById('saveModal');
    modal.style.display = "block";
    void modal.offsetWidth;
    modal.classList.add('show');
  },
  showGuidelines: function () {
    const modal = document.getElementById('guidelineModal');
    modal.style.display = "block";
    // Trigger reflow to enable transition
    void modal.offsetWidth;
    modal.classList.add('show');
  },
  reset: function () {
    this.animation = false;
    this.lightColor = '#ffffff';
    this.materialColor = '#ffffff';
    this.backgroundColor = '#000000';
    this.transparent = false;
    this.ambientIntensity = 120;
    // Reset light params
    this.lightDirX = 0.9;
    this.lightDirY = -0.9;
    this.lightDirZ = -1;
    this.zoom = 1.0;

    // Reset pos
    pos.x = 0;
    pos.y = 0;
    pos.z = 1000;
    pos.target.x = 0;
    pos.target.y = 0;
    pos.target.z = 1000;
    pos.is_moving = false;

    // Reset EasyCam
    if (easycam) {
      easycam.setDistance(1000);
      easycam.setCenter([0, 0, 0]);
      easycam.setRotation([1, 0, 0, 0]);

      if (!this.animation) {
        easycam.attachMouseListeners(canvas);
      } else {
        easycam.removeMouseListeners();
      }
    }

    // Reset Timer
    if (timer) clearInterval(timer);

    // Update GUI
    if (gui) {
      gui.controllers.forEach(c => c.updateDisplay());
      // Update folders recursively
      function updateControllers(folder) {
        folder.controllers.forEach(c => c.updateDisplay());
        Object.values(folder.folders).forEach(subFolder => updateControllers(subFolder));
      }
      Object.values(gui.folders).forEach(folder => updateControllers(folder));
    }
  }
};
var pos = {
  x: 0,
  y: 0,
  z: 1000,
  target: {
    x: 0,
    y: 0,
    z: 1000,
  },
  is_moving: false,
};

function startMoves() {
  if (timer) clearInterval(timer);
  timer = setInterval(function () {
    if (parseInt(random(5)) == 0) {
      pos.is_moving = true;
      pos.target.x = 0;
      pos.target.y = 0;
      pos.target.z = 1000;
    } else {
      pos.is_moving = true;
      pos.target.x = random(-1000, 1000);
      pos.target.y = random(-1000, 1000);
      pos.target.z = random(500, 1000);
    }
  }, 3000);
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  ortho(-width / 2, width / 2, height / 2, -height / 2, -10000, 10000);

  try {
    easycam = createEasyCam();
    // 初期状態ではアニメーションモードなのでマウス操作を無効化
    if (params.animation && easycam) easycam.removeMouseListeners();
  } catch (e) {
    console.error("EasyCam initialization failed:", e);
  }

  // GUIの設定
  if (typeof lil !== 'undefined') {
    try {
      gui = new lil.GUI();
      gui.add(params, 'animation').name('Animation').onChange(val => {
        if (val) {
          if (easycam) {
            easycam.removeMouseListeners();
            // Sync pos from easycam when switching to animation
            let state = easycam.getPosition();
            pos.x = state[0];
            pos.y = state[1];
            pos.z = state[2];
            pos.target.z = pos.z;
            pos.is_moving = false;
            startMoves();
          }
        } else {
          if (easycam) easycam.attachMouseListeners(canvas);
          if (timer) clearInterval(timer);
        }
      });
      const lightFolder = gui.addFolder('Lighting');
      lightFolder.add(params, 'ambientIntensity', 0, 255).name('Ambient Intensity');
      lightFolder.addColor(params, 'lightColor').name('Light Color');

      lightFolder.add(params, 'lightDirX', -1, 1).name('Dir X');
      lightFolder.add(params, 'lightDirY', -1, 1).name('Dir Y');
      lightFolder.add(params, 'lightDirZ', -1, 1).name('Dir Z');

      gui.addColor(params, 'materialColor').name('Material Color');
      gui.addColor(params, 'backgroundColor').name('Background Color');
      gui.add(params, 'transparent').name('Transparent Background').onChange(val => {
        // Optional: Disable background color picker if transparent is true
      });
      gui.add(params, 'zoom', 0.1, 5.0).name('Camera Zoom');
      gui.add(params, 'save').name('Save Image');
      gui.add(params, 'showGuidelines').name('Design Guidelines');
      gui.add(params, 'reset').name('Reset Settings');
    } catch (e) {
      console.error("GUI initialization failed:", e);
    }
  }

  // camera = createCamera();
  //   createEasyCam();
  // camera.setPosition(pos.x, pos.y, pos.z);
  if (easycam) {
    easycam.setDistance(1000);
    easycam.setCenter([0, 0, 0]);
  }

  if (params.animation) {
    startMoves();
  }

  // URLを取得
  var url = new URL(window.location.href);
  // URLSearchParamsオブジェクトを取得
  var urlParams = url.searchParams;
  // params.get('title');
  if (urlParams.get('title') != 'undefined') {
    document.querySelector('#title').innerHTML = urlParams.get('title');
    document.querySelector('#title').setAttribute('title', urlParams.get('title'));
  }

  if (urlParams.get('message') != 'undefined') {
    document.querySelector('#message').innerHTML = urlParams.get('message');
  }

  // Modal Event Listeners
  const modal = document.getElementById('guidelineModal');
  const closeBtn = document.getElementsByClassName("close-button")[0];

  if (closeBtn) {
    closeBtn.onclick = function () {
      modal.classList.remove('show');
      setTimeout(() => { modal.style.display = "none"; }, 300);
    }
  }

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.classList.remove('show');
      setTimeout(() => { modal.style.display = "none"; }, 300);
    }
    const saveModal = document.getElementById('saveModal');
    if (event.target == saveModal) {
      saveModal.classList.remove('show');
      setTimeout(() => { saveModal.style.display = "none"; }, 300);
    }
  }

  // Save Modal Event Listeners
  const saveModal = document.getElementById('saveModal');
  const closeSaveBtn = document.getElementById("closeSaveModal");
  if (closeSaveBtn) {
    closeSaveBtn.onclick = function () {
      saveModal.classList.remove('show');
      setTimeout(() => { saveModal.style.display = "none"; }, 300);
    }
  }

  const executeSaveBtn = document.getElementById('executeSave');
  if (executeSaveBtn) {
    executeSaveBtn.onclick = function () {
      const resSelect = document.getElementById('resolution-select');
      const formatRadios = document.getElementsByName('format');
      let selectedFormat = 'png';
      for (const radio of formatRadios) {
        if (radio.checked) {
          selectedFormat = radio.value;
          break;
        }
      }

      let targetW = windowWidth;
      let targetH = windowHeight;

      // Determine target geometry
      switch (resSelect.value) {
        case '1080p': targetW = 1920; targetH = 1080; break;
        case '4k': targetW = 3840; targetH = 2160; break;
        case 'square': targetW = 1080; targetH = 1080; break;
        case 'large-square': targetW = 2048; targetH = 2048; break;
        case 'screen': default: break;
      }

      // Calculate pixel density to achieve target size within current window dimensions
      // Or simply set pixel density high enough if saving 'screen' size,
      // but for specific resolutions, we might need a different approach.
      // A robust way in p5 for high-res save is utilizing pixelDensity.
      // However, changing aspect ratio (e.g. to square) usually requires resizeCanvas.
      // If we resizeCanvas, we might change shading because lighting depends on canvas size/normals.
      // But the main issue reported is "rendering result is slightly different".
      // This is often due to pixel density differences between screen (Retina) and saved file (usually 1.0 if strictly resized).

      // Let's try to maintain the current pixel density or force a high one.
      // let currentPD = pixelDensity();

      // We will use the current pixel density to match the rendering appearance on screen.
      // pixelDensity(1); 

      resizeCanvas(targetW, targetH);
      ortho(-targetW / 2, targetW / 2, targetH / 2, -targetH / 2, -10000, 10000);

      if (easycam) {
        easycam.setViewport([0, 0, targetW, targetH]);
      }

      isExporting = true;
      draw();
      saveCanvas('ia_logo', selectedFormat);
      isExporting = false;

      // Restore
      // pixelDensity(currentPD);
      resizeCanvas(windowWidth, windowHeight);
      ortho(-width / 2, width / 2, height / 2, -height / 2, -10000, 10000);
      if (easycam) {
        easycam.setViewport([0, 0, windowWidth, windowHeight]);
      }

      // Close modal
      saveModal.classList.remove('show');
      setTimeout(() => { saveModal.style.display = "none"; }, 300);
    }
  }
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  ortho(-width / 2, width / 2, height / 2, -height / 2, -10000, 10000);
}

function keyPressed() {
  if (key == " ") {
    params.animation = !params.animation;
    // GUIの表示更新
    if (gui) {
      gui.controllers.forEach(c => {
        if (c.property === 'animation') c.updateDisplay();
      });
    }

    if (!params.animation) {
      if (easycam) easycam.attachMouseListeners(canvas);
      clearInterval(timer);
      pos.is_moving = true;
      pos.target.x = 0;
      pos.target.y = 0;
      pos.target.z = 1000;
    }
    else {
      if (easycam) easycam.removeMouseListeners();
      startMoves();
    }
  }

}

function doubleClicked() {
  if (!params.animation && easycam) {
    easycam.setDistance(1000);
    easycam.setCenter([0, 0, 0]);
    easycam.setRotation([1, 0, 0, 0]);
  }
}

function draw() {

  if (params.animation) {
    if (easycam) easycam.setAutoUpdate(false);

    if (pos.is_moving) {
      pos.x = pos.x + (pos.target.x - pos.x) / 100;
      pos.y = pos.y + (pos.target.y - pos.y) / 100;
      pos.z = pos.z + (pos.target.z - pos.z) / 100;
      if (
        Math.abs(pos.target.x - pos.x) < 0.1 &&
        Math.abs(pos.target.y - pos.y) < 0.1 &&
        Math.abs(pos.target.z - pos.z) < 0.1
      ) {
        pos.is_moving = false;
      }
    }
    camera(pos.x, pos.y, pos.z, 0, 0, 0, 0, 1, 0);
  } else {
    if (easycam) easycam.setAutoUpdate(true);
  }


  if (params.transparent) {
    clear();
    if (!isExporting) {
      drawWireframeBackground();
    }
  } else {
    background(params.backgroundColor);
  }

  //  orbitControl();
  // camera.lookAt(0, 0, 0);


  // let dirX = (mouseX / width - 0.5) * 2;
  // let dirY = (mouseY / height - 0.5) * 2;
  noLights(); // Reset lights to avoid accumulation
  ambientLight(params.ambientIntensity);
  let c = color(params.lightColor);
  directionalLight(c, params.lightDirX, params.lightDirY, params.lightDirZ);

  let mColor = color(params.materialColor);
  ambientMaterial(mColor);

  // Apply zoom (scale)
  push();
  scale(params.zoom);

  push();
  translate(0, 0, 0);

  noStroke();
  sphere(80, 64, 64);
  pop();

  push();
  translate(-140, 140, -140);
  noStroke();
  sphere(100 / 2, 64, 64);
  pop();

  push();
  translate(-140, 0, 100);
  noStroke();
  box(110, 160, 100);
  pop();

  push();
  translate(100, 0, -140);
  noStroke();
  box(110, 160, 100);
  pop();

  pop(); // End scale wrapper
}

function drawWireframeBackground() {
  push();
  stroke(100, 100, 100, 80);
  strokeWeight(0.5);
  noFill();

  let size = 2000;
  let step = 200;
  let half = size / 2;

  // Draw grid on 6 faces of the cube
  for (let i = -half; i <= half; i += step) {
    // Top & Bottom faces (XZ plane)
    line(-half, -half, i, half, -half, i); // Top lines along X
    line(i, -half, -half, i, -half, half); // Top lines along Z
    line(-half, half, i, half, half, i);   // Bottom lines along X
    line(i, half, -half, i, half, half);   // Bottom lines along Z

    // Back & Front faces (XY plane)
    line(-half, i, -half, half, i, -half); // Back lines along X
    line(i, -half, -half, i, half, -half); // Back lines along Y
    line(-half, i, half, half, i, half);   // Front lines along X
    line(i, -half, half, i, half, half);   // Front lines along Y

    // Left & Right faces (YZ plane)
    line(-half, i, -half, -half, i, half); // Left lines along Z
    line(-half, -half, i, -half, half, i); // Left lines along Y
    line(half, i, -half, half, i, half);   // Right lines along Z
    line(half, -half, i, half, half, i);   // Right lines along Y
  }
  pop();
}
