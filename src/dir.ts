import { tmpdir } from 'os';
import { join, relative } from 'path';

export function playgroundDir(): string {
	return join(tmpdir(), "vscode-ts-node-playground");
}

export function isPlayts(fsPath?: string): string | null {
	if (!fsPath) {
		return null;
	}
	let rel = relative(playgroundDir(), fsPath);
	if (!rel.startsWith("..") && rel.endsWith(join("index.ts"))) {
		return join(fsPath, "..");
	}
	return null;
}
