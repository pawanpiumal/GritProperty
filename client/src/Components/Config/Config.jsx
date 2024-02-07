import React, { Component } from 'react';
import './config.css'
import axios from 'axios';
import Swal from 'sweetalert2';

class Config extends Component {
    constructor(props) {
        super(props);
        this.state = {
            config: ""
        }
    }

    componentDidMount() {
        axios.get(`http://${process.env.REACT_APP_BackURL}config/get`, {
            headers: {
                'Authorization': `bearer ${localStorage.getItem('userToken')}`,
                'ipDetails': localStorage.getItem('ipDetails')
            }
        }).then(res => {
            // console.log(res.data.config);
            this.setState({
                config: res.data.config
            })
        }).catch(err => {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: err.response.data.msg
            })
        })
    }

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleSubmit = (e) => {
        e.preventDefault()
        axios.post(`http://${process.env.REACT_APP_BackURL}config/post`, `${this.state.config}`, {
            headers: {
                'Authorization': `bearer ${localStorage.getItem('userToken')}`,
                'Content-Type':'text/plain'
            }
        }).then(res => {
            console.log(res);
            Swal.fire({
                icon: 'success',
                title: 'Uploaded',
                text: res.data.msg
            })
        }).catch(err => {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: err.response.data.msg
            })
        })
    }

    render() {
        return (
            <div>
                <h1 style={{ margin: '5%', marginBottom: '0%', color: 'red' }}>Changing this has a higher chance of breaking the server! BE CAREFUL!</h1>
                <form onSubmit={this.handleSubmit}>
                    <div>
                        <textarea value={this.state.config} onChange={this.handleInputChange} name="config" className='xml-area' rows="20" />
                    </div>
                    <div style={{ marginLeft: '5%', marginRight: '5%', marginBottom: '5%' }}>
                        <input type="submit" value="Submit" style={{ width: '100%', padding: '1%', fontWeight: 'bold' }} />
                    </div>
                </form>
            </div>
        );
    }
}

export default Config;