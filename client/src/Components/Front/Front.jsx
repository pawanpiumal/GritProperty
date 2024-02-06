import React, { Component } from 'react';
import './front.css'
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';

import { withRouter } from '../withRouter';
import { jwtDecode } from 'jwt-decode';

class Front extends Component {
    constructor(props) {
        super(props);

    }

    componentDidMount() {
        if (localStorage.getItem('userToken') && jwtDecode(localStorage.getItem('userToken')).exp * 1000 < Date.now()) {
            this.props.history('/login')
        }
    }

    reRoute = (place) => {
        this.props.history(place)
    }

    render() {
        return (
            <Container>
                <Row style={{ margin: '5%' }}>
                    <Col>
                        <Link to="/login">
                            <Card bg='dark' key='Dark' text='white' style={{ width: '22rem', cursor: 'pointer', backgroundImage: `url('Login.jpg')` }} className="mb-2" >
                                {/* <Card.Header></Card.Header> */}
                                <Card.Body >
                                    <Card.Title> Login </Card.Title>
                                    <Card.Text style={{ height: '8rem' }}>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>
                    <Col>
                        <Link to="/import">
                            <Card bg='dark' key='Dark' text='white' style={{ width: '22rem', cursor: 'pointer', backgroundImage: `url('Import.jpg')`, boxShadow: 'inset 0 0 100px #000' }} className="mb-2">
                                {/* <Card.Header></Card.Header> */}
                                <Card.Body >
                                    <Card.Title> Import </Card.Title>
                                    <Card.Text style={{ height: '8rem' }}>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>
                    <Col>
                        <Link to="/errors">
                            <Card bg='dark' key='Dark' text='white' style={{ width: '22rem', cursor: 'pointer', backgroundImage: `url('Error.webp')`, backgroundSize: 'cover', boxShadow: 'inset 0 0 100px #000' }} className="mb-2" >
                                {/* <Card.Header></Card.Header> */}
                                <Card.Body >
                                    <Card.Title> Errors SQL</Card.Title>
                                    <Card.Text style={{ height: '8rem' }}>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>
                    <Col>
                        <Link to="/errorFiles">
                            <Card bg='dark' key='Dark' text='white' style={{ width: '22rem', cursor: 'pointer', backgroundImage: `url('ErrorFile.webp')`, backgroundSize: 'cover', boxShadow: 'inset 0 0 100px #000' }} className="mb-2"  >
                                {/* <Card.Header></Card.Header> */}
                                <Card.Body >
                                    <Card.Title> Errors Files </Card.Title>
                                    <Card.Text style={{ height: '8rem' }}>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>
                    <Col>
                        <Link to="/config">
                            <Card bg='dark' key='Dark' text='white' style={{ width: '22rem', cursor: 'pointer', backgroundImage: `url('configImage.jpg')`, backgroundSize: 'cover', boxShadow: 'inset 0 0 100px #000' }} className="mb-2">
                                {/* <Card.Header></Card.Header> */}
                                <Card.Body >
                                    <Card.Title> Config </Card.Title>
                                    <Card.Text style={{ height: '8rem' }}>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>
                    <Col>
                        <Link to="/imports">
                            <Card bg='dark' key='Dark' text='white' style={{ width: '22rem', cursor: 'pointer', backgroundImage: `url('imports.jpg')`, backgroundSize: 'cover', boxShadow: 'inset 0 0 100px #000' }} className="mb-2" F>
                                {/* <Card.Header></Card.Header> */}
                                <Card.Body >
                                    <Card.Title> Imports </Card.Title>
                                    <Card.Text style={{ height: '8rem' }}>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>
                    <Col>
                        <Link to="/uploads">
                            <Card bg='dark' key='Dark' text='white' style={{ width: '22rem', cursor: 'pointer', backgroundImage: `url('uploads.jpg')`, backgroundSize: 'cover', boxShadow: 'inset 0 0 100px #000' }} className="mb-2">
                                {/* <Card.Header></Card.Header> */}
                                <Card.Body >
                                    <Card.Title> Uploads </Card.Title>
                                    <Card.Text style={{ height: '8rem' }}>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>
                    <Col>
                        <Link to="/records">
                            <Card bg='dark' key='Dark' text='white' style={{ width: '22rem', cursor: 'pointer', backgroundImage: `url('records.jpg')`, backgroundSize: 'cover', boxShadow: 'inset 0 0 100px #000' }} className="mb-2">
                                {/* <Card.Header></Card.Header> */}
                                <Card.Body >
                                    <Card.Title> Records </Card.Title>
                                    <Card.Text style={{ height: '8rem' }}>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default withRouter(Front);