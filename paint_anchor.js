const PAINT_ANCHOR_R = 5;
var draggingAnchor = null;

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

function PaintAnchor(x, y, c) {
  this.id = uuidv4();
  this.p = createVector(x, y);
  this.c = c;
  this.hover = false;
  this.active = false;
  this.originOff = null;
  this.moveHandlers = [];
  this.onUpdate = c => null;
  
  this.getJson = function() {
    return [ this.p.x, this.p.y ];
  }.bind(this);
  
  this.onMove = function(cb) {
    this.moveHandlers.push(cb);
  }.bind(this);
  
  this.loop = function() {
    let mp = createVector(mouseX, mouseY)
    mp.sub(width / 2, height / 2)
    mp.div(zoomSlider.value());
    let d = this.p.dist(mp) * zoomSlider.value();
    if (d <= PAINT_ANCHOR_R) {
      this.hover = true;
    } else {
      this.hover = false;
    }
    if (this.hover || this.active) {
      if (mouseIsPressed && (draggingAnchor == null || draggingAnchor == this.id)) {
        draggingAnchor = this.id
        this.active = true;
        if (this.originOff == null) {
          this.originOff = mp.copy();
          this.originOff.sub(this.p);
        } else {
          this.p = mp.copy();
          this.p.sub(this.originOff);
          this.p.x = round(this.p.x, 3)
          this.p.y = round(this.p.y, 3)
          for(let cb of this.moveHandlers) {
            cb(this.p.x, this.p.y);
          }
        }
      } else {
        draggingAnchor = null;
        this.active = false;
        this.originOff = null;
      }
    }
  }.bind(this);
  
  this.draw = function() {
    push();
    stroke('black');
    if (this.active) {
      fill('blue');
    } else if (this.hover) {
      fill('red');
    } else {
      fill(this.c);
    }
    circle(this.p.x * zoomSlider.value(), this.p.y * zoomSlider.value(), PAINT_ANCHOR_R * 2);
    pop();
  }.bind(this);
}