'use strcit';

const fs = require('fs');
const _ = require('lodash');
const path = require('path');

const rootPath = path.join(__dirname, '..');
const targetPath = path.join(rootPath, 'VOCdevkit', 'VOC2012');

const walkerSync = (root, handle) => {
  const isFile = fs.existsSync(root) && fs.statSync(root).isFile();
  const isDir = fs.existsSync(root) && fs.statSync(root).isDirectory();
  if (isFile) {
    handle(root);
  } else if (isDir) {
    const files = fs.readdirSync(root);
    files
      .map(file => {
        const current = path.join(root, file);
        walkerSync(current, handle);
      });
  }
};

const trainvalPercent = 0.66;
const trainPercent = 0.5;
const xmlFilePath = path.join(targetPath, 'Annotations');
const txtFilePath = path.join(targetPath, 'ImageSets', 'Main');

const totalXml = fs
  .readdirSync(xmlFilePath)
  .filter(file => path.extname(file) === '.xml');
const totalXmlNum = totalXml.length;
const tv = totalXmlNum * trainvalPercent;
const tr = tv * trainPercent;

const trainval = _.sampleSize(totalXml, tv);
const train = _.sampleSize(trainval, tr);
const ftrainval = [];
const ftest = [];
const ftrain = [];
const fval = [];

totalXml.forEach(item => {
  const value = item.split('.')[0];
  if (trainval.includes(item)) {
    ftrainval.push(value);
    if (train.includes(item)) {
      ftrain.push(value);
    } else {
      fval.push(value);
    }
  } else {
    ftest.push(value);
  }
});

fs.writeFileSync(path.join(txtFilePath, 'trainval.txt'), ftrainval.join('\n'));
fs.writeFileSync(path.join(txtFilePath, 'test.txt'), ftest.join('\n'));
fs.writeFileSync(path.join(txtFilePath, 'train.txt'), ftrain.join('\n'));
fs.writeFileSync(path.join(txtFilePath, 'val.txt'), fval.join('\n'));

console.log('%s created success', txtFilePath);
