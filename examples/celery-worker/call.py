from tasks import add

async_result = add.delay(1, 2)
print(async_result.get())

