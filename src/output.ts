'use strict';

import chalk from 'chalk';
import readline from 'readline';
import stringWidth from 'string-width';
import stripAnsi from 'strip-ansi';
import * as colors from './utils/colors';

class Debugger {
  enabled: boolean;
  capturing: boolean;
  capturedMessages: string[];

  constructor() {
    this.enabled = true;
    this.capturing = false;
    this.capturedMessages = [];
  }

  enable(): void {
    this.enabled = true;
  }

  capture(): void {
    this.enabled = true;
    this.capturing = true;
  }

  endCapture(): void {
    this.enabled = false;
    this.capturing = false;
    this.capturedMessages = [];
  }

  log(...args: unknown[]): void {
    if (this.enabled) {
      this.captureConsole(args, console.log);
    }
  }

  info(message: string): void {
    if (this.enabled) {
      const titleFormatted = colors.formatTitle('info', 'I');
      this.log(titleFormatted, message);
    }
  }

  note(message: string): void {
    if (this.enabled) {
      const titleFormatted = colors.formatTitle('note', 'N');
      this.log(titleFormatted, message);
    }
  }

  title(severity: string, title: string, subtitle: string): void {
    if (this.enabled) {
      const date = new Date();
      const dateString = chalk.grey(date.toLocaleTimeString());
      const titleFormatted = colors.formatTitle(severity, title);
      const subTitleFormatted = colors.formatText(severity, subtitle);
      const message = `${titleFormatted} ${subTitleFormatted}`;

      // In test environment we don't include timestamp
      if (process.env.NODE_ENV === 'test') {
        this.log(message);
        this.log();
        return;
      }

      // Make timestamp appear at the end of the line
      const cols = process.stdout.columns || 80;
      let logSpace = cols - stringWidth(message) - stringWidth(dateString);
      if (logSpace <= 0) {
        logSpace = 10;
      }

      this.log(`${message}${' '.repeat(logSpace)}${dateString}`);
      this.log();
    }
  }

  clearConsole(): void {
    if (!process.env.CI && !this.capturing && this.enabled && process.stdout.isTTY) {
      // Fill screen with blank lines, then move to (0,0) and clear it.
      const rows = process.stdout.rows || 24;
      const blank = '\n'.repeat(rows);
      console.log(blank);
      readline.cursorTo(process.stdout, 0, 0);
      readline.clearScreenDown(process.stdout);
    }
  }

  captureLogs(fun: () => void): string[] {
    try {
      this.capture();
      fun.call(undefined);
      return this.capturedMessages;
    } finally {
      this.endCapture();
    }
  }

  captureConsole(args: unknown[], method: (...args: unknown[]) => void): void {
    if (this.capturing) {
      this.capturedMessages.push(stripAnsi(args.join(' ')).trim());
    } else {
      method.apply(console, args);
    }
  }
}

const singleton = new Debugger();
export = singleton;
