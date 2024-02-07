import React, { Component } from 'react';

import {
    Label,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ReferenceArea,
    ResponsiveContainer,
} from 'recharts';

import axios from 'axios';
import Swal from 'sweetalert2';

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container'
import './plots.css'



class Plots extends Component {
    constructor(props) {
        super(props);
        this.state = {
            initialData: [],
            data: [],
            type: "errors",
            duration: "min",
            refAreaLeft: '',
            refAreaRight: '',
            top: 'dataMax+5',
            bottom: 0,
            animation: true,
            isLoading: true,
            startdate: "",
            enddate: "",
            starttime: "",
            endtime: ""
        }
    }

    zoom() {
        try {
            let { refAreaLeft, refAreaRight } = this.state;

            if (refAreaLeft === refAreaRight || refAreaRight === '') {
                this.setState(() => ({
                    refAreaLeft: '',
                    refAreaRight: '',
                }));
                return;
            }

            // xAxis domain
            refAreaLeft = this.findIndex(this.state.data, refAreaLeft)
            refAreaRight = this.findIndex(this.state.data, refAreaRight)

            // console.log(refAreaLeft, refAreaRight);

            if (refAreaLeft > refAreaRight) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

            // yAxis domain
            // console.log(refAreaLeft, refAreaRight);
            const [bottom, top] = this.getAxisYDomain(refAreaLeft, refAreaRight, 'Count', 5);
            // console.log(this.state.data.slice(refAreaLeft, refAreaRight));
            var data = this.state.data.slice(refAreaLeft, refAreaRight)
            // console.log({ data });
            this.setState(() => ({
                refAreaLeft: '',
                refAreaRight: '',
                data,
                left: refAreaLeft,
                right: refAreaRight,
                bottom,
                top
            }));
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: err.response?.data?.msg ? err.response.data.msg : "Error Occured!"
            })
        }
    }
    zoomOut() {
        this.setState(() => ({
            data: this.state.initialData,
            refAreaLeft: '',
            refAreaRight: '',
            top: 'dataMax+5',
            bottom: 0,
        }));
    }

    getAxisYDomain = (from, to, ref, offset) => {
        const refData = this.state.data.slice(from, to);
        let [bottom, top] = [refData[0][ref], refData[0][ref]];
        refData.forEach((d) => {
            if (d[ref] > top) top = d[ref];
            if (d[ref] < bottom) bottom = d[ref];
        });

        return [(bottom | 0) - offset, (top | 0) + offset];
    };



    async getData(type, duration) {
        const url = `http://${process.env.REACT_APP_BackURL}plots/all?type=${type}&duration=${duration}`
        const res = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("userToken")}`
            }
        }).then(res => {
            return res.data.rows;
        }).catch(err => {
            this.setState({
                isLoading: false
            })
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: err.response?.data?.msg ? err.response.data.msg : "Error Occured!"
            })
            return [];
        })
        return res;
    }

    async componentDidMount() {
        const data = await this.getData(this.state.type, this.state.duration)
        if (data) {
            this.setState({
                data: data,
                initialData: data,
                isLoading: false,
                startdate: data[0].Date.slice(0, 10),
                starttime: data[0].Date.slice(11, 16),
                enddate: data[data.length - 1].Date.slice(0, 10),
                endtime: data[data.length - 1].Date.slice(11, 16),
            })
        }
    }

    findIndex = (data, date) => {
        var index = ""
        data.forEach((e, id) => {
            if (e.Date == date) {
                index = id;
            }
        })
        return index;
    }

    async ChangeData(type, duration) {
        const data = await this.getData(type, duration)
        this.setState({
            data: data,
            initialData: data,
            isLoading: false,
            startdate: data[0].Date.slice(0, 10),
            starttime: data[0].Date.slice(11, 16),
            enddate: data[data.length - 1].Date.slice(0, 10),
            endtime: data[data.length - 1].Date.slice(11, 16),
        })
    }

    async onChange(e) {
        this.setState({
            [e.target.name]: e.target.value,
            isLoading: true
        })
        if (e.target.name == "type") {
            var type = e.target.value
        } else {
            var type = this.state.type
        }

        if (e.target.name == "duration") {
            var duration = e.target.value
        } else {
            var duration = this.state.duration
        }

        this.ChangeData(type, duration)
    }

    onDatePick(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    datetimePick = () => {
        let { initialData, startdate, starttime, enddate, endtime } = this.state;
        if (startdate != "" && starttime != "" && enddate != "" && endtime != "") {
            var data = initialData.filter(e => {
                return new Date(e.Date) >= new Date(`${startdate} ${starttime}`) && new Date(e.Date) <= new Date(`${enddate} ${endtime}`)
            })

            this.setState({
                data: data,
            })
        }
    }



    render() {
        return (
            <div>
                {
                    this.state.isLoading ?
                        <div className='loadblock' style={{ height: '100vh' }}><div className="lds-facebook" ><div></div><div></div><div></div></div></div>
                        :
                        <div className="highlight-bar-charts" style={{ userSelect: 'none', width: '100%', backgroundColor: '' }}>

                            <Form style={{ margin: '2%' }}>
                                <Row className="mb-3">
                                    <Col>
                                        <Form.Group >
                                            <Form.Label>Type</Form.Label>
                                            <Form.Select name="type" value={this.state.type} aria-label="Default select example" onChange={e => this.onChange(e)}>
                                                <option value="errors">Errors</option>
                                                <option value="imports">Imports</option>
                                                <option value="records">Records</option>
                                                <option value="uploads">Uploads</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col >
                                        <Form.Group>
                                            <Form.Label>Interval</Form.Label>
                                            <Form.Select name="duration" value={this.state.duration} aria-label="Default select example" onChange={e => this.onChange(e)}>
                                                <option value="min">Minutes</option>
                                                <option value="hour">Hours</option>
                                                <option value="day">Days</option>
                                                <option value="month">Months</option>
                                                <option value="year">Years</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Form.Label>From</Form.Label>
                                    <Col md={5}>
                                        <Form.Group >
                                            <Form.Control type="date" name="startdate" value={this.state.startdate} onChange={e => this.onDatePick(e)} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={5}>
                                        <Form.Group >
                                            <Form.Control type="time" name="starttime" value={this.state.starttime} onChange={e => this.onDatePick(e)} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Button type="button" className="btn update" style={{ width: '100%' }} onClick={this.datetimePick}>
                                            Select From
                                        </Button>
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Form.Label>To</Form.Label>
                                    <Col md={5}>
                                        <Form.Group >
                                            <Form.Control type="date" name="enddate" value={this.state.enddate} onChange={e => this.onDatePick(e)} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={5}>
                                        <Form.Group >
                                            <Form.Control type="time" name="endtime" value={this.state.endtime} onChange={e => this.onDatePick(e)} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Button type="button" className="btn update" style={{ width: '100%' }} onClick={this.datetimePick}>
                                            Select To
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>

                            <div style={{ margin: '2%' }}>
                                <Button type="button" className="btn update" onClick={this.zoomOut.bind(this)}>
                                    Zoom Out
                                </Button>
                            </div>

                            <div style={{ margin: "2%", border: "2px black solid", padding: '1%', justifyItems: 'center', display: 'grid', backgroundColor: '#f0f0f1' }}>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart
                                        width={800}
                                        height={400}
                                        data={this.state.data}
                                        onMouseDown={(e) => this.setState({ refAreaLeft: e.activeLabel })}
                                        onMouseMove={(e) => this.state.refAreaLeft && this.setState({ refAreaRight: e.activeLabel })}
                                        // eslint-disable-next-line react/jsx-no-bind
                                        onMouseUp={this.zoom.bind(this)}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis allowDataOverflow dataKey="Date" stroke="#2a1d2f" domain={[this.state.left, this.state.right]} />

                                        <YAxis allowDataOverflow domain={[this.state.bottom, this.state.top]} stroke="#2a1d2f" type="number" yAxisId="1" />
                                        <Tooltip />
                                        <Line yAxisId="1" type="natural" dataKey="Count" stroke='#6f4e7c' animationDuration={300} strokeWidth={1.5} />

                                        {this.state.refAreaLeft && this.state.refAreaRight ? (
                                            <ReferenceArea yAxisId="1" x1={this.state.refAreaLeft} x2={this.state.refAreaRight} strokeOpacity={0.3} />
                                        ) : null}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                        </div>
                }
            </div>
        );
    }
}

export default Plots;