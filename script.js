/**
 * Copyright (c) 2017
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
}
300;
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
const fetch_URL = `https://script.google.com/macros/s/${params}/exec`;
const imageUrl = "https://drive.google.com/thumbnail?id=#&sz=w1000";

let nameImages;

async function saveSignature(shift) {
  const dataURL = canvas.toDataURL();

  const formData = new FormData();
  formData.append("Signature", dataURL);

  const employee = $("#employeeList").val();
  formData.append("Employee", employee);

  const signDate = $("#datepicker").val(); // string with original format

  formData.append("SignDate", signDate);

  formData.append("Shift", shift);

  const res = await fetch(fetch_URL, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (data.result === "success") {
    clearCanvas();
    $("#employeeList").val("");
    console.log(data);
    alert("Signature is done successfully");
  } else {
    console.log(data);
    alert("Error");
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
    const listNames = nameImages.map((val) => val.name);
    namesMatcher(listNames);

    // // // {
    // // //   const listNames = ["aaa", "asdd", "asd", "bbb"];
    // // //   namesMatcher(listNames);

    // after load - convert "Loading..." to work typeahead imput

    $("#employeeList").removeAttr("disabled");
    $("#employeeList").addClass("typeahead-enabled");
    $("#employeeList").attr("placeholder", "Type a name");
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
      setImage(datum);
    });

  //datepicker
  $(function () {
    $("#datepicker")
      .datepicker({
        minDate: "-1m",
        maxDate: "1d",
      })
      .datepicker("setDate", "0d"); // today
  });

  function setImage(name) {
    const ni = nameImages.find((x) => x.name == name);
    if (ni.imageId != undefined) {
      const url = imageUrl.replace("#", ni.imageId);
      console.log(url);
      $("#photo").attr("src", url);
    } else {
      $("#photo").attr("src", "default.jpg");
    }
  }
}
