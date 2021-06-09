const uiComponents = import.meta.globEager("../components/ui/*.vue");
const transitionComponents = import.meta.globEager(
  "../components/transitions/*.vue"
);

function getComponentName(path, prefix) {
  const [fileName] = /[^/]*$/.exec(path);
  const [name] = fileName.split(".");

  return `${prefix}${name}`;
}

export default function (app) {
  for (const path in uiComponents) {
    const name = getComponentName(path, "Ui");

    app.component(name, uiComponents[path].default);
  }
  for (const path in transitionComponents) {
    const name = getComponentName(path, "Transition");

    app.component(name, transitionComponents[path].default);
  }
}
