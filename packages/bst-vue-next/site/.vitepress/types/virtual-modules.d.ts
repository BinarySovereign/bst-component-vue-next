// 构建期虚拟模块的类型声明：示例高亮 HTML 与设计令牌清单。
declare module 'virtual:bst-demo-highlight' {
  const demoHighlightMap: Record<string, string | undefined>;

  export default demoHighlightMap;
}

declare module 'virtual:bst-tokens' {
  interface BstTokenItem {
    name: string;
    note: string;
    light: string;
    dark: string;
    alias: string;
    isColor: boolean;
  }

  interface BstTokenGroup {
    title: string;
    description: string;
    items: BstTokenItem[];
  }

  const tokenGroups: BstTokenGroup[];

  export default tokenGroups;
}
