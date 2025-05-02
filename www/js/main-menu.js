const MIN_ZOOM = 0.125; // 1/8
const MAX_ZOOM = 8.0; // 8x
const ZOOM_STEP = 0.125; // 1/8

function cssRgbToHex(color) {
    // Convert CSS rgb color to hex color
    let rgb = color.match(/\d+/g);
    if (rgb) {
        let r = parseInt(rgb[0]);
        let g = parseInt(rgb[1]);
        let b = parseInt(rgb[2]);
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    return color;
}

function MainMenu(id) {
    // source properties
    this.id = id;
    this.ele = document.getElementById(id);
    
    // public properties
    this.showCenter = true;
    this.showPage = true;
    this.showRulers = true;
    this.pageSize = {w:400, h:300};
    this.pageColor = '#ffffff'; // default white background
    this.zoom = 1.0;

    // -------------------------------------------------------------------------------
    // save/load buttons
    this.saveBtn = document.createElement('button');
    this.saveBtn.className = 'menu-button save-button';
    this.saveBtn.title = 'Save sketch';
    this.ele.appendChild(this.saveBtn);
    this._saveCallback = () => 0;
    this._saveButtonClickHandler = function() {
        this._saveCallback();
    }.bind(this);
    this.saveBtn.addEventListener('click', this._saveButtonClickHandler);
    this.onSaveBtnClick = function(cb) {
        this._saveCallback = cb;
    }.bind(this);

    this.loadBtn = document.createElement('button');
    this.loadBtn.className = 'menu-button load-button';
    this.loadBtn.title = 'Load sketch';
    this.ele.appendChild(this.loadBtn);
    this._loadCallback = () => 0;
    this._loadButtonClickHandler = function() {
        this._loadCallback();
    }.bind(this);
    this.loadBtn.addEventListener('click', this._loadButtonClickHandler);
    this.onLoadBtnClick = function(cb) {
        this._loadCallback = cb;
    }.bind(this);

    // -------------------------------------------------------------------------------
    // undo/redo buttons
    // TODO: implement undo/redo

    // -------------------------------------------------------------------------------
    // Workspace buttons
    this.ele.appendChild(document.createElement('div')).className = 'menu-separator';

    this.gridBtn = document.createElement('button');
    this.gridBtn.className = 'menu-button grid-button';
    this.gridBtn.title = 'Toggle grid';
    this.ele.appendChild(this.gridBtn);
    this._gridButtonClickHandler = function() {
        let contentDiv = document.getElementById('main-content');
        if (contentDiv.classList.contains('grid-on')) {
            contentDiv.classList.remove('grid-on');
            contentDiv.classList.add('grid-dot');
        }
        else if (contentDiv.classList.contains('grid-dot')) {
            contentDiv.classList.remove('grid-dot');
            contentDiv.classList.add('grid-off');
        }
        else if (contentDiv.classList.contains('grid-off')) {
            contentDiv.classList.remove('grid-off');
            contentDiv.classList.add('grid-on');
        }
    }.bind(this);
    this.gridBtn.addEventListener('click', this._gridButtonClickHandler);

    this.bgColorPicker = document.createElement('input');
    this.bgColorPicker.title = 'Background color';
    this.bgColorPicker.type = 'color';
    this.bgColorPicker.className = 'menu-color-picker bg-color-picker';
    this.bgColorPicker.value = '#ffffff'; // default white background
    this.ele.appendChild(this.bgColorPicker);
    this._bgColorPickerChangeHandler = function() {
        let color = this.bgColorPicker.value;
        document.getElementById('main-canvas').style.backgroundColor = color;
    }.bind(this);
    this.bgColorPicker.addEventListener('input', this._bgColorPickerChangeHandler);

    this.showCenterBtn = document.createElement('button');
    this.showCenterBtn.className = 'menu-button show-center-button';
    this.showCenterBtn.title = 'Toggle center crosshair';
    this.ele.appendChild(this.showCenterBtn);
    this._showCenterButtonClickHandler = function() {
        this.showCenter = !this.showCenter;
        if (this.showCenter) {
            this.showCenterBtn.classList.remove('disabled');
        }
        else {
            this.showCenterBtn.classList.add('disabled');
        }
    }.bind(this);
    this.showCenterBtn.addEventListener('click', this._showCenterButtonClickHandler);

    this.showPageBtn = document.createElement('button');
    this.showPageBtn.className = 'menu-button show-page-button';
    this.showPageBtn.title = 'Toggle demo page';
    this.ele.appendChild(this.showPageBtn);
    this._showPageButtonClickHandler = function() {
        this.showPage = !this.showPage;
        if (this.showPage) {
            this.showPageBtn.classList.remove('disabled');
        }
        else {
            this.showPageBtn.classList.add('disabled');
        }
    }.bind(this);
    this.showPageBtn.addEventListener('click', this._showPageButtonClickHandler);

    this.showRulersBtn = document.createElement('button');
    this.showRulersBtn.className = 'menu-button show-rulers-button';
    this.showRulersBtn.title = 'Toggle rulers';
    this.ele.appendChild(this.showRulersBtn);
    this._showRulersButtonClickHandler = function() {
        this.showRulers = !this.showRulers;
        if (this.showRulers) {
            this.showRulersBtn.classList.remove('disabled');
        }
        else {
            this.showRulersBtn.classList.add('disabled');
        }
    }.bind(this);
    this.showRulersBtn.addEventListener('click', this._showRulersButtonClickHandler);

    this.editPageBtn = document.createElement('button');
    this.editPageBtn.className = 'menu-button edit-page-button';
    this.editPageBtn.title = 'Edit demo page';
    this.ele.appendChild(this.editPageBtn);
    this._editPageButtonClickHandler = function() {
        let pageEditorWin = document.getElementById('page-editor-win');
        if (pageEditorWin.classList.contains('hidden')) {
            pageEditorWin.classList.remove('hidden');
            this.editPageBtn.classList.add('active');
        } else {
            pageEditorWin.classList.add('hidden');
            this.editPageBtn.classList.remove('active');
        }
    }.bind(this);
    this.editPageBtn.addEventListener('click', this._editPageButtonClickHandler);

    let pageEditorDiv = document.getElementById('page-editor');

    let pageSizeWLabel = pageEditorDiv.appendChild(document.createElement('span'));
    pageSizeWLabel.className = 'menu-label page-size-w-label';
    pageSizeWLabel.innerText = 'Page width (px): ';

    this.pageSizeW = document.createElement('input');
    this.pageSizeW.type = 'number';
    this.pageSizeW.className = 'menu-number-input page-size-w';
    this.pageSizeW.value = this.pageSize.w;
    this.pageSizeW.title = 'Page width (px)';
    this.pageSizeW.min = 0;
    this.pageSizeW.max = 10000;
    this.pageSizeW.step = 10;
    pageEditorDiv.appendChild(this.pageSizeW);
    this._pageSizeWChangeHandler = function() {
        let value = parseInt(this.pageSizeW.value);
        if (value < 0) {
            value = 0;
        } else if (value > 10000) {
            value = 10000;
        }
        this.pageSize.w = value;
        this.pageSizeW.value = this.pageSize.w;
    }.bind(this);
    this.pageSizeW.addEventListener('input', this._pageSizeWChangeHandler);

    pageEditorDiv.appendChild(document.createElement('hr'));

    let pageSizeHLabel = pageEditorDiv.appendChild(document.createElement('span'));
    pageSizeHLabel.className = 'menu-label page-size-h-label';
    pageSizeHLabel.innerText = 'Page height (px): ';

    this.pageSizeH = document.createElement('input');
    this.pageSizeH.type = 'number';
    this.pageSizeH.className = 'menu-number-input page-size-h';
    this.pageSizeH.value = this.pageSize.h;
    this.pageSizeH.title = 'Page height (px)';
    this.pageSizeH.min = 0;
    this.pageSizeH.max = 10000;
    this.pageSizeH.step = 10;
    pageEditorDiv.appendChild(this.pageSizeH);
    this._pageSizeHChangeHandler = function() {
        let value = parseInt(this.pageSizeH.value);
        if (value < 0) {
            value = 0;
        } else if (value > 10000) {
            value = 10000;
        }
        this.pageSize.h = value;
        this.pageSizeH.value = this.pageSize.h;
    }.bind(this);
    this.pageSizeH.addEventListener('input', this._pageSizeHChangeHandler);

    pageEditorDiv.appendChild(document.createElement('hr'));

    let pageColorLabel = pageEditorDiv.appendChild(document.createElement('span'));
    pageColorLabel.className = 'menu-label page-color-label';
    pageColorLabel.innerText = 'Page color: ';

    this.pageColorPicker = document.createElement('input');
    this.pageColorPicker.type = 'color';
    this.pageColorPicker.className = 'menu-color-picker page-color-picker';
    this.pageColorPicker.value = this.pageColor; // default white background
    pageEditorDiv.appendChild(this.pageColorPicker);
    this._pageColorPickerChangeHandler = function() {
        let color = this.pageColorPicker.value;
        this.pageColor = color;
        this.pageColorPicker.value = this.pageColor;
    }.bind(this);
    this.pageColorPicker.addEventListener('input', this._pageColorPickerChangeHandler);

    pageEditorDiv.appendChild(document.createElement('hr'));

    let pageResetLabel = pageEditorDiv.appendChild(document.createElement('span'));
    pageResetLabel.className = 'menu-label page-reset-label';
    pageResetLabel.innerText = ' ';

    this.pageResetBtn = document.createElement('button');
    this.pageResetBtn.className = 'menu-button page-reset-button';
    this.pageResetBtn.title = 'Reset page to default size and color';
    this.pageResetBtn.innerText = 'Reset to default';
    pageEditorDiv.appendChild(this.pageResetBtn);
    this._pageResetButtonClickHandler = function() {
        this.pageSize.w = 400;
        this.pageSize.h = 300;
        this.pageColor = '#ffffff'; // default white background
        this.pageSizeW.value = this.pageSize.w;
        this.pageSizeH.value = this.pageSize.h;
        this.pageColorPicker.value = this.pageColor;
    }.bind(this);
    this.pageResetBtn.addEventListener('click', this._pageResetButtonClickHandler);

    // -------------------------------------------------------------------------------
    // Zoom buttons
    this.ele.appendChild(document.createElement('div')).className = 'menu-separator';

    this.zoomInBtn = document.createElement('button');
    this.zoomInBtn.className = 'menu-button zoom-in-button';
    this.zoomInBtn.title = 'Zoom in';
    this.ele.appendChild(this.zoomInBtn);

    this.zoomPreview = document.createElement('span');
    this.zoomPreview.className = 'menu-preview zoom-preview';
    this.zoomPreview.innerText = '100%';
    this.ele.appendChild(this.zoomPreview);

    this.zoomSlider = document.createElement('input');
    this.zoomSlider.type = 'range';
    this.zoomSlider.min = MIN_ZOOM;
    this.zoomSlider.max = MAX_ZOOM;
    this.zoomSlider.step = ZOOM_STEP;
    this.zoomSlider.value = 1.0;
    this.zoomSlider.className = 'menu-slider zoom-slider';
    this.zoomSlider.title = 'Zoom level: 1.0x';
    this.ele.appendChild(this.zoomSlider);

    this.zoomOutBtn = document.createElement('button');
    this.zoomOutBtn.className = 'menu-button zoom-out-button';
    this.zoomOutBtn.title = 'Zoom out';
    this.ele.appendChild(this.zoomOutBtn);

    this.zoomResetBtn = document.createElement('button');
    this.zoomResetBtn.className = 'menu-button zoom-reset-button';
    this.zoomResetBtn.title = 'Reset zoom to 100%';
    this.ele.appendChild(this.zoomResetBtn);

    this.zoomFitBtn = document.createElement('button');
    this.zoomFitBtn.className = 'menu-button zoom-fit-button disabled';
    this.zoomFitBtn.title = 'Zoom to fit (Comming soon)';
    this.ele.appendChild(this.zoomFitBtn);

    this.setZoomFromSlider = function() {
        let value = parseFloat(this.zoomSlider.value);
        this.zoom = value;
        this.zoomSlider.title = 'Zoom level: ' + this.zoom.toFixed(2) + 'x';
        this.zoomPreview.innerText = round(this.zoom * 100) + '%';
    }.bind(this);

    this.zoomIn = function() {
        this.zoomSlider.value = parseFloat(this.zoomSlider.value) + ZOOM_STEP;
        if (this.zoomSlider.value > MAX_ZOOM) {
            this.zoomSlider.value = MAX_ZOOM;
        }
        this.setZoomFromSlider();
    }.bind(this);

    this.zoomOut = function() {
        this.zoomSlider.value = parseFloat(this.zoomSlider.value) - ZOOM_STEP;
        if (this.zoomSlider.value < MIN_ZOOM) {
            this.zoomSlider.value = MIN_ZOOM;
        }
        this.setZoomFromSlider();
    }.bind(this);

    this.zoomReset = function() {
        this.zoomSlider.value = 1.0;
        this.setZoomFromSlider();
    }.bind(this);

    this.zoomFit = function() {
        // TODO: implement zoom fit
    }.bind(this);

    this.zoomSlider.addEventListener('input', this.setZoomFromSlider);
    this.zoomInBtn.addEventListener('click', this.zoomIn);
    this.zoomOutBtn.addEventListener('click', this.zoomOut);
    this.zoomResetBtn.addEventListener('click', this.zoomReset);
    this.zoomFitBtn.addEventListener('click', this.zoomFit);

    // -------------------------------------------------------------------------------
    // Center view button
    this.ele.appendChild(document.createElement('div')).className = 'menu-separator';

    this.centerViewBtn = document.createElement('button');
    this.centerViewBtn.className = 'menu-button center-view-button';
    this.centerViewBtn.title = 'Center view';
    this.ele.appendChild(this.centerViewBtn);

    this._centerViewButtonClickHandler = function() {
        viewPanningX = 0;
        viewPanningY = 0;
    }.bind(this);
    this.centerViewBtn.addEventListener('click', this._centerViewButtonClickHandler);

    // -------------------------------------------------------------------------------
    // save/load settings to local storage

    this.saveSettings = function() {
        let gridValue = 'grid-off';
        if (document.getElementById('main-content').classList.contains('grid-on')) {
            gridValue = 'grid-on';
        }
        if (document.getElementById('main-content').classList.contains('grid-dot')) {
            gridValue = 'grid-dot';
        }
        let bgColor = cssRgbToHex(document.getElementById('main-canvas').style.backgroundColor || '#ffffff');
        let settings = {
            showCenter: this.showCenter,
            showPage: this.showPage,
            showRulers: this.showRulers,
            pageSize: this.pageSize,
            pageColor: this.pageColor,
            grid: gridValue,
            bgColor: bgColor,
        };
        localStorage.setItem('main-menu-settings', JSON.stringify(settings));
    }.bind(this);

    this.loadSettings = function() {
        let settings = localStorage.getItem('main-menu-settings');
        if (settings) {
            settings = JSON.parse(settings);

            // update the menu properties
            this.showCenter = settings.showCenter;
            this.showPage = settings.showPage;
            this.showRulers = settings.showRulers;
            this.pageSize = settings.pageSize;
            this.pageColor = settings.pageColor;

            // update menu elements
            this.bgColorPicker.value = settings.bgColor;
            this.pageColorPicker.value = this.pageColor;
            this.pageSizeW.value = this.pageSize.w;
            this.pageSizeH.value = this.pageSize.h;
            this.showCenterBtn.classList.toggle('disabled', !this.showCenter);
            this.showPageBtn.classList.toggle('disabled', !this.showPage);
            this.showRulersBtn.classList.toggle('disabled', !this.showRulers);

            // update page elements
            document.getElementById('main-canvas').style.backgroundColor = settings.bgColor;
            document.getElementById('main-content').classList.toggle('grid-on', settings.grid === 'grid-on');
            document.getElementById('main-content').classList.toggle('grid-dot', settings.grid === 'grid-dot');
            document.getElementById('main-content').classList.toggle('grid-off', settings.grid === 'grid-off');
        }
    }.bind(this);

    this.loadSettings(); // load settings on startup

    setInterval(this.saveSettings, 200); // save settings every second
}