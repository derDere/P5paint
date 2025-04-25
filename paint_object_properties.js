function createAnchorListControl(o, prop) {
  this.o = o;
  this.div = document.createElement('div');
  this.div.className = "path-point-list";
  
  let btnDiv = this.div.appendChild(document.createElement('div'));
  btnDiv.className = "path-list-buttons";
  
  this.table = this.div.appendChild(document.createElement('table'));
  this.table.className = 'path-points';
  
  this.addBtn = btnDiv.appendChild(document.createElement('button'));
  this.addBtn.className = "path-add-point";
  this.addBtn.innerText = '➕ Add Point to Path';
  
  //this.upBtn = btnDiv.appendChild(document.createElement('button'));
  //this.upBtn.className = "path-point-up";
  //this.upBtn.innerText = '🔼';
  
  //this.downBtn = btnDiv.appendChild(document.createElement('button'));
  //this.downBtn.className = "path-point-down";
  //this.downBtn.innerText = '🔽';
  
  this.getLastAnchor = function() {
    if (this.o?.anchors?.length > 0) {
      return this.o.anchors[this.o.anchors.length - 1];
    }
    return null;
  }.bind(this);

  this.addAnchorRow = function(a) {
    let tr = document.createElement('tr');
    let radTd = tr.appendChild(document.createElement('td'));
    let posTd = tr.appendChild(document.createElement('td'));
    let delTd = tr.appendChild(document.createElement('td'));
    
    let selRad = radTd.appendChild(document.createElement('input'));
    selRad.className = "path-point-selection";
    selRad.name = "path-point-selection";
    selRad.type = "radio";
    selRad.value = a.id;
    selRad.addEventListener('change', () => {
      for(let ai of this.o.anchors) {
        ai.c = (selRad.value == ai.id) ? 'cyan' : 'white';  
      }
    });
    
    let xInput = posTd.appendChild(document.createElement('input'));
    xInput.title = "X";
    xInput.type = "number";
    xInput.value = a.p.x;
    xInput.addEventListener('change', () => a.p.x = round(parseFloat(xInput.value), 3));
    
    let yInput = posTd.appendChild(document.createElement('input'));
    yInput.title = "Y";
    yInput.type = "number";
    yInput.value = a.p.y;
    yInput.addEventListener('change', () => a.p.y = round(parseFloat(yInput.value), 3));
    
    let rmBtn = delTd.appendChild(document.createElement('button'));
    rmBtn.title = "Remove Point from Path";
    rmBtn.className = 'rm-path-point';
    rmBtn.innerText = 'X';
    rmBtn.addEventListener('click', () => {
      let i = this.o.anchors.indexOf(a);
      if (i >= 0) {
        this.o.anchors.splice(i, 1);
        tr.remove();
      }
    });
    
    a.onMove((x, y) => { xInput.value = x; yInput.value = y; });
    //a.onUpdate(())
    
    this.table.appendChild(tr);
  }.bind(this);

  for (let a of this.o.anchors) {
    this.addAnchorRow(a);
  }
  
  this.addPoint = function() {
    let x, y;
    if (!(this.getLastAnchor())) {
      x = 150;
      y = 0;
    } else {
      let np = this.getLastAnchor().p.copy();
      np.rotate(0.2);
      x = round(np.x, 3);
      y = round(np.y, 3);
    }
    let na = new PaintAnchor(x, y, 'white');
    this.o.anchors.push(na);
    this.addAnchorRow(na);
  }.bind(this);
  this.addBtn.addEventListener('click', this.addPoint);
  
  return this.div;
}

function createBooleanControl(o, prop) {
  let i = document.createElement('input');
  i.type = "checkbox";
  i.name = o.id + '-' + prop;
  i.checked = o[prop];
  i.addEventListener('change', () => {
    o[prop] = i.checked;
  });
  o.onUpdate((s,p) => {
    if (p == prop && s == o) {
      i.checked = o[prop];
    }
  });
  return i;
}


