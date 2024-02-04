import React, {Component} from 'react';
import Nav from 'react-bootstrap/Nav';
import '../App.css';

export class LeftNav extends Component {

    constructor(props) {
        super(props);
        this.state = {jobIds: []};
        this.handleSelect = this.handleSelect.bind(this);
    }

    /**
     * add new element to the left nav bar
     */
    addJob() {
        if (this.props.current != null && !this.state.jobIds.includes(this.props.current)) {
            //console.log("LeftNav does not have job id " + this.props.current);
            // see https://www.robinwieruch.de/react-state-array-add-update-remove
            this.setState(state => {
                const jobIds = state.jobIds.concat(this.props.current);
                return {
                    jobIds
                };
            });
        }
    }

    /**
     * Add new element to left nav bar new PDB ID is submitted
     *
     * @param prevProps previously submitted PDB ID
     */
    componentDidUpdate(prevProps) {
        if (this.props.current !== prevProps.current) {
            this.addJob();
        }
    }

    /**
     * handles selection of element in left nav bar, update state of the main class respectively
     *
     * @param e existing element in the left nav bar
     */
    handleSelect(e) {
        this.props.onPdbIdChange(e);
    }

    /**
     * handles the loading process of file upload, a new nav named "loading" will be displayed at left nav bar
     * depending on the status of upload
     *
     * @returns {JSX.Element} nav element that displays "loading" in left nav bar
     */
    handleLoading(){
        return (
            <div>
                {this.props.loading && <Nav.Link disabled>
                    loading
                </Nav.Link>}
            </div>
        )
    }

    render() {
        return (
            <Nav
                activeKey={this.props.current}
                className="flex-column"
                onSelect={this.handleSelect}
                variant="tabs">
                {this.state.jobIds.map(jobId => (
                    <Nav.Link eventKey={jobId} key={jobId}>{jobId.length > 4 ?
                        jobId.substring(0, 4) + ".." + jobId.substring(jobId.length - 4) :
                        jobId}
                    </Nav.Link>
                ))
                }
                {this.handleLoading()}
            </Nav>
        );
    }
}