const http = require('http')
const fs = require('fs')

const static_files = [
  'index.html',
  'client/website.js',
  'client/website.coffee',
  'data/tryna make a website.md',
  'static/obsidian.css',
  'vendor/point.js',
]

http.createServer((req, res) => {
  const path = decodeURIComponent(req.url.slice(1)) || 'index.html'
  if (static_files.includes(path)) {
    fs.createReadStream(path).pipe(res)
  } else {
    res.writeHead(404)
    res.end()
  }
}).listen(3001)
console.log('Listening on http://localhost:3001')