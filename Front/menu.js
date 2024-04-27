let dropdown = document.querySelector(".dropdown");

function toggle() {
  dropdown.classList.toggle("active");
}

function closeMenu() {
  if ($(".dropdown").hasClass("active")) toggle(); // turn off
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

export function handleMenuClick(e, fetch_URL) {
  //todoL: to function
  //console.log(e.target.classList);
  if (e.target.classList.contains("no-close-menu")) {
    //todo: rename no-close-menu - to nomal name; all - open menu
    toggle(); //todo: replace toggel to open/close?
    return;
  }

  closeMenu();

  if (e.target.id == "menuMakeGroup") {
    makeGroup(fetch_URL);
  } else if (e.target.id == "menuAbout") {
    about();
  }
}
