import React, { Component, Fragment } from 'react';
import { Link } from "react-router-dom";

class About extends Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        return (
            <Fragment>
                <div className="content-wrapper">
                    <div className="content container">
                        <section className="page-content about-section">
                            <div className="row">
                                <div className="col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6">
                                    <h1 className="title">About NFTPlayerOne</h1>
                                    <p className="content">With the rise of Web3, NFTs will be the crucial form of your digital ownership. NFTs will not just be representing arts as what is happening in 2021, they will be the fundamental form to represent majority of digital creations.</p>
                                    <p className="content">Among all digital creations, none would be more elegant and valuable as compare to a line of text. A line of text to express a great idea, a deep thought, or a recording of a memorable event.</p>
                                    <p className="content">Yes, as simple and elegant as a line of text. Just like the early days of Web2 we had 140 characters to express all sorts of ideas. </p>
                                    <p className="content">And thus, NFTPlayerOne.com was created.</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </Fragment>
        );
    }
}

export default About;
