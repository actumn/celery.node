## Classes

<dl>
<dt><a href="#Base">Base</a></dt>
<dd></dd>
<dt><a href="#Client">Client</a> ⇐ <code>external:Base</code></dt>
<dd></dd>
<dt><a href="#AsyncResult">AsyncResult</a></dt>
<dd></dd>
<dt><a href="#Task">Task</a></dt>
<dd></dd>
<dt><a href="#Worker">Worker</a> ⇐ <code>external:Base</code></dt>
<dd></dd>
<dt><a href="#AMQPBackend">AMQPBackend</a></dt>
<dd></dd>
<dt><a href="#RedisBackend">RedisBackend</a></dt>
<dd></dd>
<dt><a href="#AMQPBroker">AMQPBroker</a></dt>
<dd></dd>
<dt><a href="#RedisBroker">RedisBroker</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#createTaskMessage">createTaskMessage(id, taskName, args, kwargs)</a> ⇒ <code>String</code></dt>
<dd><p>create json string representing celery task message. used by Client.publish
now supports only protocol v1.</p>
<p>celery protocol reference: <a href="https://docs.celeryproject.org/en/latest/internals/protocol.html">https://docs.celeryproject.org/en/latest/internals/protocol.html</a>
celery code: <a href="https://github.com/celery/celery/blob/4aefccf8a89bffe9dac9a72f2601db1fa8474f5d/celery/app/amqp.py#L307-L464">https://github.com/celery/celery/blob/4aefccf8a89bffe9dac9a72f2601db1fa8474f5d/celery/app/amqp.py#L307-L464</a></p>
</dd>
</dl>

<a name="Base"></a>

## Base
**Kind**: global class  

