docs: 修正 README 横幅图片的引用地址

- 中英文 README 的横幅改用 raw.githubusercontent 上的 develop 分支绝对地址，避免相对路径在 npm 等非仓库环境失效
- 移除图片的 width 属性，宽度交由容器自适应，与居中容器配合避免超宽
- 两份 README 的修改保持一致

---

docs: fix the banner image reference in the README files

- point the banner at the absolute develop branch URL on raw.githubusercontent so relative paths do not break on npm and other non-repository viewers
- drop the width attribute and let the container size the image so it stays inside the centered wrapper
- keep both language versions in sync

Copyright (c) 2026 Felix Tang(BinarySovereign). All rights reserved.
