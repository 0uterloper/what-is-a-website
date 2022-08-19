
console.log('point v0.0.7')

window.pointify_promise = new Promise(done => window.pointify_promise_done = done)

let code = `
var state = bus.state
let Input = bus.libs.react17.input

let point_server_set = false
let current_point_d
let point_width
document.body.addEventListener('mousedown', e => {
    if (state['open_point'] && current_point_d && !current_point_d.contains(e.target)) state['open_point'] = null
})

let point_hosts = {}

window.pointify_promise_done(pointify)

;(async () => {
    while (!document.body) {
        await new Promise(done => setTimeout(done, 30))
    }
    document.body.querySelectorAll('point').forEach(pointify)
    new MutationObserver(mutationList => {
        for (let m of mutationList) {
            for (let n of m.addedNodes) {
                if (n.tagName == 'POINT') pointify(n)
            }
        }
    }).observe(document.body, {subtree: true, childList: true})
})()

function pointify(dom) {
    if (dom.tagName != 'POINT') {
        dom.querySelectorAll('point').forEach(pointify)
        return
    }

    if (dom.my_pointified) return
    dom.my_pointified = true

    let orig_point_text = dom.textContent

    function get_point_key(s) {
        if (!s) return {} 
        let url
        try { url = new URL(s) } catch (e) {
            s = 'https://test.bloop.monster:60008' + (s[0] == '/' ? '' : '/') + s
            try { url = new URL(s) } catch (e) { return {} }
        }

        let host = url.protocol + '//' + url.host
        if (!point_hosts[host]) {
            point_hosts[host] = '_' + Math.random().toString(36).slice(2)
            bus.libs.http_out(point_hosts[host] + '/*', host + '/')
        }

        return {key: point_hosts[host] + url.pathname, url}
    }

    let hi = state['https://test.bloop.monster:60008/blorg']

    let point_local_id = Math.random().toString(36).slice(2)

    let rand_preprefix = Math.random().toString(36).slice(2)

    var Point = bus.libs.react17.react_class({
        render: () => {
            let here_url = window.location.href

            let {key, url} = get_point_key(dom.getAttribute('url') || dom.getAttribute('href') || dom.getAttribute('id'))

            if (!key) return (<div style={{display: 'inline', cursor: 'pointer', background: '#feb', padding: 5}}>{orig_point_text} <span style={{fontSize: 'small', color: '#f00'}}>[missing id]</span></div>)

            if (!state[key]) state[key] = {}
            if (state['open_point'] == point_local_id) {
                if (!state[key].title) state[key].title = orig_point_text || 'modify me'
            }
            if (!state[key].pages) state[key].pages = []
            if (!state[key].point_ins) state[key].point_ins = []
            if (!state[key].point_outs) state[key].point_outs = []

            if (!state[key].pages.some(x => x == here_url)) state[key].pages.push(here_url)

            let glick_gap = '30px'
            function render_line(prefix, i, url, setter) {
                let my_editing_id = rand_preprefix + ':' + prefix + ':' + i

                if (prefix == 'pages' && url == location.href) return (<div key={my_editing_id}></div>)

                return (<div key={my_editing_id} style={{display: 'flex', whiteSpace: 'nowrap'}} onMouseEnter={e => state['hover_point'] = my_editing_id} onMouseLeave={e => state['hover_point'] = null}>
                
                    <div style={{visibility: (url || state.hover_point == my_editing_id || state.edit_point == my_editing_id) ? 'visible' : 'hidden'}}>&#x2022;&nbsp;</div>
                    <div style={{position: 'relative'}}>
                        <div style={{marginLeft: '4px'}}>
                            <span style={{color: 'rgb(30,30,30)', fontSize: '11px', fontWeight: 'bold'}}>
                                {get_point_type(state[key][prefix][i])}
                            </span>
                            <a style={{marginLeft: get_point_type(state[key][prefix][i]) ? '4px' : '0px'}} href={get_point_in_url(state[key][prefix][i])}>{get_point_title(state[key][prefix][i])}</a>
                        </div>
                        <div style={{position: 'relative', height: '30px'}}>
                            <div style={{fontSize: '14px', paddingLeft: '4px', paddingTop: '3px'}}>{url}</div>
                            <Input type="text" style={{lineHeight: 'normal', color: 'inherit', font: 'inherit', visibility: (state['hover_point'] == my_editing_id || state['edit_point'] == my_editing_id) ? 'visible' : 'hidden', position: 'absolute', left: '0px', top: '0px', fontSize: '14px', width: 'calc(100% + ' + glick_gap + ')'}} defaultValue={url} onInput={e => { setter(e.target.value || null) }} onBlur={e => state['edit_point'] = null} onFocus={e => state['edit_point'] = my_editing_id}></Input>
                            <a style={{boxSizing: 'border-box', position: 'absolute', display: (state['edit_point'] == my_editing_id || prefix != 'pages') ? 'none' : 'initial', left: '0px', top: '0px', fontSize: '14px', paddingLeft: '4px', paddingTop: '3px'}} href={url}>{url}</a>
                        </div>
                    </div>
                    <div style={{width: glick_gap}}>&nbsp;</div>
                </div>)
            }

            function get_point_title(s) {
                let {key} = get_point_key(s)
                if (!key) return null
                let val = state[key]
                if (val) return val.title
            }

            function get_point_type(s) {
                let {key} = get_point_key(s)
                if (!key) return null
                let val = state[key]
                if (val) return val.type
            }

            function get_point_in_url(s) {
                let {key} = get_point_key(s)
                if (!key) return null
                let val = state[key]
                if (val) return val.pages && val.pages[0]
            }

            function render_adder(prefix) {
                return render_line(prefix, state[key][prefix].length, '', x => {
                    if (x) state[key][prefix].push(x)
                })
            }

            // https://stackoverflow.com/questions/264640/how-can-i-create-an-editable-dropdownlist-in-html
            function render_dropdown(initial, options, onChange) {
                let i = null
                let s = null
                return (<div style={{position: 'relative', width: '50%', minWidth: '90px'}}>
                    <select ref={x => s = x} style={{width: '100%', height: '31px'}} onChange={e => { i.value = e.target.value; onChange(i.value, i) }}>
                        {options.map(op => (<option key={op} value={op}>{op}</option>))}
                    </select>
                    <Input ref={x => i = x} value={initial} style={{position: 'absolute', left: '3px', top: '3px', width: 'calc(100% - 20px)', height: '25px', border: 'none'}} onInput={e => { onChange(e.target.value); s.selectedIndex = 0 }}/>
                </div>)
            }

            let add_input

            function render_lines(prefix) {
                let x = state[key][prefix].map((x, i) => render_line(prefix, i, x, (x, e) => {
                        if (x != null) {
                            state[key][prefix][i] = x
                        } else {
                            rand_preprefix = Math.random().toString(36).slice(2)                          
                            state[key][prefix] = state[key][prefix].filter((x, ii) => ii != i)
                        }
                    }))
                x.push(render_adder(prefix))
                return x
            }

            let point_outs = render_lines('point_outs')
            let point_ins = render_lines('point_ins')
            let pages = render_lines('pages')

            return (state['open_point'] == point_local_id ? <div ref={x => current_point_d = x} style={{position: 'relative', width: point_width, fontSize: '14px', display: 'inline-block'}}>
            
                <input autoFocus style={{background: '#ffb', padding: 5, width: '100%', height: '23px', boxSizing: 'border-box', border: 'none'}} defaultValue={state[key].title} onBlur={e => state[key].title = e.target.value}></input>
                
                <div style={{position: 'absolute', left: '0px', top: '29px', background: 'white', boxSizing: 'border-box', border: '1px solid grey', padding: '14px', borderRadius: '14px', fontFamily: 'verdana', lineHeight: 1.6}}>
                
                    <div style={{fontSize: '10px', marginBottom: '12px'}}>{'' + url}</div>
                    
                    <div key="type" style={{display: 'grid', gridTemplateColumns: 'fit-content(100%) 1fr fit-content(100%) fit-content(100%)'}}>
                        <span style={{paddingTop: '6.5px'}}>Type:&nbsp;</span>
                        {render_dropdown(state[key].type, ['', 'Question', 'Answer', 'Data'], t => state[key].type = t)}
                    </div>

                    <div key="parents" style={{marginTop:'1em', marginBottom: '0.5em'}}>{state[key].point_outs.length == 1 ? 'Parent' : 'Parents'}:</div>

                    {point_outs}

                    <div key="children" style={{marginTop:'1em', marginBottom: '0.5em'}}>{state[key].point_ins.length == 1 ? 'Child' : 'Children'}:</div>

                    {point_ins}

                    <div key="also" style={{marginTop:'1em', marginBottom: '0.5em'}}>Also appears in:</div>

                    {pages}                    
                    
                </div>
            </div> : <div style={{display: 'inline', cursor: 'pointer', background: '#ffb', padding: 5}} onClick={e => {state['open_point'] = point_local_id; point_width = e.target.offsetWidth }}>{state[key].title || orig_point_text}</div>)
        }
    })

    // **** Mount React

    // React <= v17
    if (React.version.split('.')[0] <= '17') {
        console.log('hi17')
        ReactDOM.render(<Point/>, dom)

    // React v18
    } else {
        console.log('hi18')
        ReactDOM.createRoot(dom).render(<Point/>)
    }
}
`

async function include(url) {
    return await new Promise(done => {
        let script = document.createElement('script')
        script.onload = done
        script.src = url
        document.head.append(script)
    })
}

;(async () => {
    let ba = include('https://unpkg.com/babel-standalone@6/babel.min.js')
    let br = include('https://test.bloop.monster:60008/braidify.js')
    
    let re = include('https://unpkg.com/react@17/umd/react.development.js').then(() =>
        include('https://unpkg.com/react-dom@17/umd/react-dom.development.js'))
    let cr = re.then(() => include('https://unpkg.com/create-react-class@15.7.0/create-react-class.min.js'))
    let st = re.then(() => include('https://test.bloop.monster:60008/statebus.js'))
        // .then(() => include('https://test.bloop.monster:60008/statebus-lib.js?blarcksneuf7'))
        // .then(() => include('https://unpkg.com/statebus@7.0.10/client-library.js'))
    await Promise.all([ba, br, cr, st])
    eval(Babel.transform(code, {presets: ["react"]}).code)
})()
