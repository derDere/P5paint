const WIN_AREA_MARGIN_TOP = 50;
const WIN_AREA_MARGIN_RIGHT = 0;
const WIN_AREA_MARGIN_BOTTOM = 0;
const WIN_AREA_MARGIN_LEFT = 0;
const WINDOW_MIN_SIZE = 100;

const MOVABLE_WINDOW_CLASS = "movable-window";
const MOVABLE_WINDOW_CONTENT_CLASS = "window-content";

const MOVABLE_WINDOW_HEADER_CLASS = "movable-window-header";
const MOVABLE_WINDOW_HEADER_ICON_CLASS = "movable-window-icon";
const MOVABLE_WINDOW_MINIMIZE_BTN_CLASS = "movable-window-minimize-btn";
const MOVABLE_WINDOW_GRIP_CLASS = 'movable-window-grip';
const MOVALBE_WINDOW_GRIP_DIR_START = 'grip-';
const MOVABLE_WINDOW_GRIP_DIR_TOP = 'top';
const MOVABLE_WINDOW_GRIP_DIR_BOTTOM = 'bottom';
const MOVABLE_WINDOW_GRIP_DIR_LEFT = 'left';
const MOVABLE_WINDOW_GRIP_DIR_RIGHT = 'right';
const MOVABLE_WINDOW_GRIP_DIR_TOP_LEFT = 'top-left';
const MOVABLE_WINDOW_GRIP_DIR_TOP_RIGHT = 'top-right';
const MOVABLE_WINDOW_GRIP_DIR_BOTTOM_LEFT = 'bottom-left';
const MOVABLE_WINDOW_GRIP_DIR_BOTTOM_RIGHT = 'bottom-right';
const MOVABLE_WINDOW_GRIP_DIR_NONE = 'none';
const MOVABLE_WINDOW_GRIPS = [
    MOVABLE_WINDOW_GRIP_CLASS + ' ' + MOVALBE_WINDOW_GRIP_DIR_START + MOVABLE_WINDOW_GRIP_DIR_TOP,
    MOVABLE_WINDOW_GRIP_CLASS + ' ' + MOVALBE_WINDOW_GRIP_DIR_START + MOVABLE_WINDOW_GRIP_DIR_BOTTOM,
    MOVABLE_WINDOW_GRIP_CLASS + ' ' + MOVALBE_WINDOW_GRIP_DIR_START + MOVABLE_WINDOW_GRIP_DIR_LEFT,
    MOVABLE_WINDOW_GRIP_CLASS + ' ' + MOVALBE_WINDOW_GRIP_DIR_START + MOVABLE_WINDOW_GRIP_DIR_RIGHT,
    MOVABLE_WINDOW_GRIP_CLASS + ' ' + MOVALBE_WINDOW_GRIP_DIR_START + MOVABLE_WINDOW_GRIP_DIR_TOP_LEFT,
    MOVABLE_WINDOW_GRIP_CLASS + ' ' + MOVALBE_WINDOW_GRIP_DIR_START + MOVABLE_WINDOW_GRIP_DIR_TOP_RIGHT,
    MOVABLE_WINDOW_GRIP_CLASS + ' ' + MOVALBE_WINDOW_GRIP_DIR_START + MOVABLE_WINDOW_GRIP_DIR_BOTTOM_LEFT,
    MOVABLE_WINDOW_GRIP_CLASS + ' ' + MOVALBE_WINDOW_GRIP_DIR_START + MOVABLE_WINDOW_GRIP_DIR_BOTTOM_RIGHT
];

function findGripDirection(ele) {
    for(let className of ele.classList) {
        if (className.startsWith(MOVALBE_WINDOW_GRIP_DIR_START)) {
            return className.replace(MOVALBE_WINDOW_GRIP_DIR_START, '');
        }
    }
    return MOVABLE_WINDOW_GRIP_DIR_NONE;
}

const allMovableWindows = [];

function focusMovableWindow(id) {
    for (let win of allMovableWindows) {
        if (win.id == id) {
            win.focusUpdate();
            return;
        }
    }
}

