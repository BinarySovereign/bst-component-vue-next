// 补充 Vitest 注入值的类型声明
// `vitest.config.ts` 通过 test.provide 注入仓库根路径，测试内以 inject('repoRoot') 取用
import 'vitest';

declare module 'vitest' {
  interface ProvidedContext {
    // 仓库根目录的绝对路径，由配置文件在加载时计算
    repoRoot: string;
  }
}
