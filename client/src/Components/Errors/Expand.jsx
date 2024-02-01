import React, { Component } from 'react';
import './datatable.css'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge'

import ReactJson from 'react-json-view';

class Expand extends Component {
    isJSON = (str) => {
        try {
            return (JSON.parse(str) && !!str);
        } catch (e) {
            return false;
        }
    }
    render() {

        return (
            <Container>
                <Row>
                    {this.props.data.place}
                </Row>
                <Row>
                    {this.isJSON(this.props.data.error) ?
                        <ReactJson src={JSON.parse(this.props.data.error)} /> : this.props.data.error
                    }
                </Row>


            </Container>
        );
    }
}

export default Expand;