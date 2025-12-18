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
    
    // Register change listener once editor is created
    editor.onDidChangeModelContent(() => {
        validateInputs();
    });
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

// Validation Logic
function validateInputs() {
    const fileName = fileNameInput.value.trim();
    const className = classNameInput.value.trim();
    const hasJson = editor && editor.getValue().trim().length > 0;
    
    if (fileName && className && hasJson) {
        generateBtn.removeAttribute('disabled');
    } else {
        generateBtn.setAttribute('disabled', 'true');
    }
}

fileNameInput.addEventListener('input', validateInputs);
classNameInput.addEventListener('input', validateInputs);

if (editor) {
    editor.onDidChangeModelContent(() => {
        validateInputs();
    });
}

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
