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

// make fetch url from command line
const paramsString = window.location.href;
const url = new URL(paramsString);
const params = url.searchParams.get("q");
const fetch_URL = `https://script.google.com/macros/s/${params}/exec`; // deploy version
////const fetch_URL = `https://script.google.com/macros/s/${params}/dev`; // developer version
const imageUrl = "https://drive.google.com/thumbnail?id=#&sz=w256";

const canvas = $("#signatureCanvas").get(0);
const ctx = canvas.getContext("2d");

window.addEventListener("resize", () => adjustCanvas(canvas));
adjustCanvas(canvas); // for define size onOpen

canvas.addEventListener("mousedown", (e) => startDrawing(e, canvas, ctx));
canvas.addEventListener("mousemove", (e) => draw(e, canvas, ctx));
canvas.addEventListener("mouseup", () => stopDrawing());
canvas.addEventListener("mouseout", () => stopDrawing());

canvas.addEventListener("touchstart", (e) => startDrawing(e, canvas, ctx));
canvas.addEventListener("touchmove", (e) => draw(e, canvas, ctx));
canvas.addEventListener("touchend", () => stopDrawing());
canvas.addEventListener("touchcancel", () => stopDrawing());

$("#clearCanvasBtn").on("click", () => clearCanvas(canvas, ctx));

window.addEventListener("click", (e) => handleMenuClick(e, fetch_URL));

// -----------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------
window.addEventListener("load", getList);

let nameImages;

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
    clearCanvas(canvas, ctx);
  }
}
// todo: to another file
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
function setImage(name) {
  const ni = nameImages.find((x) => x.name == name);
  if (ni.imageId != undefined) {
    const url = imageUrl.replace("#", ni.imageId);
    ////console.log(url);
    $("#photo").attr("src", url);
  } else {
    $("#photo").attr("src", "default.png");
  }
}
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------

//datepicker
$(function () {
  $("#datepicker")
    .datepicker({
      minDate: "-1m",
      maxDate: "0d",
    })
    .datepicker("setDate", "0d"); // today
});

async function saveSignature(shift) {
  const employee = $("#employeeList").val();
  if (employee.trim() == "") {
    blurt("Please, enter employee name!", "", "warning");
    return;
  }

  //todo: if name empty - create message, exit
  // resize image
  const rs = resizeCanvas(canvas);
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
    cclearCanvas(canvas, ctx);
    clearImage();

    ////console.log(data);
  } else {
    console.log(data);
    blurt("Upss... error save signature", "", "error");
  }
}

function about() {
  blurt(
    "Signature",
    "А вот это программу так еще не доделали Яна Шик и Наум Шик",
    "info"
  );
}

async function makeGroup(fetch_URL) {
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
