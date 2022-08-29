# This appears to be a website
## What's *really* going on here
- you type a URL into chrome
	- if the URL's [domain?] is not an IP address, it goes to a DNS server
		- Question: how does it know which DNS server to check/the IP of the DNS server?
		- Is this right?: chrome makes an http request to the IP of the DNS server
		- the DNS server responds with a URL whose [domain?] is an IP address
			- I'm unsure about my terminology here
	- based on rules I don't understand, it either changes what it shows in the address bar to be the address returned by the DNS server or it doesn't
		- something about DNS records and CNAME and "A" something
		- this has some other consequences. For example, when I was using `<point>` tags, it was telling the `<point>` server that this `<point>` also existed on [X] URL, where [X] was the address sitting in my address bar, i.e. whatever this process determined
	- an http request is sent to the server with the new URL which has as its [domain?] the IP address with specified port or port 80 if none is specified
	- if there is a process on the computer at that IP address listening on that port, it gets the http request
		- a "process" meaning, with my current knowledge, a node http server running `server.listen`
			- I think Express gives a nicer abstraction here, and a lot of people use it. I haven't actually tried it yet
			- I tried to use node https from [this tutorial](https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/) but it didn't work. Will figure out later
		- The handler (function with `(req, res)` as args) executes -- you are now running whatever code you wrote on the server
		- The server can do whatever it wants with that. If it wants to make anything happen visible to the Chrome user, it should send a response, which can be a number of different formats
			- Chrome responds differently, in the context of typing a URL into the address bar, depending on type. Generally speaking, returning an HTML file is the standard workflow
			- This line does it, but I don't really know in-depth what's happening here:
				- `fs.createReadStream('index.html').pipe(res)`
