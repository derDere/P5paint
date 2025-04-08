function toColor(int32) {
  let a = (int32 >> (8 * 3)) & 0xFF;
  let r = (int32 >> (8 * 2)) & 0xFF;
  let g = (int32 >> (8 * 1)) & 0xFF;
  let b = (int32 >> (8 * 0)) & 0xFF;
  return color(r,g,b,a);
}

function toProStr(int32) {
  let h = '00000000' + int32.toString(16);
  h = '0x' + h.substr(h.length - 8, 8);
  return h;
}

function toColorStr(int32) {
  let a = (int32 >> (8 * 3)) & 0xFF;
  let r = (int32 >> (8 * 2)) & 0xFF;
  let g = (int32 >> (8 * 1)) & 0xFF;
  let b = (int32 >> (8 * 0)) & 0xFF;
  
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);
  
  if (r.length < 2) r = '0' + r;
  if (g.length < 2) g = '0' + g;
  if (b.length < 2) b = '0' + b;
  
  let s = '#' + r + g + b
  
  return [a, s];
}

function fromHexA(h, a) {
  a = a.toString(16);
  if (a.length < 2) a = '0' + a;
  
  h = h.substr(1);
  
  let v = parseInt(a + h, 16);
  
  return v;
}

function PaintObjectBase(id) {
  this.TypeName = "PaintObject";
  this.id = id;
  this.newIdHandler = [];
  this.anchors = [];
  this.updateHandlers = [];
  
  this.onUpdate = function(cb) {
    this.updateHandlers.push(cb);
  }.bind(this);
  this.clearUpdate = function() {
    this.updateHandlers = [];
  }.bind(this);
  
  this.triggerUpdate = function(prop) {
    for (let cb of this.updateHandlers) {
      cb(this, prop);
    }
  }.bind(this);
  
  this.newId = function(callback) {
    this.newIdHandler.push(callback);
  }.bind(this);
  
  this.update_id = function(newId) {
    let oldId = this.id;
    let doChange = true;
    for(let cb of this.newIdHandler) {
      if (!cb(oldId, newId, this)) {
        doChange = false;
      }
    }
    if (doChange) {
      this.id = newId;
    }
    return this.id;
  }.bind(this);
  
  this.xOffset = 0;
  this.yOffset = 0;
  this.rotation = 0;
  this.scaleX = 1;
  this.scaleY = 1;
  this.noFill = false;
  this.fill = 0x7FDCDCDC;
  this.noStroke = false;
  this.stroke = 0xFF000000;
  this.strokeWeight = 1;
  this.strokeCap = 'ROUND';
  this.strokeJoin = 'MITER';
  this.smooth = true;
  
  this.createBaseJJ = function() {
    return {
      'TypeName': this.TypeName,
      'id': this.id,
      'xOffset': this.xOffset,
      'yOffset': this.yOffset,
      'rotation': this.rotation,
      'scaleX': this.scaleX,
      'scaleY': this.scaleY,
      'noFill': this.noFill,
      'fill': this.fill,
      'noStroke': this.noStroke,
      'stroke': this.stroke,
      'strokeWeight': this.strokeWeight,
      'strokeCap': this.strokeCap,
      'strokeJoin': this.strokeJoin,
      'smooth': this.smooth,
    };
  }.bind(this);
  
  this.loadJJ = function(jj) {
    for(let key in jj) {
      if (key == 'Path') {
        for (let xy of jj[key]) {
          let [x, y] = xy;
          this.anchors.push(new PaintAnchor(x, y, 'white'));
        }
      } else {
        this[key] = jj[key];
      }
    }
  }.bind(this);
  
  this.getJson = function() {
    return this.createBaseJJ();
  }.bind();
  
  this.applyBasePaint = function() {
    translate(this.xOffset, this.yOffset);
    rotate(this.rotation);
    scale(this.scaleX, this.scaleY);
    if (this.noFill) {
      noFill();
    } else {
      fill(toColor(this.fill));
    }
    if (this.noStroke) {
      noStroke();
    } else {
      stroke(toColor(this.stroke));
    }
    strokeWeight(this.strokeWeight);
    switch(this.strokeCap) {
      case 'SQUARE':
        strokeCap(SQUARE);
        break;
      case 'PROJECT':
        strokeCap(PROJECT);
        break;
      default:
        strokeCap(ROUND);
        break;
    }
    switch(this.strokeJoin) {
      case 'ROUND':
        strokeJoin(ROUND);
        break;
      case 'BEVEL':
        strokeJoin(BEVEL);
        break;
      default:
        strokeJoin(MITER);
        break;
    }
    if(this.smooth) {
      smooth();
    } else {
      noSmooth();
    }
  }.bind(this);
  
  this.paint = function() {
    push();
    this.applyBasePaint();
    pop();
  }.bind(this);
  
  this.applyBaseCode = function() {
    let lines = [];
    
    if ((this.xOffset != 0) || (this.yOffset != 0))
      lines.push('translate(' + this.xOffset + ', ' + this.yOffset + ')');
      
    if (this.rotation != 0)
      lines.push('rotate(' + this.rotation + ')');
    
    if ((this.scaleX != 1) || (this.scaleY != 1))
      lines.push('scale(' + this.scaleX + ', ' + this.scaleY + ')');
    
    if (this.noFill)
      lines.push('noFill()');
    else
      lines.push('fill(' + toProStr(this.fill) + ')');
    
    if (this.noStroke)
      lines.push('noStroke()');
    else
      lines.push('stroke(' + toProStr(this.stroke) + ')');
      
    if (this.strokeWeight != 1)
      lines.push('strokeWeight(' + this.strokeWeight + ')');
      
    if (this.strokeCap != 'ROUND')
      lines.push('strokeCap(' + this.strokeCap + ')');
      
    if (this.strokeJoin != 'MITER')
      lines.push('strokeJoin(' + this.strokeJoin + ')');
    
    if (!this.smooth)
      lines.push('noSmooth()');
    
    return lines;
  }.bind(this);
  
  this.code = function() {
    let lines = [
      '# ' + this.id,
      'push()',
      ...this.applyBaseCode(),
      'pop()',
      ''
    ];
    return lines;
  }.bind(this);
}

