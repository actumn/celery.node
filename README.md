<div align="center">
  <br/>
  <img src="https://celery-node.js.org/assets/images/logo-word-long.png"/>
  <br/>
  <br/>
  <p>
    <a href="https://gitter.im/celery-node/community">
      <img src="https://badges.gitter.im/Join%20Chat.svg"/>
    </a>
    <a href="https://github.com/actumn/celery.node/blob/master/LICENSE">
      <img src="https://img.shields.io/badge/license-MIT-blue.svg"/>
    </a>
    <a href="https://github.com/actumn/celery.node/actions">
      <img src="https://github.com/actumn/celery.node/workflows/build/badge.svg"/>
    </a>
    <a href="https://www.npmjs.com/package/celery-node">
      <img src="https://badge.fury.io/js/celery-node.svg"/>
    </a>
    <a href="https://www.npmjs.com/package/celery-node">
      <img src="https://img.shields.io/npm/dm/celery-node.svg"/>
    </a>
  </p>
</div>

Celery client / worker for in node.js  
This project focuses on implementing task queue using celery protocol in node.js influenced by [node-celery](https://github.com/mher/node-celery)


## What is a Task queue and Celery?
### Task Queue
Task queue is a mechanism to distribute or dispatch "tasks" or "jobs" across "workers" or "machines" for executing them asynchronously.
  
Common use cases of task queue:
- Video Encoding & Decoding  
- Resizing Pictures  
- Processing Bulk Updates  
- Any task which can be executed asynchronously  
 ![image](https://celery-node.js.org/assets/images/task-queue-introduction.png)
  
Applications, also called as "Producers", "Publishers" register logical blocks of code as "tasks".  
Workers, also called "Consumers" consume these "task" and optionally store any results to a "message backend".  
The broker (task queue) receives tasks encapsulated as messages from "producers" and routes them to "consumers".

But managing messages is not as simple as storing them in a data sotre as aqueue.  
Suppose that a number of messages sent and dispatched by large number of producers and workers.  
We have to consider below.
- Detecting poison messages
- Ensuring reliability of the messaging sysstem
- Scaling the messaging system

### Celery
![image](https://camo.githubusercontent.com/2fd54823d96e135d6ac0ad3a1540af596b98de19/687474703a2f2f646f63732e63656c65727970726f6a6563742e6f72672f656e2f6c61746573742f5f696d616765732f63656c6572792d62616e6e65722d736d616c6c2e706e67)
  
[Celery](https://github.com/celery/celery) is a one of most famous task queue open source software. A Celery system can consist of multiple workers and brokers, giving way to high availability and horizontal scaling.    
The features of celery is 
- simple
- highly available
- fast
- flexible

Celery is written in Python, but the protocol can be implemneted in any languages. There's [gocelery](https://github.com/gocelery/gocelery) for Go and like gocelery, here's celery.node.

## Why celery.node?
![image](https://celery-node.js.org/assets/images/celery.node-concept-image.png)
  
We usually make programs using different languages because of the specific features of each language and sometimes the programs should be communicated with each others by task-queueing, such as python web application with go worker or nodejs worker for better performance.
  
We can make the programs distribute the tasks to processes written in different languages super easily by using celery, gocelery, and celery.node.
  
Also, you can use celery.node as pure nodejs task queue.

### Protocol
 [celery protocol reference](https://docs.celeryproject.org/en/latest/internals/protocol.html)  
Celery.node now supports Celery Message Protocol Version 1 and Version 2.  
```
client.conf.TASK_PROTOCOL = 1; // 1 or 2. default is 2.
```

## Install
```sh
$ npm install celery-node
```
## Getting started
### Client
#### celery.node
```javascript
const celery = require('celery-node');

const client = celery.createClient(
  "amqp://",
  "amqp://"
);

const task = client.createTask("tasks.add");
const result = task.applyAsync([1, 2]);
result.get().then(data => {
  console.log(data);
  client.disconnect();
});
```
#### python
```python
from celery import Celery

app = Celery('tasks',
    broker='amqp://',
    backend='amqp://'
)

@app.task
def add(x, y):
    return x + y

if __name__ == '__main__':
    result = add.apply_async((1, 2), serializer='json')
    print(result.get())
```
### Worker
#### celery.node
```javascript
const celery = require('celery-node');

const worker = celery.createWorker(
  "amqp://",
  "amqp://"
);
worker.register("tasks.add", (a, b) => a + b);
worker.start();
```
#### python
```python
from celery import Celery

app = Celery('tasks',
    broker='amqp://',
    backend='amqp://'
)

@app.task
def add(x, y):
    return x + y
```
```shellscript
$ celery worker -A tasks --loglevel=INFO
```
### Run Example
Ensure you already installed nodejs, npm, and docker-compose
```sh
# Generate dist/ directory, tutorial files depend on it
$ npm run dist

# start a docker container rabbitmq in the background
$ docker-compose -f examples/docker-compose.yml up -d rabbit

# run celery.node client with rabbitmq
$ node examples/tutorial/client.js

# run celery.node worker with rabbitmq
# when you run worker, you can see the result printed out from client
$ node examples/tutorial/worker.js

# stop and remove containers
$ docker-compose -f examples/docker-compose.yml down
```

## Contributing
Before contributing, please read [contributing.md](./contributing.md)   
Let's make this project more awesome!  

## License
- MIT
