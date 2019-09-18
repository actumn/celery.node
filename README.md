# celery.node
Nodejs client/server for celery  
This project focuses on using celery protocol in nodejs influenced by [node-celery](https://github.com/mher/node-celery)
## Install
```sh
$ npm install celery-node
```
## Example
### Client
#### celery.node
[client.js](examples/client.js)
```javascript
const celery = require('celery-node');

const client = celery.createClient({
  CELERY_BROKER: 'amqp://',
  CELERY_BACKEND: 'amqp://'
});
const result = client.delay('tasks.add', [1, 2]);
setTimeout(() => {
  result.get()
    .then(data => {
      console.log(data);
    });
}, 1000);
```
#### python
```python
from celery import Celery

app = Celery('tasks',
    broker='amqp://',
    backend='amqp://'
)

app.conf.update(
    CELERY_TASK_PROTOCOL=1,
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
[worker.js](examples/worker.js)
```javascript
const celery = require('..');

const worker = celery.createWorker({
  CELERY_BROKER: 'amqp://',
  CELERY_BACKEND: 'amqp://'
});
worker.register('tasks.add', (a, b) => a + b);
worker.start();
```
#### python
```python
from celery import Celery

app = Celery('tasks',
    broker='amqp://',
    backend='amqp://'
)

app.conf.update(
    CELERY_TASK_PROTOCOL=1,
)

@app.task
def add(x, y):
    return x + y
```
```shellscript
$ celery worker -A tasks --loglevel=INFO
```

## License
- MIT