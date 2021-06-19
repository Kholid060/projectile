import { getCurrentInstance } from 'vue';
import { createSingleton } from 'tippy.js';
import createTippy, { defaultOptions } from '@/utils/createTippy';

/* eslint-disable no-underscore-dangle */
export function useGroupTooltip(element, options = {}) {
  let tippyInstances = [];

  if (Array.isArray(element)) {
    tippyInstances = element.map((el) => el._tippy || createTippy(el));
  } else {
    const ctx = getCurrentInstance() && getCurrentInstance().ctx;

    tippyInstances = ctx._tooltipGroup || [];
  }

  const singleton = createSingleton(tippyInstances, {
    ...defaultOptions,
    ...options,
    moveTransition: 'transform 0.2s ease-out',
  });

  return singleton;
}
