import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
    getCurrentWallet,
    convertToETH
} from "../libs/interact";
import ItemModel from "../libs/ItemModel";
import UserModel from '../libs/UserModel';
import moment from 'moment';
const API_HOST = process.env.REACT_APP_API_URL;

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            connected: false,
            walletAddress: "",
            items: [],
            profile: {}
        }
    }

    componentDidMount() {
        getCurrentWallet().then((res) => {
            if (res.address) {
                this.setState({
                    walletAddress: res.address,
                    connected: true
                })
                this.getOwnedItem(res.address);
                this.getProfile(res.address);
            } else {
                this.props.history.push("/wallet");
            }
        })
    }

    getOwnedItem(address) {
        ItemModel.listOwned(address).then(res => {
            this.setState({
                items: res.data
            })
        }).catch(e => {
            console.log(e)
        })
    }

    getProfile(address) {
        UserModel.retrieve(address).then(res => {
            this.setState({
                profile: res.data
            })
        })
    }

    renderItem = (data) => {
        if (data) {
            return data.map((c, i) => {
                return (
                    <div className="col-xs-6 col-md-6 col-lg-4 col-xl-3" key={i}>
                        <div className="card p-20">
                            <a href={"/marketplace/" + c._id}>
                                <img className="card-img-top" src={c.image_url} alt="" />
                                <div className="card-body p-10">
                                    <div className="row m-t-20">
                                        <div className="col-7">
                                            <h5 className="m-b-6">{c.name}</h5>
                                        </div>
                                        <div className="text-right col-5">
                                            {c.listed &&
                                                <p className="card-text">
                                                    <img className="img-thumb" src="/assets/img/bnb.png" height="16" width="16" alt="" />
                                                    <span className="text-muted p-l-5">{convertToETH(c.price)}</span>
                                                </p>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                )
            })
        } else {
            return "";
        }
    }

    render() {
        return (
            <div className="content-wrapper">
                <div className="content container">
                    <section className="page-content">
                        <div className="row">
                            <div className="col-12">
                                <div className="card card-pills">
                                    <div className="card-header">
                                        <div className="row m-b-50">
                                            <div className="col-md-2 col-4">
                                                <img className="profile-image" src={this.state.profile.image_url ? API_HOST + this.state.profile.image_url : "/assets/img/default.jpg"} alt="profile" />
                                            </div>
                                            <div className="col-md-10 col-8">
                                                <div className="fb-page-title">{this.state.profile.username ? this.state.profile.username : "Unnamed"}</div>
                                                <div className="fb-page-description">{
                                                    String(this.state.walletAddress).substring(0, 6) +
                                                    "..." +
                                                    String(this.state.walletAddress).substring(38)
                                                }</div>
                                            </div>
                                        </div>

                                        <ul className="nav nav-pills nav-pills-primary" id="pills-demo-4" role="tablist">
                                            <li className="nav-item">
                                                <a className="nav-link active show" id="pills-9-tab" data-toggle="pill" href="#pills-9" role="tab" aria-controls="pills-9" aria-selected="true">My NFT</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" id="pills-10-tab" data-toggle="pill" href="#pills-10" role="tab" aria-controls="pills-10" aria-selected="true">In Wallet</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" id="pills-11-tab" data-toggle="pill" href="#pills-11" role="tab" aria-controls="pills-11" aria-selected="false">Activity</a>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="card-body">
                                        <div className="tab-content" id="pills-tabContent-4">
                                            <div className="tab-pane fade active show" id="pills-9" role="tabpanel" aria-labelledby="pills-12">
                                                {this.state.profile.nft ?
                                                    <div className="row">
                                                        <div className="col-xs-6 col-md-6 col-lg-4 col-xl-3">
                                                            <div className="card p-20">
                                                                <a href={"/marketplace/" + this.state.profile.nft._id}>
                                                                    <img className="card-img-top" src={this.state.profile.nft.image_url} alt="" />
                                                                    <div className="card-body p-10">
                                                                        <div className="row m-t-20">
                                                                            <div className="col-7">
                                                                                <h5 className="m-b-6">{this.state.profile.nft.name}</h5>
                                                                            </div>
                                                                            <div className="text-right col-5">
                                                                                {this.state.profile.nft.listed &&
                                                                                    <p className="card-text">
                                                                                        <img className="img-thumb" src="/assets/img/bnb.png" height="16" width="16" alt="" />
                                                                                        <span className="text-muted p-l-5">{convertToETH(this.state.profile.nft.price)}</span>
                                                                                    </p>
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    :
                                                    <div className="col-12 p-30 text-center">
                                                        <h2>You have yet to create your NFT, create it now!</h2>
                                                        <Link to="/mynft">
                                                            <button className="btn btn-primary m-t-20">Create NFT</button>
                                                        </Link>
                                                    </div>

                                                }

                                            </div>
                                            <div className="tab-pane fade" id="pills-10" role="tabpanel" aria-labelledby="pills-10">
                                                <div className="row">
                                                    {this.renderItem(this.state.items)}
                                                </div>
                                            </div>
                                            <div className="tab-pane fade" id="pills-11" role="tabpanel" aria-labelledby="pills-11">
                                                <h4> Trading History</h4>
                                                <div className="table-responsive">
                                                    <table className="table">
                                                        <thead>
                                                            <tr>
                                                                <th>Event</th>
                                                                <th>Item</th>
                                                                <th>Price</th>
                                                                <th>From</th>
                                                                <th>To</th>
                                                                <th>Date</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {this.state.profile.tradings?.map((t, i) => {
                                                                let from_name = "";
                                                                let from_img = false;
                                                                if (t.from_account != null) {
                                                                    from_name = t.from_account.address ? String(t.from_account.address).substring(0, 6).toUpperCase() : "";
                                                                    from_img = t.from_account.image_url ? t.from_account.image_url : "/assets/img/default.jpg";
                                                                }

                                                                let to_name = "";
                                                                let to_img = false;
                                                                if (t.to_account != null) {
                                                                    to_name = t.to_account.address ? String(t.to_account.address).substring(0, 6).toUpperCase() : "";
                                                                    to_img = t.to_account.image_url ? t.to_account.image_url : "/assets/img/default.jpg";
                                                                }

                                                                let current = moment();
                                                                let happened = moment(t.updated_at);
                                                                let time_dif = moment.duration(current.diff(happened));
                                                                let time_pasted = time_dif.asSeconds();
                                                                let time_unit = "second";
                                                                if (time_pasted > 60) {
                                                                    time_pasted = time_dif.asMinutes();
                                                                    time_unit = "mins";
                                                                    if (time_pasted > 60) {
                                                                        time_pasted = time_dif.asHours();
                                                                        time_unit = "hours";
                                                                        if (time_pasted > 24) {
                                                                            time_pasted = time_dif.asDays();
                                                                            time_unit = "days";
                                                                            if (time_pasted > 30) {
                                                                                time_pasted = time_dif.asMonths();
                                                                                time_unit = "months";
                                                                                if (time_pasted > 12) {
                                                                                    time_pasted = time_dif.asYears();
                                                                                    time_unit = "years";
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                                return (
                                                                    <tr key={i}>
                                                                        <td className="trading-type">{t.event_type}</td>
                                                                        <td>{t.item_id &&
                                                                            <Link to={"/marketplace" + t.item_id._id}>
                                                                                <img className="m-r-10" alt="profile" src={t.item_id.image_url} width="24px" style={{ "borderRadius": "50%" }} />
                                                                                <span>{t.item_id.name}</span>
                                                                            </Link>
                                                                        }</td>
                                                                        <td>{t.price ? convertToETH(t.price) : ""}</td>
                                                                        <td>
                                                                            {from_img &&
                                                                                <img className="m-r-10" alt="profile" src={from_img} width="24px" style={{ "borderRadius": "50%" }} />
                                                                            }
                                                                            <span>{from_name}</span>
                                                                        </td>
                                                                        <td>
                                                                            {to_img &&
                                                                                <img className="m-r-10" alt="profile" src={to_img} width="24px" style={{ "borderRadius": "50%" }} />
                                                                            }
                                                                            <span>{to_name}</span>
                                                                        </td>
                                                                        <td>{Math.floor(time_pasted) + " " + time_unit + " ago"}</td>
                                                                    </tr>
                                                                )
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

        )
    }
}

export default Profile;