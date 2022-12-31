window.onload = function () {
  document.body.onpointermove = function () {
    document.getElementsByTagName("h1")[0].innerHTML = "Dajesz tam, dajesz!!!";
    console.log("Pointer moving...");
  };

  start();
};

function start() {
    setInterval(function () {
        document.getElementsByTagName("h1")[0].innerHTML = "Witaj Świecie!";
    }, 5000);
}