var break_on = [".", "?", "!"];
var exceptions = ["e.g.", "i.e.", "al.", "Fig.", "vs.", "p.", "ie.", "eg.", "vs.", "Ex.", "pp.", "ref.", "sec."];
var pre_except = [" ", "(", "["]
var bullets = ["* ", "- "];


function parse_pcs(s, rid)
{
  var sin = s.split("\n");
  
  var newl = [];
  var cl = ["", -1];
  for (var i = 0; i < sin.length; ++i) {
  	var l = sin[i].trim();
    if (l == "") {
      if (cl[0] != "") {
        newl.push(cl);
        cl = ["", -1];
      }
      continue;
    }
    if (cl[0] != "") {
      for (var b = 0; b != bullets.length; ++b) {
        if (cl[0].startsWith(bullets[b]) && l.startsWith(bullets[b])) {
          newl.push(cl);
          cl = ["", -1];
          break;
        }
      }
    }

    var j = 0;
    while (true) {
      if (l == "") {
        break;
      }
      var rs = "";
      for (var b = 0; b != break_on.length; ++b) {
        var js = 0;
        while (true) {
          var k = l.indexOf(break_on[b], js);
          if (k != -1) {
            if (l.length > k + 1) {
              if (l[k+1] == ' ') {
                if (k > 0 && (j == 0 || k < j)) {
                  j = k;
                }
              } else {
                js = k+1;
                continue;
              }
            } else {
              j = k;
            }
          }
          break;
        }
      }
      if (j == 0) {
        cl[0] += l;
        if (cl[1] == -1) {
          cl[1] = i;
        }
        break;
      }
      
      var sl = l.substr(0, j + 1);
      rs = l.substr(j + 1).trim();
      var cut = true;
      for (var e = 0; e != exceptions.length; ++e) {
        if (sl.toLowerCase().endsWith(exceptions[e].toLowerCase()) && pre_except.indexOf(sl[sl.length - 1 - exceptions[e].length]) >= 0) {
          cut = false;
          cl[0] += sl;
          l = rs;
          continue;
        }
      }
      if (cut) {
        if (cl[0].length) {
          cl[0] += " ";
        }
        cl[0] += sl;
        newl.push(cl);
        cl = ["", -1];
        l = rs;
        j = 0;
      }
    }
  }
  if (cl[0] != "") {
    newl.push(cl);
  }
  return newl;
}


function parse_pcsOLD(s, rid)
{
  var sin = s.split("\n");
  
  var newl = [];
  var cl = "";
  for (var i = 0; i != sin.length; ++i) {
  	var l = sin[i].trim();
  	if (l == "" || bullets.indexOf(l.slice(0, 2)) > -1) {
  		newl.push(cl);
  		newl.push(l);
  		cl = "";
    } else {
  		if (cl.length && cl[cl.length - 1] != " ") {
  			cl += " ";
      }
  		cl += l;
    }
  }
  newl.push(cl);

  var n = true;
  var outl = [];
  cl = "";
  for (var j = 0; j != newl.length; ++j) {
    var l = newl[j];
  	if (l == "") {
  		if (outl.length != 0) {
  			outl.push("");
      }
  	} else {
  		for (var i = 0; i != l.length; ++i) {
        var ch = l[i];
        var stp = false;
        if (break_on.indexOf(cl[cl.length - 1] + ch) > -1) {
          var ll = l.toLowerCase();
  			  for (var k = 0; k != exceptions.length; ++k) {
  			    if (l.endsWith(exceptions[k])) {
  			      stp = true;
              break;
  			    }
  			  }
          if (!stp && (cl.length < 2 || !cl[cl.length - 2] == " ")) {
    				cl += " (R" + rid + ")" + ch;
    				outl.push(cl);
    				cl = "";
    				n = true;
          }
        }
        if (stp) {
  				if (n) {
  					if (ch == " ") {
  						continue;
            }
  					cl += "R" + rid + " ";
  					n = false;
          }
  				cl += ch;
        }
      }
    }
  }
  if (cl != "") {
  	outl.push(cl)
  }
  return outl;
}
