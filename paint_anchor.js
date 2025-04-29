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
  this.inSelection = false;
  this.isSelected = false;
  this.originOff = null;
  this.moveHandlers = [];
  this.onUpdate = c => null;
  this.pessedOutside = false;
  
  this.getJson = function() {
    return [ this.p.x, this.p.y ];
  }.bind(this);
  
  this.onMove = function(cb) {
    this.moveHandlers.push(cb);
  }.bind(this);

  this.triggerMoveHandlers = function() {
    for(let cb of this.moveHandlers) {
      cb(this.p.x, this.p.y);
    }
  }.bind(this);
  
  this.loop = function() {
    if (anchorSelector.isSelecting()) {
      return;
    }
    let mp = PointRealToView(mouseX, mouseY);
    let d = this.p.dist(mp) * zoomSlider.value();
    if (d <= PAINT_ANCHOR_R) {
      this.hover = true;
    } else {
      this.hover = false;
    }
    if (this.hover || this.active) {
      if ((mouseIsPressed && mouseButton == LEFT) && (draggingAnchor == null || draggingAnchor == this.id)) {
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
          this.triggerMoveHandlers();
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
    let readP = PointViewToReal(this.p)
    circle(readP.x, readP.y, PAINT_ANCHOR_R * 2);
    if (this.inSelection || this.isSelected) {
      if (this.isSelected) {
        noFill();
        stroke('#007FFF');
        drawingContext.setLineDash([]);
        strokeWeight(3);
      } else {
        fill('rgba(0, 127, 255, 0.25)');
        stroke('#007FFF');
        drawingContext.setLineDash([3, 3]);
        strokeWeight(2);
      }
      circle(readP.x, readP.y, (PAINT_ANCHOR_R * 2) + 4);
    }
    drawingContext.setLineDash([]);
    pop();
  }.bind(this);
}

function PaintAnchorSelection() {
  this.start = null;
  this.end = null;
  this.isDragging = false;
  this.isBusy = false;
  this.selection = new PaintAnchorGroup();

  this.isSelecting = function() {
    return (this.start != null && this.end != null) || this.isDragging || this.isBusy;
  }.bind(this);

  this.containsPoint = function(p) {
    if (this.start != null && this.end != null) {
      let x = round(min(this.start.x, this.end.x));
      let y = round(min(this.start.y, this.end.y));
      let w = round(abs(this.start.x - this.end.x));
      let h = round(abs(this.start.y - this.end.y));
      return (p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h);
    }
    return false;
  }

  this.update = function(selectedObject) {
    
    if (this.selection.update()) {
      this.isBusy = true;
      return;
    }
    this.isBusy = false;

    let isOverAnchor = false;
    if (selectedObject) {
      for(let anchor of selectedObject?.anchors) {
        if (anchor.hover || anchor.active) {
          isOverAnchor = true;
          break;
        }
      }
    }
    if (mouseIsPressed && mouseButton == LEFT) {
      if (!this.isDragging) {
        if (!isOverAnchor) {
          this.start = PointRealToView(mouseX, mouseY);
          this.isDragging = true;
        }
      } else {
        this.end = PointRealToView(mouseX, mouseY);
      }
      if (selectedObject) {
        for(let anchor of selectedObject?.anchors) {
          if (this.containsPoint(anchor.p)) {
            anchor.inSelection = true;
          } else {
            anchor.inSelection = false;
          }
        }
      }
    } else {
      if (this.isDragging) {
        if (selectedObject) {
          let selectedAnchors = [];
          for(let anchor of selectedObject?.anchors) {
            anchor.inSelection = false;
            if (this.containsPoint(anchor.p)) {
              anchor.isSelected = true;
              selectedAnchors.push(anchor);
            } else {
              anchor.isSelected = false;
            }
          }
          if (selectedAnchors.length > 1) {
            this.selection.anchors = selectedAnchors;
          } else {
            if (selectedAnchors.length == 1) {
              selectedAnchors[0].isSelected = false;
            }
            this.selection.anchors = [];
          }
        }
      } 
      this.isDragging = false;
      this.start = null;
      this.end = null;
    }
  }.bind(this);

  this.draw = function() {
    push();
    noSmooth();
    fill('rgba(0, 127, 255, 0.25)');
    stroke('#000');
    if (this.isDragging) {
      drawingContext.setLineDash([5, 5]);
      strokeWeight(1);
    }
    else {
      drawingContext.setLineDash([]);
      strokeWeight(3);
    }

    if ((this.start != null) && (this.end != null)) {
      let x = round(min(this.start.x, this.end.x));
      let y = round(min(this.start.y, this.end.y));
      let w = round(abs(this.start.x - this.end.x));
      let h = round(abs(this.start.y - this.end.y));

      let xy = PointViewToReal(x, y);
      x = xy.x;
      y = xy.y;
      w = w * zoomSlider.value();
      h = h * zoomSlider.value();
      rect(x, y, w, h);
    }

    drawingContext.setLineDash([]);
    pop();

    this.selection.draw();
  }.bind(this);
}

function PaintAnchorGroup() {
  this.anchors = [];
  this.isRotating = false;
  this.isMoving = false;
  this.startRotation = 0;
  this.startCenter = null;
  this.startMove = 0;

  this.getBounds = function() {
    if (this.anchors.length <= 0) {
      return null;
    }

    let x = min(this.anchors.map(a => a.p.x));
    let y = min(this.anchors.map(a => a.p.y));
    let w = max(this.anchors.map(a => a.p.x)) - x;
    let h = max(this.anchors.map(a => a.p.y)) - y;

    x = round(x - (20 / zoomSlider.value()));
    y = round(y - (20 / zoomSlider.value()));
    w = round(w + (40 / zoomSlider.value()));
    h = round(h + (40 / zoomSlider.value()));

    return { x: x, y: y, w: w, h: h };
  }.bind(this);

  this.getCenter = function() {
    if (this.anchors.length <= 0) {
      return null;
    }
    let bounds = this.getBounds();
    if (bounds == null) {
      return null;
    }
    let { x, y, w, h } = bounds;
    return createVector(x + w / 2, y + h / 2);
  }.bind(this);

  this.containsPoint = function(p, margin_top=0, margin_right=0, margin_bottom=0, margin_left=0) {
    margin_top /= zoomSlider.value();
    margin_right /= zoomSlider.value();
    margin_bottom /= zoomSlider.value();
    margin_left /= zoomSlider.value();

    if (this.anchors.length <= 0) {
      return false;
    }
    let bounds = this.getBounds();
    if (bounds == null) {
      return false;
    }
    let { x, y, w, h } = bounds;
    
    return (p.x >= x + margin_left && p.x <= x + w - margin_right && p.y >= y + margin_top && p.y <= y + h - margin_bottom);
  }.bind(this);

  this.handleReset = function() {
    if (!mouseIsPressed || mouseButton != LEFT) {
      this.isRotating = false;
      this.isMoving = false;
      this.startRotation = 0;
      this.startMove = 0;
      this.startCenter = null;
      return true;
    }
    return false;
  }.bind(this);

  this.handleRotation = function() {
    if (this.handleReset()) return;
    
    let mp = PointRealToView(mouseX, mouseY);
    let center = this.startCenter ?? this.getCenter();
    mp.sub(center.x, center.y);

    // if (mp.mag() < 20) return;

    let angle = mp.heading();

    if (!this.isRotating) {
      this.startRotation = angle;
      this.isRotating = true;
      this.startCenter = center.copy();
    }
    else {
      let delta = angle - this.startRotation;
      this.startRotation = angle;
      for(let anchor of this.anchors) {
        let p = anchor.p.copy();
        p.sub(center);
        p.rotate(delta);
        anchor.p = p.copy();
        anchor.p.add(center);
        anchor.triggerMoveHandlers();
      }
    }
  }.bind(this);

  this.handleMove = function() {
    if (this.handleReset()) return;

    let mp = PointRealToView(mouseX, mouseY);

    if (!this.isMoving) {
      this.startMove = mp.copy();
      this.isMoving = true;
    } else {
      let delta = p5.Vector.sub(mp, this.startMove);
      this.startMove = mp.copy();
      
      for(let anchor of this.anchors) {
        anchor.p.add(delta);
        anchor.triggerMoveHandlers();
      }
    }
  }.bind(this);

  this.handleResize = function(topLeft, top, topRight, left, right, bottomLeft, bottom, bottomRight) {
    if (this.handleReset()) return;

  }.bind(this);

  this.update = function() {
    if (this.anchors.length <= 1) {
      return false;
    }

    let mp = PointRealToView(mouseX, mouseY);

    let bounds = this.getBounds();
    if (bounds == null) {
      return false;
    }
    let { x, y, w, h } = bounds;

    let inRotationArea = this.containsPoint(mp, -30, -30, -30, -30);
    let inActionArea = this.containsPoint(mp, -5, -5, -5, -5);
    let inMoveArea = this.containsPoint(mp, 10, 10, 10, 10);

    if (inRotationArea || this.isRotating || this.isMoving) {
      if ((inActionArea && !inMoveArea) && !this.isRotating && !this.isMoving) { // mouse is on border
        let topSide = this.containsPoint(mp, -2, -2, (h * zoomSlider.value()) - 10, -2);
        let bottomSide = this.containsPoint(mp, (h * zoomSlider.value()) - 10, -2, -2, -2);
        let leftSide = this.containsPoint(mp, -2, (w * zoomSlider.value()) -10, -2, -2);
        let rightSide = this.containsPoint(mp, -2, -2, -2, (w * zoomSlider.value()) - 10);

        if (topSide && leftSide) {
          cursor('nwse-resize');
          this.handleResize(true, false, false, false, false, false, false, false);
        } else if (topSide && rightSide) {
          cursor('nesw-resize');
          this.handleResize(false, false, true, false, false, false, false, false);
        } else if (bottomSide && leftSide) {
          cursor('nesw-resize');
          this.handleResize(false, false, false, false, false, true, false, false);
        } else if (bottomSide && rightSide) {
          cursor('nwse-resize');
          this.handleResize(false, false, false, false, false, false, false, true);
        } else if (topSide) {
          cursor('ns-resize');
          this.handleResize(false, true, false, false, false, false, false, false);
        } else if (bottomSide) {
          cursor('ns-resize');
          this.handleResize(false, false, false, false, false, false, true, false);
        } else if (rightSide) {
          cursor('ew-resize');
          this.handleResize(false, false, false, false, true, false, false, false);
        } else if (leftSide) {
          cursor('ew-resize');
          this.handleResize(false, false, false, true, false, false, false, false);
        }
      } else if ((inMoveArea || this.isMoving) && !this.isRotating) { // mouse is in move area
        cursor('move');
        this.handleMove();
      } else {
        // in rotation area but not in action area or move area
        cursor('rotation_cursor.png');
        this.handleRotation();
      }

      return true;
    } else {
      cursor('default');
      this.handleReset();
    }

    return false;
  }.bind(this);

  this.draw = function() {
    if (this.anchors.length <= 1) {
      return;
    }

    let bounds = this.getBounds();
    if (bounds == null) {
      return;
    }
    let { x, y, w, h } = bounds;

    let pos = PointViewToReal(x, y);
    x = pos.x;
    y = pos.y;
    w = w * zoomSlider.value();
    h = h * zoomSlider.value();

    push();
    noFill();
    stroke('rgba(0, 127, 255, 0.5)');
    strokeWeight(3);
    rect(x, y, w, h);

    if (this.isRotating && this.startCenter != null) {
      let mp = createVector(mouseX, mouseY);
      let center = PointViewToReal(this.startCenter);
      line(center.x, center.y, mp.x, mp.y);
    }
    pop();
  }.bind(this);
}