"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
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
        '^@users/(.*)$': '<rootDir>/users/$1',
        '^@config/(.*)$': '<rootDir>/config/$1',
        '^@shared/(.*)$': '<rootDir>/shared/$1',
        '^@webhooks/(.*)$': '<rootDir>/webhooks/$1',
        '^@events/(.*)$': '<rootDir>/events/$1',
    },
};
exports.default = config;
//# sourceMappingURL=jest.config.js.map