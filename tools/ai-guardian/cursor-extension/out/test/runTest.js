"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const path = require("path");
const Mocha = require("mocha");
const glob_1 = require("glob");
function run() {
    // 创建Mocha实例
    const mocha = new Mocha({
        ui: 'tdd',
        color: true,
        timeout: 10000
    });
    const testsRoot = path.resolve(__dirname, '..');
    return new Promise((resolve, reject) => {
        (0, glob_1.glob)('**/**.test.js', { cwd: testsRoot }).then(files => {
            // 添加测试文件到Mocha实例
            files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));
            try {
                // 运行Mocha测试
                mocha.run(failures => {
                    if (failures > 0) {
                        reject(new Error(`${failures} tests failed.`));
                    }
                    else {
                        resolve();
                    }
                });
            }
            catch (err) {
                console.error(err);
                reject(err);
            }
        }).catch(reject);
    });
}
exports.run = run;
//# sourceMappingURL=runTest.js.map