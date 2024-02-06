import React, { Component } from 'react';
import './datatable.css'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge'

import ReactJson from 'react-json-view';

class Expand extends Component {
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
            <Container>
                <Row>
                    {this.props.data.place}
                </Row>
                <Row style={{ overflowWrap: 'anywhere' }}>
                    {this.isJSON(this.props.data.error) != false ?

                        <ReactJson src={JSON.parse(this.props.data.error)} /> : this.props.data.error
                    }

                </Row>


            </Container>
        );
    }
}

export default Expand;