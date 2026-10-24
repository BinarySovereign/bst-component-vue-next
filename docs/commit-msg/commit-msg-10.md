fix: 修复 context-menu 滚动关闭重复上报

- 关闭动画期间外部滚动会反复触发关闭，导致 `scroll-outside` 与 `update:isVisible` 各上报多次
- 新增 `isDismissing` 判定，一旦进入关闭流程或面板已不可见，外部点击与滚动都不再响应
- 打开时记录页面滚动位置作为基线，只忽略目标为 `document` 且位移未变化的历史滚动事件，真实滚动仍能关闭
- 复用已有的 `isBrowserEnvironment` 守卫读取 `window.scrollX` / `scrollY`，非浏览器环境直接跳过
- 测试辅助新增 `mockPageScroll` 与 `dispatchPageScroll`，并在每次清理时还原原始滚动属性
- 补充四条用例：关闭中重复滚动只上报一次、打开前的历史滚动被忽略、打开后垂直与水平滚动均关闭

---

fix: stop context-menu from reporting scroll closes twice

- an outside scroll during the closing animation kept re-triggering hide, so `scroll-outside` and `update:isVisible` each fired more than once
- add an `isDismissing` check so outside clicks and scrolls are ignored once closing starts or the panel is no longer visible
- record the page scroll position on open as a baseline and only ignore scroll events targeting `document` whose offset did not change, so a real scroll still closes the panel
- reuse the existing `isBrowserEnvironment` guard before reading `window.scrollX` / `scrollY` so non-browser environments skip it
- add the `mockPageScroll` and `dispatchPageScroll` test helpers and restore the original scroll properties during cleanup
- cover four cases: a repeated scroll while closing reports once, a scroll that happened before opening is ignored, and vertical and horizontal scrolls both close the panel after opening

Copyright (c) 2026 Felix Tang(BinarySovereign). All rights reserved.
