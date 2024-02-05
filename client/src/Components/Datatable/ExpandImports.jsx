import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge'

import ReactJson from 'react-json-view';

class ExpandImports extends Component {
    isJSON = (json) => {
        try {
            var obj = JSON.parse(json)
            if (obj && typeof obj === 'object' && obj !== null) {
                return true
            }
        } catch (err) { console.log(); }
        return false
    }
    render() {

        return (
            <Container>
                <Row style={{ overflowWrap: 'anywhere' }}>
                    <Col xs={2}>
                        XML to JSON
                    </Col>
                    <Col xs={10}>
                        {this.isJSON(this.props.data.xml.replace(/\n/g, '\\\\n')) != false ?
                            <ReactJson src={JSON.parse(this.props.data.xml.replace(/\n/g, '\\\\n'))} collapsed={true} /> : this.props.data.xml
                        }
                    </Col>
                </Row>
                <Row style={{ overflowWrap: 'anywhere' }}>
                    <Col xs={2}>
                        Wordpress JSON
                    </Col>
                    <Col xs={10}>
                        {this.isJSON(this.props.data.json.replace(/\n/g, '\\\\n')) != false ?
                            <ReactJson src={JSON.parse(this.props.data.json.replace(/\n/g, '\\\\n'))} collapsed={true} /> : this.props.data.json
                        }
                    </Col>

                </Row>


            </Container>
        );
    }
}

export default ExpandImports;