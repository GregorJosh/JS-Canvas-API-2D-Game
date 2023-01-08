class Rectangle {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  draw(context) {
    context.beginPath();
    context.strokeStyle = this.color;
    context.moveTo(this.x, this.y);
    context.lineTo(this.x + this.width, this.y);
    context.lineTo(this.x + this.width, this.y + this.height);
    context.lineTo(this.x, this.y + this.height);
    context.lineTo(this.x, this.y);
    context.stroke();
  }
}

onload = function () {
  const canvas = this.document.querySelector("#canvas1");

  if (canvas.getContext) {
    canvas.width = this.document.body.clientWidth;
    canvas.height = 600;
    canvas.style.border = "1px solid black";

    const context = canvas.getContext("2d");

    const rectangle = new Rectangle(10, 10, 800, 500, "red");
    rectangle.draw(context);
  }
};
