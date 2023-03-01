# rollup


## 工具
### ast
ast语法树在线分析工具  **[https://astexplorer.net/](https://astexplorer.net/)**


### magic-string
魔法字符串 语句的处理生成 **[https://github.com/Rich-Harris/magic-string](https://github.com/Rich-Harris/magic-string)**

## 打包原理

```javascript
// module.js
export const a = 'a';
```
```javascript
//入口文件 entry.js
import {a} from 'module';
console.log(a);
```
```javascript
// 打包结果 output
const a = 'a';
console.log(a);
```
简单的来讲, 通过路径找到依赖的变量,拷贝变量声明的语句到
## tree-shaking 原理
- 从入口模块出发,找出所有依赖的数据
- 找到这个变量的定义位置, 复制相关定义语句
- 未被引用的语句删除