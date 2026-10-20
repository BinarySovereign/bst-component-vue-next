// 全局类型声明：补充 TypeScript 无法从依赖中自动获取的模块与全局类型
// 通过根 `tsconfig.json` 的 `include` 纳入类型检查范围

// 单文件组件的模块声明：`.vue` 示例与快照用例会被测试代码 import
// 使用 Vue 的 DefineComponent 默认泛型，避免在声明中显式写出 any
declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent;
  export default component;
}
