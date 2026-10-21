refactor: 重构 context-menu 为能力拆分的 hook 结构

- 把原先集中在 context-menu.hooks.ts 的显隐阶段、坐标夹取、键盘导航、外部关闭与视图样式拆成 5 个独立能力 hook
- 新增 src/types.ts 收纳阶段联合类型与 emit 签名，能力 hook 之间不再互相引用形成循环依赖
- constants 按用途合并为 METRICS 与 KEYS 分组，几何参数与键盘按键集中声明，类名与告警文案补上逐项说明
- utils 只保留被两处以上使用的纯函数，并新增 isContextMenuItemActionable 统一判定菜单项是否可激活
- hooks/index.ts 只导出 controller，能力 hook 与内部类型均为内部实现，不对外暴露
- 私有函数统一以 _ 开头并前置，公共方法后置；注释精简为单行说明，根组件补上源码阅读顺序
- template README 与 component-develop 提示词补充能力拆分与 types.ts 的使用条件，并新增 refactor-oop 提示词
- 单测同步改用 METRICS 常量，补充 isContextMenuItemActionable 的用例，对外 Props、事件与类名不变

---

refactor: restructure context-menu into capability-split hooks

- split the phase, position, keyboard, outside-close, and view logic out of context-menu.hooks.ts into 5 dedicated capability hooks
- add src/types.ts for the phase union and emit signature so capability hooks no longer reference each other in a cycle
- merge constants into METRICS and KEYS groups, and document each class name and warning message inline
- keep only pure functions used in two or more places in utils.ts and add isContextMenuItemActionable to decide whether an item can be activated
- export only the controller from hooks/index.ts so capability hooks and internal types stay private
- prefix private functions with an underscore and move them to the top, keep public methods at the bottom, and document the recommended reading order in the root component
- document when to split a capability hook and when to add types.ts in the template README and component-develop prompt, and add the refactor-oop prompt
- switch the tests to the METRICS constants and cover isContextMenuItemActionable, with props, events, and class names unchanged

Copyright (c) 2026 Felix Tang(BinarySovereign). All rights reserved.
