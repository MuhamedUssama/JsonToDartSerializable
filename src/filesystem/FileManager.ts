import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class FileManager {
  async createDartFile(folderPath: string, fileName: string, content: string): Promise<void> {
    if (!fileName.endsWith('.dart')) {
      fileName += '.dart';
    }
    
    const filePath = path.join(folderPath, fileName);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
        const overwrite = await vscode.window.showWarningMessage(
            `File ${fileName} already exists. Do you want to overwrite it?`,
            'Yes',
            'No'
        );
        if (overwrite !== 'Yes') {
            return;
        }
    }

    try {
      fs.writeFileSync(filePath, content, 'utf8');
      vscode.window.showInformationMessage(`Successfully created ${fileName}`);
      
      // Open the created file
      const doc = await vscode.workspace.openTextDocument(filePath);
      await vscode.window.showTextDocument(doc);
    } catch (e) {
      vscode.window.showErrorMessage(`Failed to create file: ${e}`);
    }
  }
}
