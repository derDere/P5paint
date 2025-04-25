var objList;
var objProps;
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


function setup() {
  let can = createCanvas(600, 600);
  can.canvas.addEventListener('mousedown', (e) => {
    if (e.button == 1) { // Middle mouse button
      e.preventDefault();
    }
  });
  
  codeBox = document.getElementById('code-content');
  
  copyCodeBtn = createButton('Copy');
  copyCodeBtn.parent('code');
  copyCodeBtn.mousePressed(copyCode);
  
  objList = new PaintObjectList();
  
  objProps = new PaintObjectProperties();
  
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
  
  drawGridCb = createCheckbox('10px Grid', true);
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

  let bgc = color('' + bgColorPicker.value());
  background(bgc);
  translate(width / 2, height / 2);
  
  if (drawGridCb.checked()) {
    push();
    scale(zoomSlider.value());
    noStroke();
    fill(255 - red(bgc), 255 - green(bgc), 255 - blue(bgc), 24);
    for(let x = -600; x < 600; x += 10) {
      for(let y = -600; y < 600; y += 10) {
        if ( ((x + y) % 20) == 0) {
          rect(x, y, 10, 10); 
        }
      } 
    }
    pop();
  }

  push();
  scale(zoomSlider.value());
  translate(viewPanningX, viewPanningY);
  
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
  if (objList?.getSelected()?.anchors) {
    for(let anchor of objList.getSelected().anchors) {
      anchor.draw();
    }
  }

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
    translate(viewPanningX * zoomSlider.value(), viewPanningY * zoomSlider.value());
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