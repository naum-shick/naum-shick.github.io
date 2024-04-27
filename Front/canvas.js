function adjustCanvas(canvas) {
  if (window.innerWidth > 1200) {
    canvas.setAttribute("width", "800");
    canvas.setAttribute("height", "300");
  }
  if (window.innerWidth <= 1200 && window.innerWidth > 980) {
    canvas.setAttribute("width", "650");
    canvas.setAttribute("height", "280");
  }
  if (window.innerWidth <= 980 && window.innerWidth > 480) {
    canvas.setAttribute("width", "500");
    canvas.setAttribute("height", "250");
  }
  if (window.innerWidth <= 480 || screen.width <= 480) {
    // console.log(`width <= 480`);
    canvas.setAttribute("width", "250");
    canvas.setAttribute("height", "300");
  }
}

const strokeSize = 5;
const color = 0;
let drawing = false;

function startDrawing(e, canvas, ctx) {
  drawing = true;
  ctx.beginPath();
  const rect = canvas.getBoundingClientRect();
  ctx.moveTo(e.clientX - rect.left.toFixed(), e.clientY - rect.top.toFixed());
}

function draw(e, canvas, ctx) {
  if (!drawing) {
    return;
  }

  const rect = canvas.getBoundingClientRect();

  e.preventDefault();
  ctx.lineWidth = strokeSize;
  ctx.lineCap = "round";

  if (e.type === "touchmove") {
    ctx.lineTo(
      e.touches[0].clientX - rect.left.toFixed(),
      e.touches[0].clientY - rect.top.toFixed()
    );
  } else if (e.type === "mousemove") {
    ctx.lineTo(e.clientX - rect.left.toFixed(), e.clientY - rect.top.toFixed());
  }

  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.beginPath();

  if (e.type === "touchmove") {
    ctx.moveTo(
      e.touches[0].clientX - rect.left.toFixed(),
      e.touches[0].clientY - rect.top.toFixed()
    );
  } else if (e.type === "mousemove") {
    ctx.moveTo(e.clientX - rect.left.toFixed(), e.clientY - rect.top.toFixed());
  }
}

function stopDrawing() {
  drawing = false;
}

function clearCanvas(canvas, ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //ctx.fillStyle = "white"; // only for jpeg
  //ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// /**
//  * resize canvas
//  * @param {canvas} canvas
//  * @param {Number} resizeWidth width new canvas
//  * @param {Number} resizeHeight height new canvas
//  * @returns {canvas} canvase with new size
//  */
const resizeWidth = 200;
const resizeHeight = 100;

function resizeCanvas(canvas) {
  var canvasResize = document.createElement("canvas");

  canvasResize.width = resizeWidth;
  canvasResize.height = resizeHeight;

  var ctxResize = canvasResize.getContext("2d", { willReadFrequently: true });
  ctxResize.drawImage(
    canvas,
    0,
    0,
    canvas.width,
    canvas.height,
    0,
    0,
    resizeWidth,
    resizeHeight
  );

  return canvasResize;
}

// from https://gist.github.com/timdown/021d9c8f2aabc7092df564996f5afbbf#file-trim_canvas-js
var trimCanvas = (function () {
  function rowBlank(imageData, width, y) {
    for (let x = 0; x < width; ++x) {
      if (imageData.data[y * width * 4 + x * 4 + 3] !== 0) return false;
    }
    return true;
  }

  function columnBlank(imageData, width, x, top, bottom) {
    for (let y = top; y < bottom; ++y) {
      if (imageData.data[y * width * 4 + x * 4 + 3] !== 0) return false;
    }
    return true;
  }

  return function (canvas) {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const width = canvas.width;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let top = 0,
      bottom = imageData.height,
      left = 0,
      right = imageData.width;

    while (top < bottom && rowBlank(imageData, width, top)) ++top;
    while (bottom - 1 > top && rowBlank(imageData, width, bottom - 1)) --bottom;
    while (left < right && columnBlank(imageData, width, left, top, bottom))
      ++left;
    while (
      right - 1 > left &&
      columnBlank(imageData, width, right - 1, top, bottom)
    )
      --right;

    if (left >= right || top >= bottom) {
      return null; //not exist image
    }

    const trimmed = ctx.getImageData(left, top, right - left, bottom - top);
    const copy = canvas.ownerDocument.createElement("canvas");
    const copyCtx = copy.getContext("2d");
    copy.width = trimmed.width;
    copy.height = trimmed.height;
    copyCtx.putImageData(trimmed, 0, 0);

    return copy;
  };
})();