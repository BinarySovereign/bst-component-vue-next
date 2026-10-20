// 示例高亮虚拟模块的类型声明，由 `.vitepress/plugin/demo-highlight.ts` 在构建期生成
declare module 'virtual:bst-demo-highlight' {
  /** 示例 id -> 高亮后的 HTML（`<pre class="shiki ... vp-code">` 整段） */
  const demoHighlightMap: Record<string, string | undefined>;

  export default demoHighlightMap;
}

// 设计令牌虚拟模块的类型声明，由 `.vitepress/plugin/bst-tokens.ts` 在构建期生成。
// 形态与插件导出的 `BstTokenGroup` 一致，此处不能 import 复用：该声明文件服务于类型检查，
// 引入插件实现会把构建期依赖（node:fs / vitepress）一并拖进类型图。
declare module 'virtual:bst-tokens' {
  /** 单条令牌 */
  interface BstTokenItem {
    /** 令牌名，含 `--bst-` 前缀 */
    name: string;
    /** 源文件中紧邻其上的分节注释 */
    note: string;
    /** 亮色下解析后的实际取值（结构层即其唯一取值） */
    light: string;
    /** 暗色下解析后的实际取值；结构层与 `light` 相同 */
    dark: string;
    /** 原始声明中指向另一令牌时的 `var()` 写法，供溯源；非别名时为空串 */
    alias: string;
    /** 是否为色值，决定是否渲染色块 */
    isColor: boolean;
  }

  /** 令牌分组 */
  interface BstTokenGroup {
    title: string;
    description: string;
    items: BstTokenItem[];
  }

  const tokenGroups: BstTokenGroup[];

  export default tokenGroups;
}
