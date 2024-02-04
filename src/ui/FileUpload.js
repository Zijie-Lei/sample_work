import React, {Component} from 'react';
import Button from 'react-bootstrap/Button';
import '../App.css';
import * as constants from '../Data';

export class FileUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {uploadId: null}
        this.handleSubmitFile = this.handleSubmitFile.bind(this);
        this.handleCheckStatus = this.handleCheckStatus.bind(this);
        this.handleChangeId = this.handleChangeId.bind(this);
        this.fileInput = React.createRef();
    }

    /**
     * Handles the submission and fetching process when file is uploaded
     *
     * @param event onClick event
     */
    handleSubmitFile(event) {
        event.preventDefault();
        const fileToUpload = this.fileInput.current.files[0];
        if (this.fileInput.current.files.length > 0) {
            if (fileToUpload.name !== "") {
                const data = new FormData();
                data.append("file", fileToUpload);
                data.append("fileName", fileToUpload.name);

                fetch(constants.FILE_UPLOAD_END_POINT, {
                    method: 'POST',
                    body: data
                })
                    .then(response => {
                        if (!response.ok) {
                            response.text().then(errorMessage => {
                                alert(errorMessage);
                            })
                        } else {
                            return response.json();
                        }
                    })
                    .then(items => {
                        if (items != null) {
                            this.props.onLoading(true);
                            this.setState({uploadId: items.submissionId});
                        }
                    })
                    .catch(error => {
                        this.fileInput.current.value = null;
                        alert('Failed to fetch: ' + error.message);
                    });
            }
        }
    }

    /**
     * Check the fetching status once file is successfully submitted,
     * update the boolean state and call related functions from respectively
     */
    handleCheckStatus() {
        fetch(constants.FILE_STATUS_END_POINT + this.state.uploadId)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Fail to fetch");
                } else {
                    return response.json();
                }
            })
            .then((data) => {
                if (data.status.toString() === "FINISHED") {
                    this.handleChangeId();
                    this.fileInput.current.value = null;
                    this.props.onLoading(false);
                    this.setState({status: data.status.toString()});
                } else if (data.status.toString() === "ERROR") {
                    alert("The file could not be processed by the server. Please check that it is a valid file");
                    this.fileInput.current.value = null;
                    this.props.onLoading(false);
                    this.setState({status: data.status.toString()});
                } else {
                    this.setState({status: data.status.toString()});
                }
            })
            .catch(console.log)
    }

    /**
     * Call back function that updates PDB ID
     */
    handleChangeId() {
        this.props.onPdbIdChange(this.state.uploadId);
    }

    render() {
        if (this.state.uploadId != null && this.props.loading) {
            setTimeout(() => {
                this.handleCheckStatus();
            }, 1000);
        }

        return (
            <div>
                <input type="file" id="PdbFile" accept={".cif,.bcif,.pdb"} ref={this.fileInput} style={{width: 230}}/>
                <Button type="submit" onClick={this.handleSubmitFile}>Upload</Button>
                {this.props.loading && <div className="spinner"/>}
                {this.props.loading && <div>Now Processing: {this.state.uploadId}</div>}
            </div>
        )
    }
}