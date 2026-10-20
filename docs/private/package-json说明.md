# package.json 字段说明

> 来源：https://docs.npmjs.com/cli/v11/configuring-npm/package-json

| 字段名称 | 字段描述 | 字段用途 | 字段类型 | 填写示例 | 是否必填 |
| --- | --- | --- | --- | --- | --- |
| `name` | 包名，长度不超过 214 字符，不能含 URL 不安全字符，新包不能有大写字母。 | 作为包的唯一标识，用于 URL、命令行和文件夹名。 | string | `"my-package"` | **Y** |
| `version` | 包版本号，必须可被 node-semver 解析。 | 与 `name` 共同构成唯一标识，版本变更应伴随内容变更。 | string | `"1.0.0"` | **Y** |
| `description` | 包的描述文本。 | 帮助用户在 npm search 中发现该包。 | string | `"一个示例 npm 包"` | **N** |
| `keywords` | 关键字数组。 | 提升包在 npm search 中的可发现性。 | string[] | `["cli", "tool"]` | **N** |
| `homepage` | 项目主页 URL。 | 指向官网或文档地址。 | string | `"https://github.com/user/repo#readme"` | **N** |
| `bugs` | 问题跟踪器 URL 和/或报告邮箱。 | 方便用户反馈问题，`npm bugs` 会使用。 | string \| { url?: string; email?: string } | `{ "url": "https://github.com/user/repo/issues" }` | **N** |
| `license` | 包许可证，推荐 SPDX 标识符。 | 告知使用权限和限制。 | string | `"MIT"` | **N** |
| `author` | 包作者信息。 | 标识主要维护者。 | string \| { name: string; email?: string; url?: string } | `"张三 <zhangsan@example.com>"` | **N** |
| `contributors` | 贡献者列表。 | 列出所有参与贡献的人员。 | Array<string \| { name: string; email?: string; url?: string }> | `["李四 <lisi@example.com>"]` | **N** |
| `funding` | 资助信息。 | 提供资助开发的方式，`npm fund` 会列出。 | string \| { type: string; url: string } \| Array<string \| { type: string; url: string }> | `{ "type": "individual", "url": "https://example.com/donate" }` | **N** |
| `files` | 打包时包含的文件模式数组。 | 控制发布包中包含哪些文件，省略则默认包含所有文件。 | string[] | `["dist", "src"]` | **N** |
| `exports` | 现代模块入口点定义，支持条件导出和多入口。 | 明确定义包的公共接口，替代 `main`。 | string \| string[] \| Record<string, unknown> | `{ ".": { "import": "./index.mjs", "require": "./index.cjs" } }` | **N** |
| `main` | 模块主入口点，默认为根目录 `index.js`。 | 指定 `require("包名")` 时返回的主模块。 | string | `"index.js"` | **N** |
| `type` | 定义 Node.js 如何解释 `.js` 文件。 | 控制模块系统解析方式，取 `"module"` 或 `"commonjs"`。 | 'module' \| 'commonjs' | `"module"` | **N** |
| `browser` | 客户端浏览器环境入口点。 | 提示 bundler 在浏览器环境中替换模块。 | string \| Record<string, string \| false> | `{ "./server.js": "./client.js" }` | **N** |
| `bin` | 命令名到本地文件名的映射。 | 使包提供 CLI 工具，安装时创建可执行文件。 | string \| Record<string, string> | `{ "my-cli": "./bin/cli.js" }` | **N** |
| `man` | 手册页文件或文件数组。 | 提供 man 手册页。 | string \| string[] | `["./man/my-cli.1"]` | **N** |
| `directories` | 描述包结构的对象。 | 遵循 CommonJS Packages 规范指示包结构。 | Record<string, string> | `{ "lib": "lib", "bin": "bin" }` | **N** |
| `repository` | 代码仓库位置。 | 方便贡献者找到源码，`npm repo` 会使用。 | string \| { type: string; url: string; directory?: string } | `{ "type": "git", "url": "git+https://github.com/user/repo.git" }` | **N** |
| `scripts` | 生命周期脚本命令字典。 | 在包生命周期的不同阶段自动执行命令。 | Record<string, string> | `{ "test": "jest", "build": "tsc" }` | **N** |
| `gypfile` | 布尔值，控制是否自动使用 node-gyp 构建。 | 设为 `false` 可阻止 npm 自动构建原生插件。 | boolean | `false` | **N** |
| `config` | 配置参数对象。 | 在包脚本中通过环境变量访问持久化配置。 | Record<string, unknown> | `{ "port": "8080" }` | **N** |
| `dependencies` | 生产依赖对象。 | 指定包运行所必需的依赖项。 | Record<string, string> | `{ "express": "^4.18.2" }` | **N** |
| `devDependencies` | 开发依赖对象。 | 指定测试、构建等开发时依赖。 | Record<string, string> | `{ "typescript": "^5.0.0" }` | **N** |
| `peerDependencies` | 对等依赖对象。 | 表达与宿主工具的兼容性，常用于插件。 | Record<string, string> | `{ "react": ">=17" }` | **N** |
| `peerDependenciesMeta` | 为 `peerDependencies` 提供额外信息。 | 可将某些对等依赖标记为可选。 | Record<string, { optional?: boolean }> | `{ "react": { "optional": true } }` | **N** |
| `bundleDependencies` | 打包时捆绑的包名数组，也可为布尔值。 | 将依赖打包进 tarball，便于离线安装。 | string[] \| boolean | `["express"]` | **N** |
| `optionalDependencies` | 可选依赖对象。 | 指定可有可无的依赖，安装失败不会导致整体失败。 | Record<string, string> | `{ "fsevents": "^2.3.2" }` | **N** |
| `overrides` | 覆盖依赖树中特定包的版本或替换为 fork。 | 解决安全漏洞、统一版本或替换 fork。 | Record<string, string \| Record<string, unknown>> | `{ "lodash": "4.17.21" }` | **N** |
| `engines` | 指定适用的 Node.js 和/或 npm 版本范围。 | 声明运行环境要求。 | Record<string, string> | `{ "node": ">=18.0.0", "npm": ">=9.0.0" }` | **N** |
| `os` | 允许或阻止的操作系统数组。 | 限制包在特定操作系统上运行，`!` 前缀表示阻止。 | string[] | `["darwin", "linux"]` | **N** |
| `cpu` | 允许或阻止的 CPU 架构数组。 | 限制包在特定 CPU 架构上运行。 | string[] | `["x64", "arm64"]` | **N** |
| `libc` | 指定 libc 版本，仅在 linux 下适用。 | 限制包在特定 C 库版本上运行或构建。 | string[] | `["glibc"]` | **N** |
| `devEngines` | 开发工具链统一配置。 | 确保团队成员使用一致的开发工具版本。 | Record<string, { name: string; version: string; onFail?: 'error' \| 'warn' \| 'ignore' }> | `{ "runtime": { "name": "node", "version": ">=18" } }` | **N** |
| `workspaces` | 工作区配置，支持 monorepo。 | 指定子包路径，便于统一管理多个包。 | string[] \| { packages?: string[]; nohoist?: string[] } | `["packages/*"]` | **N** |
| `private` | 布尔值，设为 `true` 时 npm 拒绝发布。 | 防止私有包被意外发布到公共 registry。 | boolean | `true` | **N** |
| `publishConfig` | 发布时使用的配置对象。 | 指定 registry、access、tag 等发布参数。 | Record<string, unknown> | `{ "access": "public" }` | **N** |