* [Base](#Base)
    * [new Base(conf)](#new_Base_new)
    * [.backend](#Base+backend)
    * [.broker](#Base+broker)
    * [.isReady()](#Base+isReady) ⇒ <code>Promise</code>
    * [.disconnect()](#Base+disconnect) ⇒ <code>Promise</code>

<a name="new_Base_new"></a>

### new Base(conf)
Parent Class of Client and Worker
for creates an instance of celery broker and celery backend


| Param | Type | Description |
| --- | --- | --- |
| conf | <code>object</code> | the configuration object of Base class for both Celery client and worker, containing celery broker information and celery backend information |
| conf.CELERY_BROKER | <code>string</code> | celery broker connect url. ex) 'amqp://localhost' or 'redis;//localhsot' |
| conf.CELERY_BROKER_OPTIONS | <code>object</code> | celery broker connect extra option for specific broker features |
| conf.CELERY_BACKEND | <code>string</code> | celery backend connect url. ex) 'amqp://localhost' or 'redis;//localhsot' |
| conf.CELERY_BACKEND_OPTIONS | <code>object</code> | celery backend connect extra option for specific backend feaatures |

<a name="Base+backend"></a>

### base.backend
backend

**Kind**: instance property of [<code>Base</code>](#Base)  
**Access**: protected  
<a name="Base+broker"></a>

### base.broker
broker

**Kind**: instance property of [<code>Base</code>](#Base)  
**Access**: protected  
<a name="Base+isReady"></a>

### base.isReady() ⇒ <code>Promise</code>
returns promise for working some job after ready.

**Kind**: instance method of [<code>Base</code>](#Base)  
**Returns**: <code>Promise</code> - promise that continues if backend and broker connected.  
<a name="Base+disconnect"></a>

### base.disconnect() ⇒ <code>Promise</code>
returns promise for working some job after backend and broker ready.

**Kind**: instance method of [<code>Base</code>](#Base)  
**Returns**: <code>Promise</code> - promises that continues if backend and broker disconnected.  
<a name="Client"></a>

## Client ⇐ <code>external:Base</code>
**Kind**: global class  
**Extends**: <code>external:Base</code>  

* [Client](#Client) ⇐ <code>external:Base</code>
    * [new Client(conf)](#new_Client_new)
    * [.createTask(name)](#Client+createTask) ⇒ [<code>Task</code>](#Task)
    * [.delay(name, args, kwargs)](#Client+delay) ⇒ [<code>AsyncResult</code>](#AsyncResult)
    * [.publish(task, args, kwargs)](#Client+publish) ⇒ [<code>AsyncResult</code>](#AsyncResult)

<a name="new_Client_new"></a>

### new Client(conf)
Celery client


| Param | Type | Description |
| --- | --- | --- |
| conf | <code>object</code> | configuration object of Celery Client. For more information, see Base#constructor. |

<a name="Client+createTask"></a>

### client.createTask(name) ⇒ [<code>Task</code>](#Task)
createTask

**Kind**: instance method of [<code>Client</code>](#Client)  
**Returns**: [<code>Task</code>](#Task) - task object  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | for task name |

**Example**  
```js
client.createTask('task.add').delay([1, 2])
```
<a name="Client+delay"></a>

### client.delay(name, args, kwargs) ⇒ [<code>AsyncResult</code>](#AsyncResult)
delay

**Kind**: instance method of [<code>Client</code>](#Client)  
**Returns**: [<code>AsyncResult</code>](#AsyncResult) - async result object for get result of delayed task  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | the task name for create new delayed task |
| args | <code>Array</code> | array for arguments of the delayed task |
| kwargs | <code>object</code> | object for named arguments of the delayed task |

**Example**  
```js
client.delay('tasks.add', [1, 2])
```
<a name="Client+publish"></a>

### client.publish(task, args, kwargs) ⇒ [<code>AsyncResult</code>](#AsyncResult)
publish

**Kind**: instance method of [<code>Client</code>](#Client)  
**Returns**: [<code>AsyncResult</code>](#AsyncResult) - async result object for get result of delayed task  

| Param | Type |
| --- | --- |
| task | [<code>Task</code>](#Task) | 
| args | <code>Array</code> | 
| kwargs | <code>Object</code> | 

<a name="AsyncResult"></a>

## AsyncResult
**Kind**: global class  

* [AsyncResult](#AsyncResult)
    * [new AsyncResult(taskId, backend)](#new_AsyncResult_new)
    * [.get()](#AsyncResult+get) ⇒ <code>Promise</code>

<a name="new_AsyncResult_new"></a>

### new AsyncResult(taskId, backend)
Asynchronous Result


| Param | Type | Description |
| --- | --- | --- |
| taskId | <code>String</code> | task id |
| backend | [<code>AMQPBackend</code>](#AMQPBackend) \| [<code>RedisBackend</code>](#RedisBackend) | celery backend instance |

<a name="AsyncResult+get"></a>

### asyncResult.get() ⇒ <code>Promise</code>
**Kind**: instance method of [<code>AsyncResult</code>](#AsyncResult)  
<a name="Task"></a>

## Task
**Kind**: global class  

* [Task](#Task)
    * [new Task(clinet, name)](#new_Task_new)
    * [.client](#Task+client)
    * [.name](#Task+name)
    * [.delay(args, kwargs)](#Task+delay) ⇒ [<code>AsyncResult</code>](#AsyncResult)

<a name="new_Task_new"></a>

### new Task(clinet, name)
Asynchronous Task


| Param | Type | Description |
| --- | --- | --- |
| clinet | [<code>Client</code>](#Client) | celery client instance |
| name | <code>String</code> | celery task name |

<a name="Task+client"></a>

### task.client
Task client

**Kind**: instance property of [<code>Task</code>](#Task)  
<a name="Task+name"></a>

### task.name
Task name

**Kind**: instance property of [<code>Task</code>](#Task)  
<a name="Task+delay"></a>

### task.delay(args, kwargs) ⇒ [<code>AsyncResult</code>](#AsyncResult)
**Kind**: instance method of [<code>Task</code>](#Task)  
**Returns**: [<code>AsyncResult</code>](#AsyncResult) - the result of client.publish  

| Param | Type |
| --- | --- |
| args | <code>Array</code> | 
| kwargs | <code>object</code> | 

**Example**  
```js
client.createTask('task.add').delay([1, 2])
```
<a name="Worker"></a>

## Worker ⇐ <code>external:Base</code>
**Kind**: global class  
**Extends**: <code>external:Base</code>  

* [Worker](#Worker) ⇐ <code>external:Base</code>
    * [new Worker(conf)](#new_Worker_new)
    * [.register(name, handler)](#Worker+register)
    * [.start()](#Worker+start)
    * [.stop()](#Worker+stop)

<a name="new_Worker_new"></a>

### new Worker(conf)
Celery Worker


| Param | Type | Description |
| --- | --- | --- |
| conf | <code>object</code> | configuration object of Celery Worker. For more information, see Base#constructor. |

<a name="Worker+register"></a>

### worker.register(name, handler)
register task handler on worker h andlers

**Kind**: instance method of [<code>Worker</code>](#Worker)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | the name of task for dispatching. |
| handler | <code>function</code> | the function for task handling |

**Example**  
```js
worker.register('tasks.add', (a, b) => a + b);
worker.start();
```
<a name="Worker+start"></a>

### worker.start()
start celery worker to run

**Kind**: instance method of [<code>Worker</code>](#Worker)  
**Example**  
```js
worker.register('tasks.add', (a, b) => a + b);
worker.start();
```
<a name="Worker+stop"></a>

### worker.stop()
**Kind**: instance method of [<code>Worker</code>](#Worker)  
**Todo**

- [ ] implement here

<a name="AMQPBackend"></a>

## AMQPBackend
**Kind**: global class  

* [AMQPBackend](#AMQPBackend)
    * [new AMQPBackend(url, opts)](#new_AMQPBackend_new)
    * [.isReady()](#AMQPBackend+isReady) ⇒ <code>Promise</code>
    * [.disconnect()](#AMQPBackend+disconnect) ⇒ <code>Promise</code>
    * [.storeResult(taskId, result, state)](#AMQPBackend+storeResult) ⇒ <code>Promise</code>
    * [.getTaskMeta(taskId)](#AMQPBackend+getTaskMeta) ⇒ <code>Promise</code>

<a name="new_AMQPBackend_new"></a>

### new AMQPBackend(url, opts)
AMQP backend class


| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | the connection string of amqp |
| opts | <code>object</code> | the options object for amqp connect of amqplib |

<a name="AMQPBackend+isReady"></a>

### amqpBackend.isReady() ⇒ <code>Promise</code>
**Kind**: instance method of [<code>AMQPBackend</code>](#AMQPBackend)  
**Returns**: <code>Promise</code> - promises that continues if amqp connected.  
<a name="AMQPBackend+disconnect"></a>

### amqpBackend.disconnect() ⇒ <code>Promise</code>
**Kind**: instance method of [<code>AMQPBackend</code>](#AMQPBackend)  
**Returns**: <code>Promise</code> - promises that continues if amqp disconnected.  
<a name="AMQPBackend+storeResult"></a>

### amqpBackend.storeResult(taskId, result, state) ⇒ <code>Promise</code>
store result method on backend

**Kind**: instance method of [<code>AMQPBackend</code>](#AMQPBackend)  

| Param | Type | Description |
| --- | --- | --- |
| taskId | <code>String</code> |  |
| result | <code>\*</code> | result of task. i.e the return value of task handler |
| state | <code>String</code> |  |

<a name="AMQPBackend+getTaskMeta"></a>

### amqpBackend.getTaskMeta(taskId) ⇒ <code>Promise</code>
get result data from backend

**Kind**: instance method of [<code>AMQPBackend</code>](#AMQPBackend)  

| Param | Type |
| --- | --- |
| taskId | <code>String</code> | 

<a name="RedisBackend"></a>

## RedisBackend
**Kind**: global class  

* [RedisBackend](#RedisBackend)
    * [new RedisBackend(url, opts)](#new_RedisBackend_new)
    * [.isReady()](#RedisBackend+isReady) ⇒ <code>Promise</code>
    * [.disconnect()](#RedisBackend+disconnect) ⇒ <code>Promise</code>
    * [.storeResult(taskId, result, state)](#RedisBackend+storeResult)
    * [.getTaskMeta(taskId)](#RedisBackend+getTaskMeta) ⇒ <code>Promise</code>

<a name="new_RedisBackend_new"></a>

### new RedisBackend(url, opts)
Redis backend class


| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | the connection string of redis |
| opts | <code>object</code> | the options object for redis connect of ioredis |

<a name="RedisBackend+isReady"></a>

### redisBackend.isReady() ⇒ <code>Promise</code>
codes from here: https://github.com/OptimalBits/bull/blob/129c6e108ce67ca343c8532161d06742d92b651c/lib/utils.js#L21-L44

**Kind**: instance method of [<code>RedisBackend</code>](#RedisBackend)  
**Returns**: <code>Promise</code> - promises that continues if redis connected.  
<a name="RedisBackend+disconnect"></a>

### redisBackend.disconnect() ⇒ <code>Promise</code>
**Kind**: instance method of [<code>RedisBackend</code>](#RedisBackend)  
**Returns**: <code>Promise</code> - promises that continues if redis disconnected.  
<a name="RedisBackend+storeResult"></a>

### redisBackend.storeResult(taskId, result, state)
**Kind**: instance method of [<code>RedisBackend</code>](#RedisBackend)  

| Param | Type |
| --- | --- |
| taskId | <code>String</code> | 
| result | <code>\*</code> | 
| state | <code>String</code> | 

<a name="RedisBackend+getTaskMeta"></a>

### redisBackend.getTaskMeta(taskId) ⇒ <code>Promise</code>
**Kind**: instance method of [<code>RedisBackend</code>](#RedisBackend)  

| Param | Type |
| --- | --- |
| taskId | <code>String</code> | 

<a name="AMQPBroker"></a>

## AMQPBroker
**Kind**: global class  

* [AMQPBroker](#AMQPBroker)
    * [new AMQPBroker(url, opts)](#new_AMQPBroker_new)
    * [.isReady()](#AMQPBroker+isReady) ⇒ <code>Promise</code>
    * [.disconnect()](#AMQPBroker+disconnect) ⇒ <code>Promise</code>
    * [.publish(queue, message)](#AMQPBroker+publish) ⇒ <code>Promise</code>
    * [.subscribe(queue, callback)](#AMQPBroker+subscribe) ⇒ <code>Promise</code>

<a name="new_AMQPBroker_new"></a>

### new AMQPBroker(url, opts)
AMQP broker class


| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | the connection string of amqp |
| opts | <code>object</code> | the options object for amqp connect of amqplib |

<a name="AMQPBroker+isReady"></a>

### amqpBroker.isReady() ⇒ <code>Promise</code>
**Kind**: instance method of [<code>AMQPBroker</code>](#AMQPBroker)  
**Returns**: <code>Promise</code> - promises that continues if amqp connected.  
<a name="AMQPBroker+disconnect"></a>

### amqpBroker.disconnect() ⇒ <code>Promise</code>
**Kind**: instance method of [<code>AMQPBroker</code>](#AMQPBroker)  
**Returns**: <code>Promise</code> - promises that continues if amqp disconnected.  
<a name="AMQPBroker+publish"></a>

### amqpBroker.publish(queue, message) ⇒ <code>Promise</code>
**Kind**: instance method of [<code>AMQPBroker</code>](#AMQPBroker)  

| Param | Type |
| --- | --- |
| queue | <code>String</code> | 
| message | <code>String</code> | 

<a name="AMQPBroker+subscribe"></a>

### amqpBroker.subscribe(queue, callback) ⇒ <code>Promise</code>
**Kind**: instance method of [<code>AMQPBroker</code>](#AMQPBroker)  

| Param | Type |
| --- | --- |
| queue | <code>String</code> | 
| callback | <code>function</code> | 

<a name="RedisBroker"></a>

## RedisBroker
**Kind**: global class  

* [RedisBroker](#RedisBroker)
    * [new RedisBroker(opts)](#new_RedisBroker_new)
    * [.isReady()](#RedisBroker+isReady) ⇒ <code>Promise</code>
    * [.disconnect()](#RedisBroker+disconnect) ⇒ <code>Promise</code>
    * [.publish(queue, message)](#RedisBroker+publish) ⇒ <code>Promise</code>
    * [.subscribe(queue, callback)](#RedisBroker+subscribe) ⇒ <code>Promise</code>

<a name="new_RedisBroker_new"></a>

### new RedisBroker(opts)
Redis broker class


| Param | Type | Description |
| --- | --- | --- |
| opts | <code>object</code> | the options object for redis connect of ioredis |

<a name="RedisBroker+isReady"></a>

### redisBroker.isReady() ⇒ <code>Promise</code>
codes from here: https://github.com/OptimalBits/bull/blob/129c6e108ce67ca343c8532161d06742d92b651c/lib/utils.js#L21-L44

**Kind**: instance method of [<code>RedisBroker</code>](#RedisBroker)  
**Returns**: <code>Promise</code> - promises that continues if redis connected.  
<a name="RedisBroker+disconnect"></a>

### redisBroker.disconnect() ⇒ <code>Promise</code>
**Kind**: instance method of [<code>RedisBroker</code>](#RedisBroker)  
**Returns**: <code>Promise</code> - promises that continues if redis disconnected.  
<a name="RedisBroker+publish"></a>

### redisBroker.publish(queue, message) ⇒ <code>Promise</code>
**Kind**: instance method of [<code>RedisBroker</code>](#RedisBroker)  

| Param | Type |
| --- | --- |
| queue | <code>String</code> | 
| message | <code>String</code> | 

<a name="RedisBroker+subscribe"></a>

### redisBroker.subscribe(queue, callback) ⇒ <code>Promise</code>
**Kind**: instance method of [<code>RedisBroker</code>](#RedisBroker)  

| Param | Type |
| --- | --- |
| queue | <code>String</code> | 
| callback | <code>function</code> | 

<a name="createTaskMessage"></a>

## createTaskMessage(id, taskName, args, kwargs) ⇒ <code>String</code>
create json string representing celery task message. used by Client.publish
now supports only protocol v1.

celery protocol reference: https://docs.celeryproject.org/en/latest/internals/protocol.html
celery code: https://github.com/celery/celery/blob/4aefccf8a89bffe9dac9a72f2601db1fa8474f5d/celery/app/amqp.py#L307-L464

**Kind**: global function  
**Returns**: <code>String</code> - JSON serialized string of celery task message  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | for task id. commonly it is uuid.v4() |
| taskName | <code>String</code> | for task name dispatched by worker |
| args | <code>Array</code> | for function parameter |
| kwargs | <code>object</code> | for function named parameter |

