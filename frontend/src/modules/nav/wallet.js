import React, { Component } from 'react';
import {
    getCurrentWallet,
    connectWallet
} from "../../libs/interact";

class Wallet extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidMount() {
        getCurrentWallet().then((response) => {
            if (response.address) {
                this.props.history.push("/profile");
            }
        })
    }

    connect() {
        connectWallet().then((response) => {
            this.props.history.push("/profile");
        })
    }

    render() {
        return (
            <div className="content-wrapper">
                <div className="content container">
                    <section className="page-content">
                        <div className="row">
                            <div class="col-12 text-center">
                                <h3 className="wallet--wrapper-message">Sign in to your wallet.</h3>
                                <div className="wallet--wallet-logo-container">
                                    <div className="m-t-50 m-b-50">
                                        <img className="Image--image" src="/assets/img/wallet.png" width="120" alt=""/>
                                    </div>
                                </div>
                                <button className="btn btn-primary" onClick={() => this.connect()}>Sign In</button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        )
    }
}

export default Wallet;