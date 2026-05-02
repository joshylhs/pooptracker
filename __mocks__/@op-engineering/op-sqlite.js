module.exports = {
  open: jest.fn(() => ({
    execute: jest.fn(() => Promise.resolve({ rows: [] })),
    executeSync: jest.fn(() => ({ rows: [] })),
    close: jest.fn(),
  })),
};
