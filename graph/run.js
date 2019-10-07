'use strict';

const VIEWER_WIDTH = 800;
const IMAGE_REAL_WIDTH = shape.width;
const zoomRate = VIEWER_WIDTH / IMAGE_REAL_WIDTH;

const container = document.querySelector('#mask');

window.ocrRes.forEach(item => {
  const p = document.createElement('p');
  p.className = 'item';
  p.innerText = item.text;
  p.setAttribute('style', `
    width:${item.w * zoomRate}px;
    height:${item.h * zoomRate}px;
    left:${item.x * zoomRate}px;
    top:${item.y * zoomRate}px;
  `);
  container.appendChild(p);
});