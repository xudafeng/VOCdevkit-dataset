'use strcit';

const fs = require('fs');
const path = require('path');

const rootPath = path.join(__dirname, '..');
const targetPath = path.join(rootPath, 'VOCdevkit');

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

walkerSync(targetPath, file => {
  if (path.extname(file) !== '.xml') {
    return;
  }
  const pathReg = /<path>\S+<\/path>/;

  let content = fs.readFileSync(file, 'utf8');
  // replace path dir
  if (pathReg.test(content)) {
    const image = path.join(path.dirname(file), '..', 'JPEGImages', path.basename(file).replace('.xml', '.jpeg'));
    content = content.replace(pathReg, `<path>${image}</path>`);
    console.info('%s is correct', image);
    fs.writeFileSync(file, content);
  }
});