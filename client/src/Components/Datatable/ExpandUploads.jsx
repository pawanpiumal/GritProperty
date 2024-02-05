import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge'
import axios from 'axios';
import ReactJson from 'react-json-view';

import XMLViewer from 'react-xml-viewer'

class ExpandUploads extends Component {
    constructor(props) {
        super(props);
        this.state = {
            result: "",
            isLoading: true
        }
    }

    isJSON = (obj) => {
        if (obj && typeof obj === 'object' && obj !== null) {
            return true
        } else {
            return false
        }
    }

    componentDidMount() {
        axios.get(`http://${process.env.REACT_APP_BackURL}exportproperty/uploaddetails?uploadid=${this.props.data.uploadID}`, {
            headers: {
                'Authorization': `bearer ${localStorage.getItem("userToken")}`
            }
        }).then(res => {
            this.setState({
                result: res.data.result,
                isLoading: false
            })
        }).catch(err => {
            this.setState({
                result: err.response.data.msg,
                isLoading: false
            })
        })
    }

    render() {

        return (
            <Container style={{ border: "2px solid black", padding:"1%"}}>
                <Row style={{marginBottom:'20px'}}>
                    <Col xs={2}>
                        Upload Details
                    </Col>
                    <Col xs={10}>
                        {this.state.isLoading ?
                            <div className='loadblock'><div className="lds-facebook" ><div></div><div></div><div></div></div></div>
                            :
                            this.isJSON(this.state.result) ?
                                <ReactJson src={this.state.result} collapsed={true} /> : this.state.result
                        }
                    </Col>
                </Row>
                <Row style={{marginBottom:'20px'}}>
                    <Col xs={2}>
                        Post Type
                    </Col>
                    <Col xs={10}>
                        {this.props.data.postType}
                    </Col>
                </Row>
                <Row style={{ overflowWrap: 'anywhere' }}>
                    <Col xs={2}>
                        XML
                    </Col>
                    <Col xs={10}>
                        <XMLViewer xml={`"${this.props.data.xml}"`} collapsible={true} initalCollapsedDepth={0} />
                    </Col>

                </Row>


            </Container>
        );
    }
}

export default ExpandUploads;