import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  // 全部字符串转换成大写
  const allToUpper = vscode.commands.registerCommand('str-transform.allToUpper', () => {
    vscode.window.showInformationMessage("it works");
  });
  // 全部字符串转换成小写
  const allToLower = vscode.commands.registerCommand('str-transform.allToLower', () => {
    vscode.window.showInformationMessage("it works");
  });
  // 首字母转换成大写
  const headToUpper = vscode.commands.registerCommand('str-transform.headToUpper', () => {
    vscode.window.showInformationMessage("it works");
  });
  // 首字母转换成小写
  const headToLower = vscode.commands.registerCommand('str-transform.headToLower', () => {
    vscode.window.showInformationMessage("it works");
  });
  // 全部首字母转换成大写
  const allHeadToUpper = vscode.commands.registerCommand('str-transform.allHeadToUpper', () => {
    vscode.window.showInformationMessage("it works");
  });
  // 全部首字母转换成小写
  const allHeadToLower = vscode.commands.registerCommand('str-transform.allHeadToLower', () => {
    vscode.window.showInformationMessage("it works");
  });
}
