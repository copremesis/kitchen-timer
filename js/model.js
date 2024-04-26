var Model = function(args) {
  let rows = [],
      idx=0;
/*
  let append_request_header = (key, value) => {
    $.ajaxSetup({
      beforeSend: (xhr) => {
        xhr.setRequestHeader(key, value);
      }
    })
  }
*/
  //decoration of native objects is frowned upon

  const find_by = function(key, value, callback) {
    //callback = callback || function () {};
    if (callback) {
      callback(rows);
    } else {
      for (var i = 0; i<rows.length; i++) {
        if (rows[i][key] === value) {
          return rows[i];
        }
      }
      return null;
    }
  }
  this.find_by = function(key_value, callback) {
    var key = Object.keys(key_value)[0],
        value = key_value[key];
    return find_by(key, value, callback);
  }
  this.setIndex = (n) => idx = n;
  this.index = () => idx;
  this.first = function() { return rows[0]; }
  this.second = function() { return rows[1]; }
  this.last  = function() { return rows[rows.length-1]; }
  this.count = function() { return rows.length; }
  this.create = function(data, options) {
    var options = options || {};
    if (options.reset) { rows = []; }
    if(data.constructor.name === "Object") {
      rows.push((options.noIndex)? data : Object.assign({id: ++idx}, data));
    } else {
      if(options.noIndex) {
        rows = data;
      } else {
        data.map(function(row) {
          rows.push(Object.assign({id: ++idx}, row));
        });
      }
    }
    return this;
  }

//this is where assumptions begin
//as we need a way to match the exact row
//this assumes there's a primary key
//if not specified then there is one automatically generated called `id`
  this.update = function(key, keyname='id', update_row, callback) {
     callback = callback || function () {};
     switch(keyname) {
      case 'id':
        let row = find_by('id', key);
        rows[rows.indexOf(row)] = Object.assign(row, update_row);
        callback();
        return rows[rows.indexOf(row)];
      default:
        rows[key] = Object.assign(rows[key], update_row);
        callback();
        return rows[key];
     }
  }

  this.destroy = function(key, keyname='id') {
    //console.log(key, keyname, rows.filter((row) => (row[keyname] !== key)));
    this.create(rows.filter((row) => (row[keyname] != key)), {noIndex: true}).display();
  }

  this.debug = function() {
    console.log(JSON.stringify(rows, null, 2));
  }

  this.truncate = function() { rows = [];  return this;}
  this.data = function() {
    return rows;
  }

  this.slurp_xhr = function(url, options) {
    //wip could also be an override plugin vs defined here
    //see LocalStorage as an override plugin
    //we can have 3 different ways ie:
    //axios/fetch/jquery 
  }

  this.each = function(closure) {
    var closure = closure || function(e) { return e;};
    return rows.map(closure);
  }

  this.display = function(event_block, options) {
    var options = options || {};
    var t = new Table(rows, { klass: "table table-inverse"} ),
        event_block = event_block || function() {};
    var current_tab = options.tabname || location.hash.replace(/\W+/, '').split(/\//)[0];
    $('#' + current_tab).html(t.html_table());
    var table = $('#' + t.id).DataTable(
      {
        select: true,
        order: [[ 3, "desc" ]],
        pageLength: 50
      }
    );
    event_block.apply();
    table.on('search order', function() {
      event_block.apply();
    });
    table.on('page', function() {
      event_block.apply();
    });
    return t.html_table();
  }
}
