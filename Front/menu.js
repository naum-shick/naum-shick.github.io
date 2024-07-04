let dropdown = document.querySelector(".dropdown");

function toggle() {
  dropdown.classList.toggle("active");
}

function closeMenu() {
  if ($(".dropdown").hasClass("active")) toggle(); // turn off
}

async function handleMenuClick(e, fetch_URL) {
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
    await about();
  }
}
