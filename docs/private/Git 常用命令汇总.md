# Git 常用命令汇总

## 基础操作

| 命令 | 作用 | 重要程度 | 使用频率 |
| --- | --- | --- | --- |
| `git init` | 初始化本地仓库，让当前目录成为 Git 可管理的仓库。 | 高 | 低频 |
| `git status` | 查看当前工作区、暂存区的状态，了解文件的修改、新增或删除情况。 | 高 | 高频 |
| `git add <file>` | 将指定文件的更改添加到暂存区，准备提交。 | 高 | 高频 |
| `git add .` | 将当前目录下所有更改的文件添加到暂存区。 | 高 | 高频 |
| `git commit -m "message"` | 提交暂存区的文件到本地仓库，并附带提交信息。 | 高 | 高频 |
| `git commit -am "message"` | 跳过 `git add`，直接提交所有已跟踪文件的更改。 | 中 | 中频 |

## 配置命令

| 命令 | 作用 | 重要程度 | 使用频率 |
| --- | --- | --- | --- |
| `git config user.name "Your Name"` | 设置提交时的用户名。 | 高 | 低频（首次配置） |
| `git config user.email "your.email@example.com"` | 设置提交时的邮箱地址。 | 高 | 低频（首次配置） |
| `git config --global` | 加上此参数表示全局配置，对所有仓库生效。 | 中 | 低频 |
| `git config alias.<alias-name> <command>` | 为常用命令设置别名，提高效率。 | 低 | 低频 |

## 分支操作

| 命令 | 作用 | 重要程度 | 使用频率 |
| --- | --- | --- | --- |
| `git branch` | 查看本地分支。 | 高 | 高频 |
| `git branch <branch-name>` | 创建新分支。 | 高 | 高频 |
| `git checkout <branch-name>` | 切换到指定分支。 | 高 | 高频 |
| `git switch <branch-name>` | 专门用于切换分支，减少误操作。 | 中 | 中频 |
| `git checkout -b <new-branch>` | 创建并切换到新分支。 | 高 | 高频 |
| `git branch -d <branch-name>` | 删除本地分支。 | 高 | 中频 |
| `git branch -D <branch-name>` | 强制删除本地分支。 | 中 | 低频 |
| `git push origin --delete <branch-name>` | 删除远程分支。 | 中 | 低频 |

## 合并与同步

| 命令 | 作用 | 重要程度 | 使用频率 |
| --- | --- | --- | --- |
| `git merge <branch-name>` | 合并指定分支到当前分支。 | 高 | 高频 |
| `git rebase <branch-name>` | 变基当前分支到指定分支，使提交历史更线性。 | 中 | 中频 |
| `git pull --rebase` | 拉取远程最新代码并变基，避免不必要的合并提交。 | 中 | 中频 |

## 标签操作

| 命令 | 作用 | 重要程度 | 使用频率 |
| --- | --- | --- | --- |
| `git tag` | 查看所有标签。 | 中 | 低频 |
| `git tag <tag-name>` | 创建轻量标签。 | 中 | 低频 |
| `git tag -a <tag-name> -m "message"` | 创建带注释的标签。 | 中 | 低频 |
| `git push origin <tag-name>` | 推送标签到远程仓库。 | 中 | 低频 |
| `git push origin --tags` | 推送所有标签到远程仓库。 | 中 | 低频 |
| `git tag -d <tag-name>` | 删除本地标签。 | 低 | 低频 |
| `git push origin :refs/tags/<tag-name>` | 删除远程标签。 | 低 | 低频 |

## 查看历史与对比

| 命令 | 作用 | 重要程度 | 使用频率 |
| --- | --- | --- | --- |
| `git log` | 查看提交历史，显示每次提交的详细信息。 | 高 | 高频 |
| `git log --oneline` | 以简洁格式查看提交历史。 | 高 | 高频 |
| `git log --graph` | 查看分支提交的树状图，直观展示分支合并情况。 | 中 | 中频 |
| `git reflog` | 查看所有操作记录，包括被撤销的操作，用于找回误操作的提交。 | 中 | 低频 |
| `git diff` | 查看工作区与暂存区之间的文件差异。 | 高 | 高频 |
| `git diff --staged` | 查看暂存区与本地仓库之间的文件差异。 | 中 | 中频 |

## 文件恢复与撤销

| 命令 | 作用 | 重要程度 | 使用频率 |
| --- | --- | --- | --- |
| `git checkout -- <file>` | 撤销工作区中对文件的修改，恢复到最近一次提交或暂存的状态。 | 高 | 中频 |
| `git restore <file>` | 用于恢复文件，可从暂存区或特定提交恢复。 | 中 | 中频 |
| `git reset HEAD <file>` | 取消暂存区的文件，将其放回工作区。 | 高 | 中频 |
| `git reset --hard <commit>` | 重置到指定提交记录，丢弃工作区和暂存区的更改。 | 高（危险） | 低频 |
| `git reset --soft <commit>` | 重置到指定提交记录，保留更改在暂存区。 | 中 | 低频 |
| `git clean -f` | 清除工作区未跟踪的文件。 | 中 | 低频 |

## 远程仓库操作

| 命令 | 作用 | 重要程度 | 使用频率 |
| --- | --- | --- | --- |
| `git clone <repository-url>` | 克隆远程仓库到本地。 | 高 | 中频 |
| `git remote -v` | 查看远程仓库的详细信息，包括名称和 URL。 | 中 | 低频 |
| `git remote add origin <url>` | 添加远程仓库，通常命名为 origin。 | 高 | 低频 |
| `git push origin <branch-name>` | 推送本地分支到远程仓库。 | 高 | 高频 |
| `git push -u origin <branch-name>` | 推送分支并关联远程分支，后续可直接使用 `git push`。 | 高 | 中频 |
| `git pull origin <branch-name>` | 拉取远程分支的最新代码并合并到本地当前分支。 | 高 | 高频 |
| `git fetch origin <branch-name>` | 获取远程分支的最新代码，但不合并到本地分支。 | 中 | 中频 |

## 进阶工具

| 命令 | 作用 | 重要程度 | 使用频率 |
| --- | --- | --- | --- |
| `git stash` | 临时保存未完成的改动，使工作区干净。 | 高 | 中频 |
| `git stash pop` | 恢复最近一次保存的工作区改动。 | 高 | 中频 |
| `git stash list` | 查看所有保存的工作区改动记录。 | 中 | 中频 |
| `git stash clear` | 清除所有保存的工作区记录。 | 低 | 低频 |
| `git worktree` | 创建多目录并行开发环境，在不同目录中同时处理不同分支的工作。 | 低 | 低频 |

## 其他命令

| 命令 | 作用 | 重要程度 | 使用频率 |
| --- | --- | --- | --- |
| `git mv <old-file> <new-file>` | 移动或重命名文件，并将操作记录到 Git 中。 | 低 | 低频 |
| `git cherry-pick <commit>` | 将指定的提交复制到当前分支。 | 中 | 中频 |
| `git show <commit>` | 显示指定提交的详细信息。 | 中 | 中频 |
| `git grep "pattern"` | 在代码中搜索指定模式的字符串。 | 中 | 中频 |
| `git bisect` | 通过二分查找定位引入 bug 的提交。 | 低 | 低频 |

---

**评级说明：**

- **重要程度**：高 = 日常开发必须掌握；中 = 特定场景常用；低 = 偶尔用到

- **使用频率**：高频 = 每天都会用；中频 = 每周数次；低频 = 每月甚至更少

> （注：部分内容由豆包工作 AI 生成）
