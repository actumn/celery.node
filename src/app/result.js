export default class AsyncResult {
  constructor(taskId, backend) {
    this.taskId = taskId;
    this.backend = backend;
    this.result = null;
  }

  get() {
    return new Promise((resolve, reject) => {
      if (!this.result) {
        this.backend.getTaskMeta(this.taskId)
          .then((msg) => {
            this.result = msg;
            resolve(this.result);
          })
          .catch(reject);
      } else {
        resolve(this.result);
      }
    });
  }
}
