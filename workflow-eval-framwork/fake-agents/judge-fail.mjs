#!/usr/bin/env node
const result = {
  status: "failed",
  judges: [
    {
      id: "fake-llm-judge",
      status: "failed",
      summary: "Fake judge failure for harness status-mapping tests.",
    },
  ],
};
console.log(JSON.stringify(result));
