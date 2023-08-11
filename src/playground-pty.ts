import { EventEmitter, Pseudoterminal } from "vscode";
import { TERMINAL_RESET } from "./constants";

export class PlaygroundPty implements Pseudoterminal {
    private onDidWriteEmitter = new EventEmitter<string>();
    private name: string;
    private greeting?: string;
    onDidWrite = this.onDidWriteEmitter.event;

    constructor(name: string, greeting?: string) {
        this.name = name;
        this.greeting = greeting;
    }

    open(): void {
        if (!this.greeting) { return; }
        this.onDidWriteEmitter.fire(this.greeting);
    }

    close(): void { }

    clear() {
        this.onDidWriteEmitter.fire(`${TERMINAL_RESET}================ STANDARD ${this.name} ================\n\n\r`);
    
    }
    

    write(data: Buffer) {
        const output = data.toString().replace(/([^\r])\n/g, "$1\r\n");
        this.onDidWriteEmitter.fire(output);
    }
}
