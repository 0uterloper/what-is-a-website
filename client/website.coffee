bus.libs.react17.coffreact()
bus.libs.localstorage('ls/*')

bus.state['markdown'] = ''
bus.state['selection'] = ''
bus.state['ls/saved_points'] ?= []

bus.state['focus_key_entry'] = false

POINT_ENTRY_COLOR = '#FDFD96'
MOCK_PREFIX = '/outerloper/mock'

http = new XMLHttpRequest()
http.open('GET', 'data/tryna make a website.md')
http.send()
http.onloadend = ->
	bus.state['markdown'] = http.responseText

showdown.setFlavor('github')
converter = new showdown.Converter()
unescape_html = (html) -> {dangerouslySetInnerHTML: {__html: html}}

dom.BODY = -> 
	DIV {},
		DIV {},
			boxSizing: 'border-box'
			float: 'left'
			width: '66%'
			padding: '10px'
			border: '1px solid green'
			unescape_html converter.makeHtml bus.state['markdown']
		DIV {},
			boxSizing: 'border-box'
			float: 'left'
			width: '34%'
			padding: '10px'
			border: '1px solid red'
			H2 {},
				'points'
				BUTTON {},
					onClick: -> bus.state['ls/saved_points'] = []
					background: 'transparent'
					border: '0px'
					'📉'
			POTENTIAL_POINT
				selection: bus.state['selection']
			for sp in bus.state['ls/saved_points']
				SAVED_POINT {saved_point: sp, key: "sp:#{sp.text}"}


dom.POTENTIAL_POINT = (selection) ->
	if selection.text
		DIV {},
			position: 'absolute'
			top: selection.top + 'px'
			display: 'flex'
			border: '1px dashed blue'
			marginRight: '20px'
			DIV {},
				DIV {},
					display: 'flex'
					justifyContent: 'space-between'
					DIV {},
						selection.text
					BUTTON {},
						border: '0px'
						alignSelf: 'flex-start'
						background: 'transparent'
						onClick: -> clear_selection()
						'❌'
				DIV {},
					backgroundColor: POINT_ENTRY_COLOR
					CODE '<point> name: '
					POINT_NAME_FIELD
						selection: selection
	else null

dom.POINT_NAME_FIELD = (selection) ->
	INPUT {},
		id: 'point_key_entry'
		height: '20px'
		borderWidth: 0
		resize: 'none'
		autoFocus: true
		bottom: '1px'
		backgroundColor: POINT_ENTRY_COLOR
		color: 'blue'
		fontSize: 16
		className: 'borderless'
		onKeyDown: (e) ->
			if e.keyCode == 13 then save_potential_point e.target.value, selection


dom.SAVED_POINT = (saved_point) ->
	DIV {},
		position: 'absolute'
		top: saved_point.selection.top + 'px'
		unescape_html point_html saved_point.name, saved_point.text


get_selection = ->
	s = window.getSelection && window.getSelection()
	if s && s.anchorNode?
		rel = document.body.parentNode.getBoundingClientRect();
		top: s.getRangeAt(0).getBoundingClientRect().top - rel.top
		text: s.toString()
	else
		top: 0
		text: ''
clear_selection = ->
	if window.getSelection
		window.getSelection().removeAllRanges()
	bus.state['selection'] = get_selection()

highlight_text_occurrence = (text) ->
	null

save_potential_point = (name, selection) ->
	bus.state['ls/saved_points'].push
		name: name
		text: selection.text
		selection:
			text: selection.text
			top: selection.top
	clear_selection()

point_html = (name, text) ->
	encoded_name = encodeURIComponent name.replaceAll(' ', '-')
	"<point url=\"#{MOCK_PREFIX}/#{encoded_name}\">#{text}</point>"


document.onmouseup = ->
	selection = get_selection()
	if selection.text then bus.state['selection'] = selection

window.onkeypress = (e) ->
	if e.key != ' '
		key_entry = document.getElementById('point_key_entry')
		if key_entry? and key_entry != document.activeElement and !key_entry.value
			key_entry.focus()
