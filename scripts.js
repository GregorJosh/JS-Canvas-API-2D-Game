var h1, prevBgColor;

window.onload = function () {
  h1 = document.getElementsByTagName("h1")[0];
  prevBgColor = h1.style.color;

  document.body.onpointermove = function () {
    h1.innerHTML = "Dajesz tam, dajesz!!!";
    h1.style.color = "white";
    document.body.style.backgroundColor = "black";

    console.log("Pointer moving...");
  };

  letsGo();
};

function letsGo() {
  setInterval(function () {
    h1.innerHTML = "Witaj Świecie!";
    h1.style.color = "black";
    document.body.style.backgroundColor = prevBgColor;
  }, 5000);
}
