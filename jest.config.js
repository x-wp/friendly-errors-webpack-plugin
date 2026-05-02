module.exports = {
  testEnvironment: 'node',
  // ts-jest transforms .ts/.tsx; .js stays untransformed (Node already runs it).
  // When webpack-ctz lands and src/ becomes TS, this picks them up automatically.
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  testMatch: ['**/test/**/*.spec.{js,ts}'],
};
