import * as vscode from 'vscode';

// 定义TextEditorEdit类型
type TextEditorEdit = vscode.TextEditorEdit;

// 添加防抖处理，避免频繁更新
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export function activate(context: vscode.ExtensionContext) {
  // 通用的文本处理函数
  const processText = async (editor: vscode.TextEditor, transformer: (text: string) => string) => {
    // 添加错误处理
    try {
      const selection = editor.selection;
      const text = editor.document.getText(selection);
      if (!text) {
        vscode.window.showWarningMessage('请先选择要处理的文本');
        return;
      }
      
      // 添加文本大小限制检查
      if (text.length > 1000000) { // 1MB
        const proceed = await vscode.window.showWarningMessage(
          '选中的文本较大，处理可能需要一些时间。是否继续？',
          '继续', '取消'
        );
        if (proceed !== '继续') {
          return;
        }
      }

      // 检查是否是JSON文件且需要只处理内容
      const isJsonFile = editor.document.languageId === 'json';
      const config = vscode.workspace.getConfiguration('strAssistant');
      const contentOnly = config.get('jsonProcessing.contentOnly');
      
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
      
      // 处理JSON文本
      const processJsonText = (text: string, transformer: (text: string) => string): string => {
        try {
          // 尝试解析JSON
          const jsonObj = JSON.parse(text);
          
          // 递归处理JSON对象
          const processJsonObject = (obj: any): any => {
            if (typeof obj === 'string') {
              return transformer(obj);
            }
            if (Array.isArray(obj)) {
              return obj.map(item => processJsonObject(item));
            }
            if (typeof obj === 'object' && obj !== null) {
              const result: any = {};
              for (const [key, value] of Object.entries(obj)) {
                // 如果只处理内容，key保持不变
                const newKey = contentOnly ? key : processJsonObject(key);
                result[newKey] = processJsonObject(value);
              }
              return result;
            }
            return obj;
          };
          
          return JSON.stringify(processJsonObject(jsonObj), null, 2);
        } catch (e) {
          // 如果不是有效的JSON，按普通文本处理
          return transformer(text);
        }
      };
      
      try {
        const processedText = preprocessText(text);
        if (!processedText) {
          vscode.window.showWarningMessage('选中的文本无效');
          return;
        }
        
        const newText = isJsonFile ? processJsonText(processedText, transformer) : transformer(processedText);
        
        return editor.edit(editBuilder => {
          editBuilder.replace(selection, newText);
        }).then(() => {
          vscode.window.setStatusBarMessage('文本处理成功', 2000);
        });
      } catch (error) {
        console.error('Text processing error:', error);
        vscode.window.showErrorMessage(`处理文本时出错：${error || '未知错误'}`);
      }
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

  // 创建时间戳内联提示提供器
  const timestampHintProvider = vscode.languages.registerInlineValuesProvider(
    ['*'], // 支持所有语言
    {
      provideInlineValues(document: vscode.TextDocument, viewPort: vscode.Range, context: vscode.InlineValueContext): vscode.ProviderResult<vscode.InlineValue[]> {
        const inlineValues: vscode.InlineValue[] = [];
        
        // 获取用户配置的时区
        const config = vscode.workspace.getConfiguration('strAssistant');
        const timezone = config.get('timestamp.timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // 遍历可视区域内的每一行
        for (let i = viewPort.start.line; i <= viewPort.end.line; i++) {
          const line = document.lineAt(i);
          const text = line.text;
          
          // 扩展时间戳匹配规则
          const patterns = [
            // Unix时间戳（秒级和毫秒级）- 改进正则以更准确匹配
            /(?:^|[^0-9])(\d{10}|\d{13})(?:[^0-9]|$)/g,
            // ISO 8601格式 - 增加更严格的格式验证
            /\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?Z/g,
            // 日期时间字符串 - 增加更严格的格式验证
            /\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]) (?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d/g,
            // 日期字符串 - 增加更严格的格式验证
            /\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])/g
          ];

          for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
              try {
                let date: Date;
                const timestamp = match[0];

                // 根据不同格式解析日期
                if (/^\d{10}$/.test(timestamp)) {
                  const seconds = parseInt(timestamp);
                  // 添加合理性检查
                  if (seconds > 0 && seconds < 253402300799) { // 1970-01-01 到 9999-12-31
                    date = new Date(seconds * 1000);
                  } else {
                    continue;
                  }
                } else if (/^\d{13}$/.test(timestamp)) {
                  // 13位时间戳（毫秒）
                  date = new Date(parseInt(timestamp));
                } else if (timestamp.includes('T')) {
                  // ISO 8601格式
                  date = new Date(timestamp);
                } else if (timestamp.includes('-')) {
                  // 日期或日期时间格式
                  date = new Date(timestamp.replace(' ', 'T'));
                } else {
                  continue;
                }

                // 验证日期是否有效
                if (isNaN(date.getTime())) {
                  continue;
                }

                // 格式化日期时间
                const formattedDate = new Intl.DateTimeFormat('zh-CN', {
                  timeZone: timezone || 'Asia/Shanghai',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false
                }).format(date);

                // 如果是纯日期格式，只显示日期部分
                const displayText = timestamp.length === 10 && !timestamp.includes(':') 
                  ? formattedDate.split(' ')[0]
                  : formattedDate;
                
                // 创建内联值
                const inlineValue = new vscode.InlineValueText(
                  new vscode.Range(i, match.index, i, match.index + match[0].length),
                  ` → ${displayText}`
                );
                
                inlineValues.push(inlineValue);
              } catch (error) {
                console.error('Error formatting timestamp:', error);
              }
            }
          }
        }
        
        return inlineValues;
      }
    }
  );

  // 注册提供器
  context.subscriptions.push(timestampHintProvider);

  // URL编码
  const urlEncode = vscode.commands.registerCommand('str-transform.urlEncode', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      processText(editor, text => {
        try {
          // 添加更多编码选项
          const encoded = encodeURIComponent(text)
            .replace(/!/g, '%21')
            .replace(/'/g, '%27')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29')
            .replace(/\*/g, '%2A');
          return encoded;
        } catch (error) {
          vscode.window.showErrorMessage(`URL编码失败：${error}`);
          return text;
        }
      });
    }
  });

  // URL解码
  const urlDecode = vscode.commands.registerCommand('str-transform.urlDecode', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      processText(editor, text => {
        try {
          return decodeURIComponent(text);
        } catch (error) {
          vscode.window.showErrorMessage('URL解码失败，请确保输入格式正确');
          return text;
        }
      });
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });

  // Base64编码
  const base64Encode = vscode.commands.registerCommand('str-transform.base64Encode', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      processText(editor, text => {
        return Buffer.from(text).toString('base64');
      });
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });

  // Base64解码
  const base64Decode = vscode.commands.registerCommand('str-transform.base64Decode', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      processText(editor, text => {
        try {
          return Buffer.from(text, 'base64').toString();
        } catch (error) {
          vscode.window.showErrorMessage('Base64解码失败，请确保输入格式正确');
          return text;
        }
      });
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });

  // 字符串统计
  const stringStats = vscode.commands.registerCommand('str-transform.stringStats', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      const text = editor.document.getText(selection);
      
      const stats = {
        characters: text.length,
        charactersNoSpaces: text.replace(/\s/g, '').length,
        words: text.trim().split(/\s+/).filter(word => word.length > 0).length,
        lines: text.split('\n').filter(line => line.length > 0).length,
        chinese: (text.match(/[\u4e00-\u9fa5]/g) || []).length,
        numbers: (text.match(/[0-9]/g) || []).length,
        letters: (text.match(/[a-zA-Z]/g) || []).length,
        spaces: (text.match(/\s/g) || []).length,
        punctuation: (text.match(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g) || []).length
      };

      // 使用更友好的展示方式
      const message = new vscode.MarkdownString(`
### 文本统计信息
- 总字符数：${stats.characters}
- 不含空格字符数：${stats.charactersNoSpaces}
- 单词数：${stats.words}
- 行数：${stats.lines}
- 中文字符：${stats.chinese}
- 英文字母：${stats.letters}
- 数字：${stats.numbers}
- 空格：${stats.spaces}
- 标点符号：${stats.punctuation}
      `);

      // 使用更好的展示方式
      vscode.window.showInformationMessage('文本统计完成', { modal: true, detail: message.value });
    }
  });

  // JSON格式化
  const jsonFormat = vscode.commands.registerCommand('str-transform.jsonFormat', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      processText(editor, text => {
        try {
          // 先尝试修复常见的JSON错误
          text = text
            .replace(/,\s*}/g, '}')  // 移除对象末尾多余的逗号
            .replace(/,\s*\]/g, ']') // 移除数组末尾多余的逗号
            .replace(/'/g, '"');     // 将单引号替换为双引号

          const obj = JSON.parse(text);
          return JSON.stringify(obj, null, 2);
        } catch (error) {
          vscode.window.showErrorMessage(`JSON格式化失败：${error}`);
          return text;
        }
      });
    }
  });

  // JSON压缩
  const jsonMinify = vscode.commands.registerCommand('str-transform.jsonMinify', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      processText(editor, text => {
        try {
          const obj = JSON.parse(text);
          return JSON.stringify(obj);
        } catch (error) {
          vscode.window.showErrorMessage('JSON压缩失败，请确保输入是有效的JSON');
          return text;
        }
      });
    } else {
      vscode.window.showInformationMessage('请先选择文本');
    }
  });

  // 文本对齐
  const textAlign = vscode.commands.registerCommand('str-transform.textAlign', async () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const alignType = await vscode.window.showQuickPick(
        [
          { label: '左对齐', value: 'left' },
          { label: '居中', value: 'center' },
          { label: '右对齐', value: 'right' }
        ],
        { placeHolder: '选择对齐方式' }
      );

      if (alignType) {
        const width = await vscode.window.showInputBox({
          prompt: '请输入目标宽度（字符数）',
          value: '80'
        });

        if (width && /^\d+$/.test(width)) {
          const targetWidth = parseInt(width);
          processText(editor, text => {
            return text.split('\n').map(line => {
              const content = line.trim();
              const padding = targetWidth - content.length;
              if (padding <= 0) return content;

              switch (alignType.value) {
                case 'center': {
                  const leftPad = Math.floor(padding / 2);
                  const rightPad = padding - leftPad;
                  return ' '.repeat(leftPad) + content + ' '.repeat(rightPad);
                }
                case 'right':
                  return ' '.repeat(padding) + content;
                default:
                  return content + ' '.repeat(padding);
              }
            }).join('\n');
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
    mergeLinesWithQuotes,
    urlEncode,
    urlDecode,
    base64Encode,
    base64Decode,
    stringStats,
    jsonFormat,
    jsonMinify,
    textAlign
  );
}
