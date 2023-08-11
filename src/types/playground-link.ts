import { TerminalLink } from 'vscode';

export interface PlaygroundLink extends TerminalLink {
    cwd: string;
    error?: string;
    file?: [string, number, number];
}
