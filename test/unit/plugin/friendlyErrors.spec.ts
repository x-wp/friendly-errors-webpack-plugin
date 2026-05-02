import { SyncHook } from 'tapable';
const Stats = require('webpack/lib/Stats');

import output from '../../../src/output';
import FriendlyErrorsPlugin from '../../../src/friendly-errors-plugin';

let plugin: FriendlyErrorsPlugin;
let mockCompiler: { hooks: { done: SyncHook<[unknown]>; invalid: SyncHook<[]> } };

beforeEach(() => {
  plugin = new FriendlyErrorsPlugin();
  mockCompiler = {
    hooks: {
      done: new SyncHook<[unknown]>(['stats']),
      invalid: new SyncHook(),
    },
  };
  plugin.apply(mockCompiler as any);
});

describe('friendly-errors-plugin — hook output', () => {
  it('logs "WAIT  Compiling..." when the invalid hook fires', () => {
    const logs = output.captureLogs(() => mockCompiler.hooks.invalid.call());
    expect(logs).toEqual(['WAIT  Compiling...', '']);
  });

  it('logs "DONE  Compiled successfully" with elapsed ms when the done hook fires with no errors', () => {
    const stats = successStats({ startTime: 0, endTime: 100 });
    const logs = output.captureLogs(() => mockCompiler.hooks.done.call(stats));
    expect(logs).toEqual(['DONE  Compiled successfully in 100ms', '']);
  });
});

describe('friendly-errors-plugin — clearConsole behavior', () => {
  it('clears the console by default', () => {
    const spy = jest.spyOn(output, 'clearConsole').mockImplementation(() => undefined);
    new FriendlyErrorsPlugin().clearConsole();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('does not clear the console when clearConsole: false is passed', () => {
    const spy = jest.spyOn(output, 'clearConsole').mockImplementation(() => undefined);
    new FriendlyErrorsPlugin({ clearConsole: false }).clearConsole();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

function successStats(opts: { startTime: number; endTime: number }) {
  const compilation = {
    errors: [],
    warnings: [],
    children: [],
    startTime: opts.startTime,
    endTime: opts.endTime,
    getErrors() { return this.errors; },
    getWarnings() { return this.warnings; },
  };
  return new Stats(compilation);
}