function PaintRectangle(id) {
  PaintObjectBase.call(this, id);
  
  this.TypeName = "Rectangle";
  
  this.X = 0;
  this.Y = 0;
  this.Width = 250;
  this.Height = 150;
  this.topLeftRadius = 0;
  this.topRightRadius = 0;
  this.bottomRightRadius = 0;
  this.bottomLeftRadius = 0;
  
  this.getJson = function() {
    return {
      ...this.createBaseJJ(),
      'X': this.X,
      'Y': this.Y,
      'Width': this.Width,
      'Height': this.Height,
      'topLeftRadius': this.topLeftRadius,
      'topRightRadius': this.topRightRadius,
      'bottomRightRadius': this.bottomRightRadius,
      'bottomLeftRadius': this.bottomLeftRadius
    };
  }
  
  let p1 = new PaintAnchor(this.X, this.Y, 'white');
  p1.onMove((x, y) => { this.X = x; this.triggerUpdate('X'); this.Y = y; this.triggerUpdate('Y'); });
  this.anchors.push(p1);
  
  this.paint = function() {
    push();
    this.applyBasePaint();
    rectMode(CENTER)
    rect(
      this.X,
      this.Y,
      this.Width,
      this.Height,
      this.topLeftRadius,
      this.topRightRadius,
      this.bottomRightRadius,
      this.bottomLeftRadius
    );
    pop();
  }.bind(this);
  
  this.code = function() {
    let lines = [
      '# ' + this.id,
      'push()',
      ...this.applyBaseCode(),
      'rectMode(CENTER)'
    ];
    
    if ((this.topLeftRadius == 0) && (this.topRightRadius == 0) && (this.bottomLeftRadius == 0) && (this.bottomRightRadius == 0)) {
      lines.push('rect(' + this.X + ', ' + this.Y + ', ' + this.Width + ', ' + this.Height + ')');
    } else if ((this.topLeftRadius == this.topRightRadius) && (this.bottomLeftRadius == this.bottomRightRadius) && (this.topRightRadius == this.bottomRightRadius)) {
      lines.push('rect(' + this.X + ', ' + this.Y + ', ' + this.Width + ', ' + this.Height + ', ' + this.topLeftRadius + ')');
    } else {
      lines.push('rect(' + this.X + ', ' + this.Y + ', ' + this.Width + ', ' + this.Height + ', ' + this.topLeftRadius + ', ' + this.topRightRadius + ', ' + this.bottomRightRadius + ', ' + this.bottomLeftRadius + ')');
    }
    
    lines.push('pop()');
    lines.push('');
    
    return lines;
  }.bind(this);
}

