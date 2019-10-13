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

  const getMatrix = (data, options) => {
    const {
      viewWidth: VIEW_WIDTH,
      lineHeight: LINE_HEIGHT,
      realViewWidth: IMAGE_REAL_WIDTH,
    } = options;
    const ZOOM_RATE = VIEW_WIDTH / IMAGE_REAL_WIDTH;
    const REAL_LINE_HEIGHT = LINE_HEIGHT / ZOOM_RATE;
    let matrix = [];
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
    let cdata = result.slice(0);

    cdata.forEach((item) => {
      const { left, width, top, height, } = item;
      const calu = {
        rn: 0,
        ln: 0,
        tn: 0,
        bn: 0,
      };
      cdata.forEach(_item => {
        const {
          left: _left,
          width: _width,
          top: _top,
          height: _height,
        } = _item;
        if (_left + _width <= left) {
          calu.ln++;
        }
        if (_top + height <= top) {
          calu.tn++;
        }
        if (left + width <= _left) {
          calu.rn++;
        }
        if (top + height <= _height) {
          calu.bn++;
        }
      });
      item.calu = calu;
    });

    const lnSet = new Set();
    const tnSet = new Set();
    cdata.forEach((item) => {
      lnSet.add(item.calu.ln);
      tnSet.add(item.calu.tn);
    });
    let rows = tnSet.size;
    let cols = lnSet.size;
    matrix = new Array(rows);
    cdata.forEach((item) => {
      item.calu.col = Array.from(lnSet).filter((ln) => ln < item.calu.ln).length;
      item.calu.row = Array.from(tnSet).filter((tn) => tn < item.calu.tn).length;
      if (!matrix[item.calu.row]) {
        matrix[item.calu.row] = new Array(cols);
      }
      matrix[item.calu.row][item.calu.col] = item;
    });

    const extras = [];
    const max_count = 1;
    matrix.forEach((rows) => {
      const rowHas = rows.filter((item) => !!item);
      if (rowHas.length === max_count) {
        let count = 0;
        matrix.forEach((_rows) => {
          _rows.forEach((col, index) => {
            if (index === rowHas[0].calu.col && !!col) {
              count++;
            }
          });
        });
        if (count === max_count) {
          extras.push(rowHas[0]);
        }
      }
    });

    const remove = extras.reduce((ret, extra) => {
      ret.cols.push(extra.calu.col);
      ret.rows.push(extra.calu.row);
      return ret;
    }, {
      cols: [],
      rows: [],
    });

    remove.rows.forEach((row, index) => {
      matrix.splice(row - index, 1);
    });
    remove.cols.forEach((col, index) => {
      matrix.forEach((rows) => {
        rows.splice(col - index, 1);
      });
    });

    const q = matrix.reduce((ret, rows) => {
      ret += rows.filter((item) => !!item).length;
      return ret;
    }, 0);

    cols -= remove.cols.length;
    rows -= remove.rows.length;

    const Q = q / Math.max(cols * rows, 1);

    return {
      extras,
      matrix,
      Q,
      result,
      originData: data,
      zoomRate: ZOOM_RATE,
      options,
      cols,
      rows,
    };
  };

  exports.R = {
    getMatrix,
  };
});
