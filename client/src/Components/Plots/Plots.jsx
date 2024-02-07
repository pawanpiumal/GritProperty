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
            bottom: 'dataMin',
            animation: true,
            isLoading: true
        }
    }

    zoom() {
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

        this.setState(() => ({
            refAreaLeft: '',
            refAreaRight: '',
            data: this.state.data.slice(refAreaLeft, refAreaRight),
            left: refAreaLeft,
            right: refAreaRight,
            bottom,
            top
        }));
    }
    zoomOut() {
        const { data } = this.state;
        this.setState(() => ({
            data: this.state.initialData,
            refAreaLeft: '',
            refAreaRight: '',
            top: 'dataMax+5',
            bottom: 'dataMin',
        }));
    }

    getAxisYDomain = (from, to, ref, offset) => {
        const refData = this.state.data.slice(from, to);

        console.log({ from, to, refData });
        let [bottom, top] = [refData[0][ref], refData[0][ref]];
        refData.forEach((d) => {
            if (d[ref] > top) top = d[ref];
            if (d[ref] < bottom) bottom = d[ref];
        });

        return [(bottom | 0) - offset, (top | 0) + offset];
    };



    getData() {
        const url = `http://${process.env.REACT_APP_BackURL}plots/all?type=${this.state.type}&duration=${this.state.duration}`
        axios.get(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("userToken")}`
            }
        }).then(res => {
            // console.log(res);
            this.setState({
                initialData: res.data.rows,
                data: res.data.rows,
                isLoading: false
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
        this.getData()
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


    render() {
        const { data, barIndex, left, right, refAreaLeft, refAreaRight, top, bottom } = this.state;

        return (
            <div>
                {
                    this.state.isLoading ?
                        <div className='loadblock' style={{ height: '100vh' }}><div className="lds-facebook" ><div></div><div></div><div></div></div></div>
                        :
                        <div className="highlight-bar-charts" style={{ userSelect: 'none', width: '100%', backgroundColor: '' }}>
                            <button type="button" className="btn update" onClick={this.zoomOut.bind(this)}>
                                Zoom Out
                            </button>

                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart
                                    width={800}
                                    height={400}
                                    data={data}
                                    onMouseDown={(e) => this.setState({ refAreaLeft: e.activeLabel })}
                                    onMouseMove={(e) => this.state.refAreaLeft && this.setState({ refAreaRight: e.activeLabel })}
                                    // eslint-disable-next-line react/jsx-no-bind
                                    onMouseUp={this.zoom.bind(this)}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis allowDataOverflow dataKey="Date" domain={[left, right]} />

                                    <YAxis allowDataOverflow domain={[bottom, top]} type="number" yAxisId="1" />
                                    <Tooltip />
                                    <Line yAxisId="1" type="natural" dataKey="Count" stroke="black" animationDuration={1000} />

                                    {refAreaLeft && refAreaRight ? (
                                        <ReferenceArea yAxisId="1" x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} />
                                    ) : null}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                }
            </div>
        );
    }
}

export default Plots;