/**
 * Copyright (c) 2024
 *
 * Script for:
 * - get namelist from google sheet (publish script)
 * - select name
 * - make signature
 * - save signature in google sheet
 *
 * @summary make signature and save in google sheet
 * @author Yana Shick, Naum Shick
 *
 * Created at     : 2024-03-14
 * Last modified  : 2024-03-19
 */

const canvas = document.getElementById("signatureCanvas");
const ctx = canvas.getContext("2d");
const strokeSize = 5;
const color = 0;
const resizeWidth = 200;
const resizeHeight = 100;

let drawing = false;

window.addEventListener("resize", adjustCanvas);
adjustCanvas();

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

canvas.addEventListener("touchstart", startDrawing);
canvas.addEventListener("touchend", stopDrawing);
canvas.addEventListener("touchcancel", stopDrawing);
canvas.addEventListener("touchmove", draw);

window.addEventListener("load", getList);

window.addEventListener("click", function (e) {
  //todoL: to function
  //console.log(e.target.classList);
  if (e.target.classList.contains("no-close-menu")) {
    //todo: rename no-close-menu - to nomal name; all - open menu
    toggle(); //todo: replace toggel to open/close?
    return;
  }

  closeMenu();

  if (e.target.id == "menuMakeGroup") {
    makeGroup();
  } else if (e.target.id == "menuAbout") {
    about();
  }
});

function startDrawing(e) {
  drawing = true;
  ctx.beginPath();
  const rect = canvas.getBoundingClientRect();
  ctx.moveTo(e.clientX - rect.left.toFixed(), e.clientY - rect.top.toFixed());
}

function draw(e) {
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

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //ctx.fillStyle = "white"; // only for jpeg
  //ctx.fillRect(0, 0, canvas.width, canvas.height);
}

//from https://gist.github.com/timdown/021d9c8f2aabc7092df564996f5afbbf#file-trim_canvas-js
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

/**
 * resize canvas
 * @param {canvas} canvas
 * @param {Number} resizeWidth width new canvas
 * @param {Number} resizeHeight height new canvas
 * @returns {canvas} canvase with new size
 */
function resizeCanvas(canvas, resizeWidth, resizeHeight) {
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

function adjustCanvas() {
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

// make fetch url from command line
const paramsString = window.location.href;
const url = new URL(paramsString);
const params = url.searchParams.get("q");
const fetch_URL = `https://script.google.com/macros/s/${params}/exec`; // deploy version
////const fetch_URL = `https://script.google.com/macros/s/${params}/dev`; // developer version
const imageUrl = "https://drive.google.com/thumbnail?id=#&sz=w256";

let nameImages;

async function saveSignature(shift) {
  const employee = $("#employeeList").val();
  if (employee.trim() == "") {
    blurt("Please, enter employee name!", "", "warning");
    return;
  }

  //todo: if name empty - create message, exit
  // resize image
  const rs = resizeCanvas(canvas, resizeWidth, resizeHeight);
  const tr = trimCanvas(rs);

  if (!tr) {
    blurt("Please sign!", "", "warning");
    return;
  }

  //if canvas empty - create message, exit

  $(".loader").show();
  const dataURL = tr.toDataURL("image/png");

  console.log({ len: dataURL.length });

  const formData = new FormData();
  formData.append("Signature", dataURL);

  formData.append("Employee", employee);

  const signDate = $("#datepicker").val(); // string with original format

  formData.append("SignDate", signDate);

  formData.append("Shift", shift);

  const res = await fetch(fetch_URL, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  $(".loader").hide();
  if (data.result === "success") {
    blurt("Signature is done successfully", "", "success");

    clearEmployer();
    clearCanvas();
    clearImage();

    ////console.log(data);
  } else {
    console.log(data);
    blurt("Upss... error save signature", "", "error");
  }
}

async function getList() {
  const formData = new FormData();
  formData.append("getList", "getList");

  const res = await fetch(fetch_URL, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  ////console.log(data);
  if (data.row !== undefined) {
    nameImages = data.row;

    ////console.log(JSON.stringify(nameImages)); //debug names/images

    const listNames = nameImages.map((val) => val.name);
    namesMatcher(listNames);

    // after load -  typeahead input

    $("#employeeList").removeAttr("disabled");
    $("#employeeList").addClass("typeahead-enabled");

    $(".loader").hide();
    clearCanvas();
  }
}

function about() {
  blurt(
    "Signature",
    "А вот это программу так еще не доделали Яна Шик и Наум Шик",
    "info"
  );
}
async function makeGroup() {
  $(".loader").show();
  const formData = new FormData();
  formData.append("makeGroup", "makeGroup");

  const res = await fetch(fetch_URL, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  $(".loader").hide();
  if (data.result === "success") {
    blurt("Group Sheet start successfully", "", "success");

    ////console.log(data);
  } else {
    console.log(data);
    blurt("Upss... error start make group", "", "error");
  }
}

function namesMatcher(listNames) {
  const substringMatcher = function (strs) {
    return function findMatches(q, cb) {
      // an array that will be populated with substring matches
      var matches = [];
      // regex used to determine if a string contains the substring `q`
      var substringRegex = new RegExp(q, "i");
      // iterate through the pool of strings and for any string that
      // contains the substring `q`, add it to the `matches` array
      $.each(strs, function (_i, str) {
        if (substringRegex.test(str)) {
          matches.push(str);
        }
      });
      //console.log(matches);
      cb(matches);
    };
  };

  $("#scrollable-dropdown-menu .typeahead")
    .typeahead(
      {
        hint: true,
        highlight: true,
        minLength: 1,
      },
      {
        name: "listNames",
        limit: 10,
        source: substringMatcher(listNames),
      }
    )
    .bind("typeahead:selected", function (_obj, datum, _name) {
      $("#employeeList").blur();
      setImage(datum);
    });
}

function clearEmployer() {
  $("#employeeList").typeahead("val", "");
}

//datepicker
$(function () {
  $("#datepicker")
    .datepicker({
      minDate: "-1m",
      maxDate: "0d",
    })
    .datepicker("setDate", "0d"); // today
});

function clearImage() {
  $("#photo").attr("src", "default.jpg");
}

function setImage(name) {
  const ni = nameImages.find((x) => x.name == name);
  if (ni.imageId != undefined) {
    const url = imageUrl.replace("#", ni.imageId);
    ////console.log(url);
    $("#photo").attr("src", url);
  } else {
    $("#photo").attr("src", "default.jpg");
  }
}
////// menu
let dropdown = document.querySelector(".dropdown");

function closeMenu() {
  if ($(".dropdown").hasClass("active")) toggle(); // turn off
}
function toggle() {
  dropdown.classList.toggle("active");
}
