export class AsyncLocalStorage {
  getStore() { return undefined; }
  run(_store: unknown, fn: () => unknown) { return fn(); }
  enterWith(_store: unknown) {}
}