function createNumberControl(o, prop) {
  let i;
  if (prop == 'fill' || prop == 'stroke') {
    i = document.createElement('span');
    i.className = "color-input"
    
    let [a, s] = toColorStr(o[prop]);
    
    let i1 = i.appendChild(document.createElement('input'));
    let spaces = i.appendChild(document.createElement('span'));
    let i2 = i.appendChild(document.createElement('input'));
    
    i1.name = o.id + '-' + prop + '-rgb';
    i1.title = "RGB";
    i1.type = "color";
    i1.value = s;
    i1.addEventListener('change', () => {
      o[prop] = fromHexA(i1.value, parseInt(i2.value));
    });
    
    spaces.innerText = " A:";
    
    i2.name = o.id + '-' + prop + '-a';
    i2.title = "Alpha";
    i2.type = "number";
    i2.min = 0;
    i2.max = 255;
    i2.value = a;
    i2.addEventListener('change', () => {
      o[prop] = fromHexA(i1.value, parseInt(i2.value));
    });
    
  } else {
    i = document.createElement('input');
    i.name = o.id + '-' + prop;
    if (prop == 'rotation' || prop == 'ArcStart' || prop == 'ArcStop') {
      i.type = "range";
      i.min = 0;
      i.max = 2 * PI;
      i.step = (2 * PI) / 360;
      i.title = round((o[prop] / (2 * PI)) * 360) + '°';
    } else {
      i.type = "number";
    }
    i.value = o[prop];
    i.addEventListener('change', () => {
      o[prop] = parseFloat(i.value);
      if (prop == 'rotation' || prop == 'ArcStart' || prop == 'ArcStop') {
        i.title = round((o[prop] / (2 * PI)) * 360) + '°';
      } else {
        i.title = i.value;
      }
    });
    o.onUpdate((s,p) => {
      if (s == o && p == prop) {
        i.value = o[prop];
      }
    });
  }
  return i;
}


function createStringControl(o, prop) {
  if ((prop == 'strokeCap') || (prop == 'strokeJoin') || (prop == 'ArcMode')) {
    let i = document.createElement('select');
    i.name = o.id + '-' + prop;
    let options;
    if (prop == 'strokeCap') options = [ 'SQUARE', 'PROJECT', 'ROUND' ];
    if (prop == 'strokeJoin') options = [ 'ROUND', 'BEVEL', 'MITER' ];
    if (prop == 'ArcMode') options = [ 'NONE', 'PIE', 'OPEN', 'CHORD' ];
    for (let opt of options) {
      let option = document.createElement('option');
      option.value = opt;
      option.innerText = opt;
      i.appendChild(option);
    }
    i.value = o[prop];
    i.addEventListener('change', () => {
      o[prop] = i.value;
    });
    return i;
    
  } else {
    let i = document.createElement('input');
    i.type = "text";
    i.name = o.id + '-' + prop;
    i.value = o[prop];
    i.addEventListener('change', () => {
      if (prop == 'id') {
        let newId = o.update_id(i.value);
        i.value = newId;
      } else {
        o[prop] = i.value;
      }
    });
    return i;
  }
}


