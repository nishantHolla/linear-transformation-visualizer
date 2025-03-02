// DOM elements

const DOM_CANVAS = document.querySelector("canvas");

// Colors

const SPACE_COLOR = [63, 63, 70];
const BASIS1_COLOR = [239, 68, 68];
const BASIS2_COLOR = [34, 197, 94];
const GRID_COLOR = [3, 7, 18];
const INITIAL_GRID_COLOR = [3, 7, 18, 80];
const HANDLE_COLOR = [253, 224, 71];

// Values

let CANVAS_HAS_CHANGED = true;
let SCALE = 50;
let BASIS = [null, null];
let INITIAL_BASIS = [null, null];
let BASIS_HANDLE_ACTIVE = [false, false];
let MOUSE_TOLERANCE = 0.2;

// P5

function setup() {
  createCanvas(windowWidth + 200, windowHeight + 200, P2D, DOM_CANVAS);
  BASIS[0] = createVector(1, 0);
  BASIS[1] = createVector(0, 1);
  INITIAL_BASIS[0] = createVector(1, 0);
  INITIAL_BASIS[1] = createVector(0, 1);
}

function draw() {
  if (!CANVAS_HAS_CHANGED) {
    return;
  }

  translate(windowWidth / 2, windowHeight / 2);
  scale(1, -1);
  cursor(ARROW);

  background(SPACE_COLOR);
  drawBasisGrid(BASIS, GRID_COLOR);
  drawBasisGrid(INITIAL_BASIS, INITIAL_GRID_COLOR);
  drawBasisArrows(BASIS);
  drawBasisHandles(BASIS);

  CANVAS_HAS_CHANGED = false;
}

function windowResized() {
  resizeCanvas(windowWidth + 200, windowHeight + 200);
  CANVAS_HAS_CHANGED = true;
}

function mouseMoved() {
  const col = (mouseX - (windowWidth / 2)) / SCALE;
  const row = ((windowHeight / 2) - mouseY) / SCALE;

  if (abs(col - BASIS[0].x) < MOUSE_TOLERANCE &&
      abs(row - BASIS[0].y) < MOUSE_TOLERANCE) {
    BASIS_HANDLE_ACTIVE[0] = true;
    CANVAS_HAS_CHANGED = true;
  }
  else if (BASIS_HANDLE_ACTIVE[0] === true) {
    BASIS_HANDLE_ACTIVE[0] = false;
    CANVAS_HAS_CHANGED = true;
  }

  if (abs(col - BASIS[1].x) < MOUSE_TOLERANCE &&
      abs(row - BASIS[1].y) < MOUSE_TOLERANCE) {
    BASIS_HANDLE_ACTIVE[1] = true;
    CANVAS_HAS_CHANGED = true;
  }
  else if (BASIS_HANDLE_ACTIVE[1] === true) {
    BASIS_HANDLE_ACTIVE[1] = false;
    CANVAS_HAS_CHANGED = true;
  }
}

function mouseDragged() {
  let col = (mouseX - (windowWidth / 2)) / SCALE;
  const nearestCol = round(col);
  let row = ((windowHeight / 2) - mouseY) / SCALE;
  const nearestRow = round(row);

  if (abs(col - nearestCol) < 0.1) {
    col = nearestCol;
  }

  if (abs(row - nearestRow) < 0.1) {
    row = nearestRow;
  }

  if (BASIS_HANDLE_ACTIVE[0]) {
    BASIS[0].set(col, row);
    CANVAS_HAS_CHANGED = true;
  }
  else if (BASIS_HANDLE_ACTIVE[1]) {
    BASIS[1].set(col, row);
    CANVAS_HAS_CHANGED = true;
  }
}

// Canvas utils

function drawBasisArrows(basis) {
  drawArrow(0, 0, basis[0].x, basis[0].y, BASIS1_COLOR);
  drawArrow(0, 0, basis[1].x, basis[1].y, BASIS2_COLOR);
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

function drawBasisGrid(basis, color) {
  stroke(color);

  let cols = ceil(windowWidth / 2);
  let rows = ceil(windowHeight / 2);

  for (let i = -cols; i <= cols; i++) {
    strokeWeight( (i === 0) ? 2 : 1 );
    let start = p5.Vector.mult(basis[1], -rows)
      .add(p5.Vector.mult(basis[0], i))
      .mult(SCALE);

    let end = p5.Vector.mult(basis[1], rows)
      .add(p5.Vector.mult(basis[0], i))
      .mult(SCALE);

    line(start.x, start.y, end.x, end.y);
  }

  for (let j = -rows; j <= rows; j++) {
    strokeWeight( (j === 0) ? 2 : 1 );
    let start = p5.Vector.mult(basis[0], -cols)
      .add(p5.Vector.mult(basis[1], j))
      .mult(SCALE);

    let end = p5.Vector.mult(basis[0], cols)
      .add(p5.Vector.mult(basis[1], j))
      .mult(SCALE);

    line(start.x, start.y, end.x, end.y);
  }
}

function drawBasisHandles(basis) {
  stroke(HANDLE_COLOR);
  strokeWeight(6);

  if (BASIS_HANDLE_ACTIVE[0]) {
    point(BASIS[0].x * SCALE, BASIS[0].y * SCALE);
    cursor(HAND);
  }
  else if (BASIS_HANDLE_ACTIVE[1]) {
    point(BASIS[1].x * SCALE, BASIS[1].y * SCALE);
    cursor(HAND);
  }
}
