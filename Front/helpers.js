function clearImage() {
  $("#photo").attr("src", "default.jpg");
}

function clearEmployer() {
  $("#employeeList").typeahead("val", "");
}