function PaintTriangle(id) {
  PaintObjectBase.call(this, id);
  
  this.TypeName = "Triangle";
  
  this.X1 = 0;
  this.Y1 = -70;
  this.X2 = -60;
  this.Y2 = 40;
  this.X3 = 60;
  this.Y3 = 40;
  
  this.getJson = function() {
    return {
      ...this.createBaseJJ(),
      'X1': this.X1,
      'Y1': this.Y1,
      'X2': this.X2,
      'Y2': this.Y2,
      'X3': this.X3,
      'Y3': this.Y3
    };
  }
  
  let p1 = new PaintAnchor(this.X1, this.Y1, 'white');
  let p2 = new PaintAnchor(this.X2, this.Y2, 'white');
  let p3 = new PaintAnchor(this.X3, this.Y3, 'white');
  
  p1.onMove((x, y) => { this.X1 = x; this.triggerUpdate('X1'); this.Y1 = y; this.triggerUpdate('Y1'); });
  p2.onMove((x, y) => { this.X2 = x; this.triggerUpdate('X2'); this.Y2 = y; this.triggerUpdate('Y2'); });
  p3.onMove((x, y) => { this.X3 = x; this.triggerUpdate('X3'); this.Y3 = y; this.triggerUpdate('Y3'); });
  
  this.anchors.push(p1);
  this.anchors.push(p2);
  this.anchors.push(p3);
  
  this.paint = function() {
    push();
    this.applyBasePaint();
    triangle(
      this.X1,
      this.Y1,
      this.X2,
      this.Y2,
      this.X3,
      this.Y3
    );
    pop();
  }.bind(this);
  
  this.code = function() {
    let lines = [
      '# ' + this.id,
      'push()',
      ...this.applyBaseCode()
    ];
    
    lines.push('triangle(' + this.X1 + ', ' + this.Y1 + ', ' + this.X2 + ', ' + this.Y2 + ', ' + this.X3 + ', ' + this.Y3 + ')');
    
    lines.push('pop()');
    lines.push('');
    
    return lines;
  }.bind(this);
}

function PaintEllipse(id) {
  PaintObjectBase.call(this, id);
  
  this.TypeName = "Ellipse";
  
  this.X = 0;
  this.Y = 0;
  this.Width = 250;
  this.Height = 150;
  
  this.getJson = function() {
    return {
      ...this.createBaseJJ(),
      'X': this.X,
      'Y': this.Y,
      'Width': this.Width,
      'Height': this.Height
    };
  }
  
  let p1 = new PaintAnchor(this.X, this.Y, 'white');
  p1.onMove((x, y) => { this.X = x; this.triggerUpdate('X'); this.Y = y; this.triggerUpdate('Y'); });
  this.anchors.push(p1);
  
  this.paint = function() {
    push();
    this.applyBasePaint();
    ellipse(
      this.X,
      this.Y,
      this.Width,
      this.Height
    );
    pop();
  }.bind(this);
  
  this.code = function() {
    let lines = [
      '# ' + this.id,
      'push()',
      ...this.applyBaseCode()
    ];
    
    lines.push('ellipse(' + this.X + ', ' + this.Y + ', ' + this.Width + ', ' + this.Height + ')');
    
    lines.push('pop()');
    lines.push('');
    
    return lines;
  }.bind(this);
}

