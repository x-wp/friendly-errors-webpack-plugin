'use strict';

import type { AnnotatedError, RawWebpackError, Transformer } from '../types';

const TYPE = 'module-not-found';

function isModuleNotFoundError(e: AnnotatedError): boolean {
  return e.name === 'ModuleNotFoundError'
    && typeof e.message === 'string'
    && e.message.indexOf('Module not found') === 0;
}

function getRequest(webpackError: RawWebpackError): string | undefined {
  const dependencies = webpackError.dependencies;
  if (dependencies && dependencies.length > 0) {
    const dependency = dependencies[0];
    return dependency.request || (dependency.options && dependency.options.request);
  }
  // webpack 5: ModuleNotFoundError no longer carries dependencies; parse the
  // underlying resolver message instead ("Can't resolve '<request>' in '<dir>'").
  const source = (webpackError.error && webpackError.error.message) || webpackError.message || '';
  const match = /Can't resolve '([^']+)'/.exec(source);
  return match ? match[1] : undefined;
}

const transform: Transformer = (error) => {
  const webpackError = error.webpackError;
  if (isModuleNotFoundError(error)) {
    const moduleName = getRequest(webpackError);
    return Object.assign({}, error, {
      message: `Module not found ${moduleName}`,
      type: TYPE,
      severity: 900,
      module: moduleName,
      name: 'Module not found',
    });
  }
  return error;
};

export = transform;
