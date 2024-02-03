import React, { Component } from 'react';
import DataTable from 'react-data-table-component';
import './datatable.css'
import axios from 'axios';
import Expand from './Expand';
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
        name: 'Place',
        selector: row => row.place,
        sortable: true,
        width: "30vw"
    },
    {
        name: 'Error',
        selector: row => row.error,
        sortable: true,
        width: "30vw"
    },
    {
        name: 'Time',
        selector: row => row.time,
        sortable: true,
        width: "30vw"
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
        const url = `http://${process.env.REACT_APP_BackURL}db/errors?limit=${limit}`
        axios.get(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("userToken")}`
            }
        }).then(res => {
            // console.log(res);
            this.setState({
                filterdData: res.data.rows,
                originalData: res.data.rows
            })
        }).catch(err => {
            // console.error(err);
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
            originalData: data
        })
        this.getData()
    }


    render() {
        return (
            <div>
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
        );
    }
}

export default withParams(Error);