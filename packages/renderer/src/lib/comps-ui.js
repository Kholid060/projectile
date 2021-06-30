import VTooltip from '../directives/VTooltip';
import VAutofocus from '../directives/VAutofocus';
import VClosePopover from '../directives/VClosePopover';

const uiComponents = import.meta.globEager('../components/ui/*.vue');
const transitionComponents = import.meta.globEager(
  '../components/transitions/*.vue'
);

function registerComponents(app, components, prefix) {
  Object.keys(components).forEach((path) => {
    const [fileName] = /[^/]*$/.exec(path);
    const [name] = fileName.split('.');
    const componentName = `${prefix}${name}`;

    app.component(componentName, components[path].default);
  });
}

export default function (app) {
  app.directive('tooltip', VTooltip);
  app.directive('autofocus', VAutofocus);
  app.directive('close-popover', VClosePopover);

  registerComponents(app, uiComponents, 'Ui');
  registerComponents(app, transitionComponents, 'Transition');
}
