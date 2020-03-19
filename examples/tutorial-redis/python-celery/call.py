from tasks import add, add_kwargs

async_result = add.delay(1, 2)
print(async_result.get())
async_result = add.apply_async([1, 2])
print(async_result.get())
async_result = add_kwargs.delay(1, 2, c=3, d=4)
print(async_result.get())
async_result = add_kwargs.apply_async([1, 2], { 'c': 3, 'd': 4 })
print(async_result.get())
