import type { Compiler, MultiStats, Stats, WebpackPluginInstance } from 'webpack';
import type { StackFrame } from 'error-stack-parser';

/**
 * Loose webpack-error shape this plugin sees at runtime. webpack's own
 * `WebpackError` class is narrower than the actual runtime objects (some
 * fields like `file`, `origin`, `dependencies` come from stats serialization,
 * not the class itself), so we keep this permissive.
 */
export interface RawWebpackError {
  message: string;
  name?: string;
  file?: string;
  module?: any;
  origin?: any;
  dependencies?: any[];
  error?: { message?: string };
  stack?: string;
  [key: string]: any;
}

/** Output of extractWebpackError, consumed by transformers and formatters. */
export interface AnnotatedError {
  message: string;
  file: string | undefined;
  origin: string;
  name: string | undefined;
  severity: number;
  webpackError: RawWebpackError;
  originalStack: StackFrame[];
  /** A transformer's classification (e.g. 'module-not-found', 'lint-error'). */
  type?: string;
  /** Set by moduleNotFound — the missing module request. */
  module?: string;
  /** Optional extra info lines surfaced by the formatter. */
  infos?: string[];
}

/** A transformer enriches a single annotated error. Untransformed errors are returned as-is. */
export type Transformer = (error: AnnotatedError) => AnnotatedError;

/** Severity bucket used by the formatter (matches the webpack errors/warnings split). */
export type ErrorSeverity = 'error' | 'warning';

/** A formatter produces log lines for a category of errors. Falsy = empty. */
export type Formatter = (
  errors: AnnotatedError[],
  type?: ErrorSeverity | string
) => string[] | undefined | null | false;

/** Plugin constructor options. */
export interface PluginOptions {
  compilationSuccessInfo?: {
    messages?: string[];
    notes?: string[];
  };
  onErrors?: (severity: ErrorSeverity, errors: AnnotatedError[]) => void;
  clearConsole?: boolean;
  additionalFormatters?: Formatter[];
  additionalTransformers?: Transformer[];
  /**
   * Suppress the "Compiled successfully" banner on clean builds. Errors and
   * warnings still print as usual. Useful when another plugin is already
   * announcing success and you only want this plugin's error reporting.
   */
  silentSuccess?: boolean;
}

/** Either single or multi-compiler stats. */
export type AnyStats = Stats | MultiStats;

export type { Compiler, WebpackPluginInstance };
