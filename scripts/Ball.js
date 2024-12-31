class Ball {
    constructor(center_x, center_y, radius) {
        this.x = center_x;
        this.y = center_y;

        this.prev_x = this.x;
        this.prev_y =  this.y;

        this.radius=radius;
    }
}