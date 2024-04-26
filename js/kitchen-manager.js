function KitchenManager(args) {
  Model.apply(this,args); //need to modify destroy or upgrade it ;-)
  LocalStorage.apply(this,args);
  this.timers = [];
  this.create(args); //will add the id attribute to each timer aka row
  this.display = () => {
    let rows = this.data().map(
      (row) => `<tr id='${row.id}'></tr>`
    ).join('');
    let default_html = `
      <table id="timerList">
        <tr>
          <th> item </th>
          <th> amount </th>
          <th> unit </th>
          <th> seconds remaining </th>
          <th> time remaining </th>
          <th> progress </th>
          <th> </th>
        </tr>
        ${rows}
      </table>
    `;
    document.getElementById('app').innerHTML = default_html;
    this.data().forEach((row) => {
    //perhaps 
      let t = new Timer(row);
      this.timers.push(t);
      row.ttl = t.start();
      row.interval = t.interval;
    });
    return this;
  }

  //override parent method?
  this._restore = this.restore; //backup original
  this.restore = () => {
    this._restore(() => { this.timers.map((timer) => clearInterval(timer.interval)); this.timers = [] })
  }
  //now invoke save on create or delete (there's no update yet)
  if(localStorage.ktimer) {
    this.restore()
    return
  }

  this.display();
}
