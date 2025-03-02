// DOM elements

const DOM_CANVAS = document.querySelector("canvas");

// Colors

const SPACE_COLOR = [63, 63, 70];
const BASIS1_COLOR = [239, 68, 68];
const BASIS2_COLOR = [34, 197, 94];

// Values

let CANVAS_HAS_CHANGED = true;
let SCALE = 50;
let BASIS = [
  [[1], [0]], // basis 1
  [[0], [1]]  // bassi 2
];


// P5

function setup() {
  createCanvas(windowWidth + 200, windowHeight + 200, P2D, DOM_CANVAS);
}

function draw() {
  if (!CANVAS_HAS_CHANGED) {
    return;
  }

  translate(windowWidth / 2, windowHeight / 2);
  scale(1, -1);

  background(SPACE_COLOR);
  drawBasisArrows(BASIS);

  CANVAS_HAS_CHANGED = false;
}

function windowResized() {
  resizeCanvas(windowWidth + 200, windowHeight + 200);
  CANVAS_HAS_CHANGED = true;
}

// Canvas utils

function drawBasisArrows(basis) {
  drawArrow(0, 0, basis[0][0], basis[0][1], BASIS1_COLOR);
  drawArrow(0, 0, basis[1][0], basis[1][1], BASIS2_COLOR);
}

function drawArrow(x1, y1, x2, y2, color) {
  stroke(color);
  strokeWeight(3);
  fill(color);

  x1 = x1 * SCALE;
  x2 = x2 * SCALE;
  y1 = y1 * SCALE;
  y2 = y2 * SCALE;

  let angle = atan2(y2 - y1, x2 - x1);

  line(x1, y1, x2, y2);

  let arrowSize = 8;

  let x3 = x2 - arrowSize * cos(angle - PI / 6);
  let y3 = y2 - arrowSize * sin(angle - PI / 6);
  let x4 = x2 - arrowSize * cos(angle + PI / 6);
  let y4 = y2 - arrowSize * sin(angle + PI / 6);

  triangle(x2, y2, x3, y3, x4, y4);
}
