var Model = function(args) {
  var rows = [], 
      idx=0;
  let append_request_header = (key, value) => {
    $.ajaxSetup({
      beforeSend: (xhr) => {
        xhr.setRequestHeader(key, value);
      }
    }) 
  }
  rows.find_by = function(key, value, callback) {
    if (callback) {
      callback(this);
    } else {
      for (var i = 0; i<this.length; i++) {
        if (this[i][key] === value) {
          return rows[i];
        }
      }
      return null;
    }
  }
  this.find_by = function(key_value, callback) {
    var key = Object.keys(key_value)[0],
        value = key_value[key];
    return rows.find_by(key, value, callback);
  }
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
        let row = rows.find_by('id', key);
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
    var that = this, 
        options = options || {};

    //check for headers are present
    if(options.headers) {
      for (var key in options.headers) {
        //some dog shit condition for bad js assume there are main object prototypes!!
        append_request_header(key, options.headers[key])
        //oddly this can be only performed once ...
        //I wonder if a hash is being used in the library cause append sounds like it'll
        //keep adding additional headers making each subsequent request slower
      } 
    }

    //should use $.ajax to support all the REST CRUD verbs
    //rather than the wrappers
    $.getJSON(url,function(json) {
      if(rows.length > 0) {
        delete rows;
        rows = [];
      }
      if(options.key) that.create(json[options.key]);
      else that.create(json);
      that.display(options.posthook);
    });
    
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
