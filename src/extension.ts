import { mkdir } from 'fs/promises';
import * as os from 'os';
import { join } from 'path';
import { generateSlug } from 'random-word-slugs';
import * as vscode from 'vscode';
import { isPlayts, playgroundDir } from './dir';
import { PlaygroundLinkProvider } from './playground-provider';
import { PlaygroundTerminal } from './playground-terminal';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('ts-node-playground.newPlayground', async () => {
		try {
			const slug = generateSlug(3, { format: "kebab" });
			const username = os.userInfo().username;
			const tmp = join(playgroundDir(), slug);
			await mkdir(tmp, { recursive: true });
			const uri = vscode.Uri.file(join(tmp, username, "index.ts"));
			await vscode.workspace.fs.writeFile(uri, Buffer.from(""));
			const doc = await vscode.workspace.openTextDocument(uri);
			await vscode.window.showTextDocument(doc);
		} catch (err) {
			console.error(err);
			const error = err as { message?: string };
			const message = error?.message ?? "Unknown error";
			vscode.window.showErrorMessage("Could not create playground", {
				detail: message,
				modal: true,
			});
		}
	}));

	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(async (event) => {
		// const path = isPlayts(event?.document.uri.fsPath);
		// if (path) {
		// 	PlaygroundTerminal.show(path);

		// 	const ra = vscode.extensions.getExtension("matklad.rust-analyzer");
		// 	if (ra !== undefined) {
		// 		if (!ra.isActive) {
		// 			await ra.activate();
		// 		}
		// 	}
		// }
	}));

	context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(async (event) => {
		const path = isPlayts(event.uri.fsPath);
		if (path) {
			PlaygroundTerminal.onSave(path);
		}
	}));

	context.subscriptions.push(vscode.window.registerTerminalLinkProvider(new PlaygroundLinkProvider));
}

export function deactivate() { }

