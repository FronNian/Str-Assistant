# Str-Assistant VSCode Extension
# 字符串助手 VSCode 插件

<img src="static/icon.png" width="128" height="128" alt="插件图标">

A powerful VSCode extension for string manipulation, supporting various string transformation features.
一个功能强大的 VSCode 字符串转换助手，支持多种字符串转换功能。

## 功能特性 | Features

### Case Conversion | 大小写转换
- Convert to uppercase | 全部转换为大写 - Convert selected text to uppercase letters
- Convert to lowercase | 全部转换为小写 - Convert selected text to lowercase letters
- Capitalize first letter | 首字母转换为大写 - Convert the first letter to uppercase
- Uncapitalize first letter | 首字母转换为小写 - Convert the first letter to lowercase
- Capitalize all words | 全部首字母转换为大写 - Convert the first letter of each word to uppercase
- Uncapitalize all words | 全部首字母转换为小写 - Convert the first letter of each word to lowercase

### Naming Style Conversion | 命名风格转换
- camelCase | 小驼峰命名 - e.g.: `userName`
- PascalCase | 大驼峰命名 - e.g.: `UserName`
- snake_case | 下划线命名 - e.g.: `user_name`
- kebab-case | 中划线命名 - e.g.: `user-name`

### Punctuation Conversion | 标点符号转换
- Convert Chinese punctuation to English | 中文标点转换为英文 - Convert Chinese punctuation marks (，。；：""'' etc.) to corresponding English ones

### Line Processing | 行处理功能
- Remove empty lines | 删除空行 - Remove all empty lines from text
- Remove duplicate lines | 删除重复行 - Remove duplicate lines, keeping unique ones
- Sort ascending | 升序排序 - Sort multiple lines in ascending order by letters/Chinese characters
- Sort descending | 降序排序 - Sort multiple lines in descending order by letters/Chinese characters
- Shuffle lines | 打乱行顺序 - Randomly shuffle the order of multiple lines
- Merge lines | 合并多行 - Merge multiple lines into one, with customizable separator
- Merge lines with quotes | 合并多行（带引号）- Merge multiple lines into one, adding quotes to each line

### Other Features | 其他功能
- Remove all spaces | 移除所有空格 - Remove all space characters from text
- Reverse string | 字符串反转 - Reverse the order of characters in text
- Copy transformed text | 复制转换后的文本 - Copy the transformed result to clipboard without changing original text

## How to Use | 使用方法

1. Select text in editor | 在编辑器中选择要转换的文本
2. Right-click and select "String Assistant" | 右键点击选中文本，在上下文菜单中选择"字符串助手"
3. Choose desired transformation | 选择需要的转换功能
4. Or use command palette (Ctrl+Shift+P) | 或使用命令面板(Ctrl+Shift+P)输入相应命令

## Configuration | 配置选项

You can customize the following options in VSCode settings:
可以在 VSCode 设置中自定义以下选项：

### JSON Processing Settings | JSON处理设置
- Process content only in JSON files | JSON文件中是否只处理内容：
  - When enabled, only values will be transformed in JSON files | 启用后，在处理JSON文件时只会转换值，不会转换属性名
  - When disabled, both keys and values will be transformed | 禁用时会同时转换属性名和值

### Context Menu Display | 右键菜单显示
- Control which feature categories to show in context menu | 控制右键菜单中显示哪些功能类别：
  - Case conversion features | 大小写转换功能
  - Punctuation conversion features | 标点符号转换功能
  - Line processing features | 行处理功能
  - Space processing features | 空格处理功能
  - Naming conversion features | 命名转换功能
  - Other features | 其他功能

### Line Merging Settings | 合并行设置
- Customize separator for line merging | 自定义合并行时的分隔符
- Choose quote type for line merging (single/double/none) | 选择合并行时使用的引号类型（单引号/双引号/无引号）
