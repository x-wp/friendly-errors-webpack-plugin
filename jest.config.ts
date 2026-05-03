import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  // ts-jest transforms .ts/.tsx; .js stays untransformed (Node already runs it).
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  testMatch: ['**/test/**/*.spec.{js,ts}'],
  collectCoverageFrom: ['src/**/*.{ts,js}'],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text-summary'],
};

export default config;
