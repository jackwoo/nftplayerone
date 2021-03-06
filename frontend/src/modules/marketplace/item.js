import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import ItemModel from '../../model/ItemModel';
import {
    getCurrentWallet,
    purchaseItem,
    editListing,
    cancelListing,
    convertToETH,
    PriceBTOW
} from "../../libs/interact";
import { Modal } from 'react-bootstrap';
import SweetAlert from 'react-bootstrap-sweetalert';
import moment from 'moment';
import ReactTooltip from 'react-tooltip';
import {
    FacebookIcon,
    TwitterIcon,
    TelegramIcon,
    WhatsappIcon,
    FacebookShareButton,
    TelegramShareButton,
    WhatsappShareButton,
    TwitterShareButton
} from "react-share";

const API_HOST = process.env.REACT_APP_API_URL;

class Item extends Component {

    constructor(props) {
        super(props);
        this.state = {
            item: {},
            address: "",
            showPurchase: false,
            confirmPurchase: false,
            onLoading: false,
            onEditListing: false,
            newPrice: 0,
            onCancelListing: false,
            owner: {},
            loading: true,
        }
    }

    componentDidMount() {
        this.retrieveData();
    }

    async retrieveData() {
        this.setState({
            loading: true
        })
        let tokens = window.location.href.split("/");
        let id = tokens[4];
        let address = "";
        await getCurrentWallet().then((response) => {
            if (response) {
                address = response.address;
                this.setState({
                    address: response.address
                })
            }
        })

        ItemModel.retrieve(id, address).then((res) => {
            this.setState({
                item: res.data,
                owner: res.data.owner.owner_id,
                loading: false
            })
        }).catch(e => {
            console.log(e);
        })
    }

    showPurchase() {
        this.setState({
            showPurchase: true
        })
    }

    showEditListing() {
        this.setState({
            onEditListing: true
        })
    }

    showCancelListing() {
        this.setState({
            onCancelListing: true
        })
    }

    closeCancelListing() {
        this.setState({
            onCancelListing: false
        })
    }

    closePurchase() {
        this.setState({
            showPurchase: false
        })
    }

    closeEditListing() {
        this.setState({
            onEditListing: false
        })
    }

    confirmPurchase() {
        this.setState({
            confirmPurchase: !this.state.confirmPurchase
        })
    }

    priceHandler(e) {
        this.setState({
            newPrice: e.target.value
        })
    }

    async purchase() {
        if (!this.state.confirmPurchase) {
            return;
        }
        this.setState({
            showPurchase: false,
            onLoading: true
        })

        let address = "";
        getCurrentWallet().then((response) => {
            if (response) {
                address = response.address
            }
            purchaseItem(this.state.item.token_id, address, this.state.item.price).then(res => {
                this.setState({
                    onLoading: false
                })
            }).catch(e => {
                this.setState({
                    showPurchase: true,
                    onLoading: false
                })
                console.log(e);
            })
        })
    }

    async editPrice() {
        this.setState({
            onEditListing: false,
            onLoading: true
        })
        let price = this.state.newPrice;
        // Validate if the input is a valid postive float
        if (isNaN(price) || Number(price) <= 0) {
            return;
        } else {
            price = PriceBTOW(price);
        }

        let address = "";
        getCurrentWallet().then(response => {
            if (response) {
                address = response.address
            }
            let token_id = this.state.item.token_id;
            editListing(token_id, price, address).then(res => {
                this.retrieveData();
                this.setState({
                    onLoading: false
                })
            }).catch(e => {
                console.log(e);
            })
        })
    }

    async cancelListing() {
        this.setState({
            onCancelListing: false,
            onLoading: true
        })

        let address = "";
        getCurrentWallet().then(response => {
            if (response) {
                address = response.address
            }
            cancelListing(this.state.item.token_id, address).then(res => {
                this.retrieveData();
                this.setState({
                    onLoading: false
                })
            }).catch(e => {
                console.log(e);
                this.setState({
                    onLoading: false
                })
            })
        })
    }

    renderHistory() {
        return this.state.item.trading_history?.map((t, i) => {
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
                    <td>{t.price ?
                        <Fragment>
                            <img className="img-thumb" src="/assets/img/bnb.png" height="16" width="16" alt="thumbnail" />
                            <span className="trading-price">{convertToETH(t.price)}</span>
                        </Fragment>
                        : ""}</td>
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
        })
    }

