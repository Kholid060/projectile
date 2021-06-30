export function debounce(func, wait, immediate) {
  let timeout;

  return function () {
    const context = this;
    const args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}

export function getPackageIcon(repo, name) {
  if (typeof repo === 'string' && repo.includes('github.com')) {
    const user = repo.substring(0, repo.lastIndexOf('/'));

    return `${user}.png`;
  }

  return `https://avatars.dicebear.com/api/identicon/${name}.svg`;
}

export function formatNumber(num) {
  const abbrev = 'kmb';

  function round(value, precision) {
    const prec = Math.pow(10, precision);

    return Math.round(value * prec) / prec;
  }

  let base = Math.floor(Math.log(Math.abs(num)) / Math.log(1000));
  const suffix = abbrev[Math.min(2, base - 1)];

  base = abbrev.indexOf(suffix) + 1;

  return suffix ? round(num / Math.pow(1000, base), 2) + suffix : '' + num;
}

export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result
    ? [1, 2, 3].map((val) => parseInt(result[val], 16))
    : [255, 255, 255];
}

export function getTextColor(rgb) {
  if (!Array.isArray(rgb)) return console.error('Invalid param');

  const brightness = Math.round(
    (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) /
      1000
  );
  const textColor = brightness > 125 ? 'black' : 'white';

  return textColor;
}
