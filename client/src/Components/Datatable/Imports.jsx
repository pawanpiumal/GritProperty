import React, { Component } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import Expand from './Expand2';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

function withParams(Component) {
    return props => <Component {...props} params={useParams()} />;
}

const columns = [
    {
        name: 'Index',
        selector: row => parseInt(row.id),
        sortable: true,
        width: "10vw"
    },
    {
        name: 'XML',
        selector: row => row.xml,
        sortable: true,
        width: "10vw"
    },
    {
        name: 'JSON',
        selector: row => row.json,
        sortable: true,
        width: "20vw"
    },
    {
        name: 'Time',
        selector: row => row.time,
        sortable: true,
        width: "20vw"
    }
]

const ExpandedComponent = ({ data }) => <Expand data={data} />;

class Error extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filterText: "",
            filterdData: "",
            originalData: ""
        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.getData = this.getData.bind(this);

    }

    handleInputChange(e) {
        const text = e.target.value
        this.setState({
            filterText: text
        })
        const filteredItem = this.state.originalData.filter(item =>
            JSON.stringify(item).toLowerCase().indexOf(text.toLowerCase()) !== -1
        )
        this.setState({
            filterdData: filteredItem
        })
    }

    getData() {
        let limit = this.props.params.limit ? this.props.params.limit : 20
        const url = `http://${process.env.REACT_APP_BackURL}postproperty/importSQL?limit=${limit}`
        axios.get(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("userToken")}`
            }
        }).then(res => {
            // console.log(res);
            this.setState({
                filterdData: res.data.rows,
                originalData: res.data.rows,
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
        var data = []

        this.setState({
            filterdData: data,
            originalData: data,
            isLoading: true
        })
        this.getData()
    }


    render() {
        return (
            <div>
                {
                    this.state.isLoading ?
                        <div className='loadblock' style={{ height: '100vh' }}><div className="lds-facebook" ><div></div><div></div><div></div></div></div>
                        :
                        <div style={{ height: '90vh' }}>
                            <div id="search">
                                <input
                                    name='filterText'
                                    id="search-input"
                                    type="text"
                                    placeholder="Filter table data..."
                                    value={this.state.filterText}
                                    onChange={this.handleInputChange}
                                />
                            </div>
                            <div id='datatable'>
                                <div id='datatable2'>
                                    <DataTable
                                        columns={columns}
                                        data={this.state.filterdData}
                                        direction="auto"
                                        expandOnRowClicked
                                        expandableRows
                                        fixedHeaderScrollHeight="300px"
                                        expandableRowsComponent={ExpandedComponent}
                                        highlightOnHover
                                        pagination
                                        responsive
                                        subHeaderAlign="right"
                                        subHeaderWrap
                                    />
                                </div>
                            </div>
                        </div>
                }
            </div>
        );
    }
}

export default withParams(Error);