- If the response comes back with an html file, a web page loads. Now you're in HTML land
	- the html file can link CSS, which is typically served from the same server
		- I hear tell of other languages (LESS? SASS?) which can replace CSS; no idea how they work and if anything is different here
		- I think Express also makes this nicer (`bus` is statebus): 
			- `bus.http.use('/static', require('express').static('static'))`
	- the html file can have `<script>` tags, which I've used for two main functions:
		- import third-party js libraries to be run in the client code
			- Either by using a remote URL where someone has packaged it up already
				- unpkg is good: this [blog post](https://kentcdodds.com/blog/unpkg-an-open-source-cdn-for-npm) makes sense of it for me
					- node server that acts as a proxy to the files that are on npm
					- does some fancy caching stuff (CDN = Content Delivery Network) to make it faster than whatever people did before this
					- `<script src="https://unpkg.com/statebus@6.1.25/client.js" />`
					  to get `client.js` from statebus v6.1.25 in npm
					- if it's in npm, this will work. It doesn't require that the maintainer put it there. (Right?)
					- How do you know the name/location of the file you want? I think I got this far because really well-maintained popular packages just tell you what to do in the github readme *including this step* (this is why I had seen unpkg before, but just thought it was a website for hosting code). What about when this is not the case (looking at you, statebus)?
						- Working solution is to npm install and inspect the files. eh
						- Probably worth learning a better answer to this at some point
			- or by putting it in a folder somewhere on the server (commonly named `vendor`) and serving it from the server, just like the CSS
		- import the actual logic of your app (client code)
			- I'm noticing I'm confused aobut something: in my app, the third-party code has the server doing this Express thing to serve from a `static` folder when requests are made to URLs starting with `static/`. Why do I not have this for `client/`, where my code lives?
				- Is statebus doing a default behavior of sending a file when the URL points to it? Is that default behavior of a node webserver in the first place? What's the point of the express line about static serving if so?
	- the html file can have html
		- I'm using react pretty exclusively to construct my DOM; I gather that people do hybrid stuff because the HTML loads faster than anything the JS constructs, and that could matter
- Supposing you structure your thing like I do (react/statebus UI, html just has `<head>` stuff), you are now executing the client code. You're in the app. Congrats!

## Setup steps
- make the app, i.e. the client code
	- in my case statebus coffeescript and `index.html`, `styles.css`
	- transpile the coffeescript to javascript; that is what will be served
- get a [server (hardware)]
- set up the [server (hardware)]
	- getting node up and running, unix admin, all that good stuff
- get a domain
- point the domain at your server
- Write little node http server that serves all the static files on port 80
- Run the node server in a screen
- done?

## Statebus bs
- if you use a `dom.SOMETHING` component, the arguments have to be passed in as keywords, not positionally
	- because of how this is parsed, you *can't* do the thing you do for the built-in ones (like `DIV`), where you have a leading `{}` in the args to make it look pretty, because it will look *inside* that empty object for all the args, and not see keyword args that come after it
	- there's probably a good reason for all of this. This is the only place it's documented AFAIK.

### Updating to statebus v7
#### Up front
1. Import a boatload of stuff from unpkg:
```html
<!-- Include React stuff -->
<script src="https://unpkg.com/react@16/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js" crossorigin></script>
<script src="https://unpkg.com/create-react-class@15.7.0/create-react-class.min.js" crossorigin></script>
<script src='https://unpkg.com/babel-standalone@6/babel.min.js' crossorigin></script>

<!-- Include Statebus and Braidify libraries -->
<script src='https://stateb.us/code/statebus/extras/coffee.js'></script>
<script src='https://unpkg.com/statebus@7.0.10/statebus.js'></script>
<script src='https://unpkg.com/statebus@7.0.10/client-library.js'></script>
<script src='https://unpkg.com/braidify/braidify-client.js'></script>
```
- I heard tell that one goal updating statebus 6 to 7 was to separate modules for the client libraries, the coffeescript UI compiler, and the actual statebus code. This makes sense to me.
	- What doesn't make sense to me is that you have to import statebus *separately* from the client library before the client library will work. They communicate across the global namespace and the client library assumes things to be in the gobal namespace that statebus puts there
	- This seems utterly insane to me. Why does the module not handle its own dependencies when I import it? I suspect I have some flawed understanding of how all this works due to anchoring on python and pip.
		- My first impulse might be to blame statebus and its current in-between-versions hackiness, except that REACT IS REQUIRING THE SAME THING RIGHT ABOVE. ???

2. Strap in: you have to add 
```html
<script>
  bus.libs.react17.coffreact()
</script>
```
AFTER the import lines in the HTML, AND that JS line needs to be added at the top of the client code
- I do not understand this at all
	- If it's not in the client code, you get `dom is not defined`
	- If it's not in the HTML, `dom.BODY` doesn't get executed and rendered
	- seems very sus and I should probaby figure out what's happening here. later.

#### Code changes
- Change `dom` components that return `undefined` to return `null` when not rendering
	- React 12 was okay with returning `undefined` to render nothing. I used this in at least one place for a `dom` component that only renders under a certain condition. This amounted to adding `else null` at the end
- Add `key` props to components in lists
	- This was a thing before but the warning logging is more intense and annoying in React 16
	- I'm told this is in case you want to reorder child components, the `key` prop allows this to be done efficiently. eh.
		- I got a style suggestion that when doing statebus coffeescript, instead of the leading empty object e.g. `DIV {},` I should use that spot to add a key, like `DIV key: div1,`. Seems reasonable. Probably won't do off just that, but I'll keep it on my radar
	- This has to go on the React component that's in the list, rather than its children (unless they're in a list too)
		- These don't map perfectly; I have a `dom.SAVED_POINT` component which has a div in it. In the actual DOM on the web page the div exists but there's no HTML element called `potential_point`. nevertheless the `potential_point`s are the ones that need a key, not the divs inside. 🤷‍♂️ 
		- this [stackoverflow question's top answer](https://stackoverflow.com/questions/28329382/understanding-unique-keys-for-array-children-in-react-js) seems to contradict what I'm saying about children. but doing it as I've described made the warning from react go away. 🤷‍♂️ 

and uh, voila! These were the necessary changes to migrate this page (points demo thing) from statebus v6 to v7. Onward to integrating points~

### More statebus
- Wanted to make a textarea not have a border on focus. Good solution from StackOverflow: `textarea:focus { outline: none; }`
	- Problem is it's a new style rule, which afaict is not supported in the statebus client libs.
	- Easy solution is to use CSS, but noting here that I would've preferred to do this in the coffeescript code if it were possible
		- Note: to add CSS classes it's `className` instead of `class`

## Points bs
- Add `<script src="https://braid.org/point.js"></script>` into head of HTML
	- Immediately get
	  `client6.js:13 Uncaught TypeError: Cannot read properties of undefined (reading 'div') at https://stateb.us/client6.js:13:18513` upon highlighting text (rather than intended behavior of showing a `POTENTIAL_POINT` to the side)
	- Aha: the culprit is that statebus uses a very old version of React (v0.12.2)
		- `React.DOM[e]` in https://stateb.us/client6.js.
		- Non-minified: `client.js` from npm statebus, line 670: `React.DOM[el]`
		- This is a deprecated dictionary of factory functions. It was **removed in release v16.0.0**.
			- Github issue: [#8356](https://github.com/facebook/react/pull/8356)
	- It looks like points.js has support explicitly for React17 and 18; I would guess based on above 16 would work too.
- Statebus 7 uses React 17. I should either update to SB7 or scrap SB.
	- In a vacuum, scrapping SB would make sense; this is a very simple site that doesn't really need it
	- But I must learn! And if I get over the SB7 hurdle, it will be easier to expand
- Lo and behold! I fixed that problem! and still adding points causes my highlight thing to stop working!
	- Seems like it works for maybe a second or so when I load the page, then stops working
	- I notice when I add points I get the logging message suggesting I download the react devtools a second time, with a different link to reactjs.org rather than just fb.me
		- From this I'm guessing points is still clobbering some kind of react versioning and messing with statebus
	- Unfortunately there's no error this time, it's just not running the code
	- I found somewhere where points is importing statebus client code under a weird different name and the code is slightly edited in a way that seems relevant
		- That indeed seems to be the problem. I copied `point.js` to my server and edited this line out and things seem to be working.
		- Why did this happen?
	- I've been talking to Greg, who wrote `point.js`, and apparently statebus client library and braidify both don't like being included twice. This is a bug in those places, but for now, he modified `point.js` to check if they have already been included and not include again if so. Fixed this problem.
- Now I have `React.createClass is not a function` in the console
	- Specifically, when I load the page with a `<point>` tag already on screen
	- Probably because [`createClass` got moved to its own module](https://stackoverflow.com/a/46482830)
		- But this doesn't fully explain the situation, because `create-react-class` is being included, both in `index.html` and `point.js`.
	- I updated the code to use `createReactClass` (from global namespace) instead of `React.createClass` as recommended in another answer to that StackOverflow question. Seemed to work.

## CSS bs
- if an element has `position: absolute`, it doesn't affect the size scaling of its parent
	- I had a textbox that I wanted to be flush with the bottom of its div. I set its position to absolute based on an answer I found for how to do that
	- Later the container was sometimes not wide enough and the text box stuck out the side. 
	- After trying a bunch of stuff with `min-width`, fixed it by removing `position: absolute` lol
- Had a div with text and a button side-by-side in it. Wanted the button to stick to the right side.
	- Apparently `justify-content: space-between` does it, for some reason 
		- [StackOverflow link](https://stackoverflow.com/a/39514104) -- this did work for me
- width: 75% and width: 25% didn't add up because padding and border added pixels
	- Fix was to add `box-sizing: border-box` to override default `content-box`. [Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing) 

## request for comments
looking for a competent engineer to belittle me for using `tool` so I can defiantly ignore them and miss the good advice hidden behind the dick-waving. any takers?

`tool` is in this case Google Domains
