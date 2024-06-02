import { IncomingMessage, ServerResponse, createServer } from 'node:http'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { v4 as uuid } from 'uuid'
import { User } from './models/user'
import { toCreateUser } from './adapters/to-create-user.ts'
import { CreateUser } from './models/create-user'

let userList: User[] = []

const server = createServer((req, res: ServerResponse) => {
  console.log('Url:', req.url)
  console.log('Тип запроса:', req.method)

  if (!req.url?.startsWith('/api/users')) {
    error404(res)
    return
  }
  switch (req.method) {
    case 'GET':
      getMethod(req.url!, res)
      break
    case 'POST':
      createUser(req, res)
      break
    case 'DELETE':
      deleteUserById(req.url!.slice('/api/users/'.length), res)
      break
    default:
      error404(res)
  }
  // console.log('User-Agent:', req.headers['user-agent'])
  // console.log('Все заголовки')
  // console.log(req.headers)
  // res.end()
})

const error404 = (res: ServerResponse) => {
  res.writeHead(404, { 'Content-Type': 'text/html' })
  res.end('<h1>404 Method not found</h1>')
  console.log('Unknown url')
}

const getMethod = (url: string, res: ServerResponse) => {
  const param = url.slice('/api/users/'.length)
  if (param === '') {
    getAllUsers(res)
  } else {
    getUserById(param, res)
  }
}

const createUser = (req: IncomingMessage, res: ServerResponse) => {
  const body: Uint8Array[] = []
  req.on('data', (chunk: any) => {
    body.push(chunk)
  })
  req.on('end', () => {
    const bodyString = Buffer.concat(body).toString()
    try {
      const user: CreateUser = toCreateUser(JSON.parse(bodyString))
      const lostFields = []
      if (!user.username) lostFields.push('username')
      if (!user.age) lostFields.push('age')
      if (!user.hobbies || !Array.isArray(user.hobbies)) lostFields.push('hobbies')
      if (lostFields.length > 0) {
        res.writeHead(400, { 'Content-Type': 'text/html' })
        res.end(`<h1>400 User not created</h1><p>fields ${lostFields.join(', ')} required</p>`)
        console.log('User not created, fields', lostFields, 'reqiered')
        return
      }
      const newUser = {
        id: uuid(),
        ...user,
      }
      userList.push(newUser)
      res.writeHead(201, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(newUser))
      console.log('User created', newUser)
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'text/html' })
      res.end('<h1>400 Parse JSON error</h1>')
      console.log('User not created, error', e)
    }
  })
}

const getAllUsers = (res: ServerResponse<IncomingMessage>) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(userList))
  console.log('Get all users')
}

const getUserById = (id: string, res: ServerResponse<IncomingMessage>) => {
  if (!checkUUID(id)) {
    res.writeHead(400, { 'Content-Type': 'text/html' })
    res.end('<h1>400 Bad UUID</h1>')
    console.log('Get user by id, bad uuid', id)
    return
  }
  const user = userList.find(user => user.id === id)
  if (!user) {
    res.writeHead(404, { 'Content-Type': 'text/html' })
    res.end('<h1>404 User not found</h1>')
    console.log('Get user by id, not found', id)
    return
  }
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(user))
  console.log('Get user by id', user)
}

const deleteUserById = (id: string, res: ServerResponse<IncomingMessage>) => {
  if (!checkUUID(id)) {
    res.writeHead(400, { 'Content-Type': 'text/html' })
    res.end('<h1>400 Bad UUID</h1>')
    console.log('Delete user by id, bad uuid', id)
    return
  }
  const user = userList.find(user => user.id === id)
  if (!user) {
    res.writeHead(404, { 'Content-Type': 'text/html' })
    res.end('<h1>404 User not found</h1>')
    console.log('Delete user by id, not found', id)
    return
  }
  userList = userList.filter(user => user.id !== id)
  res.writeHead(204, { 'Content-Type': 'application/json' })
  res.end()
  console.log('Delete user by id', user)
}

const checkUUID = (uuid: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)
}

server.listen(3000, () => {
  console.log('Listening on port 3000...')
})
