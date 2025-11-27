import * as vscode from 'vscode';

export function getWebviewContent(webview: vscode.Webview): string {
  const nonce = getNonce();

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSON to Dart</title>
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
            max-width: 600px;
            margin: 0 auto;
        }
        label {
            font-weight: bold;
            display: block;
            margin-bottom: 5px;
        }
        input, textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            font-family: var(--vscode-editor-font-family);
            box-sizing: border-box;
        }
        input:focus, textarea:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }
        button {
            padding: 10px 20px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            cursor: pointer;
            font-weight: bold;
        }
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .error {
            color: var(--vscode-errorForeground);
            margin-top: 5px;
            display: none;
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
            <label for="jsonInput">JSON Text</label>
            <textarea id="jsonInput" rows="15" placeholder="Paste your JSON here..."></textarea>
        </div>

        <div id="errorMessage" class="error"></div>

        <button id="generateBtn">Generate</button>
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        const generateBtn = document.getElementById('generateBtn');
        const fileNameInput = document.getElementById('fileName');
        const classNameInput = document.getElementById('className');
        const jsonInput = document.getElementById('jsonInput');
        const errorMessage = document.getElementById('errorMessage');

        generateBtn.addEventListener('click', () => {
            const fileName = fileNameInput.value.trim();
            const className = classNameInput.value.trim();
            const json = jsonInput.value.trim();

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
                json: json
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
