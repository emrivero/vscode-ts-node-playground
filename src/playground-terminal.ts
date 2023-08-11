import * as child from 'child_process';
import * as vscode from 'vscode';
import { PlaygroundPty } from './playground-pty';

export class PlaygroundTerminal {
    private static terminals: Record<string, PlaygroundTerminal> = {};

    static show(cwd: string): PlaygroundTerminal {

        const terminal = PlaygroundTerminal.terminals[cwd] || new PlaygroundTerminal(cwd);
        this.createStdout(cwd, terminal);
        this.createError(cwd, terminal);
        terminal.stdout.show(true);
        return terminal;
    }

    private stdout: vscode.Terminal;
    private stderr: vscode.Terminal;
    private constructor(
        private readonly cwd: string,
    ) {
        const split = cwd.split("/");
        const slug = split[split.length - 1];

        this.stdout = vscode.window.createTerminal({
            name: `TS-Node Playground (${slug}) - stdout`,
            pty: new PlaygroundPty('OUTPUT', 'Welcome to the TS-Node Playground. Try saving the open file'),
        });
        this.stderr = vscode.window.createTerminal({
            name: `TS-Node Playground (${slug}) - stderr`,
            pty: new PlaygroundPty('ERROR'),
        });

        PlaygroundTerminal.terminals[cwd] = this;
    }

    static createStdout(cwd: string, terminal: PlaygroundTerminal) {
        if (terminal.stdout.exitStatus !== undefined) {
            const split = cwd.split("/");
            const slug = split[split.length - 1];
            terminal.stdout = vscode.window.createTerminal({
                name: `TS-Node Playground (${slug}) - stdout`,
                pty: new PlaygroundPty('OUTPUT', 'Welcome to the TS-Node Playground. Try saving the open file'),
            });
        }
    }

    static createError(cwd: string, terminal: PlaygroundTerminal) {
        if (terminal.stderr.exitStatus !== undefined) {
            const split = cwd.split("/");
            const slug = split[split.length - 1];
            terminal.stderr = vscode.window.createTerminal({
                name: `TS-Node Playground (${slug}) - stderr`,
                pty: new PlaygroundPty('ERROR'),
            });
        }
    }

    static onSave(cwd: string) {
        PlaygroundTerminal.show(cwd).onSave();
    }

    private _stream: child.ChildProcessWithoutNullStreams | undefined = undefined;
    private onSave() {
        const stderr = this.stderr;
        const stdout = this.stdout;
        const stderrpty = (stderr.creationOptions as vscode.ExtensionTerminalOptions).pty as PlaygroundPty;
        const stdoutpty = (stdout.creationOptions as vscode.ExtensionTerminalOptions).pty as PlaygroundPty;
        this._stream?.kill();

        stdoutpty.clear();
        stderrpty.clear();

        this._stream = child.spawn("npx", ["-y", "ts-node", "index.ts"], { cwd: this.cwd });

        this._stream.stdout.on("data", data => stdoutpty.write(data));
        this._stream.stderr.on("data", data => stderrpty.write(data));
        this._stream.on('error', err => {
            stderrpty.write(Buffer.from(`\n!!!!!!!!!!! Could not start compile: ${err}\n`));
            stderr.show(true);
        });
        this._stream.on('exit', exitCode => {
            if (exitCode !== 0) {
                stderrpty.write(Buffer.from(`\n!!!!!!!!!!! ts-node run returned failure status: ${exitCode}\n`));
                stderr.show(true);
            } else {
                stdout.show(true);
            }
        });
    }
}

