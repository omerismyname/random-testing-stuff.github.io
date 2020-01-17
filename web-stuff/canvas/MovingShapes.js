class MovingSquare extends Square {
  constructor(alignX = "left", alignY = "top", width = 0, fillStyle, strokeStyle, dx = 0, dy = 0, xOff = 0, yOff = 0, bound = true) {
    super(alignX, alignY, width, fillStyle, strokeStyle, xOff, yOff);

    this.dx = dx;
    this.dy = dy;
    this.bound = bound;

    this.update = () => {
      if (this.fillStyle) {this.fill();}
      if (this.strokeStyle) {this.stroke();}
      this.xOff += this.dx;
      this.yOff += this.dy;

      this.top = this.yOff;
      this.bottom = this.yOff + this.height;
      this.left = this.xOff;
      this.right = this.xOff + this.width;
      this.centreX = this.xOff + this.width / 2;
      this.centreY = this.yOff + this.height / 2;

      if (this.bound) {
        if (this.left < 0) {this.xOff = 0;}
        if (this.right > canvas.width) {this.xOff = canvas.width - this.width;}
        if (this.top < 0) {this.yOff = 0;}
        if (this.bottom > canvas.height) {this.yOff = canvas.height - this.height;}
      }
    }
  }
}