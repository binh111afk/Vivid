const feedHandler = require("./api/feed/index.js");

const req = {
  method: "GET",
  headers: {
    authorization: "Bearer fake-token"
  }
};

const context = {
  log: function(...args) { console.log(...args); },
  res: {}
};

async function test() {
  await feedHandler(context, req);
  console.log("Azure Functions Res:", context.res);
}

context.log.error = function(...args) { console.error(...args); };

test().catch(console.error);