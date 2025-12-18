import * as vscode from 'vscode';

export function getWebviewContent(webview: vscode.Webview): string {
  const nonce = getNonce();

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline' https://cdnjs.cloudflare.com; script-src 'nonce-${nonce}' https://cdnjs.cloudflare.com; worker-src 'self' blob:;">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSON to Dart</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js"></script>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-editor-background);
        }
        .container {
            display: flex;
            flex-direction: column;
            gap: 15px;
            max-width: 800px;
            margin: 0 auto;
        }
        label {
            font-weight: bold;
            display: block;
            margin-bottom: 5px;
        }
        input {
            width: 100%;
            padding: 10px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            font-family: var(--vscode-editor-font-family);
            box-sizing: border-box;
            border-radius: 6px;
        }
        input:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }
        #editor-container {
            width: 100%;
            height: 400px;
            border: 1px solid var(--vscode-input-border);
            border-radius: 8px;
            overflow: hidden;
        }
        .button-group {
            display: flex;
            gap: 10px;
        }
        button {
            padding: 10px 20px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            cursor: pointer;
            font-weight: bold;
            border-radius: 4px;
        }
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        button.secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        button.secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        .error {
            color: var(--vscode-errorForeground);
            margin-top: 5px;
            display: none;
        }
        .checkbox-container {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-left: 10px;
        }
        input[type="checkbox"] {
            width: auto;
            margin: 0;
        }
    </style>
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
            <button id="formatBtn" class="secondary">Format JSON</button>
            <button id="generateBtn">Generate</button>
            <div class="checkbox-container">
                <input type="checkbox" id="nullableCheckbox" checked>
                <label for="nullableCheckbox" style="font-weight: normal; margin: 0;">Nullable Fields</label>
            </div>
        </div>
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        let editor;

        require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
        
        require(['vs/editor/editor.main'], function() {
            editor = monaco.editor.create(document.getElementById('editor-container'), {
                value: '',
                language: 'json',
                theme: 'vs-dark',
                automaticLayout: true,
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                roundedSelection: false,
                readOnly: false,
                cursorStyle: 'line',
            });

            // Apply VS Code theme colors if possible, or stick to vs-dark/vs-light based on body class
            // For simplicity, we default to vs-dark as requested, but we could detect theme.
        });

        const generateBtn = document.getElementById('generateBtn');
        const formatBtn = document.getElementById('formatBtn');
        const fileNameInput = document.getElementById('fileName');
        const classNameInput = document.getElementById('className');
        const nullableCheckbox = document.getElementById('nullableCheckbox');
        const errorMessage = document.getElementById('errorMessage');

        formatBtn.addEventListener('click', () => {
            if (editor) {
                editor.getAction('editor.action.formatDocument').run();
            }
        });

        generateBtn.addEventListener('click', () => {
            const fileName = fileNameInput.value.trim();
            const className = classNameInput.value.trim();
            const json = editor ? editor.getValue().trim() : '';

            if (!fileName || !className || !json) {
                errorMessage.textContent = 'All fields are required.';
                errorMessage.style.display = 'block';
                return;
            }

            try {
                JSON.parse(json);
            } catch (e) {
                errorMessage.textContent = 'Invalid JSON format.';
                errorMessage.style.display = 'block';
                return;
            }

            errorMessage.style.display = 'none';
            vscode.postMessage({
                command: 'generate',
                fileName: fileName,
                className: className,
                json: json,
                isNullable: nullableCheckbox.checked
            });
        });
    </script>
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
