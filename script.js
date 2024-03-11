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

function adjustCanvas() {
  if (window.innerWidth > 1200) {
    canvas.setAttribute("width", "800");
    canvas.setAttribute("height", "400");
  }
  if (window.innerWidth <= 1200 && window.innerWidth > 980) {
    canvas.setAttribute("width", "650");
    canvas.setAttribute("height", "325");
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

const URL =
  "https://script.google.com/macros/s/AKfycbyHrrbgQx2Opd1zsm3GhHwFzvqDWAZ9PWqFTx7hsT-EyGc5ZFgvGnqtIEE8y38UPD7B/exec"


async function saveSignature() {
  const dataURL = canvas.toDataURL();
  const formData = new FormData();
  formData.append("Signature", dataURL);
  const employee = document.getElementById("employeeList").value;
  formData.append("Employee", employee);
  const res = await fetch(URL, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (data.result === "success") {
    clearCanvas();
    console.log(data);
    alert("Signature is done successfully");
  } else {
    console.log(data);
    alert("Error");
  }
}

async function getList() {
  //   console.log(`i am in`);
  const formData = new FormData();
  formData.append("getList", "getList");
  const res = await fetch(URL, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  console.log(data);
  if (data.row !== undefined) {
    data.row.forEach((element) => {
      let newOption = document.createElement("option");
      newOption.setAttribute("value", element);
      newOption.setAttribute("class", "listItem");
      newOption.innerHTML = element;
      document.getElementById("employeeList").appendChild(newOption);
    });
  }
}
