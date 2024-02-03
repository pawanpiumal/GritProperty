import React, { Component } from 'react';
import './header.css';

import { withRouter } from '../withRouter';
import { Link } from 'react-router-dom';
class header extends Component {
    render() {
        return (
            <div>
                <nav id="header-nav-bar" className="navbar " style={{ backgroundImage: `url('/Header.jpg')`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>
                    <Link href="/" style={{textDecoration:'none', width:'100%'}}>
                        <h1 className="navbar-title" onClick={() => this.props.history('/')} style={{ cursor: 'pointer' }}>Syntara Solutions</h1>
                    </Link>
                </nav>
            </div>
        );
    }
}

export default withRouter(header);