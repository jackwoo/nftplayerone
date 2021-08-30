import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import ItemModel from '../libs/ItemModel';
import {
    getCurrentWallet,
    listItem,
    PriceBTOW,
} from "../libs/interact";
import { Modal } from 'react-bootstrap';

class List extends Component {

    constructor(props) {
        super(props);
        this.state = {
            item: {},
            price: "",
            isLoading: false,
        }
    }

    componentDidMount() {
        let tokens = window.location.href.split("/");
        let id = tokens[4];
        ItemModel.retrieve(id).then((res) => {
            this.setState({
                item: res.data
            })
            // checkListing(res.data.token_id);
        }).catch(e => {
            console.log(e);
        })
    }

    priceHandler(e) {
        this.setState({
            price: e.target.value
        })
    }

    async postListing() {
        this.setState({
            isLoading: true
        })
        let price = this.state.price;
        // Validate if the input is a valid postive float
        if (isNaN(price) || Number(price) <= 0) {
            return;
        } else {
            price = PriceBTOW(price)
        }

        let address = "";
        getCurrentWallet().then((response) => {
            if (response) {
                address = response.address
            }

            let token_id = this.state.item.token_id;
            console.log(price);
            listItem(token_id, price, address).then(response => {
                console.log(response);
                this.setState({
                    isLoading: false,
                    isListed: true,
                })
                window.location.href = "/marketplace/" + this.state.item._id;
            }).catch(e => {
                this.setState({
                    isLoading: false
                })
            })
        })

    }

    render() {
        return (
            <Fragment>
                <div className="row item-controller">
                    <div className="col-12">
                        <div className="container">
                            <div className="row">
                                <Link to={"/marketplace/" + this.state.item._id}>
                                    <i className="icon dripicons-chevron-left"></i>
                                </Link>
                                <img className="img-thumb" src={this.state.item.image_url} height="40" width="40" alt="thumbnail" />
                                <h5 className="item-name">{this.state.item.name}</h5>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="content-wrapper">
                    <div className="content container">
                        <section className="page-content">
                            <div className="row">
                                <div className="col-12 col-md-8">
                                    <div className="card">
                                        <div className="card-body">
                                            <div class="form-group">
                                                <label for="demoTextInput1">Price</label>
                                                <div class="input-group mb-2 mr-sm-2">
                                                    <div class="input-group-prepend">
                                                        <div class="input-group-text">
                                                            <img className="img-thumb" src="/assets/img/bnb.png" height="20" width="20" alt="thumbnail" />
                                                        </div>
                                                    </div>
                                                    <input type="text" class="form-control" placeholder="Price" onChange={(e) => this.priceHandler(e)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-4">
                                    <div className="card">
                                        <div className="card-body">
                                            <div class="list_summary">
                                                <h3><i class="zmdi zmdi-receipt zmdi-hc-fw"></i> Summary</h3>
                                                <hr />
                                                <div class="asset-sell-subheader">Listing</div>
                                                <button class="btn btn-primary" type="button" onClick={() => this.postListing()}>Post your listing</button>
                                                <hr />
                                                <div class="asset-sell-subheader">Fees</div>
                                                <ul>
                                                    <li>
                                                        <span>To Platform</span><span class="separator"></span><span>2.5%</span>
                                                    </li>
                                                    <li>
                                                        <span>To Creator</span><span class="separator"></span><span>2.5%</span>
                                                    </li>
                                                    <li>
                                                        <strong><span>Total</span></strong><span class="separator"></span><strong><span>5%</span></strong>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <Modal show={this.state.isLoading} centered>
                    <Modal.Body>
                        <div className="container text-center p-20">
                            <h3>We are listing your nft to the market, please do not close the window</h3>
                            <div class="preloader pl-xl pls-primary">
                                <svg class="pl-circular" viewBox="25 25 50 50">
                                    <circle class="plc-path" cx="50" cy="50" r="20"></circle>
                                </svg>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
            </Fragment>
        );
    }
}

export default List;
