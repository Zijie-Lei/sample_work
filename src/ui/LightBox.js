import React, {Component, useState, useEffect, createRef} from 'react';
import '../App.css';
import * as constants from '../Data';
import {Network} from 'vis';
import {Viewer} from '@rcsb/rcsb-molstar/build/dist/viewer/rcsb-molstar';


export class Molstar extends Component {
    constructor(props) {
        super(props);
        this.state = {molstar: null, config: null, url: null, chains: null, coreResidue: null, componentsAdded: false};
    }

    /**
     * Initialize Molstar component and set parameters as needed
     */
    componentDidMount() {
        function getQueryParam(id) {
            const a = new RegExp(id + '=([^&#=]*)', 'i')
            const m = a.exec(window.location.search)
            return m ? decodeURIComponent(m[1]) : undefined
        }

        const _config = getQueryParam('config');
        const config = _config && JSON.parse(_config);

        // initialize Molstar viewer
        const viewer = new Viewer('viewer', {
            showImportControls: true,
            showSessionControls: false,
            layoutShowLog: false,
            layoutShowControls: false,
            showMembraneOrientationPreset: true,
            showNakbColorTheme: true,
            detachedFromSierra: true,
        });
        this.setState({molstar: viewer, config: config});

        // If Molstar component is for visualizing interfaces
        if (this.props.isInterface) {
            const chainUrl = constants.INTERF_END_POINT + this.props.pdbId
            fetch(chainUrl)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Fail to fetch");
                    } else {
                        return response.json();
                    }
                })
                .then((data) => {
                    const target = data.filter(each => each.interfaceId === this.props.id)[0]
                    if (target.chain1 === target.chain2) {
                        target.chain2 = target.chain2 + "_1"
                    }
                    this.setState({chains: [target.chain1, target.chain2]})
                })
                .catch(console.log)

            const coreUrl = constants.INTERF_RESIDUE_END_POINT + this.props.pdbId + "/" + this.props.id
            fetch(coreUrl)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Fail to fetch");
                    } else {
                        return response.json();
                    }
                })
                .then((data) => {
                    this.setState({coreResidue: data.filter(each => each.region === 3)})
                })
                .catch(console.log)
        }
    }

    render() {
        // if loading Molstar for Interface
        if (this.props.isInterface) {

            if (this.state.url == null) {
                this.setState({url: constants.getInterfCifUrl(this.props.pdbId, this.props.id)})
            }

            // if core residues exist for given interface, highlight these residues with different visualization
            if (this.state.molstar && !this.state.componentsAdded && this.state.coreResidue) {
                this.setState({url: constants.getInterfCifUrl(this.props.pdbId, this.props.id)})
                this.state.molstar.loadStructureFromUrl(this.state.url, 'mmcif', false, this.state.config).then((resolved) => {
                    this.state.molstar.createComponent(
                        'Chain 1 Core Residues',
                        this.state.coreResidue.filter(cr => (
                            cr.side
                        )).map(cr => ({
                                modelId: resolved.structure.obj.data.units[0].model.id,
                                labelAsymId: this.state.chains[0],
                                labelSeqId: cr['residueNumber']
                            })
                        ),
                        "ball-and-stick"
                    );
                    this.state.molstar.createComponent(
                        'Chain 2 Core Residues',
                        this.state.coreResidue.filter(cr => (
                            !cr.side
                        )).map(
                            cr => ({
                                modelId: resolved.structure.obj.data.units[0].model.id,
                                labelAsymId: this.state.chains[1],
                                labelSeqId: cr['residueNumber']
                            })
                        ),
                        "ball-and-stick"
                    );
                });
                this.setState({componentsAdded: true});
            }
        } else {
            // if loading Molstar for Assembly
            if (this.state.url == null) {
                this.setState({url: constants.getAssemblyCifUrl(this.props.pdbId, this.props.id)})
            }
            if (this.state.molstar) {
                this.state.molstar.loadStructureFromUrl(this.state.url, 'mmcif', false, this.state.config)
            }
        }
        return (
            <div>
                <div id={'viewer'}/>
            </div>
        );
    }
}

