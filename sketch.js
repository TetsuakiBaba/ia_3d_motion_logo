var flg_auto_camera = true;
var timer;
var easycam;
var gui;
var canvas;
var params = {
  animation: true,
  lightColor: '#ffffff',
  materialColor: '#ffffff',
  backgroundColor: '#000000',
  ambientIntensity: 120,
  save: function () { saveCanvas('ia_logo', 'png'); },
  reset: function () {
    this.animation = true;
    this.lightColor = '#ffffff';
    this.materialColor = '#ffffff';
    this.backgroundColor = '#000000';
    this.ambientIntensity = 120;

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
      easycam.removeMouseListeners();
      easycam.setDistance(1000);
      easycam.setCenter([0, 0, 0]);
      easycam.setRotation([1, 0, 0, 0]);
    }

    // Reset Timer
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

    // Update GUI
    if (gui) {
      gui.controllers.forEach(c => c.updateDisplay());
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
function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  ortho(-width / 2, width / 2, height / 2, -height / 2, -10000, 10000);

  try {
    easycam = createEasyCam();
    // 初期状態ではアニメーションモードなのでマウス操作を無効化
    if (easycam) easycam.removeMouseListeners();
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
            // Reset target to avoid immediate jump
            pos.target.x = pos.x;
            pos.target.y = pos.y;
            pos.target.z = pos.z;
            pos.is_moving = false;
          }
        } else {
          if (easycam) easycam.attachMouseListeners(canvas);
        }
      });
      gui.addColor(params, 'lightColor').name('Light Color');
      gui.addColor(params, 'materialColor').name('Material Color');
      gui.addColor(params, 'backgroundColor').name('Background Color');
      gui.add(params, 'ambientIntensity', 0, 255).name('Ambient Intensity');
      gui.add(params, 'save').name('Save PNG');
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


  background(params.backgroundColor);

  //  orbitControl();
  // camera.lookAt(0, 0, 0);


  // let dirX = (mouseX / width - 0.5) * 2;
  // let dirY = (mouseY / height - 0.5) * 2;
  ambientLight(params.ambientIntensity);
  let c = color(params.lightColor);
  directionalLight(c, 0.9, -0.9, -1);

  let mColor = color(params.materialColor);
  ambientMaterial(mColor);

  push();
  translate(0, 0, 0);

  noStroke();
  sphere(80);
  pop();

  push();
  translate(-140, 140, -140);
  noStroke();
  sphere(100 / 2);
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
}
