import React, {Component} from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Image from 'react-bootstrap/Image';
import '../App.css';
import * as constants from '../Data';
import {LightBox} from "./LightBox";

export class AssembliesTable extends Component {

    constructor(props) {
        super(props);
        this.state = {assemblies: [], loaded: null};
        this.handleClick = this.handleClick.bind(this);
    }

    /**
     * fetch assemblies data from EPPIC assembly endpoint, transform assemblies information
     * and update state respectively
     */
    loadAssembliesData() {
        if (this.props.pdbId != null) {
            console.log("Loading assemblies data for " + this.props.pdbId);
            fetch(constants.ASSEMBLIES_END_POINT + this.props.pdbId)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Fail to fetch");
                    } else {
                        return response.json();
                    }
                })
                .then((data) => {
                    const transfAssembliesData = constants.transformAssembliesData(data);
                    this.setState({assemblies: transfAssembliesData, loaded: this.props.pdbId})
                })
                .catch(console.log)
        }
    }

    /**
     * find member interfaces for the given assembly, remove duplicate interfaces and return id of unique interfaces
     * @param assembly assembly information fetched from loadAssembliesData()
     * @returns {*[]} list of id of unique interfaces for the given assembly
     */

    removeDuplicateInterf(assembly) {
        const id = [];
        const graphEdges = assembly.graphEdges;
        if (graphEdges) {
            for (const key of Object.keys(graphEdges)) {
                const interf = graphEdges[key].interfaceId;
                if (!id.includes(interf)) {
                    id.push(interf);
                }
            }
        }
        return id;
    }

    /**
     * find the member interface cluster for the given assembly, remove duplicate interface clusters
     * and return id of unique interface clusters
     *
     * @param assembly assembly information for the given pdbId, fetched from loadAssembliesData()
     * @returns {*[]} id of unique interface clusters for the given assembly
     */
    removeDuplicaateCluster(assembly) {
        const cluster = [];
        const graphEdges = assembly.graphEdges;
        for (const key of Object.keys(graphEdges)) {
            const interf = graphEdges[key].interfaceClusterId;
            if (!cluster.includes(interf)) {
                cluster.push(interf);
            }
        }
        return cluster;
    }

    /**
     * handle event that navigates to filtered interface page for selected assembly, assuming the given assembly has
     * member interface clusters
     *
     * @param assembly assembly information for the given pdbId, fetched from loadAssembliesData()
     */
    handleClick(assembly) {
        if (Number.isInteger(assembly.id)) {
            this.props.onSelect("interfaces", assembly.id);
        } else {
            this.props.onSelect("interfaces", null);
        }
        this.props.onFilter(this.removeDuplicaateCluster(assembly));
    }

    render() {
        if (this.props.pdbId == null) {
            return null;
        }

        if (this.state.loaded !== this.props.pdbId) {
            this.loadAssembliesData();
            return null;
        }

        this.state.assemblies.sort((a, b) => a['eppic'].score > b['eppic'].score ? -1 : 1)

        const Assemblies = ({assemblies}) => {
            if (assemblies != null) {
                return (
                    <tbody>
                    {assemblies.map((assembly) => (
                        <tr key={assembly.id}>
                            <td><LightBox id={assembly.id}
                                          isDiagram={false}
                                          isInterface={false}
                                          pdbId={this.props.pdbId}
                                          src={constants.getAssemblyImgUrl(this.props.pdbId, assembly.id)}>
                            </LightBox></td>
                            <td><LightBox id={assembly.id}
                                          isDiagram={true}
                                          isInterface={false}
                                          pdbId={this.props.pdbId}
                                          src={constants.getAssemblyDiagramImgUrl(this.props.pdbId, assembly.id)}>
                            </LightBox></td>
                            <td>{assembly.id}</td>
                            <td>{assembly.mmSizes}</td>
                            <td>{assembly.stoichiometries}</td>
                            <td>{assembly.symmetries}</td>
                            <td title={assembly.eppic.score !== null ? `Score: ${assembly.eppic.score.toFixed(2)}` : null}
                                style={{
                                    fontSize: 16,
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    color: assembly.eppic.callName === 'bio' ? 'green' : assembly.eppic.callName === 'xtal' ? 'red' : 'black'
                                }}>
                                {assembly.eppic.callName.toUpperCase()}
                                {
                                    (assembly.eppic.score >= constants.BIO_EXCELLENT_CUTOFF && assembly.eppic.callName === 'bio') || (assembly.eppic.score <= constants.XTAL_EXCELLENT_CUTOFF && assembly.eppic.callName === 'xtal') ?
                                        <Image style={{width: 18}} src={constants.CONFIDENCE_EXCELLENT}/>
                                        :
                                        (assembly.eppic.score >= constants.BIO_GOOD_CUTOFF && assembly.eppic.callName === 'bio') || (assembly.eppic.score <= constants.XTAL_GOOD_CUTOFF && assembly.eppic.callName === 'xtal') ?
                                            <Image style={{width: 18}} src={constants.CONFIDENCE_GOOD}/>
                                            :
                                            <div></div>

                                }
                            </td>
                            {
                                this.removeDuplicateInterf(assembly).length === 0 ?
                                    <td>{this.removeDuplicateInterf(assembly).length + " interface(s)"}</td>
                                    :
                                    <td><Button variant="link"
                                                onClick={() => this.handleClick(assembly)}>{this.removeDuplicateInterf(assembly).length + " interface(s)"}</Button>
                                    </td>
                            }
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
                    <th>3D view</th>
                    <th>Assembly diagram</th>
                    <th>ID</th>
                    <th>Macromolecular size</th>
                    <th>Stoichiometry</th>
                    <th>Symmetry</th>
                    <th>Prediction</th>
                    <th>Interfaces</th>
                </tr>
                </thead>

                <Assemblies assemblies={this.state.assemblies}/>

            </Table>
        );
    }
}