last_drop_destination = null;
last_drop_item = null;

function persist_state() {
  localStorage.setItem('output', document.getElementById('output').innerHTML);
  localStorage.setItem('segments', document.getElementById('sortable_wrapper').innerHTML);
  localStorage.setItem('pcs_raw', document.getElementById('pcs_raw').value);
}


function import_raw(add) {
  var t = document.getElementById('pcs_raw');
  var r = document.getElementById('reviewer_id');
  var sep = parse_pcs(t.value, r.value);
  var blk = document.getElementById('sortable_wrapper');
  if (!add) {
    while (blk.firstChild) {
        blk.removeChild(blk.firstChild);
    }        
  }
  for (var i = 0; i != sep.length; ++i) {
    if (sep[i][0] != "") {
      var div = document.createElement('li');
      div.classList.add('r' + r.value);
      div.classList.add('item');
      div.dataset.line = sep[i][1] + 1;
      div.addEventListener('click', item_clicked);
      div.addEventListener('dblclick', item_dblclicked);
      var t = document.createElement('span');
      t.innerText = sep[i][0];
      t.classList.add('tdesc');
      t.addEventListener('keydown', text_keydown);
      div.appendChild(t);
      var b = document.createElement('span');
      b.classList.add('brep');
      b.addEventListener('click', brep_clicked);
      div.appendChild(b);
      var bi = document.createElement('img');
      bi.src = "aright.png";
      bi.classList.add('bmerge');
      bi.addEventListener('click', bmerge_clicked);
      div.appendChild(bi);
      blk.appendChild(div);
    }
  }
  sortable('#sortable_wrapper', {
    forcePlaceholderSize: true
  })[0].addEventListener('sortupdate', item_sorted);
  
  persist_state();
}


function clear_pcs() {
  var t = document.getElementById('pcs_raw');
  var r = document.getElementById('reviewer_id');
  t.value = "";
  r.value = "1";
  t.focus();
  persist_state();
}


function clear_all() {
  var t = document.getElementById('pcs_raw');
  var r = document.getElementById('reviewer_id');
  t.value = "";
  r.value = "1";
  t.focus();
  var s = document.getElementById('sortable_wrapper');
  s.innerHTML = '';
  var o = document.getElementById('output');
  o.innerHTML = '';
  init_ui();

  persist_state();
  t.focus();
}


function render_text() {
  var o = document.getElementById('output');
  var os = '';
  
  for (var i = 0; i < o.children.length; ++i) {
    if (o.children[i].classList.contains('newsortable')) {
      continue;
    }
    s = o.children[i];
    os += s.children[1].innerText + '\n\n';
    for (j = 0; j < s.children[2].children.length; ++j) {
      p = s.children[2].children[j];
      var r = '';
      for (var k = 0; k < p.classList.length; ++k) {
        if (p.classList[k][0] == 'r') {
          r = p.classList[k].toUpperCase();
          break;
        }
      }
      os += p.innerText;
      if (r != '') {
        os += ' (' + r + ')';
      }
      os += ' L' + p.dataset.line;
      os += '\n';
    }
    os += '\n';
  }

  var r = document.getElementById('pcs_raw');
  r.value = os;
}


function item_clicked(e) {
  if (e.detail == 1) {
    if (e.srcElement.tagName != 'SPAN' || !e.srcElement.getAttribute('contenteditable')) {
      click_ev = window.setTimeout(function() {
        if (e.srcElement.tagName == 'SPAN') {
          e.srcElement.parentElement.classList.toggle('read');
        } else {
          e.srcElement.classList.toggle('read');
        }
        persist_state();
      }, 200);
    }
  }
}


function item_dblclicked(e) {
  window.clearTimeout(click_ev);
  var el = e.srcElement;
  if (el.tagName == 'SPAN') {
    el.setAttribute('contenteditable', 'true');
    el.focus();
  }
}


function item_sorted(e) {
  last_drop_destination = e.detail.destination.contained;
  last_drop_item = e.detail.item;
  persist_state();
}


function brep_clicked(e) {
  if (last_drop_item) {
    var el = e.target.parentElement;
    el.parentElement.removeChild(el);
    last_drop_item.after(el);
    last_drop_item = el;
  }
}


function bmerge_clicked(e) {
  var el = e.srcElement.parentElement;
  if (el.nextSibling != null) {
    el.children[0].innerText = el.children[0].innerText + '\n' + el.nextSibling.children[0].innerText;
    el.parentElement.removeChild(el.nextSibling);
    persist_state();
  }
}


function hpref_changed() {
  var b = document.getElementById('heading_pref');
  if (b.value == '=') {
    var a = document.getElementById('heading_post');
    a.value = '=';
    var s = document.getElementById('heading_space');
    s.checked = true;
  }
}


