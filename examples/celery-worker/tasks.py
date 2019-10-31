from celery import Celery

celery = Celery('tasks', 
    broker='amqp://',
    backend='amqp://'
)

celery.conf.update(
    CELERY_TASK_PROTOCOL=1,
)

@celery.task()
def add(x, y):
    return x + y
