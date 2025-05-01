var objList;
var objProps;
var anchorSelector;
var drawCenterCb;
var drawGridCb;
var zoomSlider;
var zoomReset;
var bgColorPicker;
var codeBox;
var copyCodeBtn;
var saveBtn;
var loadBtn;
var oldCode = '';
var eleNum = 1;

var viewPanningX = 0;
var viewPanningY = 0;
var viewPanningMovementMouseX = 0;
var viewPanningMovementMouseY = 0;
var viewPanningMovement = false;
var viewPanningCenterBtn;
var lastWinSize = { width: 0, height: 0 };

function copyCode() {
  const textarea = document.getElementById("code-content");

  // Select the text
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length); // For mobile compatibility

  // Try to copy
  try {
    const successful = document.execCommand('copy');
    if (successful) {
    } else {
      alert("Copy command failed.");
    }
  } catch (err) {
    alert("Copy error: " + err);
  }

  // Deselect after copy (optional)
  textarea.setSelectionRange(0, 0);
  textarea.blur();
}

function PointRealToView(x, y) {
  if (x instanceof p5.Vector) {
    let v = x;
    x = v.x;
    y = v.y;
  }
  let p = createVector(x, y);
  p.sub(width / 2, height / 2)
  p.div(zoomSlider.value());
  p.sub(viewPanningX, viewPanningY);
  return p;
}

function PointViewToReal(x, y) {
  if (x instanceof p5.Vector) {
    let v = x;
    x = v.x;
    y = v.y;
  }
  let p = createVector(x, y);
  p.add(viewPanningX, viewPanningY);
  p.mult(zoomSlider.value());
  p.add(width / 2, height / 2);
  return p;
}

function getMainCanvasSize() {
  let div = document.getElementById('main-canvas');
  return {
    width: div.clientWidth,
    height: div.clientHeight
  };
}

