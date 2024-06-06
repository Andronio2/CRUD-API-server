import { createServer } from 'node:http'
import cluster from 'node:cluster'
import { availableParallelism } from 'node:os'

if (cluster.isPrimary) {
  console.log('Primary PID:', process.pid)
  cluster.schedulingPolicy = cluster.SCHED_RR
  for (let i = 0; i < availableParallelism(); i++) {
    cluster.fork({
      ID: i,
    })
  }
  cluster.on('listening', (worker, address) => {
    console.log('Worker', worker.process.pid, 'is listening on', address.port)
  })
} else {
  console.log('Slave PID:', process.pid)
  console.log('id', process.env.ID)
  const port = 3000 + Number(process.env.ID)
  createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Hello World! ' + port)
    console.log('process', process.env.ID)
  }).listen(port, () => {
    console.log('Server started on port', port)
  })
}
