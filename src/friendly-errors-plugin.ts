'use strict';

import type { Compilation, Compiler, MultiStats, Stats, WebpackPluginInstance } from 'webpack';

import transformErrors from './core/transformErrors';
import formatErrors from './core/formatErrors';
import output from './output';
import { concat, uniqueBy } from './utils';

import babelSyntax from './transformers/babelSyntax';
import moduleNotFoundTransformer from './transformers/moduleNotFound';
import esLintError from './transformers/esLintError';

import moduleNotFoundFormatter from './formatters/moduleNotFound';
import eslintErrorFormatter from './formatters/eslintError';
import defaultErrorFormatter from './formatters/defaultError';

import type {
  AnnotatedError,
  ErrorSeverity,
  Formatter,
  PluginOptions,
  RawWebpackError,
  Transformer,
} from './types';

const defaultTransformers: Transformer[] = [
  babelSyntax,
  moduleNotFoundTransformer,
  esLintError,
];

const defaultFormatters: Formatter[] = [
  moduleNotFoundFormatter,
  eslintErrorFormatter,
  defaultErrorFormatter,
];

class FriendlyErrorsWebpackPlugin implements WebpackPluginInstance {
  compilationSuccessInfo: NonNullable<PluginOptions['compilationSuccessInfo']>;
  onErrors: PluginOptions['onErrors'];
  shouldClearConsole: boolean;
  silentSuccess: boolean;
  formatters: Formatter[];
  transformers: Transformer[];
  previousEndTimes: Record<number, number | undefined>;

  constructor(options?: PluginOptions) {
    options = options || {};
    this.compilationSuccessInfo = options.compilationSuccessInfo || {};
    this.onErrors = options.onErrors;
    this.shouldClearConsole = options.clearConsole == null ? true : Boolean(options.clearConsole);
    this.silentSuccess = Boolean(options.silentSuccess);
    this.formatters = concat<Formatter>(defaultFormatters, options.additionalFormatters);
    this.transformers = concat<Transformer>(defaultTransformers, options.additionalTransformers);
    this.previousEndTimes = {};
  }

  apply(compiler: Compiler): void {
    const doneFn = (stats: Stats | MultiStats): void => {
      this.clearConsole();

      const hasErrors = stats.hasErrors();
      const hasWarnings = stats.hasWarnings();

      if (!hasErrors && !hasWarnings) {
        if (!this.silentSuccess) {
          this.displaySuccess(stats);
        }
        return;
      }

      if (hasErrors) {
        this.displayErrors(extractErrorsFromStats(stats, 'errors'), 'error');
        return;
      }

      if (hasWarnings) {
        this.displayErrors(extractErrorsFromStats(stats, 'warnings'), 'warning');
      }
    };

    const invalidFn = (): void => {
      this.clearConsole();
      output.title('info', 'WAIT', 'Compiling...');
    };

    const plugin = { name: 'FriendlyErrorsWebpackPlugin' };

    compiler.hooks.done.tap(plugin, doneFn);
    compiler.hooks.invalid.tap(plugin, invalidFn);
  }

  clearConsole(): void {
    if (this.shouldClearConsole) {
      output.clearConsole();
    }
  }

  displaySuccess(stats: Stats | MultiStats): void {
    const time = isMultiStats(stats)
      ? this.getMultiStatsCompileTime(stats)
      : this.getStatsCompileTime(stats);
    output.title('success', 'DONE', 'Compiled successfully in ' + time + 'ms');

    if (this.compilationSuccessInfo.messages) {
      this.compilationSuccessInfo.messages.forEach((message) => output.info(message));
    }
    if (this.compilationSuccessInfo.notes) {
      output.log();
      this.compilationSuccessInfo.notes.forEach((note) => output.note(note));
    }
  }

  displayErrors(errors: RawWebpackError[], severity: ErrorSeverity): void {
    const processedErrors = transformErrors(errors, this.transformers);

    const topErrors = getMaxSeverityErrors(processedErrors);
    const nbErrors = topErrors.length;

    const subtitle = severity === 'error'
      ? `Failed to compile with ${nbErrors} ${severity}${nbErrors === 1 ? '' : 's'}`
      : `Compiled with ${nbErrors} ${severity}${nbErrors === 1 ? '' : 's'}`;
    output.title(severity, severity.toUpperCase(), subtitle);

    if (this.onErrors) {
      this.onErrors(severity, topErrors);
    }

    formatErrors(topErrors, this.formatters, severity).forEach((chunk) => output.log(chunk));
  }

  getStatsCompileTime(stats: Stats, statsIndex?: number): number {
    // When we have multi compilations but only one of them is rebuilt, we need
    // to skip the unchanged compilers to report the true rebuild time.
    if (statsIndex !== undefined) {
      if (this.previousEndTimes[statsIndex] === stats.endTime) {
        return 0;
      }
      this.previousEndTimes[statsIndex] = stats.endTime;
    }

    return (stats.endTime || 0) - (stats.startTime || 0);
  }

  getMultiStatsCompileTime(stats: MultiStats): number {
    // Webpack multi compilations run in parallel — use the longest duration.
    return stats.stats.reduce<number>(
      (time, s, index) => Math.max(time, this.getStatsCompileTime(s, index)),
      0
    );
  }
}

function extractErrorsFromStats(
  stats: Stats | MultiStats,
  type: 'errors' | 'warnings'
): RawWebpackError[] {
  if (isMultiStats(stats)) {
    const errors = stats.stats.reduce<RawWebpackError[]>(
      (acc, s) => acc.concat(extractErrorsFromStats(s, type)),
      []
    );
    // Dedupe so the same error doesn't show many times when multiple
    // compilers depend on the same module.
    return uniqueBy(errors, (error) => error.message);
  }

  const findErrorsRecursive = (compilation: Compilation): RawWebpackError[] => {
    const errors = (compilation as any)[type] as RawWebpackError[];
    if (errors.length === 0 && compilation.children) {
      for (const child of compilation.children) {
        errors.push(...findErrorsRecursive(child));
      }
    }
    return uniqueBy(errors, (error) => error.message);
  };

  return findErrorsRecursive(stats.compilation);
}

function isMultiStats(stats: Stats | MultiStats): stats is MultiStats {
  return 'stats' in stats && Array.isArray((stats as MultiStats).stats);
}

function getMaxSeverityErrors(errors: AnnotatedError[]): AnnotatedError[] {
  const maxSeverity = getMaxInt(errors, 'severity');
  return errors.filter((e) => e.severity === maxSeverity);
}

function getMaxInt(collection: AnnotatedError[], propertyName: 'severity'): number {
  return collection.reduce<number>((res, curr) => {
    return curr[propertyName] > res ? curr[propertyName] : res;
  }, 0);
}

export = FriendlyErrorsWebpackPlugin;