const LightBoxViewer = ({children, src, isDiagram, pdbId, id, isInterface}) => {
    const [isOpen, setIsOpen] = useState(true);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const toggleIsOpen = () => {
        setIsOpen(!isOpen);
    };
    const handleChild = (e) => {
        e.stopPropagation();
    };

    // specify style for lightbox
    const diagramStyle = {
        background: "white",
        display: 'inline-block',
        width: "70%",
        height: "90%",
        position: "relative",
        border: "solid grey 1px"
    }

    if (src != null && nodes.length === 0 && edges.length === 0) {
        setNodes(src.nodes)
        setEdges(src.edges)
    }

    // initialize diagram
    const container = createRef();
    const initialNodeSize = 10;

    useEffect(() => {
        const options = {
            nodes: {
                shape: 'dot',
                size: initialNodeSize,
            },
            edges: {
                smooth: {
                    enabled: false,
                    type: "dynamic",
                    roundness: 1.0
                },
                arrows: 'to',
            },
            physics: false
        };
        if (container.current != null) {
            container.current = new Network(container.current, {nodes, edges}, options);
            container.current.on("zoom", function (params) {
                options.nodes.size = initialNodeSize / params.scale;
                container.current.setOptions(options);
            });
        }

    }, [container, nodes, edges]);

    return (
        <div onClick={toggleIsOpen}>
            {children}
            {isOpen ?
                <div onClick={toggleIsOpen} style={{
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    height: '100vh',
                    width: '100vw',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    cursor: 'pointer'
                }}>
                    {isDiagram === true ?
                        // if lightbox is for diagram
                        <div onClick={handleChild} ref={container} style={diagramStyle}/>
                        :
                        // if lightbox is for Molstar
                        <div onClick={handleChild} style={diagramStyle}>
                            <Molstar pdbId={pdbId} isInterface={isInterface}
                                     id={id}/>
                        </div>

                    }
                </div>
                : null}
        </div>
    );
};

/**
 * Main class for the light box feature
 */
export class LightBox extends Component {
    constructor(props) {
        super(props);
        this.state = {pdbId: null, diagram: null, open: false, molstar: null}
        this.loadDiagramData = this.loadDiagramData.bind(this);
        this.onClickOpen = this.onClickOpen.bind(this);
    }

    /**
     * Fetch diagram data for the specific assembly for given PDB ID, update state respectively
     *
     * @param pdbId selected PDB ID
     * @param assembly selected assembly
     */
    loadDiagramData(pdbId, assembly) {
        fetch(constants.ASSEMBLIES_DIAGRAM_END_POINT + pdbId + "/" + assembly)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Fail to fetch");
                } else {
                    return response.json();
                }
            })
            .then((data) => {
                this.setState({diagram: data, pdbId: pdbId})
            })
            .catch(console.log)
    }

    /**
     * handles the event of opening lightbox
     */
    onClickOpen() {
        this.setState({open: !this.state.open})
    }

    render() {
        if (!this.state.open) {
            return (
                <img src={this.props.src} alt="Assembly" onClick={this.onClickOpen}/>
            )
        }
        // If the selected visualization is diagram instead of Molstar
        if (this.state.pdbId !== this.props.pdbId && this.props.isDiagram === true) {
            this.loadDiagramData(this.props.pdbId, this.props.id);
        }

        const image = <img src={this.props.src} alt="Assembly"/>

        return (
            <div>
                <LightBoxViewer id={this.props.id} pdbId={this.props.pdbId} isInterface={this.props.isInterface}
                                children={image} src={this.state.diagram} isDiagram={this.props.isDiagram}/>
            </div>
        );

    }
}