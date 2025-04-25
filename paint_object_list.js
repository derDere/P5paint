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
    items.splice(0, 1);  // Remove the [ADD] item
    // Sort items by zIndex
    items.sort((a, b) => a.zIndex - b.zIndex);
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
      // Set initial zIndex to last position and reorder all indices
      let items = this.items();
      o.zIndex = items.length;  // Put at end initially
      this.reorderZIndices();   // Ensure sequential order
      
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
  this.reorderZIndices = function() {
    let items = this.items();
    // Sort by current zIndex
    items.sort((a, b) => a.zIndex - b.zIndex);
    // Reassign sequential zIndex values
    items.forEach((item, index) => {
      item.zIndex = index;
    });
  }.bind(this);

  this.moveUp = function(id) {
    if (id in this.allObjects) {
      let items = this.items();
      let currentIndex = items.findIndex(item => item.id === id);
      if (currentIndex > 0) {
        // Swap items
        let temp = items[currentIndex].zIndex;
        items[currentIndex].zIndex = items[currentIndex - 1].zIndex;
        items[currentIndex - 1].zIndex = temp;
        // Ensure sequential order
        this.reorderZIndices();
        // Update listbox order
        this.updateListboxOrder();
      }
    }
  }.bind(this);

  this.moveDown = function(id) {
    if (id in this.allObjects) {
      let items = this.items();
      let currentIndex = items.findIndex(item => item.id === id);
      if (currentIndex < items.length - 1) {
        // Swap items
        let temp = items[currentIndex].zIndex;
        items[currentIndex].zIndex = items[currentIndex + 1].zIndex;
        items[currentIndex + 1].zIndex = temp;
        // Ensure sequential order
        this.reorderZIndices();
        // Update listbox order
        this.updateListboxOrder();
      }
    }
  }.bind(this);

  this.updateListboxOrder = function() {
    // Store selected value
    let selectedValue = this.listbox.value;
    
    // Clear all options except [ADD]
    while (this.listbox.children.length > 1) {
      this.listbox.removeChild(this.listbox.lastChild);
    }
    
    // Re-add all items in correct order
    let items = this.items();
    for (let obj of items) {
      let opt = document.createElement('option');
      opt.id = "opt-" + obj.id;
      opt.innerText = obj.id;
      opt.value = obj.id;
      this.listbox.appendChild(opt);
    }
    
    // Restore selection
    this.listbox.value = selectedValue;
  }.bind(this);
}