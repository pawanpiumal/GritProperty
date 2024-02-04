import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge'

import ReactJson from 'react-json-view';

import XMLViewer from 'react-xml-viewer'

class Expand extends Component {
    isJSON = (json) => {
        try {
            var obj = JSON.parse(json)
            if (obj && typeof obj === 'object' && obj !== null) {
                return true
            }
        } catch (err) { }
        return false
    }
    render() {

        return (
            <Container>
                <Row>
                    {this.props.data.postType}
                </Row>
                <Row style={{ overflowWrap: 'anywhere' }}>
                    {/* {this.isJSON(this.props.data.error) != false ?
                        <ReactJson src={JSON.parse(this.props.data.error)} /> : this.props.data.error
                    } */}
                    <XMLViewer xml={`"${this.props.data.xml}"`} collapsible={true} />
                    {/* {this.props.data.xml} */}
                </Row>


            </Container>
        );
    }
}

export default Expand;