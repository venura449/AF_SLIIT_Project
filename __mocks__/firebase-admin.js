// __mocks__/firebase-admin.js
module.exports = {
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn()
  },
  messaging: () => ({
    send: jest.fn().mockResolvedValue('mocked send'),
    sendMulticast: jest.fn().mockResolvedValue('mocked sendMulticast')
  })
};