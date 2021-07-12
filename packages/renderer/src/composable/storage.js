function invokeEvent(name, param) {
  const { ipcRenderer } = window.electron;

  return ipcRenderer.callMain(`storage-${name}`, param);
}

export function useStorage() {
  return {
    get: (key, def) => invokeEvent('get', { key, def }),
    set: (key, value) => invokeEvent('set', { key, value }),
    has: (key) => invokeEvent('has', key),
    delete: (key) => invokeEvent('delete', key),
    clear: () => invokeEvent('clear'),
  };
}
