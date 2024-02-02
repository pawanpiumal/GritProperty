import React, { Component } from 'react';
import './header.css';

import { withRouter } from '../withRouter';
class header extends Component {
    render() {
        return (
            <div>
                <nav id="header-nav-bar" className="navbar " style={{ backgroundImage: `url('/Header.jpg')`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>
                    <h1 className="navbar-title" onClick={() => this.props.history('/')} style={{ cursor: 'pointer' }}>Syntara Solutions</h1>
                </nav>
            </div>
        );
    }
}

export default withRouter(header);