'use strict';

const assert = require('assert');

const { R } = require('..');

describe('./test/index.test.js', () => {
  let res;
  it('#1 should be ok', async () => {
    const { data, shape } = require('./8.jpg_data');
    res = R.getMatrix(data, {
      viewWidth: 800,
      lineHeight: 30,
      realViewWidth: shape.width,
      realViewHeight: shape.height,
    });
    assert.equal(res.zoomRate, 1);
    assert.equal(res.cols, 3);
    assert.equal(res.rows, 6);
    assert.equal(res.extras.length, 1);
    assert.equal(res.Q.toFixed(2), 0.39);
  });

  it('#2 should be ok', async () => {
    const { data, shape } = require('./7.jpg_data');
    res = R.getMatrix(data, {
      viewWidth: 800,
      lineHeight: 30,
      realViewWidth: shape.width,
      realViewHeight: shape.height,
    });
    assert.equal(res.zoomRate, 1);
    assert.equal(res.cols, 2);
    assert.equal(res.rows, 4);
    assert.equal(res.extras.length, 1);
    assert.equal(res.Q.toFixed(2), 0.50);
  });

  it('#3 should be ok', async () => {
    const { data, shape } = require('./1.jpg_data');
    res = R.getMatrix(data, {
      viewWidth: 800,
      lineHeight: 30,
      realViewWidth: shape.width,
      realViewHeight: shape.height,
    });
    assert.equal(res.zoomRate.toFixed(1), 0.6);
    assert.equal(res.cols, 3);
    assert.equal(res.rows, 4);
    assert.equal(res.extras.length, 1);
    assert.equal(res.Q.toFixed(2), 0.50);
  });
});