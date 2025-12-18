import * as vscode from 'vscode';

export function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
  const nonce = getNonce();

  const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'style.css'));
  const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'main.js'));

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline' https://cdnjs.cloudflare.com; script-src 'nonce-${nonce}' https://cdnjs.cloudflare.com; worker-src 'self' blob:;">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSON to Dart</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js"></script>
    <link href="${styleUri}" rel="stylesheet">
</head>
<body>
    <div class="container">
        <h2>Generate Dart Class from JSON</h2>
        
        <div>
            <label for="fileName">File Name (e.g. user_model)</label>
            <input type="text" id="fileName" placeholder="user_model">
        </div>

        <div>
            <label for="className">Class Name (e.g. UserModel)</label>
            <input type="text" id="className" placeholder="UserModel">
        </div>

        <div>
            <label for="editor-container">JSON Text</label>
            <div id="editor-container"></div>
        </div>

        <div id="errorMessage" class="error"></div>

        <div class="button-group">
            <div class="left-buttons">
                <button id="formatBtn" class="secondary">Format JSON</button>
                <button id="generateBtn" disabled>Generate</button>
            </div>
            <div class="checkbox-container">
                <input type="checkbox" id="nullableCheckbox" checked>
                <label for="nullableCheckbox" style="font-weight: normal; margin: 0; cursor: pointer;">Nullable Fields</label>
            </div>
        </div>
    </div>

    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