function PaintObjectProperties() {
  this.div = document.getElementById('property-grid');
  
  this.table = document.createElement('table');
  this.table.className = 'properties';
  this.table.cellspacing = '0';
  this.table.cellpadding = '0';
  this.div.appendChild(this.table);
    this.createControlButtons = function(o) {
    let controlRow = document.createElement('tr');
    let controlTd = controlRow.appendChild(document.createElement('td'));
    controlTd.colSpan = 2;
    controlTd.align = "center";
    controlTd.style.padding = "5px 0";

    // Visibility toggle button
    let visibilityBtn = controlTd.appendChild(document.createElement('button'));
    visibilityBtn.className = "control-btn";
    visibilityBtn.innerHTML = "👁️";
    visibilityBtn.title = "Toggle Visibility";
    visibilityBtn.style.marginRight = "5px";

    // Move up button
    let moveUpBtn = controlTd.appendChild(document.createElement('button'));    moveUpBtn.className = "control-btn";
    moveUpBtn.innerHTML = "⬇️";
    moveUpBtn.title = "Move To Back";
    moveUpBtn.style.marginRight = "5px";
    moveUpBtn.addEventListener('click', () => {
      objList.moveUp(o.id);
    });

    // Move down button
    let moveDownBtn = controlTd.appendChild(document.createElement('button'));
    moveDownBtn.className = "control-btn";
    moveDownBtn.innerHTML = "⬆️";
    moveDownBtn.title = "Move To Front";
    moveDownBtn.style.marginRight = "5px";
    moveDownBtn.addEventListener('click', () => {
      objList.moveDown(o.id);
    });

    // Remove button
    let removeBtn = controlTd.appendChild(document.createElement('button'));
    removeBtn.className = "control-btn";
    removeBtn.innerHTML = "❌";
    removeBtn.title = "Remove Object";
    removeBtn.style.color = "red";
    removeBtn.addEventListener('click', () => {
      if (confirm('Do you really want to remove "' + o.id + '" ?!')) {
        objList.remove(o.id);
      }
    });

    return controlRow;
  }.bind(this);

  this.setObject = function(o) {
    if (!o) {
      this.table.innerHTML = '<tr><td align="center"><b>Add a new Object</b></td></tr>';
      for (let ptype in PaintObjectTypes) {
        let tr = this.table.appendChild(document.createElement('tr'));
        let td = tr.appendChild(document.createElement('td'));
        td.align = "center";
        let btn = td.appendChild(document.createElement('button'));
        btn.className = "add-obj";
        btn.innerText = ptype;
        btn.addEventListener('click', () => {
          objList.add(new PaintObjectTypes[ptype](ptype + ' (' + (eleNum++) + ')'));
        });
      }
      let tr = this.table.appendChild(document.createElement('tr'));
      let td = tr.appendChild(document.createElement('td'));
      td.className = "empty-qm";
      td.align = "center";
      td.innerText = 'p5';
      return;
    }
    
    this.table.innerHTML = '';
    
    for(let prop in o) {
      if (prop == 'zIndex') continue;  // Hide zIndex property, only modified by up/down buttons
      if (o.TypeName == 'Line' && prop == 'fill') continue;
      if (o.TypeName == 'Line' && prop == 'noFill') continue;
      if (o.TypeName == 'Point' && prop == 'fill') continue;
      if (o.TypeName == 'Point' && prop == 'noFill') continue;
      if (o.TypeName == 'Point' && prop == 'rotation') continue;
      if (o.TypeName == 'Circle' && prop == 'rotation') continue;
      
      if (typeof o[prop] == 'function') continue;
      if (typeof o[prop] == 'object') {
        if (!((prop == "Path") && (o.TypeName == "Shape"))) {
          continue;
        }
      }
      if (prop == 'TypeName') {
        let ttr = document.createElement('tr');
        let ttdName = ttr.appendChild(document.createElement('td'));
        ttdName.className = 'type-name-display';
        ttdName.colSpan = 2;        ttdName.innerText = o[prop];
        this.table.appendChild(ttr);
        this.table.appendChild(this.createControlButtons(o));
        continue;
      }
        
      let tr = document.createElement('tr');
      let tdName = tr.appendChild(document.createElement('td'));
      tdName.className = 'name-display';
      let tdValue = tr.appendChild(document.createElement('td'));
      
      tdName.innerText = prop + ':';
      
      switch(typeof o[prop]) {
        case 'boolean':
          tdValue.appendChild(createBooleanControl(o, prop));
          break;
        case 'string':
          tdValue.appendChild(createStringControl(o, prop));
          break;
        case 'number':
          tdValue.appendChild(createNumberControl(o, prop));
          break;
        case 'object':
          if (prop == 'Path') {
            tdValue.appendChild(new createAnchorListControl(o, prop));
          }
          break;
        default:
          tdValue.innerText = typeof o[prop];
          break;
      }
        this.table.appendChild(tr);
    }
  }.bind(this);
  
  this.setObject(null);
}






















































// EOF