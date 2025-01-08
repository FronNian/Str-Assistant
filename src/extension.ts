import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// 定义TextEditorEdit类型
type TextEditorEdit = vscode.TextEditorEdit;

export function activate(context: vscode.ExtensionContext) {
  // 加载语言文件
  const loadLanguageFile = (lang: string): any => {
    const langPath = path.join(context.extensionPath, 'src', 'language', `${lang}.json`);
    try {
      return JSON.parse(fs.readFileSync(langPath, 'utf8'));
    } catch (err) {
      console.error(`Failed to load language file: ${lang}`, err);
      return null;
    }
  };

  // 获取当前语言设置
  const getCurrentLanguage = (): string => {
    return vscode.workspace.getConfiguration('strAssistant').get('language') || 'en';
  };

  // 获取翻译文本
  const getTranslation = (key: string): string => {
    const lang = getCurrentLanguage();
    const translations = loadLanguageFile(lang);
    return translations?.[key] || key;
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
    }
  });
  // 全部字符串转换成小写
  const allToLower = vscode.commands.registerCommand('str-transform.allToLower', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      const lowerText = selectedText.toLowerCase();
      editor.edit((editBuilder) => {
        editBuilder.replace(selection, lowerText);
      });
    } else {
      vscode.window.showInformationMessage("请先选择文本");
    }
  });
  // 首字母转换成大写
  const headToUpper = vscode.commands.registerCommand('str-transform.headToUpper', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      const upperText = selectedText.charAt(0).toUpperCase() + selectedText.slice(1);
      editor.edit((editBuilder) => {
        editBuilder.replace(selection, upperText);
      });
    }
  });
  // 首字母转换成小写
  const headToLower = vscode.commands.registerCommand('str-transform.headToLower', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      const lowerText = selectedText.charAt(0).toLowerCase() + selectedText.slice(1);
      editor.edit((editBuilder) => {
        editBuilder.replace(selection, lowerText);
      });
    }
  });
  // 全部首字母转换成大写
  const allHeadToUpper = vscode.commands.registerCommand('str-transform.allHeadToUpper', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      const upperText = selectedText.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      editor.edit((editBuilder) => {
        editBuilder.replace(selection, upperText);
      });
    }
  });
  // 全部首字母转换成小写
  const allHeadToLower = vscode.commands.registerCommand('str-transform.allHeadToLower', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      const lowerText = selectedText.split(' ').map(word => word.charAt(0).toLowerCase() + word.slice(1)).join(' ');
      editor.edit((editBuilder) => {
        editBuilder.replace(selection, lowerText);
      });
    }
  });

  // 监听配置变化
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('strAssistant.language')) {
        // 刷新命令显示
        vscode.commands.executeCommand('setContext', 'strAssistant.language', getCurrentLanguage());
      }
    })
  );

  // 注册所有命令
  context.subscriptions.push(allToUpper);
  // ... 其他命令注册保持不变 ...
}
