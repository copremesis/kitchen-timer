    //start a default timer
    document.kitchen = new KitchenManager(
      [
        {
          item: 'Chicken',
          amount: 30,
          unit: 'minutes',
        },
        {
          item: 'Brisket',
          amount: 6,
          unit: 'hours',
        },
        {
          item: 'Proof Dough',
          amount: 1.5,
          unit: 'hours',
        },
      ]
    );
    const resetTimers = () => {
//should abstract cause it's particular 
      //perhaps shift them off then delete them too?
      document.kitchen.timers.forEach((timer) => {
        clearInterval(timer.interval);
        let x = document.kitchen.timers.shift();
      });
      //vs this (leaving something around even if it's dormant)
      document.kitchen.timers = [];
//
    }
    //add a new timer
    document.nextTimer.add.onclick = (e) => {
      e.preventDefault();
      //clean up the mess beforhand
      resetTimers();
      document.kitchen.create({
        item: document.nextTimer.nextItem.value,
        amount: parseFloat(document.nextTimer.nextAmount.value || 60),
        unit: document.nextTimer.nextUnit.value
      }).display().save();
    }


    const horseRace = () => {
      resetTimers();
      document.kitchen.create({
        item: 'horse-' + Math.random().toString(16),
        amount: Math.floor(Math.random() * 30),
        unit: 'seconds' 
      }).display().save();
    }
    
    document.debug = () => {
      console.log(JSON.stringify(document.kitchen.data(), null, 2))
      console.table(document.kitchen.data());
      console.log(document.kitchen.timers.map((timer) => timer.interval))
    }
