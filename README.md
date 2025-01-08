# Str-Assistant VSCode Extension

<img src="static/icon.png" width="128" height="128" alt="插件图标">

一个功能强大的 VSCode 字符串转换助手，支持多种字符串转换功能。

## 功能特性

### 大小写转换
- 全部转换为大写 - 将选中文本全部转换为大写字母
- 全部转换为小写 - 将选中文本全部转换为小写字母
- 首字母转换为大写 - 将选中文本的第一个字母转换为大写
- 首字母转换为小写 - 将选中文本的第一个字母转换为小写
- 全部首字母转换为大写 - 将选中文本中每个单词的首字母转换为大写
- 全部首字母转换为小写 - 将选中文本中每个单词的首字母转换为小写

### 命名风格转换
- 小驼峰命名 (camelCase) - 例如：`userName`
- 大驼峰命名 (PascalCase) - 例如：`UserName`
- 下划线命名 (snake_case) - 例如：`user_name`
- 中划线命名 (kebab-case) - 例如：`user-name`

### 标点符号转换
- 中文标点转换为英文 - 将中文标点符号（，。；：""''等）转换为对应的英文标点

### 行处理功能
- 删除空行 - 移除文本中的所有空行
- 删除重复行 - 移除文本中的重复行，保留唯一行
- 升序排序 - 将多行文本按字母/汉字顺序升序排序
- 降序排序 - 将多行文本按字母/汉字顺序降序排序
- 打乱行顺序 - 随机打乱多行文本的顺序
- 合并多行 - 将多行文本合并为一行，可自定义分隔符
- 合并多行（带引号）- 将多行文本合并为一行，每行文本加上引号，可选择单引号或双引号

### 其他功能
- 移除所有空格 - 删除文本中的所有空格字符
- 字符串反转 - 将文本字符顺序反转
- 复制转换后的文本 - 将转换结果复制到剪贴板而不改变原文本

## 使用方法

1. 在编辑器中选择要转换的文本
2. 右键点击选中文本，在上下文菜单中选择"字符串转换"
3. 选择需要的转换功能
4. 或使用命令面板(Ctrl+Shift+P)输入相应命令

## 配置选项

可以在 VSCode 设置中自定义以下选项：

### 右键菜单显示
- 控制右键菜单中显示哪些功能类别：
  - 大小写转换功能
  - 标点符号转换功能
  - 行处理功能
  - 空格处理功能
  - 命名转换功能
  - 其他功能

### 合并行设置
- 自定义合并行时的分隔符
- 选择合并行时使用的引号类型（单引号/双引号/无引号）
