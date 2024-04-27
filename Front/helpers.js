function clearImage() {
  $("#photo").attr("src", "assets/images/default.png");
}

function clearEmployer() {
  $("#employeeList").typeahead("val", "");
}
