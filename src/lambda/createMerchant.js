const handler = async (event) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  const result = { foo: 'barrrr' };

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: `${JSON.stringify(result, undefined, 2)}`
  };
};

module.exports = { handler };