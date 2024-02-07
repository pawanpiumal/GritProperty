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
            xml: "<x>Remove this Code before adding listing code</x>",
            isLoading: false,
            jsonResult: { result: "result" },
            draftPublish: "draft"
        }

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

    }

    handleInputChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    onToggle = (e) => {
        // console.log();
        this.setState({
            'draftPublish': e.target.checked ? "publish" : "draft"
        })
    }

    onfocusclean = (e) => {
        if (this.state.xml == "<x>Remove this Code before adding listing code</x>") {
            this.setState({
                xml: ""
            })
        }

    }

    handleSubmit(e) {
        e.preventDefault()
        console.log("Running");
        this.setState({
            isLoading: true
        })
        axios.post(`http://${process.env.REACT_APP_NodeURL}?status=${this.state.draftPublish}`, `${this.state.xml}`, {
            headers: {
                "Content-Type": "application/xml",
                'Authorization': `bearer ${localStorage.getItem('userToken')}`,
                'ipDetails': localStorage.getItem('ipDetails')
            }
        }).then(res => {
            // console.log(res.data.item.meta.uniqueid);
            Swal.fire({
                icon: 'success',
                title: 'Uploaded',
                text: 'Property uploaded.'
            })
            this.setState({
                jsonResult: res.data
            })
        }).catch(err => {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: err.response.data.msg
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
                        <div className='loadblock' style={{height:'100vh'}}><div className="lds-facebook" ><div></div><div></div><div></div></div></div>
                        :
                        <div>
                            <form onSubmit={this.handleSubmit}>
                                <div>
                                    <textarea value={this.state.xml} onFocus={this.onfocusclean} onChange={this.handleInputChange} name="xml" className='xml-area' rows="20" />
                                </div>
                                <div className="form-check" style={{ marginLeft: '5%', marginBottom: '2%' }}>
                                    <input style={{ backgroundColor: "black" }} className="form-check-input" type="checkbox" id="flexCheckDefault" name="draftPublish" onChange={this.onToggle} />
                                    <label className="form-check-label" htmlFor="flexCheckDefault">
                                        Publish
                                    </label>
                                </div>
                                <div style={{ marginLeft: '5%', }}>
                                    <input type="submit" value="Submit" style={{ width: '100%', padding: '1%', fontWeight: 'bold' }} />
                                </div>
                            </form>
                            <div className='xml-viewer' style={{ backgroundColor: "white", padding: '2rem' }}>
                                <XMLViewer xml={`"${this.state.xml}"`} collapsible={true} />
                            </div>
                            <div className='xml-viewer' style={{ backgroundColor: "white", padding: '2rem' }}>
                                <ReactJson src={this.state.jsonResult} />
                            </div>
                        </div>
                }
            </div>
        );
    }
}

export default importproperty;