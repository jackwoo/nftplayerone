import React, { Component, Fragment } from 'react';
import {
    getCurrentWallet,
    getCurrentWalletBalance,
    disconnectWallet,
    connectWallet,
    convertToETH
} from "../../libs/interact";
import UserModel from "../../model/UserModel";

class Nav extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isWalletConnected: false,
            walletAddress: "",
            walletBalance: 0,
            profile: {}
        }
    }

    componentDidMount() {
        getCurrentWallet().then((response) => {
            if (response) {
                this.setState({
                    isWalletConnected: true,
                    walletAddress: response.address
                })
                this.getBalance(response.address);
            }
        })
    }

    getBalance(address) {
        getCurrentWalletBalance(address).then(res => {
            this.setState({
                walletBalance: convertToETH(res)
            })
        })
    }

    logout() {
        disconnectWallet().then((response) => {
            this.setState({
                isWalletConnected: false,
                walletAddress: ""
            })
            this.redirect(false);
        })
    }

    connect() {
        connectWallet().then((response) => {
            let data = {
                address: response.address
            }
            UserModel.connect(data).then((res) => {
                this.setState({
                    isWalletConnected: true,
                    walletAddress: response.address
                })
                this.redirect(true);
                this.getBalance(response.address);
            }).catch(e => {
                console.log(e);
            })
        }).catch(e => {
            console.log(e);
        })
    }

    redirect(connected) {
        let tokens = window.location.href.split("/");
        if (connected && tokens[3].includes("wallet")) {
            window.location.href = "/profile";
        } else if (!connected && tokens[3].includes("profile")) {
            window.location.href = "/wallet";
        }
    }

    render() {
        return (
            <Fragment>
                <footer id="footer" className="d-flex justify-content-between p-15">
                    <div className="d-flex">
                        <a className="dropdown-item" href="/about">About</a>
                        <a className="dropdown-item" target="_blank" href="https://medium.com/@nftplayerone">Blog</a>
                    </div>
                    <div className="d-flex">
                        <a href="javascript:void(0)" data-toggle-state="aside-right-open">
                            <i className="icon dripicons-wallet"></i>
                        </a>
                    </div>
                </footer>

                <aside className="sidebar sidebar-right">
                    <div className="sidebar-content">
                        <div className="tab-panel m-b-30" id="sidebar-tabs">
                            {this.state.isWalletConnected ?
                                (
                                    <Fragment>
                                        <h1>My Wallet<span className="wallet-address">{
                                            String(this.state.walletAddress).substring(0, 6) +
                                            "..." +
                                            String(this.state.walletAddress).substring(38)
                                        }</span></h1>
                                        <hr />

                                        <div className="row">
                                            <div className="col-12">
                                                <ul className="balance-list">
                                                    <li className="btn btn-secondary btn-outline balance-container">
                                                        <div className="balance-currency-icon-container">
                                                            <img className="balance-currency-icon" src="https://storage.opensea.io/files/6f8e2979d428180222796ff4a33ab929.svg" alt="" />
                                                        </div>
                                                        <div className="balance-currency-container">
                                                            <span className="balance-currency-label">BNB</span>
                                                            <p className="balance-currency-name">Binance</p>
                                                        </div>
                                                        <div className="balance-amount-container">
                                                            <span className="balance-amount">{this.state.walletBalance}</span>
                                                        </div>
                                                    </li>
                                                </ul>
                                                <button className="btn btn-danger btn-outline wallet-btn" onClick={() => this.logout()}>Logout</button>
                                            </div>
                                        </div>
                                    </Fragment>
                                ) :
                                (
                                    <Fragment>
                                        <h1>My Wallet</h1>
                                        <hr />
                                        <div className="row">
                                            <div className="col-12">
                                                <p>Connect with one of our available wallet info providers or create a new one.</p>
                                            </div>
                                            <div className="col-12">
                                                <button className="btn btn-secondary btn-outline wallet-btn" onClick={() => this.connect()}>
                                                    <div className="wallet-icon-container">
                                                        <img className="wallet-icon" src="https://opensea.io/static/images/logos/metamask-alternative.png" width="25px" height="25px" alt="" />
                                                    </div>
                                                    <div className="wallet-label-container">
                                                        <span>Metamask</span>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </Fragment>
                                )
                            }
                        </div>
                    </div>
                </aside>
            </Fragment>
        );
    }
}

export default Nav;
