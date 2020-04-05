# Calling Tasks

## Task
Task is the unit of work representing logical blocks of code in celery.  

```javascript
worker.register("tasks.add", (a, b) => a + b);
worker.start();

const task = client.createTask("tasks.add");
const result = task.applyAsync([1, 2]);
// or
const result = task.delay(1, 2);

result
  .get()
  .then(data => console.log(data));
```




### .applyAsync()
```javascript
applyAsync(args: Array<any>, kwargs?: object): AsyncResult
```

### .delay()
```javascript
delay(...args: any[]): AsyncResult
```
`delay()` is just shortcut of applyAsync.  
It is recommend to use `applyAsync()` instead of `delay()`

## AsyncResult
`AsyncResult` represents the result of task executed by worker.  
 
## .get()
```javascript
get(timeout?: number): Promise<any>
```
The function to get result from result backend.
