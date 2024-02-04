import React, {Component} from 'react';
import Table from 'react-bootstrap/Table';
import '../App.css';
import * as constants from '../Data';

export class SequenceTable extends Component {
    constructor(props) {
        super(props);
        this.state = {sequences: null, pdbId: null}
        this.loadSequence = this.loadSequence.bind(this)
    }

    /**
     * fetch sequence data from EPPIC sequence endpoint, update state respectively
     */
    loadSequence() {
        if (this.props.pdbId != null) {
            console.log("Loading sequence data for " + this.props.pdbId);
            fetch(constants.SEQUENCES_END_POINT + this.props.pdbId)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Fail to fetch");
                    } else {
                        return response.json();
                    }
                })
                .then((data) => {
                    const proteinData = data.filter(sequence => sequence.protein)
                    this.setState({sequences: proteinData, pdbId: this.props.pdbId})
                })
                .catch(console.log)
        }
    }

    render() {
        if (this.props.pdbId == null) {
            return null;
        }

        if (this.state.pdbId !== this.props.pdbId) {
            this.loadSequence();
            return null;
        }

        const Sequences = ({sequences}) => {
            if (sequences != null) {
                return (
                    <tbody>
                    {sequences.map((sequence) => (
                        <tr key={sequence.repChain}>
                            <td>{sequence.repChain}</td>
                            <td>{sequence.memberChains}</td>
                            <td>{sequence.refUniProtId}</td>
                            <td>{sequence.numHomologs}</td>
                        </tr>
                    ))}
                    </tbody>
                )
            } else {
                return (
                    <tbody>
                    </tbody>);
            }
        };

        return (
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Representative chain ID</th>
                    <th>Member chain IDs</th>
                    <th>Reference UniProt ID</th>
                    <th>Number of homolog sequences in MSA</th>
                </tr>
                </thead>

                <Sequences sequences={this.state.sequences}/>

            </Table>
        )
    }


}