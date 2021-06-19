import tippy, { roundArrow } from 'tippy.js';
import 'tippy.js/animations/shift-toward-subtle.css';
import 'tippy.js/dist/svg-arrow.css';

export const defaultOptions = {
  arrow: roundArrow,
  animation: 'shift-toward-subtle',
  theme: 'my-theme',
};

export default function (el, options = {}) {
  el.setAttribute('vtooltip', '');

  const instance = tippy(el, {
    ...defaultOptions,
    ...options,
  });

  return instance;
}