    render() {
        if (this.state.loading) {
            return (
                <Fragment>
                    <div className="row text-center">
                        <div className="preloader pl-xl pls-primary">
                            <svg className="pl-circular" viewBox="25 25 50 50">
                                <circle className="plc-path" cx="50" cy="50" r="20"></circle>
                            </svg>
                        </div>
                    </div>
                </Fragment>
            )
        }

        return (
            <Fragment>
                {this.state.item.isOwner &&
                    <div className="item-controller">
                        <div className="row">
                            <div className="text-right col-12">
                                {this.state.item.listed ?
                                    <Fragment>
                                        <button className="btn btn-secondary" onClick={() => this.showCancelListing()}>Cancel</button>
                                        <button className="btn btn-primary" onClick={() => this.showEditListing()}>Change Price</button>
                                    </Fragment>
                                    :
                                    <Link to={"/marketplace/" + this.state.item._id + "/sell"}>
                                        <button className="btn btn-primary">Sell</button>
                                    </Link>
                                }
                            </div>
                        </div>
                    </div>
                }
                <div className="content-wrapper">
                    <div className="content container">
                        <section className="page-content">
                            <div className="row">
                                <div className="col-md-12 col-lg-5">
                                    <div className="card p-20">
                                        <p>{this.state.item.text}</p>
                                    </div>
                                </div>

                                <div className="col-md-12 col-lg-7">
                                    <section className="m-b-10 d-flex justify-content-between">
                                        <div className="d-flex align-items-center">
                                            <a href="#!">
                                                <div className="rounded-image-container">
                                                    <img alt="profile" src={this.state.owner.image_url ? this.state.owner.image_url : "/assets/img/default.jpg"} />
                                                </div>
                                            </a>
                                            <div className="p-l-10 p-r-20 ">Owned by
                                                <span className="msg-creator-name">{this.state.owner.username ? this.state.owner.username : " " + String(this.state.owner.address).substring(0, 6).toUpperCase()}</span>
                                            </div>
                                        </div>
                                        <section className="m-b-15">
                                            <button type="button" className="btn btn-secondary item-function-btn" data-tip="Refesh Metadata" onClick={() => this.retrieveData()}>
                                                <i className="icon dripicons-clockwise"></i>
                                            </button>
                                            <button type="button"
                                                class="btn btn-secondary dropdown item-function-btn"
                                                data-toggle="dropdown" aria-expanded="false" data-tip="Share"
                                                style={{ "borderTopLeftRadius": "0px", "borderBottomLeftRadius": "0px" }}>
                                                <i class="zmdi zmdi-share zmdi-hc-fw"></i>
                                            </button>
                                            <div class="dropdown-menu menu-icons dropdown-menu-right share-dropdown" x-placement="bottom-start">
                                                <li>
                                                    <FacebookShareButton url={window.location.href} className="share-btn">
                                                        <FacebookIcon size={24} round={true} />
                                                        <span>Share on Facebook</span>
                                                    </FacebookShareButton>
                                                </li>
                                                <li>
                                                    <TwitterShareButton url={window.location.href} className="share-btn">
                                                        <TwitterIcon size={24} round={true} />
                                                        <span>Share in Twitter</span>
                                                    </TwitterShareButton>
                                                </li>
                                                <li>
                                                    <TelegramShareButton url={window.location.href} className="share-btn">
                                                        <TelegramIcon size={24} round={true} />
                                                        <span>Share in Telegram</span>
                                                    </TelegramShareButton>
                                                </li>
                                                <li>
                                                    <WhatsappShareButton url={window.location.href} className="share-btn">
                                                        <WhatsappIcon size={24} round={true} />
                                                        <span>Share in Whatsapp</span>
                                                    </WhatsappShareButton>
                                                </li>
                                            </div>
                                            <ReactTooltip />
                                        </section>
                                    </section>
                                    {this.state.item.listed &&
                                        <div className="card">
                                            <div className="card-body">
                                                <p className="card-text m-b-5"><span className="text-muted m-r-5">Price</span></p>
                                                <h2 className="card-title m-b-5"><img className="img-thumb" src="/assets/img/bnb.png" height="20" width="20" alt="thumbnail" /> {convertToETH(this.state.item.price)}</h2>
                                                {!this.state.item.isOwner &&
                                                    <button className="btn btn-primary" onClick={() => this.showPurchase()}>Buy Now</button>
                                                }

                                            </div>
                                        </div>
                                    }
                                    <div className="card">
                                        <div className="card-header" data-q-action="card-collapsed">
                                            <strong>Price History</strong>
                                            <div className="actions top-right">
                                                <i className="icon dripicons-chevron-down"></i>
                                            </div>
                                        </div>
                                        <div className="card-body block-el">
                                            No Trading Data Yet
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    <div className="card">
                                        <div className="card-header" data-q-action="card-collapsed">
                                            <strong>Trading History</strong>
                                            <div className="actions top-right">
                                                <i className="icon dripicons-chevron-down"></i>
                                            </div>
                                        </div>
                                        <div className="card-body block-el">
                                            <div className="table-responsive">
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Event</th>
                                                            <th>Price</th>
                                                            <th>From</th>
                                                            <th>To</th>
                                                            <th>Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {this.renderHistory()}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <Modal dialogClassName="modal-lg" show={this.state.showPurchase} onHide={() => this.closePurchase()} centered>
                    <Modal.Header className="align-items-center" closeButton>
                        <h2 className="text-center m-0">Check Out</h2>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container p-20">
                            <div className="d-flex flex-row justify-content-between align-items-center">
                                <div className="justify-content-start">
                                    <strong>Item</strong>
                                </div>
                                <div className="justify-content-end">
                                    <strong>Subtotal</strong>
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex flex-row justify-content-between align-items-center">
                                <div className="justify-content-start">
                                    <img className="img-thumb" src={API_HOST + this.state.item.image_url} height="50px" width="50px" alt="thumbnail" />
                                    <span className="p-l-10">{this.state.item.name}</span>
                                </div>
                                <div className="justify-content-end">
                                    <img className="img-thumb" src="/assets/img/bnb.png" height="16" width="16" alt="thumbnail" />
                                    <span className="text-muted p-l-5">{this.state.item.price}</span>
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex flex-row justify-content-between align-items-center">
                                <div className="justify-content-start">
                                    <strong>Total</strong>
                                </div>
                                <div className="justify-content-end">
                                    <img className="img-thumb" src="/assets/img/bnb.png" height="16" width="16" alt="thumbnail" />
                                    <strong className="p-l-5">{convertToETH(this.state.item.price)}</strong>
                                </div>
                            </div>
                            <hr />
                            <div className="custom-control custom-checkbox form-check">
                                <input type="checkbox" className="custom-control-input" id="confirm-purchase" checked={this.state.confirmPurchase} onChange={() => this.confirmPurchase()} />
                                <label className="custom-control-label" for="confirm-purchase">By checking this box, I agree to Friend For Sale's Terms of Service</label>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="justify-content-center">
                        <div className="text-center">
                            <button className="btn btn-primary" disabled={!this.state.confirmPurchase} onClick={() => this.purchase()}>
                                Checkout
                            </button>
                        </div>
                    </Modal.Footer>
                </Modal>

                <Modal dialogClassName="modal-lg" show={this.state.onEditListing} onHide={() => this.closeEditListing()} centered>
                    <Modal.Header className="align-items-center" closeButton>
                        <h2 className="text-center m-0">Change Price</h2>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container">
                            <div className="form-group">
                                <label for="demoTextInput1">New Price</label>
                                <div className="input-group mb-2 mr-sm-2">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text">
                                            <img className="img-thumb" src="/assets/img/bnb.png" height="20" width="20" alt="thumbnail" />
                                        </div>
                                    </div>
                                    <input type="text" className="form-control" placeholder="Price" onChange={(e) => this.priceHandler(e)} />
                                </div>
                            </div>
                        </div>

                    </Modal.Body>
                    <Modal.Footer className="justify-content-center">
                        <div className="text-center">
                            <button className="btn btn-primary" onClick={() => this.editPrice()}>
                                Update Price
                            </button>
                        </div>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.onLoading} centered>
                    <Modal.Body>
                        <div className="container text-center p-20">
                            <h3>We are processing your requrest, please do not close the window</h3>
                            <div className="preloader pl-xl pls-primary">
                                <svg className="pl-circular" viewBox="25 25 50 50">
                                    <circle className="plc-path" cx="50" cy="50" r="20"></circle>
                                </svg>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>

                <SweetAlert
                    warning
                    showCancel
                    confirmBtnText="Confirm"
                    confirmBtnBsStyle="danger"
                    title="Are you sure?"
                    onConfirm={() => this.cancelListing()}
                    onCancel={() => this.closeCancelListing()}
                    show={this.state.onCancelListing}
                    customButtons={
                        <Fragment>
                            <button className="btn btn-secondary m-r-10" onClick={() => this.closeCancelListing()}>Cancel</button>
                            <button className="btn btn-danger m-l-10" onClick={() => this.cancelListing()}>Confirm</button>
                        </Fragment>
                    }
                >
                    Are you sure you want to cancel the listing?
                </SweetAlert>
            </Fragment >
        );
    }
}

export default Item;
