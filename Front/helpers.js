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
    //text: "Little font text",
    icon: "success",
  });
}

async function msgWarning(txt) {
  await Swal.fire({
    title: txt,
    icon: "warning",
  });
}
async function msgError(txt) {
  await Swal.fire({
    title: txt,
    icon: "error",
  });
}

async function msgConfirm(txt) {
  return await Swal.fire({
    title: txt,
    //text: txt,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, it's new name",
    cancelButtonText: "No",
  }).then((result) => result.isConfirmed);
}
