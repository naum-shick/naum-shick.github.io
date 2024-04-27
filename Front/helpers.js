export function clearImage() {
  $("#photo").attr("src", "default.jpg");
}

export function clearEmployer() {
  $("#employeeList").typeahead("val", "");
}
