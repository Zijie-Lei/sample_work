import React, {Component} from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import '../App.css';

export class InputFormPanel extends Component {
    constructor(props) {
        super(props);
        this.handleChangeId = this.handleChangeId.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.state = {pdbId: ''};
    }

    /**
     * handles change of input, set state respectively
     *
     * @param e keyboard input
     */
    handleChangeInput(e) {
        this.setState({pdbId: e.target.value});
    }

    /**
     * handles submission of input, change PDB ID respectively
     *
     * @param e submission of input
     */
    handleChangeId(e) {
        e.preventDefault();
        this.props.onPdbIdChange(this.state.pdbId);
        e.target.value = '';

    }

    /**
     * handles the event of pressing "Enter" to submit
     *
     * @param e keyboard input
     */
    handleKeyPress(e) {
        if (e.key === "Enter") {
            this.handleChangeId(e);
        }
    }

    render() {
        return (
            <InputGroup className="mb-3">
                <FormControl
                    placeholder="Enter 4-letter PDB id"
                    aria-label="Enter 4-letter PDB id"
                    aria-describedby="basic-addon2"
                    onChange={this.handleChangeInput}
                    onKeyDown={this.handleKeyPress}
                />
                <Button variant="primary" onClick={this.handleChangeId}>Submit</Button>
            </InputGroup>
        )
    }
}