function PaintArc(id) {
  PaintObjectBase.call(this, id);
  
  this.TypeName = "Arc";
  
  // x, y, w, h, start, stop, [mode]
  this.X = 0;
  this.Y = 0;
  this.Width = 250;
  this.Height = 150;
  this.ArcStart = 0;
  this.ArcStop = (PI / 2) * 3.5;
  this.ArcMode = 'NONE';
  
  this.getJson = function() {
    return {
      ...this.createBaseJJ(),
      'X': this.X,
      'Y': this.Y,
      'Width': this.Width,
      'Height': this.Height,
      'ArcStart': this.ArcStart,
      'ArcStop': this.ArcStop,
      'ArcMode': this.ArcMode,
    };
  }
  
  let p1 = new PaintAnchor(this.X, this.Y, 'white');
  p1.onMove((x, y) => { this.X = x; this.triggerUpdate('X'); this.Y = y; this.triggerUpdate('Y'); });
  this.anchors.push(p1);
  
  this.getArcMode = function() {
    if (this.ArcMode == 'OPEN') {
      return OPEN;
    }
    if (this.ArcMode == 'CHORD') {
      return CHORD;
    }
    if (this.ArcMode == 'PIE') {
      return PIE;
    }
    return null;
  }.bind(this);
  
  this.paint = function() {
    push();
    this.applyBasePaint();
    if (this.ArcMode != 'NONE') {
      arc(
        this.X,
        this.Y,
        this.Width,
        this.Height,
        this.ArcStart,
        this.ArcStop,
        this.getArcMode()
      );
    } else {
      arc(
        this.X,
        this.Y,
        this.Width,
        this.Height,
        this.ArcStart,
        this.ArcStop
      );
    }
    pop();
  }.bind(this);
  
  this.code = function() {
    let lines = [
      '# ' + this.id,
      'push()',
      ...this.applyBaseCode()
    ];
    
    if (this.ArcMode != 'NONE') {
      lines.push('arc(' + this.X + ', ' + this.Y + ', ' + this.Width + ', ' + this.Height + ', ' + this.ArcStart + ', ' + this.ArcStop + ', ' + this.ArcMode + ')');
    } else {
      lines.push('arc(' + this.X + ', ' + this.Y + ', ' + this.Width + ', ' + this.Height + ', ' + this.ArcStart + ', ' + this.ArcStop + ')');
    }
    
    
    lines.push('pop()');
    lines.push('');
    
    return lines;
  }.bind(this);
}

function PaintCircle(id) {
  PaintObjectBase.call(this, id);
  
  this.TypeName = "Circle";
  
  // x, y, w, h, start, stop, [mode]
  this.X = 0;
  this.Y = 0;
  this.Diameter = 100;
  
  this.getJson = function() {
    return {
      ...this.createBaseJJ(),
      'X': this.X,
      'Y': this.Y,
      'Diameter': this.Diameter
    };
  }
  
  let p1 = new PaintAnchor(this.X, this.Y, 'white');
  p1.onMove((x, y) => { this.X = x; this.triggerUpdate('X'); this.Y = y; this.triggerUpdate('Y'); });
  this.anchors.push(p1);
  
  this.paint = function() {
    push();
    this.applyBasePaint();
    circle(
      this.X,
      this.Y,
      this.Diameter
    );
    pop();
  }.bind(this);
  
  this.code = function() {
    let lines = [
      '# ' + this.id,
      'push()',
      ...this.applyBaseCode()
    ];
    
    lines.push('circle(' + this.X + ', ' + this.Y + ', ' + this.Diameter + ')');
    
    lines.push('pop()');
    lines.push('');
    
    return lines;
  }.bind(this);
}

