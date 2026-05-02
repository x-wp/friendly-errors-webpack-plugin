'use strict';

import path from 'path';
import ErrorStackParser from 'error-stack-parser';
import type { AnnotatedError, RawWebpackError } from '../types';

// Inline duck-typed replacement for webpack/lib/RequestShortener (webpack
// internal). NormalModule#readableIdentifier only calls shorten(request).
const cwdPrefix = process.cwd() + path.sep;
const requestShortener = {
  shorten(request: string): string {
    if (typeof request !== 'string') return request;
    return request.split(cwdPrefix).join('./').split(path.sep).join('/');
  },
};

/*
 This logic is mostly duplicated from webpack/lib/Stats.js#toJson()
 See: https://github.com/webpack/webpack/blob/2f618e733aab4755deb42e9d8e859609005607c0/lib/Stats.js#L89
*/

function extractError(e: RawWebpackError): AnnotatedError {
  return {
    message: e.message,
    file: getFile(e),
    origin: getOrigin(e),
    name: e.name,
    severity: 0,
    webpackError: e,
    originalStack: getOriginalErrorStack(e),
  };
}

function getOriginalErrorStack(e: RawWebpackError) {
  let cur: any = e;
  while (cur && cur.error != null) {
    cur = cur.error;
  }
  if (cur && cur.stack) {
    return ErrorStackParser.parse(cur);
  }
  return [];
}

function getFile(e: RawWebpackError): string | undefined {
  if (e.file) {
    return e.file;
  }
  if (e.module && typeof e.module.readableIdentifier === 'function') {
    return e.module.readableIdentifier(requestShortener);
  }
  return undefined;
}

function getOrigin(e: RawWebpackError): string {
  let origin = '';
  if (e.dependencies && e.origin) {
    origin += '\n @ ' + e.origin.readableIdentifier(requestShortener);
    e.dependencies.forEach((dep: any) => {
      if (!dep.loc) return;
      if (typeof dep.loc === 'string') return;
      if (!dep.loc.start) return;
      if (!dep.loc.end) return;
      origin += ' ' + dep.loc.start.line + ':' + dep.loc.start.column + '-' +
        (dep.loc.start.line !== dep.loc.end.line ? dep.loc.end.line + ':' : '') + dep.loc.end.column;
    });
    let current: any = e.origin;
    while (current.issuer && typeof current.issuer.readableIdentifier === 'function') {
      current = current.issuer;
      origin += '\n @ ' + current.readableIdentifier(requestShortener);
    }
  }
  return origin;
}

export = extractError;
