const fixtureWarning = () => ({
  postcssPlugin: 'fixture-warning',
  Once(_root, { result }) {
    result.warn('fixture postcss warning');
  },
});
fixtureWarning.postcss = true;

module.exports = {
  plugins: [fixtureWarning()],
};
