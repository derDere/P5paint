const WIN_AREA_MARGIN_TOP = 50;
const WIN_AREA_MARGIN_RIGHT = 0;
const WIN_AREA_MARGIN_BOTTOM = 0;
const WIN_AREA_MARGIN_LEFT = 0;

const MOVABLE_WINDOW_CLASS = "movable-window";
const MOVABLE_WINDOW_CONTENT_CLASS = "window-content";

const MOVABLE_WINDOW_HEADER_CLASS = "movable-window-header";
const MOVABLE_WINDOW_HEADER_ICON_CLASS = "movable-window-icon";
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

function MovableWindow(ele) {

    this.ele = ele;

    this.width = parseInt(ele.dataset.width) || 200;
    this.height = parseInt(ele.dataset.height) || 200;
    this.margin = parseInt(ele.dataset.m) || 10;
    this.title = ele.dataset.title || "Drag me!";
    this.iconUrl = ele.dataset.icon || "unknown image";
    this.anchor = ele.dataset.anchor || "TL";

    this.isMoving = false;
    this.isResizing = false;
    this.offsetX = this.margin;
    this.offsetY = this.margin;
    this.startX = 0;
    this.startY = 0;

    this.ele.style.width = this.width + "px";
    this.ele.style.height = this.height + "px";
    if (this.anchor.toUpperCase().indexOf("T") != -1) {
        this.ele.style.top = (this.margin + WIN_AREA_MARGIN_TOP) + "px";
    }
    if (this.anchor.toUpperCase().indexOf("B") != -1) {
        this.ele.style.bottom = (this.margin + WIN_AREA_MARGIN_BOTTOM) + "px";
    }
    if (this.anchor.toUpperCase().indexOf("L") != -1) {
        this.ele.style.left = (this.margin + WIN_AREA_MARGIN_LEFT) + "px";
    }
    if (this.anchor.toUpperCase().indexOf("R") != -1) {
        this.ele.style.right = (this.margin + WIN_AREA_MARGIN_RIGHT) + "px";
    }

    this.header = document.createElement('div');
    this.header.className = MOVABLE_WINDOW_HEADER_CLASS;
    this.ele.appendChild(this.header);
    this.header.innerText = this.title;

    this.icon = document.createElement('div');
    this.icon.className = MOVABLE_WINDOW_HEADER_ICON_CLASS;
    this.header.appendChild(this.icon);
    this.icon.style.backgroundImage = `url('${this.iconUrl}')`;

    this.grips = [];
    for (let grip of MOVABLE_WINDOW_GRIPS) {
        let gripEle = document.createElement('div');
        gripEle.className = grip;
        this.ele.appendChild(gripEle);
        this.grips.push(gripEle);
    }

    this.stopAction = function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.isMoving = false;
        this.isResizing = false;
    }.bind(this);

    this.startDrag = function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.isMoving = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
    }.bind(this);

    this.startResize = function(e) {
        e.preventDefault();
        e.stopPropagation();
        let resizeDir = findGripDirection(e.target);
        this.isMoving = false;
        this.isResizing = true;
        this.resizeDirection = resizeDir;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.startWidth = parseInt(this.ele.style.width);
        this.startHeight = parseInt(this.ele.style.height);
        this.startLeft = parseInt(this.ele.style.left);
        this.startTop = parseInt(this.ele.style.top);
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
        
        // Update start position for next move
        this.startX = e.clientX;
        this.startY = e.clientY;
    }.bind(this);

    this.mouseMoveResizeLogic = function(e) {
        // Todo - Implement resizing logic based on resizeDirection
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
        const leftMargin = WIN_AREA_MARGIN_LEFT + this.margin;
        const rightMargin = WIN_AREA_MARGIN_RIGHT + this.margin;
        const topMargin = WIN_AREA_MARGIN_TOP + this.margin;
        const bottomMargin = WIN_AREA_MARGIN_BOTTOM + this.margin;

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

    setInterval(fixAllFalsePos, 1000);
}