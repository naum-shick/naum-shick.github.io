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
 * Last modified  : 2024-05-14
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

// block context menu on search icon
// $("#search-icon").on("contextmenu", (e) => searchIconContextMenu(e));
// $("#search-icon").on("touchstart", (e) => searchIconContextMenu(e));

$("body").on("contextmenu", () => false);

window.addEventListener("click", (e) => handleMenuClick(e, fetch_URL));

// -----------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------
window.addEventListener("load", getList);

let nameImages; // global name list + images id

let lastDateTime = Math.floor(Date.now() / (3600 * 24 * 1000)); // date only last start of check
setInterval(timerCheckChangeDateReload, 2000);

// check - may be, now next day (after sleep?)
function timerCheckChangeDateReload() {
  var dat = Math.floor(Date.now() / (3600 * 24 * 1000)); // date only last start of check

  if (dat > lastDateTime) {
    // if next day - reload
    location.reload();
  }
}

// get names list
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
    .bind("typeahead:selected", function (_obj, _datum, _name) {
      $("#employeeList").blur(); // make lost focus
      //setImage(datum);
    })

    .bind("typeahead:change", function (_obj, datum, _name) {
      setImage(datum);
    });
}

/**
 * Try set image by name; if name empty - clear; not found - new name
 * Image - from url
 * @param {String} name - name of user (Ivan Rabinovich)
 */
function setImage(name) {
  if (!name) {
    clearImage();
  } else {
    const ni = nameImages.find((x) => x.name == name);
    if (!ni) {
      //names not exist
      setNewNameImage();
    } else if (!ni.imageId) {
      // names exist - not exist image in server
      clearImage();
    } else {
      //exist image - set it
      const url = imageUrl.replace("#", ni.imageId);
      ////console.log(url);
      $("#photo").attr("src", url);
    }
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

/**
 * Save in google tables user/signature/shift
 * @param {int} shift
 * @returns
 */
async function saveSignature(shift) {
  const employee = $("#employeeList").val();

  if (employee.trim() == "") {
    await msgWarning("Please, enter client's name!");
    return;
  }

  let isInList = true;
  if (!nameImages.some((x) => x.name == employee)) {
    isInList = false;
    if (
      !(await msgConfirm("This name is not on the main list. Are you sure?"))
    ) {
      return;
    }
  }

  // resize image
  const rs = resizeCanvas(canvas);
  const tr = trimCanvas(rs);

  //if canvas empty - create message, exit
  if (!tr) {
    await msgWarning("Please sign!");
    return;
  }

  $(".loader").show();
  const dataURL = tr.toDataURL("image/png");

  console.log({ len: dataURL.length });

  const formData = new FormData();
  formData.append("Signature", dataURL);

  formData.append("Employee", employee);

  const signDate = $("#datepicker").val(); // string with original format

  formData.append("SignDate", signDate);

  formData.append("Shift", shift);

  formData.append("InList", isInList);

  const res = await fetch(fetch_URL, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  $(".loader").hide();
  if (data.status === "success") {
    await msgOk("Signature is done successfully");

    clearEmployer();
    clearCanvas(canvas, ctx);
    clearImage();

    ////console.log(data);
  } else {
    console.log(data);
    await msgError("Upss... error save signature");
  }
}

async function about() {
  await msgOk(
    "А вот это программу продолжают модифицировать Яна Шик и Наум Шик"
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
  if (data.status === "success") {
    await msgOk("Group/Calendar/Individual start successfully");

    ////console.log(data);
  } else {
    console.log(data);
    await msgError("Upss... error start make group");
  }
}

//block ontext menu on searchIcon - simple set focus to list
function searchIconContextMenu(e) {
  $("#employeeList").focus();
  e.preventDefault();
}
