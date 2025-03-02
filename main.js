// DOM elements

const DOM_CANVAS = document.querySelector("canvas");
const DOM_TRANSFROMATION_MATRIX = document.querySelector(".transformation-matrix");
const DOM_MODE_BUTTONS = document.querySelectorAll(".header-bottom input");
const DOM_INSTRUCTION_TEXT = document.querySelector(".instruction-text");
const DOM_PLAY_TRANSFORMATION_BUTTON = document.querySelector(".transformation-play-button");

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
let CURRENT_MODE = "free-movement-mode";
let DELTA_ROTATION = 1;
let DELTA_SCALE = 0.01;
let TARGET_ROTATION = [null, null];
let TARGET_SCALE = [null, null];
let STATE = "idle";

// P5

function setup() {
  DOM_MODE_BUTTONS[0].click();
  DOM_PLAY_TRANSFORMATION_BUTTON.addEventListener("click", playTransformation);

  createCanvas(windowWidth + 200, windowHeight + 200, P2D, DOM_CANVAS);
  BASIS[0] = createVector(1, 0);
  BASIS[1] = createVector(0, 1);
  INITIAL_BASIS[0] = createVector(1, 0);
  INITIAL_BASIS[1] = createVector(0, 1);

  DOM_MODE_BUTTONS.forEach(button => {
    button.addEventListener("change", (e) => {
      CURRENT_MODE = e.target.value;
      domChangeMode(e.target.value);
    })
  })

  domChangeMode(CURRENT_MODE);
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

  if (STATE === "rotating") {
    if (TARGET_ROTATION[0] === 0 && TARGET_ROTATION[1] === 0) {
      STATE = "scaling";
    }

    if (TARGET_ROTATION[0] !== 0) {
      if (abs(TARGET_ROTATION[0]) < DELTA_ROTATION) {
        applyTransformation(BASIS[0], rotationMatrix(TARGET_ROTATION[0]))
        TARGET_ROTATION[0] = 0;
      }
      else {
        const direction = abs(TARGET_ROTATION[0]) / TARGET_ROTATION[0];
        applyTransformation(BASIS[0], rotationMatrix(DELTA_ROTATION * direction));
        TARGET_ROTATION[0] -= DELTA_ROTATION * direction;
      }
    }

    if (TARGET_ROTATION[1] !== 0) {
      if (abs(TARGET_ROTATION[1]) < DELTA_ROTATION) {
        applyTransformation(BASIS[1], rotationMatrix(TARGET_ROTATION[1]))
        TARGET_ROTATION[1] = 0;
      }
      else {
        const direction = abs(TARGET_ROTATION[1]) / TARGET_ROTATION[1];
        applyTransformation(BASIS[1], rotationMatrix(DELTA_ROTATION * direction));
        TARGET_ROTATION[1] -= DELTA_ROTATION * direction;
      }
    }
  }
  else if (STATE === "scaling") {
    if (TARGET_SCALE[0] === 0 && TARGET_SCALE[1] === 0) {
      STATE = "idle";
    }

    if (TARGET_SCALE[0] !== 0) {
      if (abs(TARGET_SCALE[0]) < DELTA_SCALE) {
        const direction = abs(TARGET_SCALE[0]) / TARGET_SCALE[0];
        applyTransformation(BASIS[0], scalingMatrix(1 + TARGET_SCALE[0] / magnitude(BASIS[0]) * direction));
        TARGET_SCALE[0] = 0;
      }
      else {
        const direction = abs(TARGET_SCALE[0]) / TARGET_SCALE[0];
        applyTransformation(BASIS[0], scalingMatrix(1 + DELTA_SCALE / magnitude(BASIS[0]) * direction));
        TARGET_SCALE[0] -= DELTA_SCALE * direction;
      }
    }

    if (TARGET_SCALE[1] !== 0) {
      if (abs(TARGET_SCALE[1]) < DELTA_SCALE) {
        const direction = abs(TARGET_SCALE[1]) / TARGET_SCALE[1];
        applyTransformation(BASIS[1], scalingMatrix(1 + TARGET_SCALE[1] / magnitude(BASIS[1]) * direction));
        TARGET_SCALE[1] = 0;
      }
      else {
        const direction = abs(TARGET_SCALE[1]) / TARGET_SCALE[1];
        applyTransformation(BASIS[1], scalingMatrix(1 + DELTA_SCALE / magnitude(BASIS[1]) * direction));
        TARGET_SCALE[1] -= DELTA_SCALE * direction;
      }
    }
  }
  else {
    CANVAS_HAS_CHANGED = false;
  }
}

