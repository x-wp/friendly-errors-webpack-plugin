const path = require('path');

const fixtureWarning = () => ({
  postcssPlugin: 'fixture-warning',
  Once(_root, { result }) {
    const from = result.opts.from || '';
    result.warn(`warning in ${path.basename(from)}`);
  },
});
fixtureWarning.postcss = true;

module.exports = {
  plugins: [fixtureWarning()],
};
