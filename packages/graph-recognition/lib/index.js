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
    let matrix = [];
    let result = [];
    const _result = [];

    data.forEach((item, index) => {
      _result.push({
        text: item.text,
        width: Math.min(item.text.length * REAL_LINE_HEIGHT, item.w) * ZOOM_RATE,
        height: Math.min(REAL_LINE_HEIGHT, item.h) * ZOOM_RATE,
        left: item.x * ZOOM_RATE,
        top: item.y * ZOOM_RATE,
        index,
      });
    });
    result = _result.slice(0);

    result.forEach((item) => {
      const { left, width, top, height } = item;
      const arrayItem = {
        rightNum: 0,
        leftNum: 0,
        topNum: 0,
        bottomNum: 0
      };
      result.forEach(_item => {
        const { left: _left, width: _width, top: _top, height: _height } = _item;
        if (_left + _width <= left) {
          arrayItem.leftNum++;
        }
        if (_top + height <= top) {
          arrayItem.topNum++;
        }
        if (left + width <= _left) {
          arrayItem.rightNum++;
        }
        if (top + height <= _height) {
          arrayItem.bottomNum++;
        }
      });
      item.arrayItem = arrayItem;
    });

    const leftNumSet = new Set();
    const topNumSet = new Set();
    result.forEach((item) => {
      leftNumSet.add(item.arrayItem.leftNum);
      topNumSet.add(item.arrayItem.topNum);
    });
    const rows = topNumSet.size;
    const cols = leftNumSet.size;
    result.forEach((item) => {
      item.arrayItem.col = Array.from(leftNumSet).filter((leftNum) => leftNum < item.arrayItem.leftNum).length;
      item.arrayItem.row = Array.from(topNumSet).filter((topNum) => topNum < item.arrayItem.topNum).length;
    });
    matrix = new Array(rows);
    result.forEach((item) => {
      if (!matrix[item.arrayItem.row]) {
        matrix[item.arrayItem.row] = new Array(cols);
      }
      matrix[item.arrayItem.row][item.arrayItem.col] = item;
    });

    const extras = [];
    matrix.forEach((rows) => {
      const rowHasItemArray = rows.filter((item) => !!item);
      if (rowHasItemArray.length === 1) {
        let count = 0;
        matrix.forEach((_rows) => {
          _rows.forEach((col, index) => {
            if (index === rowHasItemArray[0].arrayItem.col && !!col) {
              count++;
            }
          })
        });
        if (count === 1) {
          extras.push(rowHasItemArray[0]);
        }
      }
    });

    const rmObj = extras.reduce((ret, extra) => {
      ret.rmCols.push(extra.arrayItem.col);
      ret.rmRows.push(extra.arrayItem.row);
      return ret;
    }, {
      rmCols: [],
      rmRows: []
    });

    rmObj.rmRows.forEach((row, index) => {
      matrix.splice(row - index, 1);
    });
    rmObj.rmCols.forEach((col, index) => {
      matrix.forEach((rows) => {
        rows.splice(col - index, 1);
      });
    });

    const q = matrix.reduce((ret, rows) => {
      ret += rows.filter((item) => !!item).length;
      return ret;
    }, 0);

    const percent = q / Math.max((cols - rmObj.rmCols.length) * (rows - rmObj.rmRows.length), 1);

    return {
      extras,
      matrix,
      percent,
      result: _result,
      originData: data,
      zoomRate: ZOOM_RATE,
      options,
      cols: cols - rmObj.rmCols.length,
      rows: rows - rmObj.rmRows.length,
    };
  }

  const getMatrix1 = (data, options) => {
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
      rows: matrix.length,
    };
  };

  const getQ = (data, options) => {
    const {
      viewWidth: VIEW_WIDTH,
      realViewWidth: IMAGE_REAL_WIDTH,
      realViewHeight: IMAGE_REAL_HEIGHT,
    } = options;
    const ZOOM_RATE = VIEW_WIDTH / IMAGE_REAL_WIDTH;
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

    const t_size = Math.sqrt(Math.pow(IMAGE_REAL_WIDTH, 2) + Math.pow(IMAGE_REAL_HEIGHT, 2));
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

  const isGra1 = (options) => {
    const {
      cols,
      rows,
    } = options;
    return cols >=2 && rows >= 3;
  };

  const isGra2 = (options) => {
    const {
      Q
    } = options;
    return Q >= 0.5;
  };

  exports.R = {
    getMatrix,
    getQ,
    isGra1,
    isGra2,
  };
});