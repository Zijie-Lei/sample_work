import React, {Component} from 'react';
import Table from 'react-bootstrap/Table';
import Image from 'react-bootstrap/Image';
import '../App.css';
import * as constants from '../Data';
import {LightBox} from "./LightBox";

export class InterfTable extends Component {

    constructor(props) {
        super(props);
        this.state = {interfs: [], loaded: null};
    }

    /**
     * fetch Interface data from EPPIC endpoint, update state respectively
     */
    loadInterfData() {
        if (this.props.pdbId != null) {
            console.log("Loading interface data for " + this.props.pdbId);
            fetch(constants.INTERF_END_POINT + this.props.pdbId)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Fail to fetch");
                    } else {
                        return response.json();
                    }
                })
                .then((data) => {
                    const transfInterfs = constants.transformInterfData(data);
                    this.setState({interfs: transfInterfs, loaded: this.props.pdbId})
                })
                .catch(console.log)
        }
    }

    /**
     * Filter the interface data by cluster ID
     *
     * @param id selected cluster ID
     * @returns {T[]} interfaces with specified cluster ID
     */
    clusterFilter(id) {
        return this.state.interfs.filter(interf => {
            return interf.clusterId === id;
        })
    }

    /**
     * Return average area of the selected interface cluster
     * @param group selected interface cluster
     * @returns {string} the average area of the cluster
     */
    getAverage(group) {
        let sum = 0;
        for (let i = 0; i < group.length; i++) {
            sum += group[i].area;
        }
        let avg = sum / group.length;
        return avg.toFixed(2);
    }

    /**
     * Render interfaces grouped by cluster ID
     *
     * @returns {*[]} list of interface clusters
     */
    renderItem() {
        // list of interface clusters that are to be rendered
        const summary = [];
        let i = 1;
        while (this.clusterFilter(i).length > 0) {
            if (this.props.interfaceClusterIdsToFilter == null || this.props.interfaceClusterIdsToFilter.includes(i)) {
                // initialize one cluster to be rendered
                summary.push({
                    cluster: "Cluster: " + i,
                    area: this.getAverage(this.clusterFilter(i)),
                    interface: this.clusterFilter(i),
                    number: this.clusterFilter(i).length + " interface(s)"
                });
            }
            i++;
        }

        const clusters = []

        for (let index in summary) {
            let item = summary[index];

            // fill overall information for one cluster
            const itemRows = [
                <tr
                    key={"row-data-" + item.cluster}
                    style={{fontWeight: 'bold', borderWidth: 50}}>
                    <td>{item.number}</td>
                    <td>{item.cluster}</td>
                    <td></td>
                    <td>{item.area}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            ];

            // fill interface-specific information for one cluster
            itemRows.push(
                item.interface.map((interf) => (
                    <tr key={"row-expanded-" + interf.interfaceId} style={{background: 'whitesmoke'}}>
                        <td><LightBox id={interf.interfaceId}
                                      isDiagram={false}
                                      isInterface={true}
                                      pdbId={this.props.pdbId}
                                      src={constants.getInterfImgUrl(this.props.pdbId, interf.interfaceId)}>
                        </LightBox></td>
                        <td>{interf.interfaceId}</td>
                        <td>{interf.chain1 + " + " + interf.chain2}</td>
                        <td>{interf.area.toFixed(2)}</td>
                        <td><img src={constants.getOpTypeImgUrl(interf.operatorType)} alt="Operator"
                                 title={interf.operator}/></td>
                        <td title={interf["eppic-cs"].score !== undefined ? `Score: ${interf["eppic-cs"].score.toFixed(2)}` : interf['eppic-cs'].callReason}
                            style={{color: interf["eppic-cs"].callName === 'bio' ? 'green' : interf["eppic-cs"].callName === 'xtal' ? 'red' : 'black'}}>
                            {interf["eppic-cs"].callName}</td>
                        <td title={interf["eppic"].score !== null ? `Score: ${interf["eppic"].score.toFixed(2)}` : null}
                            style={{
                                fontSize: 16,
                                textAlign: 'center',
                                fontWeight: 'bold',
                                color: interf["eppic"].callName === 'bio' ? 'green' : interf["eppic"].callName === 'xtal' ? 'red' : 'black'
                            }}>
                            {interf["eppic"].callName.toUpperCase()}
                            {
                                (interf["eppic"].score >= constants.BIO_EXCELLENT_CUTOFF && interf["eppic"].callName === 'bio') || (interf["eppic"].score <= constants.XTAL_EXCELLENT_CUTOFF && interf["eppic"].callName === 'xtal') ?
                                    <Image style={{width: 18}} src={constants.CONFIDENCE_EXCELLENT}/>
                                    :
                                    (interf["eppic"].score >= constants.BIO_GOOD_CUTOFF && interf["eppic"].callName === 'bio') || (interf["eppic"].score <= constants.XTAL_GOOD_CUTOFF && interf["eppic"].callName === 'xtal') ?
                                        <Image style={{width: 18}} src={constants.CONFIDENCE_GOOD}/>
                                        :
                                        <div></div>
                            }
                        </td>
                    </tr>
                ))
            );

            clusters.push(itemRows);
        }
        return clusters;
    }

    render() {
        if (this.props.pdbId == null) {
            return null;
        }

        if (this.state.loaded !== this.props.pdbId) {
            this.loadInterfData();
            return null;
        }

        let allItemRows = this.renderItem();

        return (
            <div>
                <Table bordered hover>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>ID</th>
                        <th>Chains</th>
                        <th>Area</th>
                        <th>Operator</th>
                        <th>Core-Surface</th>
                        <th>Final</th>
                    </tr>
                    </thead>

                    <tbody>
                    {allItemRows}
                    </tbody>
                </Table>

            </div>
        );
    }
}