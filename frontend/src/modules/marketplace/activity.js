import React, { Component, Fragment } from 'react';
import UserModel from '../../model/UserModel';
import { Link } from 'react-router-dom';
import {
    convertToETH,
    getCurrentWallet
} from "../../libs/interact";
import CreateNFT from "../marketplace/create";
import Profile from "../profile/profile";
import moment from 'moment';

class Activity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            connected: false,
            activities: []
        }
    }

    componentDidMount() {
        getCurrentWallet().then(res => {
            if (!res) {
                this.setState({
                    connected: false
                })
            } else {
                this.setState({
                    connected: true
                })
                this.getProfile(res.address);
            }
        })
    }

    getProfile(address) {
        UserModel.activiy(address).then(res => {
            this.setState({
                activities: res.data.tradings
            })
        })
    }

    renderItem = (data) => {
        console.log(data);
        if (data) {
            return data.map((c, i) => {
                return (
                    <div class="col-12" key={i}>
                        <div class="card p-10">
                            <a href={"/marketplace/" + c._id}>
                                <div class="card-body p-10">
                                    <div className="item-list-detail">
                                        <div className="item-list-detail-info">
                                            <p>{c.text ? c.text : ""}</p>
                                        </div>
                                        {c.listed &&
                                            <div className="item-list-detail-price">
                                                <div className="text-muted">prices</div>
                                                <div>
                                                    <img class="img-thumb" src="/assets/img/bnb.png" height="16" width="16" alt="bnb icon" />
                                                    <span>{c.listed ? convertToETH(c.price) : ""}</span>
                                                </div>
                                            </div>
                                        }
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

    addressFormator(address) {
        return String(address).substring(0, 6) +
            "..." +
            String(address).substring(38)
    }

    renderActivities() {
        return <div className="table-responsive">
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
                    {this.state.activities?.map((t, i) => {
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
                                    <Link to={"/marketplace/" + t.item_id._id}>
                                        <img className="m-r-10" alt="profile" src={t.item_id.image_url} width="24px" style={{ "borderRadius": "50%" }} />
                                        <span>{t.item_id.text}</span>
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
    }

    render() {
        return (
            <Fragment>
                <div className="content-wrapper">
                    <div className="content container">
                        <section className="page-content">
                            <div className="row">
                                <div className="col-sm-12 col-md-12 col-lg-8 col-xl-8 col-xxl-8 card">
                                    <div className="row">
                                        <CreateNFT />
                                    </div>
                                    <div className="row">
                                        <div className="col-12">
                                            <h1>My Activity</h1>
                                        </div>
                                        {this.state.connected ? this.renderActivities() :
                                            <div className="col-12 text-center p-10">
                                                <p>Connect wallet to view this section</p>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div className="col-sm-12 col-md-12 col-lg-4 col-xl-4 col-xxl-4">
                                    <div className="row">
                                        <Profile />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </Fragment>
        );
    }
}

export default Activity;