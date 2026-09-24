document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js");
window.addEventListener("load", () => {
  const preloader = document.querySelector(".preloader");
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add("hidden");
    }, 1000);
  }
});