function setup() {
  InitAllMovableWindows();
  let size = getMainCanvasSize();
  lastWinSize = size;
  let can = createCanvas(size.width, size.height);
  can.parent('main-canvas');
  can.canvas.addEventListener('mousedown', (e) => {
    if (e.button == 1) { // Middle mouse button
      e.preventDefault();
    }
  });
  
  // Add beforeunload event handler
  window.addEventListener('beforeunload', (e) => {
    if (objList.items().length > 0) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return e.returnValue;
    }
  });

  codeBox = document.getElementById('code-content');
  
  copyCodeBtn = createButton('Copy');
  copyCodeBtn.parent('code');
  copyCodeBtn.mousePressed(copyCode);
  
  objList = new PaintObjectList();
  
  objProps = new PaintObjectProperties();

  anchorSelector = new PaintAnchorSelection();
  
  objList.addSelectedHandler(objProps.setObject);
  
  saveBtn = createButton('💾');
  saveBtn.mousePressed(() => {
    let jj = JSON.stringify(objList.getJson(), null, 2);
    let blob = new Blob([jj], { type: 'application/json' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'PaintSketch.json';
    a.click();
    URL.revokeObjectURL(url);
  });
  saveBtn.parent('menu');

  loadBtn = createButton('📂');
  loadBtn.mousePressed(() => {
    // Only show save confirmation if there are objects in the scene
    if (objList.items().length === 0 || confirm('Did you save?!')) {
      let i = document.createElement('input');
      i.type = 'file';
      i.accept = '.json,application/json';

      i.onchange = e => {
        let file = e.target.files[0];
        if (!file) return;

        let reader = new FileReader();
        reader.onload = e => {
          let jj = e.target.result;
          let jo = JSON.parse(jj);   
          for (let key of Object.keys(objList.allObjects)) {
            if (key == NONE_ITM) continue;
            objList.remove(key);
          }
          jo.sort((a, b) => a.zIndex - b.zIndex);
          for (let itm of jo) {
            if (itm.TypeName in PaintObjectTypes) {
              let oo = new PaintObjectTypes[itm.TypeName]();
              oo.loadJJ(itm);
              objList.add(oo);
            }
          }
          viewPanningX = 0;
          viewPanningY = 0;
        };
        reader.readAsText(file);
      };

      i.click();
    }
  });
  loadBtn.parent('menu');
  
  drawCenterCb = createCheckbox('Show Center', true);
  drawCenterCb.parent('menu');
  
  drawGridCb = createCheckbox('Page', true);
  drawGridCb.parent('menu');
  
  createSpan("Zoom:").parent('menu');
  
  zoomSlider = createSlider(0.5, 5, 1, 0.1);
  zoomSlider.parent('menu');
  
  zoomReset = createButton('100%');
  zoomReset.mousePressed(() => zoomSlider.value(1));
  zoomReset.parent('menu');

  viewPanningCenterBtn = createButton('Center View');
  viewPanningCenterBtn.mousePressed(() => {
    viewPanningX = 0;
    viewPanningY = 0;
  });
  viewPanningCenterBtn.parent('menu');
  
  bgColorPicker = createColorPicker('white');
  bgColorPicker.parent('menu');
}

function windowResized() {
  let size = getMainCanvasSize();
  viewPanningX = (viewPanningX * size.width) / lastWinSize.width;
  viewPanningY = (viewPanningY * size.height) / lastWinSize.height;
  resizeCanvas(size.width, size.height);
  lastWinSize = size;
}

function draw() {

  if (mouseIsPressed && mouseButton == CENTER) {
    if (viewPanningMovement) { 
      viewPanningX = ((mouseX / zoomSlider.value()) - viewPanningMovementMouseX);
      viewPanningY = ((mouseY / zoomSlider.value()) - viewPanningMovementMouseY);
    } else {
      viewPanningMovement = true;
      viewPanningMovementMouseX = (mouseX / zoomSlider.value()) - viewPanningX;
      viewPanningMovementMouseY = (mouseY / zoomSlider.value()) - viewPanningY;
    }
  } else {
    viewPanningMovement = false;
    viewPanningMovementMouseX = 0;
    viewPanningMovementMouseY = 0;
  }

  anchorSelector.update(objList?.getSelected());

  //let bgc = color('' + bgColorPicker.value());
  //background(bgc);
  clear();
  background(0, 0, 0, 0);
  
  push();
  translate(width / 2, height / 2);

  push();
  scale(zoomSlider.value());
  translate(viewPanningX, viewPanningY);
  
  if (drawGridCb.checked()) {
    push();
    rectMode(CENTER);
    stroke(192);
    strokeWeight(1);
    fill(255);
    rect(0, 0, 400, 300, 5);
    pop();
  }
  
  if (objList?.getSelected()?.anchors) {
    for(let anchor of objList.getSelected().anchors) {
      anchor.loop();
    }
  }
  
  let lines = [];
  let useShapeFunction = false;
  for(let po of objList.items()) {
    try {
      push();
      po.paint();
      lines = lines.concat(po.code());
      if (po.UseShapeFunction) {
        useShapeFunction = true;
      }
      pop();
    } catch(err) {
      textAlign(CENTER, CENTER);
      text(err.message, 0, 0);
      lines = lines.concat([ '', '# ' + po.id, '# Error: ' + err.message, '' ]);
    }
  }
  pop();
  pop();
  
  if (objList?.getSelected()?.anchors) {
    for(let anchor of objList.getSelected().anchors) {
      anchor.draw();
    }
  }

  anchorSelector.draw();

  let newCode = '';
  if (useShapeFunction) {
    newCode += GetShapeFunction().join('\n') + '\n';
  }

  newCode += 'def draw_geometry():\n';
  
  newCode += '    ' + lines.join('\n    ');
  if (newCode != oldCode) {
    codeBox.innerHTML = newCode;
    oldCode = newCode;
  }
  
  if (drawCenterCb.checked()) {
    push();
    translate(width / 2, height / 2);
    translate(viewPanningX * zoomSlider.value(), viewPanningY * zoomSlider.value());
    strokeWeight(3);
    strokeCap(ROUND);
    stroke(255, 0, 0, 128);
    noFill();
    line(0, -50, 0, 50);
    line(-50, 0, 50, 0);
    stroke(0, 255, 0, 128);
    line(-viewPanningX * zoomSlider.value(), -viewPanningY * zoomSlider.value(), 0, 0);
    pop();
  }
}





















































// EOF