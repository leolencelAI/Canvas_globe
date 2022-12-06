/* Loader */
setTimeout(() => {
    document.querySelector(".loader").style.display = "none"
}, 2000)

/* CANVAS */
const canvas = document.querySelector('#medusa-stage');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
const ctx = canvas.getContext('2d');

if (window.devicePixelRatio > 1) {
  canvas.width = canvas.clientWidth * 2;
  canvas.height = canvas.clientHeight * 2;
  ctx.scale(2, 2);
}

let width = canvas.clientWidth; 
let height = canvas.clientHeight;
let rotation = 0; 
let dots = []; 

let DOTS_AMOUNT = window.screen.width;
let DOT_RADIUS = 3; 
let GLOBE_RADIUS = width * 0.7; 
let GLOBE_CENTER_Z = -GLOBE_RADIUS; 
let PROJECTION_CENTER_X = width / 2; 
let PROJECTION_CENTER_Y = height / 2; 
let FIELD_OF_VIEW = width * 0.8;

class Dot {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    
    this.xProject = 0;
    this.yProject = 0;
    this.sizeProjection = 0;
    this.alpha = 1;
    this.iteration = 0;
  }
 
  // Do some math to project the 3D position into the 2D canvas and draw the dots
  project(sin, cos) {
    const rotX = cos * this.x + sin * (this.z - GLOBE_CENTER_Z);
    const rotZ = -sin * this.x + cos * (this.z - GLOBE_CENTER_Z) + GLOBE_CENTER_Z;
    this.sizeProjection = FIELD_OF_VIEW / (FIELD_OF_VIEW - rotZ);
    this.xProject = (rotX * this.sizeProjection) + PROJECTION_CENTER_X;
    this.yProject = (this.y * this.sizeProjection) + PROJECTION_CENTER_Y;
  }

  draw(sin, cos) {
    this.project(sin, cos);
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(this.xProject, this.yProject, DOT_RADIUS * this.sizeProjection, 0, Math.PI * 2);
    ctx.fillStyle = "#0984e3";
    ctx.fill();
    ctx.closePath();
  }

  implosion() {
    this.xProject -= (this.xProject - PROJECTION_CENTER_X)/100;
    this.yProject -= (this.yProject  - PROJECTION_CENTER_Y)/100;
    this.alpha -= 0.01;
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.xProject, this.yProject, DOT_RADIUS * this.sizeProjection*this.alpha, 0, Math.PI * 2);
    ctx.fillStyle = "#0984e3";
    ctx.fill();
    ctx.closePath();
  }

  // Do some math to project the 3D position into the 2D canvas and draw the lines
  projectline(sin, cos) {
    const rotX = cos * this.x + sin * (this.z - GLOBE_CENTER_Z);
    const rotZ = -sin * this.x + cos * (this.z - GLOBE_CENTER_Z) + GLOBE_CENTER_Z;
    this.sizeProjection = FIELD_OF_VIEW / (FIELD_OF_VIEW - rotZ);
    this.xProject = (rotX * this.sizeProjection) + PROJECTION_CENTER_X;
    this.yProject = (this.y *this.sizeProjection) + PROJECTION_CENTER_Y;
    this.xProject = PROJECTION_CENTER_X + (((this.xProject - PROJECTION_CENTER_X)/100)*this.iteration)
    this.yProject = PROJECTION_CENTER_Y + (((this.yProject - PROJECTION_CENTER_Y)/100)*this.iteration)
    
    if (this.iteration < 100) {
      this.iteration += 1
    }
  }

  drawline(sin, cos) {
    this.projectline(sin, cos);
    var grad= ctx.createLinearGradient(PROJECTION_CENTER_X, PROJECTION_CENTER_Y, this.xProject, this.yProject);
    grad.addColorStop(0, "white");
    grad.addColorStop(1, "#0984e3");
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(PROJECTION_CENTER_X, PROJECTION_CENTER_Y);
    ctx.lineTo(this.xProject, this.yProject);
    ctx.stroke(); 
  }
}

function createDots() {
  dots.length = 0;
  
  for (let i = 0; i < DOTS_AMOUNT; i++) {
    const theta = Math.random() * 2 * Math.PI; // Random value between [0, 2PI]
    const phi = Math.acos((Math.random() * 2) - 1); // Random value between [-1, 1]
    
    const x = GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta);
    const y = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta);
    const z = (GLOBE_RADIUS * Math.cos(phi)) + GLOBE_CENTER_Z;
    dots.push(new Dot(x, y, z));
  }
}

function render(a) {
  ctx.clearRect(0, 0, width, height);
  speed = 0.0002
  rotation = a * speed;
  
  const sineRotation = Math.sin(-rotation);
  const cosineRotation = Math.cos(rotation);
  
  for (var i = 0; i < dots.length; i++) {
    dots[i].draw(sineRotation, cosineRotation);
  }
  
  if ($('#medusa-stage').is(':hover')) {
      window.requestAnimationFrame(renderhover);
  } else {
      window.requestAnimationFrame(render);
  }
}

function renderhover() { 
  if ($('#medusa-stage').is(':hover')) {
    ctx.clearRect(0, 0, width, height);
    dots.forEach((dot, i) => {
        dot.implosion()
      })

    if (dots[0].alpha - 0.01 > 0) {
      window.requestAnimationFrame(renderhover);
    } else {
      ctx.globalAlpha = 1;
      window.requestAnimationFrame(renderline);
    } 
  } else {
    createDots();
    window.requestAnimationFrame(render);
  } 
}

function renderline(a) {
  if ($('#medusa-stage').is(':hover')) {
    ctx.clearRect(0, 0, width, height);

    speed = 0.0002
    rotation = a * speed;

    const sineRotation = Math.sin(-rotation); 
    const cosineRotation = Math.cos(rotation); 

    for (let i = 0; i < dots.length; i += 8) {
      dots[i].drawline(sineRotation, cosineRotation);
    }

    window.requestAnimationFrame(renderline);
  } else {
    createDots();
    window.requestAnimationFrame(render);
  }
}

function afterResize () {
  width = canvas.offsetWidth;
  height = canvas.offsetHeight;
  if (window.devicePixelRatio > 1) {
    canvas.width = canvas.clientWidth * 2;
    canvas.height = canvas.clientHeight * 2;
    ctx.scale(2, 2);
  } else {
    canvas.width = width;
    canvas.height = height;
  }
  if (window.screen.width<400) {
    DOT_RADIUS = 1
  } else if (400<window.screen.width && window.screen.width<1000){
    DOT_RADIUS = 2
  } else {
    DOT_RADIUS = 3
  }

  DOTS_AMOUNT = window.screen.width;
  GLOBE_RADIUS = width * 0.7;
  GLOBE_CENTER_Z = -GLOBE_RADIUS;
  PROJECTION_CENTER_X = width / 2;
  PROJECTION_CENTER_Y = height / 2;
  FIELD_OF_VIEW = width * 0.8;
  
  createDots();
}

window.addEventListener('resize', afterResize);

createDots();

if ($('#medusa-stage').is(':hover')) {
    window.requestAnimationFrame(renderhover);
} else {
    window.requestAnimationFrame(render);
}