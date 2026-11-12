document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js");
window.addEventListener("load", () => {
  const preloader = document.querySelector(".preloader");

  preloader.classList.add("hidden");
});
