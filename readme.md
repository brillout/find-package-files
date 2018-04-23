Search in all files of a npm package:
Search in all files that are descendents of the package's root directory but skips the files ignored by `.gitingore`.
E.g. if `node_modules/` is in `.gitignore` then the installed dependencies will be skipped.


### Usage

~~~shell
npm install @brillout/find-package-files
~~~

~~~js
const findPackageFiles = require('@brillout/find-package/files');

const packageRootDir = __dirname;

const jsFiles = findPackageFiles('*.js', {cwd: packageRootDir});
console.log(jsFiles);
~~~
