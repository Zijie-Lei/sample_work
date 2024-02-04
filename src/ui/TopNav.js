import React, {Component} from 'react';
import Nav from 'react-bootstrap/Nav';
import '../App.css';

export class TopNav extends Component {

    constructor(props) {
        super(props);
        this.state = {current: "Home"};
    }

    render() {  
        return (
            <Nav activeKey={this.state.current} variant="tabs">
                <Nav.Link eventKey="Home" key="Home">Home</Nav.Link>
                <Nav.Link eventKey="Downloads" key="Downloads">Downloads</Nav.Link>
                <Nav.Link eventKey="Help" key="Help" href="help.html">Help</Nav.Link>
                <Nav.Link eventKey="F.A.Q." key="F.A.Q." href="faq.html">F.A.Q.</Nav.Link>
                <Nav.Link eventKey="Release log" key="Release log">Release log</Nav.Link>
                <Nav.Link eventKey="Publications" key="Publications">Publications</Nav.Link>
            </Nav>
        );
    }
}