function windowResized() {
  resizeCanvas(windowWidth + 200, windowHeight + 200);
  CANVAS_HAS_CHANGED = true;
}

function mouseMoved() {
  if (CURRENT_MODE !== "free-movement-mode") {
    return;
  }

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
  if (CURRENT_MODE !== "free-movement-mode") {
    return;
  }

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
    domSetMatrix(DOM_TRANSFROMATION_MATRIX, basisToMatrix(BASIS), "span");
  }
  else if (BASIS_HANDLE_ACTIVE[1]) {
    BASIS[1].set(col, row);
    CANVAS_HAS_CHANGED = true;
    domSetMatrix(DOM_TRANSFROMATION_MATRIX, basisToMatrix(BASIS), "span");
  }
}

function playTransformation() {
  BASIS[0].set(1, 0);
  BASIS[1].set(0, 1);

  const transformation = domGetMatrix(DOM_TRANSFROMATION_MATRIX);

  TARGET_ROTATION[0] = (atan2(transformation[1][0], transformation[0][0]) - atan2(0, 1)) * RAD_TO_DEG;
  TARGET_ROTATION[1] = (atan2(transformation[1][1], transformation[0][1]) - atan2(1, 0)) * RAD_TO_DEG;

  TARGET_SCALE[0] = sqrt(pow(transformation[1][0], 2) + pow(transformation[0][0], 2)) - 1;
  TARGET_SCALE[1] = sqrt(pow(transformation[1][1], 2) + pow(transformation[0][1], 2)) - 1;

  STATE = "rotating";
  CANVAS_HAS_CHANGED = true;
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

// DOM utils

function domGetMatrix(element) {
  const matrix = [
    [Number(element.children[0].value), Number(element.children[1].value)],
    [Number(element.children[2].value), Number(element.children[3].value)],
  ];

  return matrix;
}

function domSetMatrix(element, matrix, childElementName) {
  element.replaceChildren();

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      let item = document.createElement(childElementName);
      if (childElementName === "input") {
        item.value = matrix[i][j];
        item.classList.add("matrix-input")
        item.addEventListener("input", () => {
          domValidateInputTransformation();
        })
      }
      else {
        item.innerText = matrix[i][j];
      }
      element.appendChild(item);
    }
  }
}

function domChangeMode(mode) {
  BASIS[0].set(1, 0);
  BASIS[1].set(0, 1);

  document.querySelector("body").dataset.mode = mode;
  if (mode === "free-movement-mode") {
    DOM_INSTRUCTION_TEXT.innerText = "Click and drag the heads of the basis vectors to see the required transformation";
    domSetMatrix(DOM_TRANSFROMATION_MATRIX, basisToMatrix(BASIS), "span");
  }
  else {
    DOM_INSTRUCTION_TEXT.innerText = "Input required transformation matrix and click play"
    domSetMatrix(DOM_TRANSFROMATION_MATRIX, basisToMatrix(BASIS), "input");
  }
  CANVAS_HAS_CHANGED = true;
}

function domValidateInputTransformation() {
  let isInvalid = false;

  const inputs = document.querySelectorAll(".matrix-input");
  inputs.forEach(input => {
    if (isNaN(Number(input.value)) || input.value === "") {
      isInvalid = true;
    }
  })

  DOM_PLAY_TRANSFORMATION_BUTTON.disabled = isInvalid;
}

// Math utils

function basisToMatrix(basis) {
  return [ [basis[0].x, basis[1].x], [basis[0].y, basis[1].y]];
}

function applyTransformation(basis, mat) {
  const a = mat[0][0];
  const b = mat[0][1];
  const c = mat[1][0];
  const d = mat[1][1];

  let e = basis.x;
  let f = basis.y;

  basis.set(a*e + b*f, c*e + d*f);
  return basis;
}

function rotationMatrix(degrees) {
  let theta = radians(degrees);
  return [
    [cos(theta), -sin(theta)],
    [sin(theta), cos(theta)]
  ];
}

function scalingMatrix(scale) {
  return [
    [scale, 0],
    [0, scale]
  ]
}

function magnitude(basis) {
  return sqrt(basis.x * basis.x + basis.y * basis.y);
}
