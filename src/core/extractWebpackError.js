'use strict';

const path = require('path');
const ErrorStackParser = require('error-stack-parser');

// Inline duck-typed replacement for webpack/lib/RequestShortener (webpack
// internal). NormalModule#readableIdentifier only calls shorten(request).
const cwdPrefix = process.cwd() + path.sep;
const requestShortener = {
  shorten(request) {
    if (typeof request !== 'string') return request;
    return request
      .split(cwdPrefix).join('./')
      .split(path.sep).join('/');
  }
};

/*
 This logic is mostly duplicated from webpack/lib/Stats.js#toJson()
 See: https://github.com/webpack/webpack/blob/2f618e733aab4755deb42e9d8e859609005607c0/lib/Stats.js#L89
*/

function extractError (e) {
  return {
    message: e.message,
    file: getFile(e),
    origin: getOrigin(e),
    name: e.name,
    severity: 0,
    webpackError: e,
    originalStack: getOriginalErrorStack(e)
  };
}

function getOriginalErrorStack(e) {
  while (e.error != null) {
    e = e.error;
  }
  if (e.stack) {
    return ErrorStackParser.parse(e);
  }
  return [];
}

function getFile (e) {
  if (e.file) {
    return e.file;
  } else if (e.module && e.module.readableIdentifier && typeof e.module.readableIdentifier === "function") {
    return e.module.readableIdentifier(requestShortener);
  }
}

function getOrigin (e) {
  let origin = '';
  if (e.dependencies && e.origin) {
    origin += '\n @ ' + e.origin.readableIdentifier(requestShortener);
    e.dependencies.forEach(function (dep) {
      if (!dep.loc) return;
      if (typeof dep.loc === "string") return;
      if (!dep.loc.start) return;
      if (!dep.loc.end) return;
      origin += ' ' + dep.loc.start.line + ':' + dep.loc.start.column + '-' +
        (dep.loc.start.line !== dep.loc.end.line ? dep.loc.end.line + ':' : '') + dep.loc.end.column;
    });
    var current = e.origin;
    while (current.issuer && typeof current.issuer.readableIdentifier === 'function') {
      current = current.issuer;
      origin += '\n @ ' + current.readableIdentifier(requestShortener);
    }
  }
  return origin;
}

module.exports = extractError;
