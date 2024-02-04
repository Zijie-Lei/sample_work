import React, {Component} from 'react';
import '../App.css';
import * as constants from '../Data';

export class PdbInfoPanel extends Component {

    constructor(props) {
        super(props);
        this.state = {pdbInfo: null, pdbId: null};
    }

    /**
     * fetch PDB Info data from EPPIC endpoint, update state respectively
     */
    loadPdbInfoData() {
        if (this.props.pdbId != null) {
            console.log("Loading PdbInfo data for " + this.props.pdbId);
            fetch(constants.PDBINFO_END_POINT + this.props.pdbId)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Fail to fetch");
                    } else {
                        return response.json();
                    }
                })
                .then((data) => {
                    this.setState({pdbInfo: data, pdbId: this.props.pdbId})
                })
                .catch(console.log)
        }
    }

    render() {

        if (this.props.pdbId == null) {
            return null;
        }

        if (this.state.pdbId !== this.props.pdbId) {
            this.loadPdbInfoData();
        }

        if (this.state.pdbInfo == null)
            return null;

        return (
            <div>
                <h4 className="text-left">
                    {this.state.pdbInfo.title}
                </h4>
                <p className="text-left">
                    {this.state.pdbInfo.expMethod} - {this.state.pdbInfo.spaceGroup} - {this.state.pdbInfo.resolution.toFixed(2)} Å
                </p>

            </div>
        );
    }
}