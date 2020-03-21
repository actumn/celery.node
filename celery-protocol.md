## Celery Protocol
[Celery Protocol Reference](https://docs.celeryproject.org/en/latest/internals/protocol.html)

There is 2 protocols in celery, since celery 4.x supports protocol version 2.  
And now celery.node supports both, too.  
  
Default is version 2, but if you want to use version 1,  
You can change task protocol by setting `client.conf.TASK_PROTOCOL` to `1`

```javascript
client.conf.TASK_PROTOCOL = 1; // 1 or 2. default is 2.
```

### Protocol Version 2
```javascript
{
   "body":"W1sxLCAyXSwge30sIHsiY2FsbGJhY2tzIjogbnVsbCwgImVycmJhY2tzIjogbnVsbCwgImNoYWluIjogbnVsbCwgImNob3JkIjogbnVsbH1d",
   "content-encoding":"utf-8",
   "content-type":"application/json",
   "headers":{
      "lang":"py",
      "task":"tasks.add",
      "id":"c2fe8766-03aa-4963-b245-40886cf53ab7",
      "shadow":null,
      "eta":null,
      "expires":null,
      "group":null,
      "retries":0,
      "timelimit":[
         null,
         null
      ],
      "root_id":"c2fe8766-03aa-4963-b245-40886cf53ab7",
      "parent_id":null,
      "argsrepr":"(1, 2)",
      "kwargsrepr":"{}",
      "origin":"gen15977@{hostid}"
   },
   "properties":{
      "correlation_id":"c2fe8766-03aa-4963-b245-40886cf53ab7",
      "reply_to":"104d59fc-a09a-374a-89b7-c3b67954e2de",
      "delivery_mode":2,
      "delivery_info":{
         "exchange":"",
         "routing_key":"celery"
      },
      "priority":0,
      "body_encoding":"base64",
      "delivery_tag":"7cbb1ef5-6e93-4ac3-8888-2f6c2ef9b035"
   }
}
```

### Protocol Version 1
```javascript
message
{
   "body":"eyJ0YXNrIjogInRhc2tzLmFkZCIsICJpZCI6ICIzMDhmOTE3Yy0zZjhlLTQ3YzQtYTkwOS02MTZiN2MyMDMwMWEiLCAiYXJncyI6IFsxLCAyXSwgImt3YXJncyI6IHt9LCAiZ3JvdXAiOiBudWxsLCAicmV0cmllcyI6IDAsICJldGEiOiBudWxsLCAiZXhwaXJlcyI6IG51bGwsICJ1dGMiOiB0cnVlLCAiY2FsbGJhY2tzIjogbnVsbCwgImVycmJhY2tzIjogbnVsbCwgInRpbWVsaW1pdCI6IFtudWxsLCBudWxsXSwgInRhc2tzZXQiOiBudWxsLCAiY2hvcmQiOiBudWxsfQ==",
   "content-encoding":"utf-8",
   "content-type":"application/json",
   "headers":{

   },
   "properties":{
      "correlation_id":"308f917c-3f8e-47c4-a909-616b7c20301a",
      "reply_to":"d85f2faa-cb9b-3ba6-9b1d-09c8aab00a45",
      "delivery_mode":2,
      "delivery_info":{
         "exchange":"",
         "routing_key":"celery"
      },
      "priority":0,
      "body_encoding":"base64",
      "delivery_tag":"b1590118-e7ca-4fb3-98f0-12fa4e7642ee"
   }
}
```