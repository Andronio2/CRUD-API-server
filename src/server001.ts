import { createServer } from 'node:http'
import * as fs from 'node:fs'
import * as path from 'node:path'

const server = createServer((req, res) => {
  console.log('req', req.url)
  let filename = '.' + req.url

  if (filename === './') {
    filename = './index.html'
  }

  const extname = String(path.extname(filename)).toLowerCase()

  const mimetype = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
  }

  const contentType = mimetype[extname as keyof typeof mimetype] || 'application/octet-stream'

  fs.readFile(filename, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile('./404.html', (err, data) => {
          res.writeHead(404, { 'Content-Type': 'text/html' })
          res.end(data, 'utf8')
        })
      } else {
        res.writeHead(500)
        res.end('Sorry, check with the site admin for error: ' + err.code + ' ..\n')
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(data, 'utf8')
    }
  })
})

server.listen(3000)
console.log('Listening on port 3000...')
