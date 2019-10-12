'use strict';

const container = document.querySelector('#mask');
const print = document.querySelector('#print');
const htmlRes = document.querySelector('#html');
const qRes = document.querySelector('#q');
const { R } = window.R;

const run = () => {
  const res = R.getMatrix(window.ocrRes, {
    viewWidth: 800,
    lineHeight: 30,
    realViewWidth: window.shape.width,
    realViewHeight: window.shape.height,
  });
  
  console.log(res);
  
  const {
    result,
    cols,
    originData,
    zoomRate,
    matrix,
    rows,
  } = res;
  
  originData.forEach((item, index) => {
    const p = document.createElement('p');
    p.className = 'item';
    p.innerText = item.text;
    p.setAttribute('style', `
      width: ${item.w * zoomRate}px;
      height: ${item.h * zoomRate}px;
      left: ${item.x * zoomRate}px;
      top: ${item.y * zoomRate}px;
    `);
    container.appendChild(p);
  });
  
  res.result.forEach((item, index) => {
    const p2 = document.createElement('p');
    p2.className = 'item2';
    p2.innerText = `${item.index} ${item.text}`;
    p2.setAttribute('style', `
      width: ${item.width}px;
      height: ${item.height}px;
      left: ${item.left}px;
      top: ${item.top}px;
    `);
    container.appendChild(p2);
  });
  
  let section = '';
  for (let i = 0; i < matrix.length; i++) {
    section += '<tr>';
    const current = matrix[i];
    for (let j = 0; j < current.length; j++) {
      const item = current[j] || {};
      section += `<td><p>${item.text || ''}</p></td>`
    }
    section += '</tr>';
  }

  console.log(section);

  const html = `<table>
    <colgroup>
      ${new Array(cols + 1).join('<col />')}
    </colgroup>
    <tbody>
      ${section}
    </tbody>
  </table>`;

  htmlRes.innerHTML = html;

  print.innerHTML = JSON.stringify({
    cols,
    rows,
    matrix,
  }, null, 2);

  const isGra1 = R.isGra1(res);
  console.log(`gra1: ${isGra1}`);

  return;
  // if (isGra1) {
  //   return;
  // }
  const res2 = R.getQ(originData, {
    viewWidth: 800,
    realViewWidth: window.shape.width,
    realViewHeight: window.shape.height,
  });

  delete res2.originData;

  qRes.innerHTML = JSON.stringify(res2, null, 2);
  const isGra2 = R.isGra2(res2);
  console.log(`gra2: ${isGra2}`);

  if (isGra2) {
    return;
  }

};

run();
