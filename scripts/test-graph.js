'use strict';

const fs = require('fs');
const getPixels = require('get-pixels');
const Engine = require('macaca-ai-engine');

require('dotenv').config();

const filePath = process.argv.pop();

const engine = new Engine();

const run = async () => {
  const res = await engine.imageRecognizeFromPath(filePath);
  getPixels(filePath, (err, pixels) => {
    if (err) {
      console.log('Bad image path');
      return;
    }
    console.log(pixels.shape);
    fs.writeFileSync('./graph/data.js', [
      `window.ocrRes = ${JSON.stringify(res, null, 2)};`,
      `window.shape = { width: ${pixels.shape[0]} };`
    ].join('\n'));
  });
};

run().then();