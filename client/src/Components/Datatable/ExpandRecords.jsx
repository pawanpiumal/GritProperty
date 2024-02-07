import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge'
import axios from 'axios';
import ReactJson from 'react-json-view';

import XMLViewer from 'react-xml-viewer'

class ExpandRecords extends Component {

    isJSON = (item) => {
        let value = typeof item !== "string" ? JSON.stringify(item) : item;
        try {
            value = JSON.parse(value);
        } catch (e) {
            return false;
        }

        return typeof value === "object" && value !== null;
    }

    render() {

        return (
            <Container style={{ border: "2px solid black", padding: "1%" }}>
                <Row style={{ marginBottom: '20px' }}>
                    <Col xs={2}>
                        Headers
                    </Col>
                    <Col xs={10}>
                        {
                            this.isJSON(this.props.data.headers) ?
                                <ReactJson src={JSON.parse(this.props.data.headers)} collapsed={true} /> : this.props.data.headers
                        }
                    </Col>
                </Row>
                <Row style={{ marginBottom: '20px' }}>
                    <Col xs={2}>
                        Body
                    </Col>
                    <Col xs={10}>
                        {
                            this.isJSON(this.props.data.body) ?
                                <ReactJson src={JSON.parse(this.props.data.body)} collapsed={true} /> : this.props.data.body
                        }
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default ExpandRecords;