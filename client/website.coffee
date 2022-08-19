bus.libs.react17.coffreact()

bus.state['markdown'] = ''
bus.state['selection'] = ''
bus.state['saved_points'] = []

# sp.text is the point text
# sp.selection.text is the text that was highlighted to create the point
_example_sp = 
	text: 'how does it know which DNS server to check/the IP of the DNS server?'
	selection:
		top: 133.8125
		text: 'how does it know which DNS server to check/the IP of the DNS server?'

DEBUG = true
if DEBUG
	bus.state['saved_points'].push(_example_sp)

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
		display: 'flex'
		DIV {},
			flex: '3 1 400px'
			padding: '10px'
			border: '1px solid green'
			unescape_html converter.makeHtml bus.state['markdown']
		DIV {},
			flex: '1 2 200px'
			padding: '10px'
			border: '1px solid red'
			H2 'points'
			POTENTIAL_POINT
				selection: bus.state['selection']
			for sp in bus.state['saved_points']
				SAVED_POINT {saved_point: sp, key: "sp:#{sp.text}"}


dom.POTENTIAL_POINT = (selection) ->
	if selection.text
		BR()
		DIV {},
			position: 'absolute'
			top: selection.top + 'px'
			border: '1px dashed blue'
			selection.text
			BR()
			BUTTON {},
				border: '0px'
				onClick: ->
					save_potential_point selection
					clear_selection()
				'make point☝️'
	else null

dom.SAVED_POINT = (saved_point) ->
	DIV {},
		position: 'absolute'
		top: saved_point.selection.top + 'px'
		saved_point.text


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

save_potential_point = (selection) ->
	bus.state['saved_points'].push
		text: selection.text
		selection:
			text: selection.text
			top: selection.top


document.onmouseup = ->
	bus.state['selection'] = get_selection()
