docs: 重整文档站与 Storybook 示例结构

- 文档站示例目录改为按 basic / advanced / ai 分层，context-menu 原有示例迁入 advanced/context-menu
- 新增键盘操作、业务回调、关闭行为开关、程序化控制、视口边缘自适应、面板尺寸与滚动、完全自定义内容、动态菜单数据、多实例共 9 个示例
- 站点样式拆为 demo/index.css 汇总加 block、shared 与各层分片，删除原 demo.css
- 组件文档页按新路径引用示例，并补齐上述 9 个场景的说明
- 首页重写特性卡片并新增 GitHub 入口，页脚改为 MIT 协议与 2026 年份署名
- 样式预览页与主题定制页删除与当前实现不符的内容，导航同步收敛
- Storybook 新增挂载即显示、面板内滚动、全部禁用 3 个示例，story 按正常 / 异常 / 边界重新分组
- Storybook 演示改为初始显隐跟随入参，并补记 update:isVisible 与 update:position 事件
- VitePress 配置、插件与主题入口精简说明注释，示例 id 归一化随分层目录生效
- README 中英文版补充文档站入口，引导页 Node 下限对齐 >=22.13.0

---

docs: restructure the docs site and Storybook examples

- organize the docs site examples into basic / advanced / ai layers and move the context-menu examples under advanced/context-menu
- add 9 examples for keyboard navigation, item actions, close behavior switches, programmatic control, viewport edge clamping, panel size and scrolling, fully custom content, dynamic items, and multiple instances
- split the site styles into a demo/index.css entry plus block, shared, and per-layer files, replacing the old demo.css
- point the component page at the new paths and cover all 9 new scenarios
- rewrite the home page feature cards, add a GitHub link, and switch the footer to the MIT license with the 2026 copyright year
- drop outdated notes from the styles preview and theming pages and trim the navigation to match
- add visible-on-mount, inner-scroll, and all-disabled examples to Storybook and regroup the stories by normal / abnormal / edge cases
- make the Storybook demo follow the incoming isVisible value and log update:isVisible and update:position
- trim comments in the VitePress config, plugins, and theme entry, with demo ids resolving through the new layer directories
- add the docs site link to both README files and align the Node floor on the introduction page to >=22.13.0

Copyright (c) 2026 Felix Tang(BinarySovereign). All rights reserved.
