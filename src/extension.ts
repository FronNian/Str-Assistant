import * as vscode from 'vscode';

// 定义TextEditorEdit类型
type TextEditorEdit = vscode.TextEditorEdit;

export function activate(context: vscode.ExtensionContext) {
  // 通用的文本处理函数
  const processText = (editor: vscode.TextEditor, transformer: (text: string) => string) => {
    const selection = editor.selection;
    const text = editor.document.getText(selection);
    if (!text) {
      vscode.window.showWarningMessage('请先选择要处理的文本');
      return;
    }
    
    // 预处理文本，处理不规则的行
    const preprocessText = (text: string): string => {
      // 统一换行符
      text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      // 移除开头和结尾的空白
      text = text.trim();
      // 处理连续的空行
      text = text.replace(/\n{3,}/g, '\n\n');
      return text;
    };
    
    try {
      const processedText = preprocessText(text);
      if (!processedText) {
        vscode.window.showWarningMessage('选中的文本无效');
        return;
      }
      
      const newText = transformer(processedText);
      return editor.edit(editBuilder => {
        editBuilder.replace(selection, newText);
      }).then(() => {
        // 操作成功后显示状态
        vscode.window.setStatusBarMessage('文本处理成功', 2000);
      });
    } catch (error) {
      console.error('Text processing error:', error);
      vscode.window.showErrorMessage(`处理文本时出错：${error || '未知错误'}`);
    }
  };

  // 复制转换后的文本而不修改原文本
  const copyTransformedText = async (text: string, transformer: (text: string) => string) => {
    const newText = transformer(text);
    await vscode.env.clipboard.writeText(newText);
    vscode.window.showInformationMessage('已复制转换后的文本到剪贴板');
  };

  // 全部字符串转换成大写
  const allToUpper = vscode.commands.registerCommand('str-transform.allToUpper', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      const upperText = selectedText.toUpperCase();
      editor.edit((editBuilder: TextEditorEdit) => {
        editBuilder.replace(selection, upperText);
      });
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });
  // 全部字符串转换成小写
  const allToLower = vscode.commands.registerCommand('str-transform.allToLower', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      const lowerText = selectedText.toLowerCase();
      editor.edit((editBuilder: TextEditorEdit) => {
        editBuilder.replace(selection, lowerText);
      });
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });
  // 首字母转换成大写
  const headToUpper = vscode.commands.registerCommand('str-transform.headToUpper', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      const upperText = selectedText.charAt(0).toUpperCase() + selectedText.slice(1);
      editor.edit((editBuilder: TextEditorEdit) => {
        editBuilder.replace(selection, upperText);
      });
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });
  // 首字母转换成小写
  const headToLower = vscode.commands.registerCommand('str-transform.headToLower', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      const lowerText = selectedText.charAt(0).toLowerCase() + selectedText.slice(1);
      editor.edit((editBuilder: TextEditorEdit) => {
        editBuilder.replace(selection, lowerText);
      });
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });
  // 全部首字母转换成大写
  const allHeadToUpper = vscode.commands.registerCommand('str-transform.allHeadToUpper', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      // 使用正则表达式匹配所有英文单词（包括带连字符的单词）
      const upperText = selectedText.replace(
        /\b[a-zA-Z]+(-[a-zA-Z]+)*\b/g,
        word => {
          // 处理带连字符的单词
          return word.split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join('-');
        }
      );
      editor.edit((editBuilder: TextEditorEdit) => {
        editBuilder.replace(selection, upperText);
      });
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });
  // 全部首字母转换成小写 
  const allHeadToLower = vscode.commands.registerCommand('str-transform.allHeadToLower', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      // 使用正则表达式匹配所有英文单词（包括带连字符的单词）
      const lowerText = selectedText.replace(
        /\b[a-zA-Z]+(-[a-zA-Z]+)*\b/g,
        word => {
          // 处理带连字符的单词
          return word.split('-')
            .map(part => part.charAt(0).toLowerCase() + part.slice(1))
            .join('-');
        }
      );
      editor.edit((editBuilder: TextEditorEdit) => {
        editBuilder.replace(selection, lowerText);
      });
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });

  // 转换为小驼峰命名
  const toCamelCase = vscode.commands.registerCommand('str-transform.toCamelCase', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      processText(editor, text => {
        // 处理多行文本
        return text.split('\n').map(line => {
          if (!line.trim()) return '';
          
          // 清理无效字符
          line = line.replace(/[^a-zA-Z0-9_\s-]/g, ' ');
          
          // 先处理可能的驼峰命名
          line = line.replace(/([A-Z])/g, '_$1').toLowerCase();
          
          return line
            .replace(/^_/, '')  // 移除开头的下划线
            .replace(/[_-]([a-z])/g, (_, letter) => letter.toUpperCase())
            .replace(/^[A-Z]/, letter => letter.toLowerCase());
        }).filter(Boolean).join('\n');
      });
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });

  // 转换为大驼峰命名
  const toPascalCase = vscode.commands.registerCommand('str-transform.toPascalCase', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      processText(editor, text => {
        // 先处理可能的驼峰命名
        text = text.replace(/([A-Z])/g, '_$1').toLowerCase();
        return text
          .replace(/^_/, '')  // 移除开头的下划线
          .replace(/[_-]([a-z])/g, (_, letter) => letter.toUpperCase())
          .replace(/^[a-z]/, letter => letter.toUpperCase());
      });
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });

  // 转换为下划线命名
  const toSnakeCase = vscode.commands.registerCommand('str-transform.toSnakeCase', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      processText(editor, text => {
        return text
          .replace(/([A-Z])/g, '_$1')
          .replace(/[-\s]/g, '_')
          .toLowerCase()
          .replace(/^_/, '');
      });
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });

  // 转换为中划线命名
  const toKebabCase = vscode.commands.registerCommand('str-transform.toKebabCase', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      processText(editor, text => {
        return text
          .replace(/([A-Z])/g, '-$1')
          .replace(/[_\s]/g, '-')
          .toLowerCase()
          .replace(/^-/, '');
      });
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });

  // 字符串反转
  const reverse = vscode.commands.registerCommand('str-transform.reverse', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      processText(editor, text => {
        return text.split('').reverse().join('');
      });
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });

  // 移除所有空格
  const removeSpaces = vscode.commands.registerCommand('str-transform.removeSpaces', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      processText(editor, text => {
        return text.replace(/\s+/g, '');
      });
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });

  // 复制转换后的文本（不改变原文本）
  const copyTransformed = vscode.commands.registerCommand('str-transform.copyTransformed', async () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      const text = editor.document.getText(selection);
      
      const transformType = await vscode.window.showQuickPick([
        { label: '大写', value: 'upper' },
        { label: '小写', value: 'lower' },
        { label: '首字母大写', value: 'capitalize' },
        { label: '驼峰命名', value: 'camel' },
        { label: '帕斯卡命名', value: 'pascal' },
        { label: '下划线命名', value: 'snake' },
        { label: '中划线命名', value: 'kebab' }
      ], {
        placeHolder: '选择转换类型'
      });

      if (transformType) {
        const transformers = {
          upper: (t: string) => t.toUpperCase(),
          lower: (t: string) => t.toLowerCase(),
          capitalize: (t: string) => t.charAt(0).toUpperCase() + t.slice(1),
          camel: (t: string) => t.replace(/[_-]([a-z])/g, (_, l) => l.toUpperCase()),
          pascal: (t: string) => t.charAt(0).toUpperCase() + t.slice(1).replace(/[_-]([a-z])/g, (_, l) => l.toUpperCase()),
          snake: (t: string) => t.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, ''),
          kebab: (t: string) => t.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
        } as Record<string, (t: string) => string>;

        await copyTransformedText(text, transformers[transformType.value]);
      }
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });

  // 中文标点转换为英文
  const toPunctuation = vscode.commands.registerCommand('str-transform.toPunctuation', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      processText(editor, text => {
        const punctuationMap: { [key: string]: string } = {
          '，': ',',
          '。': '.',
          '；': ';',
          '：': ':',
          '“': '"',
          '”': '"',
          '‘': "'",
          '’': "'",
          '！': '!',
          '？': '?',
          '（': '(',
          '）': ')',
          '【': '[',
          '】': ']',
          '《': '<',
          '》': '>',
          '、': ',',
          '～': '~'
        };
        return text.split('').map(char => punctuationMap[char] || char).join('');
      });
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });

  // 删除空行
  const removeEmptyLines = vscode.commands.registerCommand('str-transform.removeEmptyLines', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      processText(editor, text => {
        return text.split('\n')
          .filter(line => line.trim() !== '')
          .join('\n');
      });
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });

  // 删除重复行
  const removeDuplicateLines = vscode.commands.registerCommand('str-transform.removeDuplicateLines', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      processText(editor, text => {
        return Array.from(new Set(text.split('\n'))).join('\n');
      });
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });

  // 升序排序
  const sortAscending = vscode.commands.registerCommand('str-transform.sortAscending', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      processText(editor, text => {
        return text.split('\n')
          .map(line => line.trim())  // 清理每行的空白
          .filter(line => line !== '')  // 过滤空行
          .sort((a, b) => {
            try {
              return a.localeCompare(b, 'zh-CN');
            } catch (err) {
              // 如果本地化比较失败，使用基本比较
              return a < b ? -1 : a > b ? 1 : 0;
            }
          })
          .join('\n');
      });
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });

  // 降序排序
  const sortDescending = vscode.commands.registerCommand('str-transform.sortDescending', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      processText(editor, text => {
        return text.split('\n')
          .filter(line => line.trim() !== '')  // 过滤空行
          .sort((a, b) => b.localeCompare(a, 'zh-CN'))  // 使用本地化排序
          .join('\n');
      });
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });

  // 打乱行顺序
  const shuffleLines = vscode.commands.registerCommand('str-transform.shuffleLines', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      processText(editor, text => {
        const lines = text.split('\n');
        for (let i = lines.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [lines[i], lines[j]] = [lines[j], lines[i]];
        }
        return lines.join('\n');
      });
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });

  // 获取配置
  const getConfig = () => {
    return vscode.workspace.getConfiguration('strAssistant');
  };

  // 合并多行
  const mergeLines = vscode.commands.registerCommand('str-transform.mergeLines', async () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const config = getConfig();
      const separator = await vscode.window.showInputBox({
        prompt: '请输入分隔符',
        value: config.get('mergeLine.separator')
      });

      if (separator !== undefined) {
        processText(editor, text => {
          return text.split('\n')
            .filter(line => line.trim() !== '')
            .join(separator);
        });
      }
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });

  // 合并多行（带引号）
  const mergeLinesWithQuotes = vscode.commands.registerCommand('str-transform.mergeLinesWithQuotes', async () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const config = getConfig();
      const quoteType = await vscode.window.showQuickPick(
        [
          { label: '双引号 (")', value: '"' },
          { label: '单引号 (\')', value: "'" }
        ],
        { placeHolder: '选择引号类型' }
      );

      if (quoteType) {
        const separator = await vscode.window.showInputBox({
          prompt: '请输入分隔符',
          value: config.get('mergeLine.separator')
        });

        if (separator !== undefined) {
          processText(editor, text => {
            return text.split('\n')
              .map(line => line.trim())  // 清理每行的空白
              .filter(line => line !== '')  // 过滤空行
              .map(line => {
                try {
                  // 处理特殊字符
                  line = line
                    .replace(/\\/g, '\\\\')  // 转义反斜杠
                    .replace(/\n/g, '\\n')   // 转义换行
                    .replace(/\r/g, '\\r')   // 转义回车
                    .replace(/\t/g, '\\t')   // 转义制表符
                    .replace(/\f/g, '\\f')   // 转义换页
                    .replace(/\v/g, '\\v');  // 转义垂直制表符

                  // 处理引号
                  const quote = quoteType.value;
                  // 检查是否已经有引号
                  if (line.startsWith(quote) && line.endsWith(quote)) {
                    return line;  // 已有引号则不处理
                  }
                  return `${quote}${line.replace(new RegExp(quote, 'g'), '\\' + quote)}${quote}`;
                } catch (err) {
                  console.warn('Line processing error:', err, line);
                  return `${quoteType.value}${line}${quoteType.value}`;  // 降级处理
                }
              })
              .join(separator);
          });
        }
      }
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });

  // 注册所有命令
  context.subscriptions.push(
    allToUpper,
    allToLower,
    headToUpper,
    headToLower,
    allHeadToUpper,
    allHeadToLower,
    toCamelCase,
    toPascalCase,
    toSnakeCase,
    toKebabCase,
    reverse,
    removeSpaces,
    copyTransformed,
    toPunctuation,
    removeEmptyLines,
    removeDuplicateLines,
    sortAscending,
    sortDescending,
    shuffleLines,
    mergeLines,
    mergeLinesWithQuotes
  );
}
