import React, { Component } from 'react';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import axios from 'axios';
import Swal from 'sweetalert2';

class Plots extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            type: "errors",
            duration: "min"
        }
    }

    getData() {
        const url = `http://${process.env.REACT_APP_BackURL}plots/all?type=${this.state.type}&duration=${this.state.duration}`
        axios.get(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("userToken")}`
            }
        }).then(res => {
            // console.log(res);
            this.setState({
                data: res.data.rows
            })
        }).catch(err => {
            // console.error(err);
            this.setState({
                isLoading: false
            })
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: err.response.data.msg
            })
        })

    }

    componentDidMount() {
        var data = []

        this.setState({
            data: []
        })
        this.getData()
    }


    render() {
        return (
            <div style={{ backgroundColor: 'white', width: 'auto' }}>
                <LineChart
                    width={500}
                    height={300}
                    data={this.state.data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Count" stroke="#8884d8" activeDot={{ r: 8 }} />
                    {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
                </LineChart>
            </div>
        );
    }
}

export default Plots;