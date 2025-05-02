const allTools = [];

function Tool(name, icon) {
    this.name = name;
    this.icon = icon;
    this.button = null;
    this.isActive = false;
    this.activateCallback = null;

    this.activate = function () {
        this.isActive = true;
        if (this.button) {
            this.button.classList.add("active");
        }
        if (this.activateCallback) {
            this.activateCallback(this);
        }
    }.bind(this);

    this.deactivate = function () {
        this.isActive = false;
        if (this.button) {
            this.button.classList.remove("active");
        }
    }.bind(this);
}

let oldToolNameNum = 1;
function OldTool(key) {
    let icon = 'gfx/geo_icon_' + key.toLowerCase() + '.png';
    let name = 'Add ' + key;
    Tool.call(this, name, icon);
    this.key = key;
    this.activateCallback = function (tool) {
        objList.add(new PaintObjectTypes[this.key](this.key + '_' + (oldToolNameNum++)));
        this.deactivate();
    }.bind(this);
}

function AddOldTools() {
    for(let key in PaintObjectTypes) {
        let oldTool = new OldTool(key);
        allTools.push(oldTool);
    }
}

function ToolMenu() {
    this.ele = document.getElementById("tools");
    this.activeTool = null;

    this.activateTool = function (tool) {
        if (this.activeTool) {
            this.activeTool.deactivate();
        }
        this.activeTool = tool;
        this.activeTool.activate();
    }

    this.buttons = [];
    for (let tool of allTools) {
        let button = document.createElement("button");
        button.className = "tool-button";
        button.title = tool.name;
        button.style.backgroundImage = `url(${tool.icon})`;
        tool.button = button;
        button.addEventListener("click", () => {
            this.activateTool(tool);
        });
        this.ele.appendChild(button);
        this.buttons.push(button);
    }
}