fix: 修复 context-menu 非 body 挂载的坐标基准

- 原地渲染或挂到自定义容器时，`position` 原先被当作视口坐标，导致面板整体偏移容器左上角的距离
- 新增 `origin` 记录挂载容器左上角的视口坐标，坐标夹取在视口坐标系内计算，最终样式再折算回容器坐标
- 新增 `resolveContextMenuOrigin`，在无元素、非浏览器环境、挂到 `body` 或 `documentElement` 时统一返回视口原点
- 监听 `teleport` 变化触发重新测量，切换挂载目标后面板位置随之校正
- 测量流程加入令牌，同一 ticket 内重复调用只采纳最后一次结果，避免旧坐标覆盖新坐标
- 组件文档、类型注释与 `README-TYPES.md` 同步说明坐标基准，props playground 示例按容器原点换算并展示 `items[].action` 回调
- 单测补充容器锚定、视口夹取、重复测量与 `teleport` 变化重测四类用例，工具函数补齐 6 种原点分支

---

fix: correct context-menu coordinates when not mounted to body

- `position` was treated as viewport coordinates even for inline rendering or a custom container, so the panel drifted by the container's top-left offset
- add `origin` for the container's top-left viewport position, clamp in viewport space, and convert the final style value back to container coordinates
- add `resolveContextMenuOrigin`, which returns the viewport origin when there is no element, no browser environment, or the parent is `body` or `documentElement`
- remeasure when `teleport` changes so the panel position is corrected after switching mount targets
- guard the measurement flow with a token so repeated calls in the same tick keep only the latest result instead of letting an older position overwrite a newer one
- document the coordinate basis in the component page, type comments, and `README-TYPES.md`, and update the props playground example to convert around the container origin and show the `items[].action` callback
- cover container anchoring, viewport clamping, repeated measurement, and remeasure on `teleport` change in the tests, plus all six origin branches for the utility

Copyright (c) 2026 Felix Tang(BinarySovereign). All rights reserved.
