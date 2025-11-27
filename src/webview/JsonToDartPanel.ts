import * as vscode from 'vscode';
import { getWebviewContent } from './getWebviewContent';
import { JsonToDartConverter } from '../converter/JsonToDartConverter';
import { FileManager } from '../filesystem/FileManager';

export class JsonToDartPanel {
  public static currentPanel: JsonToDartPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _disposables: vscode.Disposable[] = [];
  private readonly _folderPath: string;

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, folderPath: string) {
    this._panel = panel;
    this._folderPath = folderPath;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = getWebviewContent(this._panel.webview);
    this._setWebviewMessageListener(this._panel.webview);
  }

  public static createOrShow(extensionUri: vscode.Uri, folderPath: string) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (JsonToDartPanel.currentPanel) {
      JsonToDartPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      'jsonToDart',
      'JSON to Dart',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
      }
    );

    JsonToDartPanel.currentPanel = new JsonToDartPanel(panel, extensionUri, folderPath);
  }

  private _setWebviewMessageListener(webview: vscode.Webview) {
    webview.onDidReceiveMessage(
      async (message: any) => {
        const command = message.command;
        const text = message.text;

        switch (command) {
          case 'generate':
            await this._handleGenerate(message.fileName, message.className, message.json);
            return;
        }
      },
      undefined,
      this._disposables
    );
  }

  private async _handleGenerate(fileName: string, className: string, json: string) {
    try {
      const converter = new JsonToDartConverter();
      const dartCode = converter.convert(json, className);
      
      const fileManager = new FileManager();
      await fileManager.createDartFile(this._folderPath, fileName, dartCode);
      
      this._panel.dispose();
    } catch (error) {
      vscode.window.showErrorMessage(`Error generating Dart code: ${error}`);
    }
  }

  public dispose() {
    JsonToDartPanel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}
