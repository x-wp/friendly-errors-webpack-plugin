const { SyncHook } = require('tapable');
const Stats = require('webpack/lib/Stats')

const output = require("../../../src/output");
const FriendlyErrorsPlugin = require("../../../index");

var notifierPlugin;
var mockCompiler;

beforeEach(() => {
  notifierPlugin = new FriendlyErrorsPlugin();
  mockCompiler = {
    hooks: {
      done: new SyncHook(['stats']),
      invalid: new SyncHook()
    }
  };
  notifierPlugin.apply(mockCompiler);
});

it('friendlyErrors : capture invalid message', () => {

  const logs = output.captureLogs(() => {
    mockCompiler.hooks.invalid.call();
  });

  expect(logs).toEqual([
    'WAIT  Compiling...',
    ''
    ]);
});

it('friendlyErrors : capture compilation without errors', () => {

  const stats = successfulCompilationStats();
  const logs = output.captureLogs(() => {
    mockCompiler.hooks.done.call(stats);
  });

  expect(logs).toEqual([
    'DONE  Compiled successfully in 100ms',
    ''
  ]);
});

it('friendlyErrors : default clearConsole option', () => {
  const plugin = new FriendlyErrorsPlugin();
  expect(plugin.shouldClearConsole).toBeTruthy()
});

it('friendlyErrors : clearConsole option', () => {
  const plugin = new FriendlyErrorsPlugin({ clearConsole: false });
  expect(plugin.shouldClearConsole).toBeFalsy()
});

function successfulCompilationStats(opts) {
  const options = Object.assign({ startTime: 0, endTime: 100 }, opts);

  const compilation = {
    errors: [],
    warnings: [],
    children: [],
    startTime: options.startTime,
    endTime: options.endTime,
    getErrors() { return this.errors; },
    getWarnings() { return this.warnings; }
  };
  return new Stats(compilation);
}
