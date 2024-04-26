function Timer(row) {
  //untility functions (maybe namespace them?)
  const secondsFromNow   = (milliSeconds) => Math.floor(milliSeconds/1000)
  const hoursRemaining   = (s)            => `${Math.floor(s / 3600)}`.padStart(2, '0');
  const minutesRemaining = (s)            => `${Math.floor((s % 3600) / 60)}`.padStart(2, '0');
  const secondsRemaining = (s)            => `${Math.floor(s%60)}`.padStart(2, '0');
  const timeRemaining    = (s)            => [hoursRemaining(s), minutesRemaining(s), secondsRemaining(s)].join(':');
  const htmlRow          = (amount, unit, seconds_remaining, hms_remaining, percentage_elapsed) => {
    return `
      <td > ${row.item || '---'} </td>
      <td> ${row.amount} </td>
      <td> ${row.unit} </td>
      <td> ${seconds_remaining} </td>
      <td> ${hms_remaining}</td>
      <td style="width: 100%">
        <div style="border: 1px solid teal; border-radius: 3px; height: 8px;">
          <div class="w3-teal" style="height:7px;width:${percentage_elapsed}%"></div>
        </div>
      </td>
      <td id="nix-${row.id}"> &#10005; </td>`;
  };
  const tryCatch = (closure) => {
    try {
      closure.call();
    } catch(e) {
      console.log(e);
    }
  }
  this.amount = row.amount;
  this.unit = row.unit;
  this.item = row.item;
  this.duration = (this.amount)[this.unit]();            //wild and whack but see this as (10).seconds() or (10)["seconds"]()
  this.rowId = row.id;                                   //see https://numberjs.dragonwrench.com for API examples
  this.rowElement = document.getElementById(this.rowId); //find the corresponding row to populate with the computed row
  this.timer = row.ttl || this.duration.from_now();      //create a future timestamp aka TTL
  let r1 = this.timer - new Date;                        //remaining time in milliSeconds
  let progress = (1 - r1/this.duration) * 100;           //progress
  let remainingSeconds = secondsFromNow(r1);                           //remaining time in seconds
  if (r1 > 0) {
    this.rowElement.innerHTML = (!row.ttl)?
      htmlRow(this.amount, this.unit, secondsFromNow(this.timer - new Date), timeRemaining(secondsFromNow(this.timer - new Date)), 0) :
      htmlRow(this.amount, this.unit, remainingSeconds, timeRemaining(remainingSeconds), progress);
  } else {
    this.rowElement.innerHTML = htmlRow(this.amount, this.unit, 0, timeRemaining(0), 100);
  }
  this.start = () => {
    this.interval = setInterval(() => {
      let r1 = this.timer - new Date;                    //remaining time in milliSeconds
      let p1 = (1 - r1/this.duration) * 100;
      let s1 = secondsFromNow(r1);                       //remaining time in seconds
      this.rowElement.innerHTML = htmlRow(this.amount, this.unit, s1, timeRemaining(s1), p1);
      if(s1 < 0 || r1 < 0) {
        //should auto matically shut off the loop
        console.log(`clearing this interval: ${this.interval}`);
        clearInterval(this.interval);
        this.rowElement.innerHTML = htmlRow(this.amount, this.unit, 0, timeRemaining(0), 100);
        if (typeof row.sms === 'undefined') {
          tryCatch(() => {
            console.table(row);
            //console.error(row.item);
             
            notifyMe(this.item); 
/*
            document.kitchen.update(
               'id', this.rowId,{sms: true}                //must be the model collection that gets updated
            ); 
*/
            document.kitchen.find_by({id: this.rowId}).sms = true;
            document.kitchen.save();                       //localStorage
          })
        }
      };
      document.querySelectorAll('td[id^=nix-]').forEach((el) => {
        el.onclick = function(e) {
          let id = parseInt(e.target.id.split("-")[1]);
          console.log(`need to clear interval for this id ${id}`);
          clearInterval(document.kitchen.find_by({id: id}).interval);
          document.kitchen.destroy(id);
          document.kitchen.save();                       //localStorage
        }
      })
    }, 500);
    return this.timer;
  }
}
