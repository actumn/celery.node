## Getting Started
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