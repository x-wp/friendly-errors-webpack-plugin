'use strict';

import { concat } from '../utils';
import type { AnnotatedError, Formatter } from '../types';

interface ModuleGroup {
  module: string;
  relative: boolean;
  errors: AnnotatedError[];
}

function isRelative(moduleName: string): boolean {
  return moduleName.startsWith('./') || moduleName.startsWith('../');
}

function formatFileList(files: string[]): string {
  const length = files.length;
  if (!length) return '';
  return ` in ${files[0]}${files[1] ? `, ${files[1]}` : ''}${
    length > 2 ? ` and ${length - 2} other${length === 3 ? '' : 's'}` : ''
  }`;
}

function formatGroup(group: ModuleGroup): string {
  const files = group.errors
    .map((e) => e.file)
    .filter((f): f is string => Boolean(f));
  return `* ${group.module}${formatFileList(files)}`;
}

function forgetToInstall(missingDependencies: ModuleGroup[]): string {
  const moduleNames = missingDependencies.map((d) => d.module);
  if (missingDependencies.length === 1) {
    return `To install it, you can run: npm install --save ${moduleNames.join(' ')}`;
  }
  return `To install them, you can run: npm install --save ${moduleNames.join(' ')}`;
}

function dependenciesNotFound(dependencies: ModuleGroup[]): string[] | undefined {
  if (dependencies.length === 0) return undefined;
  return concat<string>(
    dependencies.length === 1
      ? 'This dependency was not found:'
      : 'These dependencies were not found:',
    '',
    dependencies.map(formatGroup),
    '',
    forgetToInstall(dependencies)
  );
}

function relativeModulesNotFound(modules: ModuleGroup[]): string[] | undefined {
  if (modules.length === 0) return undefined;
  return concat<string>(
    modules.length === 1
      ? 'This relative module was not found:'
      : 'These relative modules were not found:',
    '',
    modules.map(formatGroup)
  );
}

function groupModules(errors: AnnotatedError[]): ModuleGroup[] {
  const missingModule = new Map<string | undefined, AnnotatedError[]>();

  errors.forEach((error) => {
    if (!missingModule.has(error.module)) {
      missingModule.set(error.module, []);
    }
    missingModule.get(error.module)!.push(error);
  });

  return Array.from(missingModule.keys()).map((moduleName) => ({
    module: moduleName as string,
    relative: isRelative(moduleName as string),
    errors: missingModule.get(moduleName)!,
  }));
}

function formatErrors(errors: AnnotatedError[]): string[] {
  if (errors.length === 0) {
    return [];
  }

  const groups = groupModules(errors);

  const dependencies = groups.filter((group) => !group.relative);
  const relativeModules = groups.filter((group) => group.relative);

  return concat<string>(
    dependenciesNotFound(dependencies),
    dependencies.length && relativeModules.length ? ['', ''] : null,
    relativeModulesNotFound(relativeModules)
  );
}

const format: Formatter = (errors) => {
  return formatErrors(errors.filter((e) => e.type === 'module-not-found'));
};

export = format;
