// 发布单元清单：发布脚本与 Notes 提取共用的事实来源
//
// 一个发布单元对应一个可独立分发的产物目录（根 dist 下的同名目录）。
// `dir` 指向源码包目录，版本号与 CHANGELOG 都从该目录读取。
// `file` 是 Release 附件的文件名前缀，固定为 `bst-<单元>`，与源码包目录名一致。
export const RELEASE_UNITS = {
  'vue-next': {
    dir: 'packages/bst-vue-next',
    name: '@binarysovereign/vue-next',
    file: 'bst-vue-next',
  },
  'vue-next-pro': {
    dir: 'packages/bst-vue-next-pro',
    name: '@binarysovereign/vue-next-pro',
    file: 'bst-vue-next-pro',
  },
  'vue-next-pro-ai': {
    dir: 'packages/bst-vue-next-pro-ai',
    name: '@binarysovereign/vue-next-pro-ai',
    file: 'bst-vue-next-pro-ai',
  },
  styles: {
    dir: 'packages/bst-styles',
    name: '@binarysovereign/styles',
    file: 'bst-styles',
  },
};

/**
 * 列出全部发布单元标识
 *
 * @returns {string[]} 单元标识数组
 */
export function listUnitKeys() {
  return Object.keys(RELEASE_UNITS);
}
