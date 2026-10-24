// 写给维护者：
// hooks 目录统一出口：只导出 controller.hooks.ts 的组合式函数。
// 视图不得绕过 controller 直接调用下游 hook；
// 按能力拆分的 context-menu-{capability}.hooks.ts 与 types.ts 均为内部实现，不对外导出。

/**
 * Copyright (c) 2026 Felix Tang (BinarySovereign). Licensed under the MIT License. See the LICENSE file in the root directory for the full license text.
 */

export { useContextMenuController } from './controller.hooks';
