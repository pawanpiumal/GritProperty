import React, { Component } from 'react';
import 'xterm/css/xterm.css'
import { Terminal } from 'xterm'
import './terminal.css'
import { FitAddon } from 'xterm-addon-fit';

const socket = new WebSocket(`ws://${process.env.REACT_APP_IP}:6060`);
const fitAddon = new FitAddon();

class TerminalApp extends Component {

    async componentDidMount() {

        socket.onmessage = (event) => {
            term.write(event.data);

        }

        var term = new Terminal({
            cursorBlink: true,
            fullscreenWin: true
        });

        term.loadAddon(fitAddon);

        term.open(this.termElm)

        fitAddon.fit();

        function init() {
            if (term._initialized) {
                return;
            }

            term._initialized = true;

            term.prompt = () => {
                runCommand('\n');
            };

            setTimeout(() => {
                term.prompt();
            }, 300);

            term.onKey(keyObj => {
                runCommand(keyObj.key);
            });
        }

        function isOpen(ws) { return ws.readyState === ws.OPEN }

        function runCommand(command) {
            if (!isOpen(socket)) {
                return
            };
            socket.send(command);

        }

        init();
        this.term = term

    }


    render() {
        return (
            <div id="App" >
                <div className="term-win">
                    <div style={{ height: '100%' }} ref={ref => this.termElm = ref}></div>
                </div>
            </div>
        );
    }
}

export default TerminalApp;