function MovableWindow(ele) {
    this.id = ele.id;
    this.ele = ele;
    allMovableWindows.push(this);

    this.initialWidth = parseInt(ele.dataset.width) || 200;
    this.initialHeight = parseInt(ele.dataset.height) || 200;
    this.width = this.initialWidth;
    this.height = this.initialHeight;
    this.margin = { top: 10, right: 10, bottom: 10, left: 10 };
    this.title = ele.dataset.title || "Drag me!";
    this.iconUrl = ele.dataset.icon || "unknown image";
    this.anchor = ele.dataset.anchor || "TL";

    // parseInt(ele.dataset.m) || 10;
    let marginStrVal = ele.dataset.m;
    if (marginStrVal) {
        if (marginStrVal.indexOf(',') != -1) {
            let parts = marginStrVal.split(',');
            if (parts.length == 4) {
                this.margin = {
                    top: parseInt(parts[0]) || 10,
                    right: parseInt(parts[1]) || 10,
                    bottom: parseInt(parts[2]) || 10,
                    left: parseInt(parts[3]) || 10
                };
            }
            else if (parts.length == 2) {
                this.margin = {
                    top: parseInt(parts[0]) || 10,
                    bottom: parseInt(parts[0]) || 10,
                    left: parseInt(parts[1]) || 10,
                    right: parseInt(parts[1]) || 10
                };
            }
            else if (parts.length == 1) {
                this.margin = {
                    top: parseInt(parts[0]) || 10,
                    right: parseInt(parts[0]) || 10,
                    bottom: parseInt(parts[0]) || 10,
                    left: parseInt(parts[0]) || 10
                };
            }
        }
        else {
            this.margin = {
                top: parseInt(marginStrVal) || 10,
                right: parseInt(marginStrVal) || 10,
                bottom: parseInt(marginStrVal) || 10,
                left: parseInt(marginStrVal) || 10
            };
        }
    }

    this.isMoving = false;
    this.isResizing = false;
    this.startX = 0;
    this.startY = 0;
    this.lastWidth = this.width;
    this.lastHeight = this.height;
    this.isMinimized = false;

    if (this.anchor.toUpperCase().indexOf("T") != -1) {
        this.initialOffsetY = this.margin.top + WIN_AREA_MARGIN_TOP;
    }
    if (this.anchor.toUpperCase().indexOf("B") != -1) {
        this.initialOffsetY = this.margin.bottom + WIN_AREA_MARGIN_BOTTOM;
    }
    if (this.anchor.toUpperCase().indexOf("L") != -1) {
        this.initialOffsetX = this.margin.left + WIN_AREA_MARGIN_LEFT;
    }
    if (this.anchor.toUpperCase().indexOf("R") != -1) {
        this.initialOffsetX = this.margin.right + WIN_AREA_MARGIN_RIGHT;
    }
    this.offsetX = this.initialOffsetX;
    this.offsetY = this.initialOffsetY;

    this.header = document.createElement('div');
    this.header.className = MOVABLE_WINDOW_HEADER_CLASS;
    this.ele.appendChild(this.header);
    this.header.innerText = this.title;

    this.icon = document.createElement('div');
    this.icon.className = MOVABLE_WINDOW_HEADER_ICON_CLASS;
    this.header.appendChild(this.icon);
    this.icon.style.backgroundImage = `url('${this.iconUrl}')`;

    this.miniBtn = document.createElement('button');
    this.miniBtn.className = MOVABLE_WINDOW_MINIMIZE_BTN_CLASS;
    this.ele.appendChild(this.miniBtn);

    this.grips = [];
    for (let grip of MOVABLE_WINDOW_GRIPS) {
        let gripEle = document.createElement('div');
        gripEle.className = grip;
        this.ele.appendChild(gripEle);
        this.grips.push(gripEle);
    }

    this.updatePosition = function() {
        // Update position based on anchor
        if (this.anchor.toUpperCase().indexOf("T") != -1) {
            this.ele.style.top = this.offsetY + "px";
        }
        if (this.anchor.toUpperCase().indexOf("B") != -1) {
            this.ele.style.bottom = this.offsetY + "px";
        }
        if (this.anchor.toUpperCase().indexOf("L") != -1) {
            this.ele.style.left = this.offsetX + "px";
        }
        if (this.anchor.toUpperCase().indexOf("R") != -1) {
            this.ele.style.right = this.offsetX + "px";
        }
    }.bind(this);

    this.updateSize = function() {
        this.ele.style.width = this.width + "px";
        this.ele.style.height = this.height + "px";
    }.bind(this);

    this.focusUpdate = function() {
        let allWindows = document.getElementsByClassName(MOVABLE_WINDOW_CLASS);
        for (let win of allWindows) {
            win.classList.remove('focused');
        }
        this.ele.classList.add('focused');
    }.bind(this);
    this.ele.addEventListener('click', this.focusUpdate);

    this.updateSize();
    this.updatePosition();

    this.toggleMinimize = function() {
        this.focusUpdate();
        if (this.isMinimized) {
            this.width = this.lastWidth;
            this.height = this.lastHeight;
            this.updateSize();
            this.isMinimized = false;
            this.ele.classList.remove('minimized');
        } else {
            this.lastWidth = this.width;
            this.lastHeight = this.height;
            this.width = this.initialWidth;
            this.height = 40;
            this.offsetX = this.initialOffsetX;
            this.offsetY = this.initialOffsetY;
            this.updateSize();
            this.updatePosition();
            this.isMinimized = true;
            this.ele.classList.add('minimized');
        }
    }.bind(this);
    this.miniBtn.addEventListener('click', this.toggleMinimize);
    this.header.addEventListener('dblclick', this.toggleMinimize);

    this.stopAction = function(e) {
        if (!this.isMoving && !this.isResizing) return;
        e.preventDefault();
        e.stopPropagation();
        this.isMoving = false;
        this.isResizing = false;
    }.bind(this);

    this.startDrag = function(e) {
        this.focusUpdate();
        e.preventDefault();
        e.stopPropagation();
        this.isMoving = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
    }.bind(this);

    this.startResize = function(e) {
        this.focusUpdate();
        e.preventDefault();
        e.stopPropagation();
        if (this.isMinimized) return;
        this.isMoving = false;
        this.isResizing = true;
        this.resizeDirection = findGripDirection(e.target);
        this.startX = e.clientX;
        this.startY = e.clientY;
    }.bind(this);
    
    this.mouseMoveDragLogic = function(e) {
        // Calculate delta from start position
        let deltaX = e.clientX - this.startX;
        let deltaY = e.clientY - this.startY;
        
        // Reverse deltas for right/bottom anchors
        if (this.anchor.toUpperCase().indexOf("R") != -1) {
            deltaX = -deltaX;
        }
        if (this.anchor.toUpperCase().indexOf("B") != -1) {
            deltaY = -deltaY;
        }
        
        // Update offsets with the appropriate deltas
        this.offsetX += deltaX;
        this.offsetY += deltaY;
        
        this.updatePosition();
        
        // Update start position for next move
        this.startX = e.clientX;
        this.startY = e.clientY;
    }.bind(this);

    this.mouseMoveResizeLogic = function(e) {
        // 1. Calculate initial deltas
        let deltaX = e.clientX - this.startX;
        let deltaY = e.clientY - this.startY;
        
        // If grabbing left edge and left-anchored, or right edge and right-anchored
        if (this.resizeDirection.includes('left')) {
            deltaX = -deltaX;
        }
        // If grabbing top edge and top-anchored, or bottom edge and bottom-anchored
        if (this.resizeDirection.includes('top')) {
            deltaY = -deltaY;
        }

        let newWidth = this.width;
        if ((this.resizeDirection.includes('left')) || (this.resizeDirection.includes('right'))) {
            newWidth = Math.max(WINDOW_MIN_SIZE, this.width + deltaX);
        }
        if (newWidth <= WINDOW_MIN_SIZE) {
            newWidth = this.width;
            deltaX = 0;
        }

        let newHeight = this.height;
        if ((this.resizeDirection.includes('top')) || (this.resizeDirection.includes('bottom'))) {
            newHeight = Math.max(WINDOW_MIN_SIZE, this.height + deltaY);
        }
        if (newHeight <= WINDOW_MIN_SIZE) {
            newHeight = this.height;
            deltaY = 0;
        }

        this.width = newWidth;
        this.height = newHeight;

        // 4. Move window if needed to keep grabbed edge at cursor
        if (this.resizeDirection.includes('left') && this.anchor.includes('L')) {
            this.offsetX -= deltaX;
        }
        if (this.resizeDirection.includes('top') && this.anchor.includes('T')) {
            this.offsetY -= deltaY;
        }
        if (this.resizeDirection.includes('right') && this.anchor.includes('R')) {
            this.offsetX -= deltaX;
        }
        if (this.resizeDirection.includes('bottom') && this.anchor.includes('B')) {
            this.offsetY -= deltaY;
        }
        
        this.updatePosition();

        this.updateSize();

        this.startX = e.clientX;
        this.startY = e.clientY;
    }.bind(this);

    this.windowMouseMove = function(e) {
        if (!this.isMoving && !this.isResizing) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        if (this.isMoving) {
            this.mouseMoveDragLogic(e);

        } else if (this.isResizing) {
            this.mouseMoveResizeLogic(e);
        }
    }.bind(this);

    this.fixFalsePos = function() {
        // Skip if window is being moved or resized
        if (this.isMoving || this.isResizing) return;

        const parentWidth = this.ele.parentElement.clientWidth;
        const parentHeight = this.ele.parentElement.clientHeight;
        
        // Calculate margins for all sides
        const leftMargin = WIN_AREA_MARGIN_LEFT + this.margin.left;
        const rightMargin = WIN_AREA_MARGIN_RIGHT + this.margin.right;
        const topMargin = WIN_AREA_MARGIN_TOP + this.margin.top;
        const bottomMargin = WIN_AREA_MARGIN_BOTTOM + this.margin.bottom;

        // Fix X position based on anchor
        if (this.anchor.toUpperCase().indexOf("R") != -1) {
            // For right anchor
            if (this.offsetX < rightMargin) {
                this.offsetX = rightMargin;
            }
            // Check left boundary (parentWidth - width - leftMargin)
            if (this.offsetX > parentWidth - this.width - leftMargin) {
                this.offsetX = parentWidth - this.width - leftMargin;
            }
            this.ele.style.right = this.offsetX + "px";
        } else if (this.anchor.toUpperCase().indexOf("L") != -1) {
            // For left anchor
            if (this.offsetX < leftMargin) {
                this.offsetX = leftMargin;
            }
            // Check right boundary
            if (this.offsetX > parentWidth - this.width - rightMargin) {
                this.offsetX = parentWidth - this.width - rightMargin;
            }
            this.ele.style.left = this.offsetX + "px";
        }

        // Fix Y position based on anchor
        if (this.anchor.toUpperCase().indexOf("B") != -1) {
            // For bottom anchor
            if (this.offsetY < bottomMargin) {
                this.offsetY = bottomMargin;
            }
            // Check top boundary
            if (this.offsetY > parentHeight - this.height - topMargin) {
                this.offsetY = parentHeight - this.height - topMargin;
            }
            this.ele.style.bottom = this.offsetY + "px";
        } else if (this.anchor.toUpperCase().indexOf("T") != -1) {
            // For top anchor
            if (this.offsetY < topMargin) {
                this.offsetY = topMargin;
            }
            // Check bottom boundary
            if (this.offsetY > parentHeight - this.height - bottomMargin) {
                this.offsetY = parentHeight - this.height - bottomMargin;
            }
            this.ele.style.top = this.offsetY + "px";
        }
    }.bind(this);

    // Add event listeners
    this.header.addEventListener('mousedown', this.startDrag);
    for (let grip of this.grips) {
        grip.addEventListener('mousedown', this.startResize);
    }
    window.addEventListener('mousemove', this.windowMouseMove);
    window.addEventListener('mouseup', this.stopAction);
}

function InitAllMovableWindows() {
    var allMovables = [];
    
    let elements = document.getElementsByClassName(MOVABLE_WINDOW_CLASS);
    for (let ele of elements) {
        let win = new MovableWindow(ele);
        allMovables.push(win);
    }

    var fixAllFalsePos = function() {
        for (let win of allMovables) {
            win.fixFalsePos();
        }
    };

    setInterval(fixAllFalsePos, 200);
}