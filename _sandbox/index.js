// Intentional errors for manually exercising the friendly-errors pipeline:
//  * unused vars  -> eslint warning      (esLintError transformer)
//  * bad require  -> module-not-found    (moduleNotFound transformer)
const unused = 'I am unused';
const unused2 = 'me too';

require('this-package-does-not-exist');
require('./relative-module-that-is-missing');