function hpost_changed() {
  
}


function title_focus(el) {
  if (el.parentElement.classList.contains('newsortable')) {
    document.execCommand('selectAll',false,null);
    el.parentElement.classList.remove('newsortable');
  }
}


function move_up(el) {
  var p = el.parentElement.parentElement.parentElement;
  if (p.children.length > 3) {
    var dc = el.parentElement.parentElement;
    var dt = dc.previousElementSibling;
    if (dt.previousElementSibling != null) {
      var c2 = dt.previousElementSibling;
      p.insertBefore(dc, c2);
      p.insertBefore(dt, c2);
    }
  }
  persist_state();
}


function move_down(el) {
  var p = el.parentElement.parentElement.parentElement;
  if (p.children.length > 3) {
    var dc = el.parentElement.parentElement;
    var dt = dc.nextElementSibling;
    if (dt.nextElementSibling != null) {
      var t2 = dt.nextElementSibling.nextElementSibling;
      p.insertBefore(dc, t2);
      p.insertBefore(dt, dc);
    }
  }
  persist_state();
}


function title_placeholder() {
  var div = document.createElement('div');
  div.classList.add('section');
  div.classList.add('newsortable');
  div.innerHTML = 
      '<div class="segment_move">'
    + '<span class="move_up" onclick="move_up(this);">&#9650;</span>'
    + '<span class="move_down" onclick="move_down(this);">&#9660;</span>'
    + '</div>'
    + '<h2 onclick="title_focus(this);" onmousedown="return mouse_down(this,event);" onfocusout="return focus_out(this,event);" onkeydown="return title_down(this,event);">title</h2>';
  return div;
}


function mouse_down(el, event) {
  el.setAttribute('contenteditable', 'true');
}


function focus_out(el, event) {
  el.setAttribute('contenteditable', 'false');
}


function title_down(el, event) {
  if (event.keyCode == 13) {
    window.getSelection().removeAllRanges();
    var d = el.parentElement;
    if (el.nextElementSibling == null) { //.tagName != 'UL') {
      var ul = document.createElement('ul');
      var blk = document.getElementById('sortable_wrapper');
      ul.classList.add('sortable');
      ul.classList.add('outsortable');
      d.appendChild(ul);

      d.parentElement.insertBefore(title_placeholder(), d);
      if (d.nextElementSibling == null) {
        d.parentElement.appendChild(title_placeholder());
      } else {
        d.parentElement.insertBefore(title_placeholder(), d.nextElementSibling);
      }
      
      sortable('.outsortable', {
        forcePlaceholderSize: true,
        acceptFrom: '.sortable'
      })[0].addEventListener('sortupdate', item_sorted);
    } else {
      if (el.innerText == '' && el.nextElementSibling.children.length == 0) {
        var p = d.parentElement;
        p.removeChild(d.nextElementSibling);
        p.removeChild(d);
      }
    }
    
    el.setAttribute('contenteditable', 'false');
    persist_state();
    return false;
  }
}


function text_keydown(ev) {
  if (ev.keyCode == 13 && ev.metaKey) {
    ev.srcElement.setAttribute('contenteditable', 'false');
  }
}


function onload() {
}


function init_ui() {
  if (output.children.length == 0) {
    document.getElementById('output').appendChild(title_placeholder());
  }
}


document.addEventListener("DOMContentLoaded", function(event) {
  document.getElementById('pcs_raw').value = localStorage.getItem('pcs_raw');
  var blk = document.getElementById('sortable_wrapper');
  blk.innerHTML = localStorage.getItem('segments');
  for (var i = 0; i != blk.children.length; ++i) {
    blk.children[i].addEventListener('click', item_clicked);
    blk.children[i].addEventListener('dblclick', item_dblclicked);
  }
  var br = document.getElementsByClassName('brep');
  for (var i = 0; i != br.length; ++i) {
    br[i].addEventListener('click', brep_clicked);
  }
  var bm = document.getElementsByClassName('bmerge');
  for (var i = 0; i != bm.length; ++i) {
    bm[i].addEventListener('click', bmerge_clicked);
  }
  var bt = document.getElementsByClassName('tdesc');
  for (var i = 0; i != bt.length; ++i) {
    bt[i].addEventListener('keydown', text_keydown);
  }
  
  var output = document.getElementById('output');
  output.innerHTML = localStorage.getItem('output');
  init_ui();
  
  sortable('#sortable_wrapper', {
    forcePlaceholderSize: true
  })[0].addEventListener('sortupdate', item_sorted);
  var sa = sortable('.outsortable', {
    forcePlaceholderSize: true,
    acceptFrom: '.sortable'
  });
  for (var i = 0; i != sa.length; ++i) {
    sa[i].addEventListener('sortupdate', item_sorted);
  }
});
