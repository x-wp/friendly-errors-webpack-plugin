'use strict';

import chalk from 'chalk';

type ColorName = 'green' | 'blue' | 'white' | 'yellow' | 'red';
type BgColorName = 'bgGreen' | 'bgBlue' | 'bgWhite' | 'bgYellow' | 'bgRed';

export function formatTitle(severity: string, message: string): string {
  return chalk[bgColor(severity)].black('', message, '');
}

export function formatText(severity: string, message: string): string {
  return chalk[textColor(severity)](message);
}

export function bgColor(severity: string): BgColorName {
  const color = textColor(severity);
  return ('bg' + capitalizeFirstLetter(color)) as BgColorName;
}

export function textColor(severity: string): ColorName {
  switch (severity.toLowerCase()) {
    case 'success':
      return 'green';
    case 'info':
      return 'blue';
    case 'note':
      return 'white';
    case 'warning':
      return 'yellow';
    case 'error':
      return 'red';
    default:
      return 'red';
  }
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