function PaintLine(id) {
  PaintObjectBase.call(this, id);
  
  this.TypeName = "Line";
  
  this.X1 = -40;
  this.Y1 = -70;
  this.X2 = 40;
  this.Y2 = 70;
  
  this.getJson = function() {
    return {
      ...this.createBaseJJ(),
      'X1': this.X1,
      'Y1': this.Y1,
      'X2': this.X2,
      'Y2': this.Y2,
    };
  }
  
  let p1 = new PaintAnchor(this.X1, this.Y1, 'white');
  let p2 = new PaintAnchor(this.X2, this.Y2, 'white');
  
  p1.onMove((x, y) => { this.X1 = x; this.triggerUpdate('X1'); this.Y1 = y; this.triggerUpdate('Y1'); });
  p2.onMove((x, y) => { this.X2 = x; this.triggerUpdate('X2'); this.Y2 = y; this.triggerUpdate('Y2'); });
  
  this.anchors.push(p1);
  this.anchors.push(p2);
  
  this.paint = function() {
    push();
    this.applyBasePaint();
    line(
      this.X1,
      this.Y1,
      this.X2,
      this.Y2
    );
    pop();
  }.bind(this);
  
  this.code = function() {
    let lines = [
      '# ' + this.id,
      'push()'
    ];
    
    for (let l of this.applyBaseCode()) {
      if (!l.startsWith('fill') && !l.startsWith('noFill')) {
        lines.push(l);
      }
    }
    
    lines.push('line(' + this.X1 + ', ' + this.Y1 + ', ' + this.X2 + ', ' + this.Y2 + ')');
    
    lines.push('pop()');
    lines.push('');
    
    return lines;
  }.bind(this);
}

function PaintPoint(id) {
  PaintObjectBase.call(this, id);
  
  this.TypeName = "Point";
  
  this.X = 20;
  this.Y = 20;
  
  this.getJson = function() {
    return {
      ...this.createBaseJJ(),
      'X': this.X,
      'Y': this.Y
    };
  }
  
  let p1 = new PaintAnchor(this.X, this.Y, 'white');
  p1.onMove((x, y) => { this.X = x; this.triggerUpdate('X'); this.Y = y; this.triggerUpdate('Y'); });
  this.anchors.push(p1);
  
  this.paint = function() {
    push();
    this.applyBasePaint();
    point(
      this.X,
      this.Y
    );
    pop();
  }.bind(this);
  
  this.code = function() {
    let lines = [
      '# ' + this.id,
      'push()'
    ];
    
    for (let l of this.applyBaseCode()) {
      if (!l.startsWith('fill') && !l.startsWith('noFill')) {
        lines.push(l);
      }
    }
    
    lines.push('point(' + this.X + ', ' + this.Y + ')');
    
    lines.push('pop()');
    lines.push('');
    
    return lines;
  }.bind(this);
}

function PaintQuad(id) {
  PaintObjectBase.call(this, id);
  
  this.TypeName = "Quad";
  
  this.X1 = 0;
  this.Y1 = -70;
  this.X2 = 60;
  this.Y2 = 0;
  this.X3 = 0;
  this.Y3 = 40;
  this.X4 = -70;
  this.Y4 = 0;
  
  this.getJson = function() {
    return {
      ...this.createBaseJJ(),
      'X1': this.X1,
      'Y1': this.Y1,
      'X2': this.X2,
      'Y2': this.Y2,
      'X3': this.X3,
      'Y3': this.Y3,
      'X4': this.X4,
      'Y4': this.Y4,
    };
  }
  
  let p1 = new PaintAnchor(this.X1, this.Y1, 'white');
  let p2 = new PaintAnchor(this.X2, this.Y2, 'white');
  let p3 = new PaintAnchor(this.X3, this.Y3, 'white');
  let p4 = new PaintAnchor(this.X4, this.Y4, 'white');
  
  p1.onMove((x, y) => { this.X1 = x; this.triggerUpdate('X1'); this.Y1 = y; this.triggerUpdate('Y1'); });
  p2.onMove((x, y) => { this.X2 = x; this.triggerUpdate('X2'); this.Y2 = y; this.triggerUpdate('Y2'); });
  p3.onMove((x, y) => { this.X3 = x; this.triggerUpdate('X3'); this.Y3 = y; this.triggerUpdate('Y3'); });
  p4.onMove((x, y) => { this.X4 = x; this.triggerUpdate('X4'); this.Y4 = y; this.triggerUpdate('Y4'); });
  
  this.anchors.push(p1);
  this.anchors.push(p2);
  this.anchors.push(p3);
  this.anchors.push(p4);
  
  this.paint = function() {
    push();
    this.applyBasePaint();
    quad(
      this.X1,
      this.Y1,
      this.X2,
      this.Y2,
      this.X3,
      this.Y3,
      this.X4,
      this.Y4
    );
    pop();
  }.bind(this);
  
  this.code = function() {
    let lines = [
      '# ' + this.id,
      'push()',
      ...this.applyBaseCode()
    ];
    
    lines.push('quad(' + this.X1 + ', ' + this.Y1 + ', ' + this.X2 + ', ' + this.Y2 + ', ' + this.X3 + ', ' + this.Y3 + ', ' + this.X4 + ', ' + this.Y4 + ')');
    
    lines.push('pop()');
    lines.push('');
    
    return lines;
  }.bind(this);
}

