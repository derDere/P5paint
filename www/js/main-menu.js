function MainMenu(id) {
    this.id = id;
    this.ele = document.getElementById(id);
    this.showCenter = true;

    this.saveBtn = document.createElement('button');
    this.saveBtn.className = 'menu-button save-button';
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
    this.ele.appendChild(this.loadBtn);
    this._loadCallback = () => 0;
    this._loadButtonClickHandler = function() {
        this._loadCallback();
    }.bind(this);
    this.loadBtn.addEventListener('click', this._loadButtonClickHandler);
    this.onLoadBtnClick = function(cb) {
        this._loadCallback = cb;
    }.bind(this);

    this.gridBtn = document.createElement('button');
    this.gridBtn.className = 'menu-button grid-button';
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

    this.showCenterBtn = document.createElement('button');
    this.showCenterBtn.className = 'menu-button show-center-button';
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
}