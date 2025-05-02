var objList;
var objProps;
var anchorSelector;
var codeBox;
var copyCodeBtn;
var oldCode = '';
var eleNum = 1;
var mainMenu;
var viewPanningX = 0;
var viewPanningY = 0;
var viewPanningMovementMouseX = 0;
var viewPanningMovementMouseY = 0;
var viewPanningMovement = false;
var lastWinSize = { width: 0, height: 0 };

function copyCode() {
  // Create a temporary textarea element
  const tempTextArea = document.createElement('textarea');
  tempTextArea.value = oldCode;
  document.body.appendChild(tempTextArea);
  
  // Select the text
  tempTextArea.select();
  tempTextArea.setSelectionRange(0, tempTextArea.value.length); // For mobile compatibility

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

  // Clean up
  document.body.removeChild(tempTextArea);
}

function PointRealToView(x, y) {
  if (x instanceof p5.Vector) {
    let v = x;
    x = v.x;
    y = v.y;
  }
  let p = createVector(x, y);
  p.sub(width / 2, height / 2)
  p.div(mainMenu.zoom);
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
  p.mult(mainMenu.zoom);
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

  mainMenu = new MainMenu('menu');
  
  mainMenu.onSaveBtnClick(() => {
    let jj = JSON.stringify(objList.getJson(), null, 2);
    let blob = new Blob([jj], { type: 'application/json' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'PaintSketch.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  mainMenu.onLoadBtnClick(() => {
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

  windowResized();

  let loadingScreen = document.getElementById('loading');
  loadingScreen.style.display = 'none';
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
      viewPanningX = ((mouseX / mainMenu.zoom) - viewPanningMovementMouseX);
      viewPanningY = ((mouseY / mainMenu.zoom) - viewPanningMovementMouseY);
    } else {
      viewPanningMovement = true;
      viewPanningMovementMouseX = (mouseX / mainMenu.zoom) - viewPanningX;
      viewPanningMovementMouseY = (mouseY / mainMenu.zoom) - viewPanningY;
    }
  } else {
    viewPanningMovement = false;
    viewPanningMovementMouseX = 0;
    viewPanningMovementMouseY = 0;
  }

  let canvasDiv = document.getElementById('main-canvas');
  canvasDiv.style.backgroundPosition = 'calc(50% + ' + round((viewPanningX - 50) * mainMenu.zoom) + 'px) calc(50% + ' + round((viewPanningY - 50) * mainMenu.zoom) + 'px)';
  canvasDiv.style.backgroundSize = (round(mainMenu.zoom * 100)) + 'px';

  anchorSelector.update(objList?.getSelected());

  clear();
  background(0, 0, 0, 0);
  
  push();
  translate(width / 2, height / 2);
  scale(mainMenu.zoom);
  translate(viewPanningX, viewPanningY);
  
  if (mainMenu.showPage) {
    push();
    rectMode(CENTER);
    noStroke();
    push();
    fill(0,0,0,14);
    translate(2, 2);
    rect(0, 0, mainMenu.pageSize.w + 8, mainMenu.pageSize.h + 8, 2);
    rect(0, 0, mainMenu.pageSize.w + 6, mainMenu.pageSize.h + 6, 2);
    rect(0, 0, mainMenu.pageSize.w + 4, mainMenu.pageSize.h + 4, 1);
    rect(0, 0, mainMenu.pageSize.w + 2, mainMenu.pageSize.h + 2, 1);
    rect(0, 0, mainMenu.pageSize.w , mainMenu.pageSize.h, 0);
    pop();
    fill(mainMenu.pageColor);
    rect(0, 0, mainMenu.pageSize.w, mainMenu.pageSize.h, 0);
    pop();
  }

  if (mainMenu.showRulers) {
    push();
    stroke(128, 128, 128, 192);
    strokeWeight(2);
    strokeCap(SQUARE);

    line(-(mainMenu.pageSize.w / 2) + 2, -(mainMenu.pageSize.h / 2) - 10, (mainMenu.pageSize.w / 2) - 2, -(mainMenu.pageSize.h / 2) - 10);
    line(-(mainMenu.pageSize.w / 2) + 1, -(mainMenu.pageSize.h / 2), -(mainMenu.pageSize.w / 2) + 1, -(mainMenu.pageSize.h / 2) - 20,);
    line((mainMenu.pageSize.w / 2) - 1, -(mainMenu.pageSize.h / 2), (mainMenu.pageSize.w / 2) - 1, -(mainMenu.pageSize.h / 2) - 20,);

    line(-(mainMenu.pageSize.w / 2) - 10, -(mainMenu.pageSize.h / 2) + 2, -(mainMenu.pageSize.w / 2) - 10, (mainMenu.pageSize.h / 2) - 2);
    line(-(mainMenu.pageSize.w / 2), -(mainMenu.pageSize.h / 2) + 1, -(mainMenu.pageSize.w / 2) - 20, -(mainMenu.pageSize.h / 2) + 1);
    line(-(mainMenu.pageSize.w / 2), (mainMenu.pageSize.h / 2) - 1, -(mainMenu.pageSize.w / 2) - 20, (mainMenu.pageSize.h / 2) - 1);

    let mousePosCanvas = PointRealToView(mouseX, mouseY);

    let rulerMousePosX = round(mousePosCanvas.x) + (mainMenu.pageSize.w / 2);
    let rulerMouseDrawPosX = Math.min(Math.max(rulerMousePosX, 1), mainMenu.pageSize.w - 1);
    let mouseDisplayOffsetY = 15;
    line(-(mainMenu.pageSize.w / 2) + rulerMouseDrawPosX, -(mainMenu.pageSize.h / 2), -(mainMenu.pageSize.w / 2) + rulerMouseDrawPosX, -(mainMenu.pageSize.h / 2) - (20 + mouseDisplayOffsetY),);

    let rulerMousePosY = round(mousePosCanvas.y) + (mainMenu.pageSize.h / 2);
    let rulerMouseDrawPosY = Math.min(Math.max(rulerMousePosY, 1), mainMenu.pageSize.h - 1);
    let mouseDisplayOffsetX = 10 + (('' + mainMenu.pageSize.h).length * 7);
    line(-(mainMenu.pageSize.w / 2), -(mainMenu.pageSize.h / 2) + rulerMouseDrawPosY, -(mainMenu.pageSize.w / 2) - (20 + mouseDisplayOffsetX), -(mainMenu.pageSize.h / 2) + rulerMouseDrawPosY);

    textSize(12);
    textAlign(CENTER, BOTTOM);
    noStroke();
    fill(128, 128, 128, 255);

    text(`${mainMenu.pageSize.w} px`, 0, -(mainMenu.pageSize.h / 2) - 12);
    text(`${rulerMousePosX} px\n${round(mousePosCanvas.x)} px`, -(mainMenu.pageSize.w / 2) + rulerMouseDrawPosX, -(mainMenu.pageSize.h / 2) - (22 + mouseDisplayOffsetY));

    textAlign(RIGHT, CENTER);
    text(`${mainMenu.pageSize.h} px`, -(mainMenu.pageSize.w / 2) - 12, 0);
    text(`${rulerMousePosY} px\n${round(mousePosCanvas.y)} px`, -(mainMenu.pageSize.w / 2) - (22 + mouseDisplayOffsetX), -(mainMenu.pageSize.h / 2) + rulerMouseDrawPosY);

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
    // Update code and trigger Prism highlighting
    codeBox.textContent = newCode; // Use textContent instead of innerHTML for security
    Prism.highlightElement(codeBox);
    oldCode = newCode;
  }
  
  if (mainMenu.showCenter) {
    push();
    translate(width / 2, height / 2);
    translate(viewPanningX * mainMenu.zoom, viewPanningY * mainMenu.zoom);
    strokeWeight(3);
    strokeCap(ROUND);
    if (viewPanningX == 0 && viewPanningY == 0) {
      stroke(0, 255, 0, 128);
    } else {
      stroke(255, 0, 0, 128);
    }
    noFill();
    line(0, -50, 0, 50);
    line(-50, 0, 50, 0);
    stroke(0, 255, 0, 128);
    line(-viewPanningX * mainMenu.zoom, -viewPanningY * mainMenu.zoom, 0, 0);
    pop();
  }
}





















































// EOF