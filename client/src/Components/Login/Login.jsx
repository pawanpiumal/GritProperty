import React, { Component } from 'react';
import './login.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2'

import { withRouter } from '../withRouter';

import axios from 'axios'

import { jwtDecode } from "jwt-decode";


class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: ""
        }
    }
    async componentDidMount() {
        await axios.get('https://api.ipify.org/?format=json').then(res => {
            localStorage.setItem('ipAddress', res.data.ip)
            axios.get(`https://api.iplocation.net/?ip=${res.data.ip}`).then(res2 => {
                localStorage.setItem('ipDetails', JSON.stringify(res2.data))
            }).catch(e => {
                localStorage.setItem('ipDetails', "")
            })
        }).catch(e => {
            localStorage.setItem('ipAddress', "")
        })

        if (localStorage.getItem('userToken') && localStorage.getItem('userToken') != "") {
            const decoded = jwtDecode(localStorage.getItem('userToken'))
            // console.log(decoded);
            await axios.post(`http://${process.env.REACT_APP_LoginURL}`, {
                "username": decoded.username,
                "password": decoded.password
            }, {
                headers: {
                    'ipDetails': localStorage.getItem('ipDetails')
                }
            }).then(res => {
                localStorage.setItem('userToken', res.data.token)
                Swal.fire({
                    icon: 'success',
                    title: 'Successful',
                    text: res.data.msg
                }).then(re => {
                    this.props.history('/')
                })
            }).catch(err => {
                // console.error(err.response.data);
                Swal.fire({
                    icon: 'error',
                    title: err.response.data.status ? err.response.data.status : "Oops..",
                    text: err.response.data.msg ? err.response.data.msg : ""
                })
            })

        }
    }

    onChangeHandler = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
        });
    };

    submit = (e) => {
        e.preventDefault()
        if (this.state.username !== "" && this.state.password !== "") {
            axios.post(`http://${process.env.REACT_APP_LoginURL}`, {
                "username": this.state.username,
                "password": this.state.password
            }).then(res => {
                console.log(res);
                localStorage.setItem('userToken', res.data.token)
                Swal.fire({
                    icon: 'success',
                    title: 'Loggedin',
                    text: res.data.status
                }).then(re => {
                    this.props.history('/')
                })
            }).catch(err => {
                console.error(err.response.data);
                Swal.fire({
                    icon: 'error',
                    title: err.response.data.status ? err.response.data.status : "Oops..",
                    text: err.response.data.msg ? err.response.data.msg : ""
                })
            })
        }

    }

    render() {
        return (
            <div>
                <section className="vh-100 gradient-custom">
                    <div className="container py-5 h-100">
                        <div className="row d-flex justify-content-center align-items-center h-100">
                            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                                <div className="card bg-dark text-white" style={{ borderRadius: "1rem" }}>
                                    <div className="card-body p-5 text-center">

                                        <div className="mb-md-5 mt-md-4 pb-5">

                                            <h2 className="fw-bold mb-2 text-uppercase">Login</h2>
                                            <p className="text-white-50 mb-5">Please enter your login and password!</p>

                                            <div className="form-outline form-white mb-4">
                                                <input type="text" name='username' onChange={this.onChangeHandler} id="typeusername" className="form-control form-control-lg" />
                                                <label className="form-label" >Username</label>
                                            </div>

                                            <div className="form-outline form-white mb-4">
                                                <input type="password" onChange={this.onChangeHandler} name='password' id="typePasswordX" className="form-control form-control-lg" />
                                                <label className="form-label" >Password</label>
                                            </div>
                                            <button className="btn btn-outline-light btn-lg px-5" type="submit" onClick={this.submit}>Login</button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default withRouter(Login);