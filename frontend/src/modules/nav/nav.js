import React, { Component, Fragment } from 'react';
import {
    getCurrentWallet,
    getCurrentWalletBalance,
    disconnectWallet,
    connectWallet,
    convertToETH
} from "../../libs/interact";
import UserModel from "../../libs/UserModel";

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
                this.getProfile(response.address);
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

    getProfile(address) {
        UserModel.retrieve(address).then(res => {
            this.setState({
                profile: res.data
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
                console.log(response);
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
                <nav id="my-nav" className="top-toolbar navbar navbar-mobile navbar-tablet">
                    <ul className="navbar-nav nav-left">
                        <li className="nav-item">
                            <a href="/">
                                <div className="logo nav-image-rounded">
                                    <svg id="logo" width="25" height="25" viewBox="0 0 54.03 56.55">
                                        <defs>
                                            <linearGradient id="logo_background_color">
                                                <stop className="stop1" offset="30%"></stop>
                                                <stop className="stop2" offset="80%"></stop>
                                                <stop className="stop3" offset="100%"></stop>
                                            </linearGradient>
                                        </defs>
                                        <path id="logo_path" className="cls-2" d="M90.32,0c14.2-.28,22.78,7.91,26.56,18.24a39.17,39.17,0,0,1,1,4.17l.13,1.5A15.25,15.25,0,0,1,118.1,29v.72l-.51,3.13a30.47,30.47,0,0,1-3.33,8,15.29,15.29,0,0,1-2.5,3.52l.06.07c.57.88,1.43,1.58,2,2.41,1.1,1.49,2.36,2.81,3.46,4.3.41.55,1,1,1.41,1.56.68.92,1.16,1.89.32,3.06-.08.12-.08.24-.19.33a2.39,2.39,0,0,1-2.62.07,4.09,4.09,0,0,1-.7-.91c-.63-.85-1.41-1.61-2-2.48-1-1.42-2.33-2.67-3.39-4.1a16.77,16.77,0,0,1-1.15-1.37c-.11,0-.06,0-.13.07-.41.14-.65.55-1,.78-.72.54-1.49,1.08-2.24,1.56A29.5,29.5,0,0,1,97.81,53c-.83.24-1.6.18-2.5.39a16.68,16.68,0,0,1-3.65.26H90.58L88,53.36A36.87,36.87,0,0,1,82.71,52a27.15,27.15,0,0,1-15.1-14.66c-.47-1.1-.7-2.17-1.09-3.39-1-3-1.45-8.86-.51-12.38a29,29,0,0,1,2.56-7.36c3.56-6,7.41-9.77,14.08-12.57a34.92,34.92,0,0,1,4.8-1.3Zm.13,4.1c-.45.27-1.66.11-2.24.26a32.65,32.65,0,0,0-4.74,1.37A23,23,0,0,0,71,18.7,24,24,0,0,0,71.13,35c2.78,6.66,7.2,11.06,14.21,13.42,1.16.39,2.52.59,3.84.91l1.47.07a7.08,7.08,0,0,0,2.43,0H94c.89-.21,1.9-.28,2.75-.46V48.8A7.6,7.6,0,0,1,95.19,47c-.78-1-1.83-1.92-2.62-3s-1.86-1.84-2.62-2.87c-2-2.7-4.45-5.1-6.66-7.62-.57-.66-1.14-1.32-1.66-2-.22-.29-.59-.51-.77-.85a2.26,2.26,0,0,1,.58-2.61,2.39,2.39,0,0,1,2.24-.2,4.7,4.7,0,0,1,1.22,1.3l.51.46c.5.68,1,1.32,1.6,2,2.07,2.37,4.38,4.62,6.27,7.17.94,1.26,2.19,2.3,3.14,3.58l1,1c.82,1.1,1.8,2,2.62,3.13.26.35.65.6.9,1A23.06,23.06,0,0,0,105,45c.37-.27,1-.51,1.15-1h-.06c-.18-.51-.73-.83-1-1.24-.74-1-1.64-1.88-2.37-2.87-1.8-2.44-3.89-4.6-5.7-7-.61-.82-1.44-1.52-2-2.34-.85-1.16-3.82-3.73-1.54-5.41a2.27,2.27,0,0,1,1.86-.26c.9.37,2.33,2.43,2.94,3.26s1.27,1.31,1.79,2c1.44,1.95,3.11,3.66,4.54,5.6.41.55,1,1,1.41,1.56.66.89,1.46,1.66,2.11,2.54.29.39.61,1.06,1.09,1.24.54-1,1.34-1.84,1.92-2.8a25.69,25.69,0,0,0,2.5-6.32c1.27-4.51.32-10.37-1.15-13.81A22.48,22.48,0,0,0,100.75,5.94a35.12,35.12,0,0,0-6.08-1.69A20.59,20.59,0,0,0,90.45,4.11Z" transform="translate(-65.5)" fill="white"></path>
                                    </svg>
                                </div>
                            </a>
                        </li>
                        <li className="nav-item">
                            <div className="nav-search-bar-container">
                                <i className="icon dripicons-search"></i>
                                <input type="text" className="nav-search-bar-input" placeholder="Search..." />
                            </div>
                        </li>
                    </ul>
                    <ul className="navbar-nav nav-right">
                        <li className="nav-item">
                            <a href="#!" data-toggle-state="mobile-topbar-toggle">
                                <i className="icon dripicons-align-right"></i>
                            </a>
                        </li>
                    </ul>
                </nav>
                <nav className="top-toolbar navbar navbar-desktop flex-nowrap">
                    <ul className="navbar-nav nav-left">
                        <li className="nav-item">
                            <a href="/">
                                <div className="logo nav-image-rounded">
                                    <svg id="logo" width="25" height="25" viewBox="0 0 54.03 56.55">
                                        <defs>
                                            <linearGradient id="logo_background_color">
                                                <stop className="stop1" offset="30%"></stop>
                                                <stop className="stop2" offset="80%"></stop>
                                                <stop className="stop3" offset="100%"></stop>
                                            </linearGradient>
                                        </defs>
                                        <path id="logo_path" className="cls-2" d="M90.32,0c14.2-.28,22.78,7.91,26.56,18.24a39.17,39.17,0,0,1,1,4.17l.13,1.5A15.25,15.25,0,0,1,118.1,29v.72l-.51,3.13a30.47,30.47,0,0,1-3.33,8,15.29,15.29,0,0,1-2.5,3.52l.06.07c.57.88,1.43,1.58,2,2.41,1.1,1.49,2.36,2.81,3.46,4.3.41.55,1,1,1.41,1.56.68.92,1.16,1.89.32,3.06-.08.12-.08.24-.19.33a2.39,2.39,0,0,1-2.62.07,4.09,4.09,0,0,1-.7-.91c-.63-.85-1.41-1.61-2-2.48-1-1.42-2.33-2.67-3.39-4.1a16.77,16.77,0,0,1-1.15-1.37c-.11,0-.06,0-.13.07-.41.14-.65.55-1,.78-.72.54-1.49,1.08-2.24,1.56A29.5,29.5,0,0,1,97.81,53c-.83.24-1.6.18-2.5.39a16.68,16.68,0,0,1-3.65.26H90.58L88,53.36A36.87,36.87,0,0,1,82.71,52a27.15,27.15,0,0,1-15.1-14.66c-.47-1.1-.7-2.17-1.09-3.39-1-3-1.45-8.86-.51-12.38a29,29,0,0,1,2.56-7.36c3.56-6,7.41-9.77,14.08-12.57a34.92,34.92,0,0,1,4.8-1.3Zm.13,4.1c-.45.27-1.66.11-2.24.26a32.65,32.65,0,0,0-4.74,1.37A23,23,0,0,0,71,18.7,24,24,0,0,0,71.13,35c2.78,6.66,7.2,11.06,14.21,13.42,1.16.39,2.52.59,3.84.91l1.47.07a7.08,7.08,0,0,0,2.43,0H94c.89-.21,1.9-.28,2.75-.46V48.8A7.6,7.6,0,0,1,95.19,47c-.78-1-1.83-1.92-2.62-3s-1.86-1.84-2.62-2.87c-2-2.7-4.45-5.1-6.66-7.62-.57-.66-1.14-1.32-1.66-2-.22-.29-.59-.51-.77-.85a2.26,2.26,0,0,1,.58-2.61,2.39,2.39,0,0,1,2.24-.2,4.7,4.7,0,0,1,1.22,1.3l.51.46c.5.68,1,1.32,1.6,2,2.07,2.37,4.38,4.62,6.27,7.17.94,1.26,2.19,2.3,3.14,3.58l1,1c.82,1.1,1.8,2,2.62,3.13.26.35.65.6.9,1A23.06,23.06,0,0,0,105,45c.37-.27,1-.51,1.15-1h-.06c-.18-.51-.73-.83-1-1.24-.74-1-1.64-1.88-2.37-2.87-1.8-2.44-3.89-4.6-5.7-7-.61-.82-1.44-1.52-2-2.34-.85-1.16-3.82-3.73-1.54-5.41a2.27,2.27,0,0,1,1.86-.26c.9.37,2.33,2.43,2.94,3.26s1.27,1.31,1.79,2c1.44,1.95,3.11,3.66,4.54,5.6.41.55,1,1,1.41,1.56.66.89,1.46,1.66,2.11,2.54.29.39.61,1.06,1.09,1.24.54-1,1.34-1.84,1.92-2.8a25.69,25.69,0,0,0,2.5-6.32c1.27-4.51.32-10.37-1.15-13.81A22.48,22.48,0,0,0,100.75,5.94a35.12,35.12,0,0,0-6.08-1.69A20.59,20.59,0,0,0,90.45,4.11Z" transform="translate(-65.5)"
                                            fill="black"></path>
                                    </svg>
                                </div>
                            </a>
                        </li>
                        <li className="nav-item">
                            <div className="nav-search-bar-container">
                                <i className="icon dripicons-search"></i>
                                <input type="text" className="nav-search-bar-input" placeholder="Search..." />
                            </div>
                        </li>
                    </ul>
                    <ul className="navbar-nav nav-right">
                        <li className="nav-item nav-text dropdown dropdown-menu-md">
                            <a href="/marketplace">
                                <span>
                                    Marketplace
                                </span>
                            </a>
                        </li>
                        <li className="nav-item nav-text dropdown dropdown-menu-md">
                            <a href="#!" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                <span>
                                    Stats&nbsp;
                                </span>
                                <i className="la la-angle-down menu-arrow-down"></i>
                            </a>
                            <div className="dropdown-menu menu-icons dropdown-menu-left">
                                <ul className="list-reset filter-list">
                                    <li><a className="dropdown-item" href="#!">Rankings</a></li>
                                    <div className="dropdown-divider"></div>
                                    <li><a className="dropdown-item" href="#!">Activity</a></li>
                                </ul>
                            </div>
                        </li>
                        <li className="nav-item nav-text dropdown dropdown-menu-md">
                            <a href="#!" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                <span>
                                    Resources&nbsp;
                                </span>
                                <i className="la la-angle-down menu-arrow-down"></i>
                            </a>
                            <div className="dropdown-menu menu-icons dropdown-menu-right">
                                <ul className="list-reset filter-list">
                                    <li><a className="dropdown-item" href="#!">Help Center</a></li>
                                    <div className="dropdown-divider"></div>
                                    <li><a className="dropdown-item" target="_blank" href="https://medium.com/@nftplayerone">Blog</a></li>
                                </ul>
                            </div>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link nav-pill user-avatar nav-image-rounded" href="/profile">
                                <div className="rounded-image-container">
                                    {this.state.isWalletConnected ?
                                        <img src={this.state.profile.image_url ? this.state.profile.image_url : "/assets/img/default.jpg"} className="w-35 rounded-circle" alt="profile" />
                                        :
                                        <i className="la la-user"></i>
                                    }
                                </div>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#!" data-toggle-state="aside-right-open">
                                <i className="icon dripicons-wallet"></i>
                            </a>
                        </li>
                    </ul>
                </nav>

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
