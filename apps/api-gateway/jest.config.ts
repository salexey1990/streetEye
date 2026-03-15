import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@gateway/(.*)$': '<rootDir>/gateway/$1',
    '^@middleware/(.*)$': '<rootDir>/middleware/$1',
    '^@interceptors/(.*)$': '<rootDir>/interceptors/$1',
    '^@filters/(.*)$': '<rootDir>/filters/$1',
    '^@guards/(.*)$': '<rootDir>/guards/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@events/(.*)$': '<rootDir>/events/$1',
  },
};

export default config;
