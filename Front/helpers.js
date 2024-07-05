function clearImage() {
  $("#photo").attr("src", "assets/images/default.png");
}

function setNewNameImage() {
  $("#photo").attr("src", "assets/images/newName.png");
}

function clearEmployer() {
  $("#employeeList").typeahead("val", "");
}

async function msgOk(txt) {
  await Swal.fire({
    title: txt,
    imageUrl: "./assets/images/success-96.png",
    customClass: {
      confirmButton: "save-btn",
    },
    buttonsStyling: false,
    color: "#4f85c6",
  });
}

async function msgWarning(txt) {
  await Swal.fire({
    title: txt,
    imageUrl: "./assets/images/warning-96.png",
    customClass: {
      confirmButton: "save-btn",
    },
    buttonsStyling: false,
    color: "#4f85c6",
  });
}
async function msgError(txt) {
  await Swal.fire({
    title: txt,
    imageUrl: "./assets/images/error-96.png",
    customClass: {
      confirmButton: "save-btn",
    },
    color: "red",
    buttonsStyling: false,
  });
}

async function msgConfirm(txt) {
  return await Swal.fire({
    title: txt,
    //text: txt,
    imageUrl: "./assets/images/question-96.png",
    showCancelButton: true,
    customClass: {
      confirmButton: "save-btn",
      cancelButton: "save-btn cancel",
    },
    buttonsStyling: false,
    color: "red",
    confirmButtonText: "Yes, it's new name",
    cancelButtonText: "No",
  }).then((result) => result.isConfirmed);
}
