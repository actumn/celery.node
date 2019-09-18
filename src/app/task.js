export default class Task {
  constructor(client, name) {
    this.client = client;
    this.name = name;
  }

  delay(args, kwargs) {
    if (args && !Array.isArray(args)) {
      throw new Error('args is not array');
    }

    if (kwargs && typeof kwargs !== 'object') {
      throw new Error('kwargs is not object');
    }

    return this.client.publish(
      this,
      args || [],
      kwargs || {},
    );
  }
}
