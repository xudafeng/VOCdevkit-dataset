'use strict';

;(function(root, factory) {
  if (typeof exports !== 'undefined') {
    return factory(exports);
  } else {
    /* istanbul ignore next */
    factory(root['R'] || (root['R'] = {}));
  }
})(this, function(exports) {
  /* istanbul ignore next */
  function R() {}

  const getMatrix = (data, options) => {
    const {
      viewWidth: VIEW_WIDTH,
      lineHeight: LINE_HEIGHT,
      realViewWidth: IMAGE_REAL_WIDTH,
      realViewHeight: IMAGE_REAL_HEIGHT,
    } = options;
    const ZOOM_RATE = VIEW_WIDTH / IMAGE_REAL_WIDTH;
    const VIEW_HEIGHT = IMAGE_REAL_HEIGHT * ZOOM_RATE;
    const REAL_LINE_HEIGHT = LINE_HEIGHT / ZOOM_RATE;
    const result = [];
    data.forEach((item, index) => {
      result.push({
        text: item.text,
        width: Math.min(item.text.length * REAL_LINE_HEIGHT, item.w) * ZOOM_RATE,
        height: Math.min(REAL_LINE_HEIGHT, item.h) * ZOOM_RATE,
        left: item.x * ZOOM_RATE,
        top: item.y * ZOOM_RATE,
        index,
      });
    });
    const matrix = [];
    let cols = 0;
    for (let i = 0; i < VIEW_HEIGHT; i++) {
      let temp = [];
      for (let j = 0; j < result.length; j++) {
        const item = result[j];
        const hit = i >= item.top && i <= item.top + item.height;
        if (hit) {
          const lasted = temp[temp.length - 1];
          if (lasted && lasted.index !== item.index) {
            temp.push(item);
          } else {
            temp.push(item);
          }
          i = item.top + item.height;
        }
      }
      if (temp.length) {
        matrix.push(temp);
        cols = Math.max(temp.length, cols);
        temp = [];
      }
    }
    return {
      matrix,
      result,
      originData: data,
      zoomRate: ZOOM_RATE,
      options,
      cols,
    };
  };

  const getQ = (data, options) => {
    const {
      viewWidth: VIEW_WIDTH,
      realViewWidth: IMAGE_REAL_WIDTH,
      realViewHeight: IMAGE_REAL_HEIGHT,
    } = options;
    const ZOOM_RATE = VIEW_WIDTH / IMAGE_REAL_WIDTH;
    const VIEW_HEIGHT = IMAGE_REAL_HEIGHT * ZOOM_RATE;
    let v = 0;
    for (let i = 0; i < data.length; i++) {
      const current = data[i];
      for (let j = 0; j < data.length; j++) {
        const target = data[j];
        const cx = current.x + current.w / 2;
        const cy = current.y + current.h / 2;
        const tx = target.x + target.w / 2;
        const ty = target.y + target.h / 2;
        v += Math.sqrt(Math.pow(tx - cx, 2) + Math.pow(ty - cy, 2));
      }
    }

    const t_size = Math.sqrt(Math.pow(VIEW_WIDTH, 2) + Math.pow(VIEW_HEIGHT, 2));
    const Q = v / t_size / data.length;
    return {
      originData: data,
      zoomRate: ZOOM_RATE,
      options,
      v,
      t_size,
      Q,
    };
  };

  R.getMatrix = getMatrix;
  R.getQ = getQ;

  exports.R = R;
});