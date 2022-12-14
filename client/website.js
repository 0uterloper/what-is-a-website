// Generated by CoffeeScript 2.7.0
var MOCK_PREFIX, POINT_ENTRY_COLOR, base, clear_selection, converter, get_selection, highlight_text_occurrence, http, point_html, save_potential_point, unescape_html;

bus.libs.react17.coffreact();

bus.libs.localstorage('ls/*');

bus.state['markdown'] = '';

bus.state['selection'] = '';

if ((base = bus.state)['ls/saved_points'] == null) {
  base['ls/saved_points'] = [];
}

bus.state['focus_key_entry'] = false;

POINT_ENTRY_COLOR = '#FDFD96';

MOCK_PREFIX = '/outerloper/mock';

http = new XMLHttpRequest();

http.open('GET', 'data/tryna make a website.md');

http.send();

http.onloadend = function() {
  return bus.state['markdown'] = http.responseText;
};

showdown.setFlavor('github');

converter = new showdown.Converter();

unescape_html = function(html) {
  return {
    dangerouslySetInnerHTML: {
      __html: html
    }
  };
};

dom.BODY = function() {
  var sp;
  return DIV({}, DIV({}, {
    boxSizing: 'border-box',
    float: 'left',
    width: '66%',
    padding: '10px',
    border: '1px solid green'
  }, unescape_html(converter.makeHtml(bus.state['markdown']))), DIV({}, {
    boxSizing: 'border-box',
    float: 'left',
    width: '34%',
    padding: '10px',
    border: '1px solid red'
  }, H2({}, 'points', BUTTON({}, {
    onClick: function() {
      return bus.state['ls/saved_points'] = [];
    },
    background: 'transparent',
    border: '0px'
  }, '📉')), POTENTIAL_POINT({
    selection: bus.state['selection']
  }), (function() {
    var i, len, ref, results;
    ref = bus.state['ls/saved_points'];
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      sp = ref[i];
      results.push(SAVED_POINT({
        saved_point: sp,
        key: `sp:${sp.text}`
      }));
    }
    return results;
  })()));
};

dom.POTENTIAL_POINT = function(selection) {
  if (selection.text) {
    return DIV({}, {
      position: 'absolute',
      top: selection.top + 'px',
      display: 'flex',
      border: '1px dashed blue',
      marginRight: '20px'
    }, DIV({}, DIV({}, {
      display: 'flex',
      justifyContent: 'space-between'
    }, DIV({}, selection.text), BUTTON({}, {
      border: '0px',
      alignSelf: 'flex-start',
      background: 'transparent',
      onClick: function() {
        return clear_selection();
      }
    }, '❌')), DIV({}, {
      backgroundColor: POINT_ENTRY_COLOR
    }, CODE('<point> name: '), POINT_NAME_FIELD({
      selection: selection
    }))));
  } else {
    return null;
  }
};

dom.POINT_NAME_FIELD = function(selection) {
  return INPUT({}, {
    id: 'point_key_entry',
    height: '20px',
    borderWidth: 0,
    resize: 'none',
    autoFocus: true,
    bottom: '1px',
    backgroundColor: POINT_ENTRY_COLOR,
    color: 'blue',
    fontSize: 16,
    className: 'borderless',
    onKeyDown: function(e) {
      if (e.keyCode === 13) {
        return save_potential_point(e.target.value, selection);
      }
    }
  });
};

dom.SAVED_POINT = function(saved_point) {
  return DIV({}, {
    position: 'absolute',
    top: saved_point.selection.top + 'px'
  }, unescape_html(point_html(saved_point.name, saved_point.text)));
};

get_selection = function() {
  var rel, s;
  s = window.getSelection && window.getSelection();
  if (s && (s.anchorNode != null)) {
    rel = document.body.parentNode.getBoundingClientRect();
    return {
      top: s.getRangeAt(0).getBoundingClientRect().top - rel.top,
      text: s.toString()
    };
  } else {
    return {
      top: 0,
      text: ''
    };
  }
};

clear_selection = function() {
  if (window.getSelection) {
    window.getSelection().removeAllRanges();
  }
  return bus.state['selection'] = get_selection();
};

highlight_text_occurrence = function(text) {
  return null;
};

save_potential_point = function(name, selection) {
  bus.state['ls/saved_points'].push({
    name: name,
    text: selection.text,
    selection: {
      text: selection.text,
      top: selection.top
    }
  });
  return clear_selection();
};

point_html = function(name, text) {
  var encoded_name;
  encoded_name = encodeURIComponent(name.replaceAll(' ', '-'));
  return `<point url=\"${MOCK_PREFIX}/${encoded_name}\">${text}</point>`;
};

document.onmouseup = function() {
  var selection;
  selection = get_selection();
  if (selection.text) {
    return bus.state['selection'] = selection;
  }
};

window.onkeypress = function(e) {
  var key_entry;
  if (e.key !== ' ') {
    key_entry = document.getElementById('point_key_entry');
    if ((key_entry != null) && key_entry !== document.activeElement && !key_entry.value) {
      return key_entry.focus();
    }
  }
};
