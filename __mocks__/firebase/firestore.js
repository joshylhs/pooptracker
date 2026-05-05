module.exports = {
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn((..._args) => ({})),
  getDoc: jest.fn(async () => ({ exists: () => false, data: () => ({}) })),
  setDoc: jest.fn(async () => {}),
  runTransaction: jest.fn(async (_db, fn) =>
    fn({
      get: jest.fn(async () => ({ exists: () => false, data: () => ({}) })),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }),
  ),
  serverTimestamp: jest.fn(() => ({ __serverTimestamp: true })),
  writeBatch: jest.fn(() => ({
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn(async () => {}),
  })),
};
