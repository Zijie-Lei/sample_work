import React, {Component} from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import * as constants from './Data';
import {TopNav} from './ui/TopNav'
import {LeftNav} from './ui/LeftNav'
import {PdbInfoPanel} from "./ui/PdbInfoPanel";
import {InputFormPanel} from "./ui/InputFormPanel"
import {AssembliesTable} from "./ui/AssemblyTable";
import {InterfTable} from "./ui/InterfaceTable";
import {SequenceTable} from "./ui/SequenceTable";
import {FileUpload} from "./ui/FileUpload"
import './App.css';
import Button from "react-bootstrap/Button";


function App() {

    return (
        <div>
            <EppicPanel/>
        </div>
    );
}

class EppicPanel extends Component {

    constructor(props) {
        super(props);
        this.handlePdbIdChange = this.handlePdbIdChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.handlePopState = this.handlePopState.bind(this);
        this.handleUrlParem = this.handleUrlParem.bind(this);
        this.handleLoading = this.handleLoading.bind(this);
        this.state = {
            pdbId: null,
            uniprotVersion: null,
            tab: "assemblies",
            interfaceClusterIdsToFilter: null,
            currAssembly: null,
            loading: false,
        };
    }

    componentDidMount() {
        window.addEventListener('popstate', this.handlePopState);
    }

    componentWillUnmount() {
        window.removeEventListener('popstate', this.handlePopState);
    }

    handlePopState(e) {
        e.preventDefault();
        if (e.state == null) {
            this.setState({
                pdbId: null,
                uniprotVersion: null,
                tab: "assemblies",
                interfaceClusterIdsToFilter: null,
                currAssembly: null
            })
        } else {
            this.setState({
                pdbId: e.state.pdbId,
                uniprotVersion: e.state.uniprotVersion,
                tab: e.state.tab,
                interfaceClusterIdsToFilter: e.state.interfaceClusterIdsToFilter,
                currAssembly: e.state.currAssembly
            })
        }
    }

    handleUrlParem() {
        const url = window.location.hash.substring(1);
        if (url !== "") {
            const parts = url.split('/');
            this.handlePdbIdChange(parts[1], parts[0]);
        }
    }

    handlePdbIdChange(pdbId, tab = 'assemblies') {
        fetch(constants.PDBINFO_END_POINT + pdbId)
            .then((response) => {
                if (!response.ok) {
                    alert("Could not find data for given PDB id");
                    //throw new Error("Fail to fetch");
                } else {
                    return response.json();
                }
            })
            .then((data) => {
                this.setState({
                    pdbId: pdbId,
                    tab: tab,
                    uniprotVersion: data.runParameters.uniProtVersion,
                    interfaceClusterIdsToFilter: null,
                    currAssembly: null
                });
            })
            .catch(console.log)
    }

    handleReset() {
        this.setState({interfaceClusterIdsToFilter: null, currAssembly: null});
    }

    handleFilter(filter) {
        this.setState({interfaceClusterIdsToFilter: filter});
    }

    handleSelect(key, assembly) {
        if (Number.isInteger(assembly)) {
            this.setState({currAssembly: assembly});
        }
        this.setState({tab: key});
    }

    handleLoading(status) {
        this.setState({loading: status});
    }

    render() {
        const pdbId = this.state.pdbId;
        const newPath = this.state.currAssembly != null && this.state.tab === 'interfaces'?
            "#" + this.state.tab + "/" + this.state.pdbId + "/" + this.state.currAssembly
            :
            "#" + this.state.tab + "/" + this.state.pdbId;

        if (this.state.pdbId == null) {
            this.handleUrlParem();
        }

        if (this.state.pdbId && window.location.hash !== newPath) {
            window.history.pushState(this.state, null, newPath);
        }

        return (
            <div className="App">
                <header className="App-header">
                </header>

                {/* fluid=true is to fill all horizontal space */}
                <Container fluid={true}>
                    <Row>
                        <Col>
                            <TopNav/>
                        </Col>
                        <Col xs={2}>
                            <Image className="float-right" src="images/eppic-logo.png" rounded height="35" width="87"/>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs={1}>
                            <LeftNav
                                current={pdbId}
                                onPdbIdChange={this.handlePdbIdChange}
                                loading={this.state.loading}
                            />
                        </Col>
                        <Col>
                            <Row>
                                <Col xs={4}>
                                    <div>
                                        <InputFormPanel
                                            onPdbIdChange={this.handlePdbIdChange}
                                        />
                                    </div>
                                </Col>
                                <Col xs={4}>
                                    <div>
                                        <FileUpload
                                            onPdbIdChange={this.handlePdbIdChange}
                                            onLoading={this.handleLoading}
                                            loading={this.state.loading}
                                        />
                                    </div>
                                </Col>

                            </Row>
                            <Row>
                                <PdbInfoPanel pdbId={pdbId}/>
                            </Row>
                            <Row>
                                <Col>
                                    <div>

                                        <Tabs
                                            activeKey={this.state.tab}
                                            id="main-tabs"
                                            onSelect={this.handleSelect}
                                            transition={false}>
                                            <Tab eventKey="assemblies" title="Assemblies">
                                                <AssembliesTable
                                                    pdbId={pdbId}
                                                    onSelect={this.handleSelect}
                                                    onFilter={this.handleFilter}
                                                />
                                            </Tab>
                                            <Tab eventKey="interfaces"
                                                 title={Number.isInteger(this.state.currAssembly) ? "Interfaces for assembly " + this.state.currAssembly : "Interfaces"}>
                                                {
                                                    this.state.interfaceClusterIdsToFilter != null ?
                                                        <Button onClick={this.handleReset} size="sm">
                                                            All interfaces
                                                        </Button>
                                                        :
                                                        <div></div>
                                                }
                                                <InterfTable
                                                    pdbId={pdbId}
                                                    onReset={this.handleReset}
                                                    interfaceClusterIdsToFilter={this.state.interfaceClusterIdsToFilter}
                                                />
                                            </Tab>
                                            <Tab eventKey="sequence"
                                                 title={this.state.uniprotVersion != null ? "Sequence information (UniProt " + this.state.uniprotVersion + ")" : "Sequence information"}>
                                                <SequenceTable
                                                    pdbId={pdbId}
                                                />
                                            </Tab>
                                            {Number.isInteger(this.state.currAssembly) ?
                                                <Tab title={<img style={{width: 25}} alt={'diagramInTab'}
                                                                 src={constants.getAssemblyDiagramImgUrl(this.state.pdbId, this.state.currAssembly)}/>}></Tab>
                                                :
                                                <div/>
                                            }
                                        </Tabs>
                                    </div>

                                </Col>
                            </Row>

                        </Col>

                    </Row>

                </Container>

            </div>
        );
    }
}


export default App;