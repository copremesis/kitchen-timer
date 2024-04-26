//extension of model.js
//for localStorage methods save & restore
function LocalStorage(args) {
  this.save = () => {
    localStorage.ktimer = JSON.stringify({ data: this.data(), offset: this.index() })
  }
  this.restore = (closure) => {
    closure = closure || function() {}
    closure();      //remove and clear all previous intervals
    let rows = JSON.parse(localStorage.ktimer)
    this.truncate();
    this.create(rows.data, {noIndex: true});
    this.setIndex(rows.offset);
    this.display(); //through the override in the kitchen manager code start a new set of workers
  }
}
