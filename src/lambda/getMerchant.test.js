const { handler } = require('./getMerchant');

const mockQuery = jest.fn().mockImplementation(() => {
  return {
    promise: () => Promise.resolve({
      Items: [{ email: "abc@gmail.com" }],
      Count: 1
    })
  };
});

jest.mock('aws-sdk', () => {
  return {
    DynamoDB: {
      DocumentClient: jest.fn().mockImplementation(() => {
         return { query: mockQuery }
      })
    }
  };
});

const lambdaEvent = {
  queryStringParameters: {
    name: 'foobar'
  }
};
describe('getMerchant', () => {
  describe('when found', () => {
    it('returns 200', async () => {
      const { statusCode } = await handler(lambdaEvent);
      expect(statusCode).toEqual(900);
    });
  });
});