/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // tsconfig.json resolves "@/*" against ["./src/*", "./*"] — src first,
  // repo root as fallback (so "@/lib/stellar" is src/lib/stellar.ts but
  // "@/components/Navbar" is components/Navbar.tsx at the repo root).
  // Jest has no built-in fallback resolution, so mirror it with ordered,
  // more-specific-first mappings for src's actual subdirectories.
  moduleNameMapper: {
    '^@/(hooks|lib)/(.*)$': '<rootDir>/src/$1/$2',
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};

module.exports = config;
