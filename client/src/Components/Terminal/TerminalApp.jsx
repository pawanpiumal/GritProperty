import React, { Component } from 'react';
import 'xterm/css/xterm.css'
import { Terminal } from 'xterm'

const socket = new WebSocket(`ws://${process.env.REACT_APP_IP}:6060`);

class TerminalApp extends Component {

    async componentDidMount() {

        socket.onmessage = (event) => {
            term.write(event.data);

        }

        var term = new Terminal({
            cursorBlink: true
        });

        term.open(this.termElm)

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
            if (!isOpen(socket)) return;
            socket.send(command);

        }

        init();
        this.term = term
    }


    render() {
        return (
            <div className="App">
                <div style={{ padding: '10px' }}>
                    <div ref={ref => this.termElm = ref}></div>
                </div>
            </div>
        );
    }
}

export default TerminalApp;
