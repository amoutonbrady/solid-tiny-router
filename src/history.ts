import mitt from 'mitt';

export function createHistory(initialRoute?: string) {
  const emitter = mitt();
  let location = new URL(initialRoute || document.location.href);
  const baseUrl = location.origin;

  emitter.on('navigate', (url: any) => {
    location = url;
  });

  function trigger() {
    emitter.emit('navigate', new URL(document.location.href));
  }

  function listen(listener: (url: URL) => void) {
    emitter.on<any>('navigate', listener);
  }

  function push(path: string, state: Record<string, any> = {}) {
    const url = new URL(baseUrl + path);
    if (location.toString() === url.toString()) return;
    window.history.pushState(state, '', path);
    trigger();
  }

  function back() {
    window.history.go(-1);
    trigger();
  }

  function clear() {
    emitter.all.clear();
  }

  return { push, back, listen, clear, location };
}
