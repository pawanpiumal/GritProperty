import React, { Component } from 'react';

import axios from 'axios';

import XMLViewer from 'react-xml-viewer'
import ReactJson from 'react-json-view'


import './importproperty.css'

//Importing sweet alert and sweet alert dark theme
import Swal from 'sweetalert2';
import '@sweetalert2/themes/dark';

class importproperty extends Component {
    constructor(props) {
        super(props);
        this.state = {
            xml: "<x>Remove this</x>",
            isLoading: false,
            jsonResult: { result: "result" }
        }

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

    }

    handleInputChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleSubmit(e) {
        e.preventDefault()
        console.log("Running");
        this.setState({
            isLoading: true
        })
        axios.post(`http://${process.env.REACT_APP_NodeURL}?status=draft`, `${this.state.xml}`, {
            headers: {
                "Content-Type": "application/xml"
            }
        }).then(res => {
            console.log(res);
            Swal.fire({
                icon: 'success',
                title: 'Uploaded',
                text: res
            })
            this.setState({
                jsonResult: res.data
            })
        }).catch(err => {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: err
            })

        }).finally(e => {
            this.setState({
                isLoading: false
            })
        })

    }

    render() {
        return (
            <div className='container'>
                {
                    this.state.isLoading ?
                        <div className='loadblock'><div className="lds-facebook" ><div></div><div></div><div></div></div></div>
                        :
                        <div>
                            <form onSubmit={this.handleSubmit}>
                                <div>
                                    <textarea value={this.state.xml} onChange={this.handleInputChange} name="xml" className='xml-area' rows="20" />
                                </div>
                                <div>
                                    <input type="submit" value="Submit" />
                                </div>
                            </form>
                            <div className='xml-viewer'>
                                <XMLViewer xml={`"${this.state.xml}"`} />
                            </div>
                            <div className='xml-viewer'>
                                <ReactJson src={this.state.jsonResult} />
                            </div>
                        </div>
                }
            </div>
        );
    }
}

export default importproperty;