const NONE_ITM = "[ADD]";


function PaintObjectList() {
  this.div = document.getElementById('object-list');
  this.listbox = document.createElement('select');
  this.listbox.size = 10;
  this.div.appendChild(this.listbox);
  this.selected = null;
  this.selectedHandler = [];
  
  this.allObjects = {};
  
  this.getJson = function() {
    let l = [];
    for (let key in this.allObjects) {
      if (key == NONE_ITM) continue;
      l.push(this.allObjects[key].getJson());
    }
    return l;
  }.bind(this);
  
  this.getSelected = function() {
    if (this.selected in this.allObjects) {
      return this.allObjects[this.selected];
    }
    return null;
  }.bind(this);
  
  this.items = function() {
    let items = Object.values(this.allObjects);
    items.splice(0, 1);
    return items;
  }.bind(this);
  
  this.listbox_changed = function(e) {
    this.getSelected()?.clearUpdate();
    this.selected = this.listbox.value;
    for(let handler of this.selectedHandler) {
      if (this.selected in this.allObjects) {
        handler(this.allObjects[this.selected]);
      } else {
        handler(null);
      }
    }
  }.bind(this);
  this.listbox.addEventListener('change', this.listbox_changed);
  
  this.addSelectedHandler = function(callback) {
    this.selectedHandler.push(callback);
  };
  
  this.add = function(o) {
    let id;
    if (o) id = o.id;
    else id = NONE_ITM;
    
    let opt = document.createElement('option');
    opt.id = "opt-" + id;
    opt.innerText = id;
    opt.value = id;
    this.listbox.appendChild(opt);
    
    if (o) {
      o.newId((oid,nid, o) => {
        if (nid in this.allObjects) return false;
        this.allObjects[nid] = o;
        delete this.allObjects[oid];
        opt.id = "opt-" + nid;
        opt.innerText = nid;
        opt.value = nid;
        return true;
      });
    }
    
    this.allObjects[id] = o;
    
    if (o) {
      this.getSelected()?.clearUpdate();
      this.listbox.value = o.id;
      this.selected = o.id;
      for(let handler of this.selectedHandler) {
        handler(o);
      }
    }
  }.bind(this);
  this.add(null);
  this.listbox.value = NONE_ITM;
  
  this.remove = function(id) {
    if (id in this.allObjects) {
      let opt = document.getElementById('opt-' + id);
      opt.remove();
      delete this.allObjects[id];
      //if (id == this.selected) {
      this.selected = null;
      for(let handler of this.selectedHandler) {
        handler(null);
      }
      //}
    }
  }.bind(this);
}