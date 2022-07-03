const { renderer } = require('./query.js');
const { builder } = require("@netlify/functions");

exports.handler = builder(render)

async function render() {
  return await renderer();
}