function PaintSquare(id) {
  PaintObjectBase.call(this, id);
  
  this.TypeName = "Square";
  
  this.X = 0;
  this.Y = 0;
  this.s = 160;
  
  this.getJson = function() {
    return {
      ...this.createBaseJJ(),
      'X': this.X,
      'Y': this.Y,
      's': this.s,
    };
  }
  
  let p1 = new PaintAnchor(this.X, this.Y, 'white');
  p1.onMove((x, y) => { this.X = x; this.triggerUpdate('X'); this.Y = y; this.triggerUpdate('Y'); });
  this.anchors.push(p1);
  
  this.paint = function() {
    push();
    this.applyBasePaint();
    rectMode(CENTER)
    square(
      this.X,
      this.Y,
      this.s
    );
    pop();
  }.bind(this);
  
  this.code = function() {
    let lines = [
      '# ' + this.id,
      'push()',
      ...this.applyBaseCode(),
      'rectMode(CENTER)'
    ];
    
    lines.push('square(' + this.X + ', ' + this.Y + ', ' + this.s + ')');
    
    lines.push('pop()');
    lines.push('');
    
    return lines;
  }.bind(this);
}

function PaintShape(id) {
  PaintObjectBase.call(this, id);
  
  this.TypeName = "Shape";
  
  this.Close = true;
  this.Path = this.anchors;
  
  this.Path.push(new PaintAnchor(0, -50, 'white'));
  this.Path.push(new PaintAnchor(48, -16, 'white'));
  this.Path.push(new PaintAnchor(29, 40, 'white'));
  this.Path.push(new PaintAnchor(-29, 40, 'white'));
  this.Path.push(new PaintAnchor(-48, -16, 'white'));
  
  this.getJson = function() {
    let l = [];
    for (let a of this.Path) {
      l.push(a.getJson());
    }
    return {
      ...this.createBaseJJ(),
      'Close': this.Close,
      'Path': [...l]
    };
  }
  
  this.paint = function() {
    push();
    this.applyBasePaint();
    beginShape();
    for (let a of this.anchors) {
      vertex(a.p.x, a.p.y);
    }
    if (this.Close) {
      endShape(CLOSE);
    } else {
      endShape();
    }
    pop();
  }.bind(this);
  
  this.code = function() {
    let lines = [
      '# ' + this.id,
      'push()',
      ...this.applyBaseCode(),
      'beginShape()'
    ];
    
    for (let a of this.anchors) {
      lines.push('vertex(' + a.p.x + ', ' + a.p.y + ')');
    }
    
    if (this.Close) {
      lines.push('endShape(CLOSE)');
    } else {
      lines.push('endShape()');
    }
    
    lines.push('pop()');
    lines.push('');
    
    return lines;
  }.bind(this);
}

const PaintObjectTypes = {
  "Rectangle": PaintRectangle,
  "Triangle": PaintTriangle,
  "Ellipse": PaintEllipse,
  "Arc": PaintArc,
  "Circle": PaintCircle,
  "Line": PaintLine,
  "Point": PaintPoint,
  "Quad": PaintQuad,
  "Square": PaintSquare,
  "Shape": PaintShape
};




















































// EOF