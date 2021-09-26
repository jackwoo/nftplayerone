import React, { Component, Fragment } from 'react';
import ItemModel from "../../model/ItemModel";
import {
	convertToETH,
	getCurrentWallet
} from "../../libs/interact";
import CreateNFT from "../marketplace/create";
import Profile from "../profile/profile";
import { Modal } from "react-bootstrap";

class Marketplace extends Component {
	constructor(props) {
		super(props);
		this.state = {
			collections: [],
			connected: false,
			fields: {},
			newUser: false
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
			}
			ItemModel.list().then((response) => {
				this.setState({
					collections: response.data
				})
			})
		})
		this.checkNewuser();
	}

	checkNewuser() {
		if (new URLSearchParams(this.props.location.search).get("newuser")) {
			this.setState({
				newUser: true
			})
		}
	}

	renderMsg() {
		if (this.state.collections.length == 0) {
			return <div class="col-12 text-center p-20">No NFT yet, create the first one now!</div>
		}
		return this.state.collections.map((c, i) => {
			return (
				<div class="col-12" key={i}>
					<div class="card m-b-10">
						<a href={"/marketplace/" + c._id}>
							<div class="card-body p-10">
								<div className="item-list-detail">
									<div className="item-list-detail-info">
										<div className="d-flex">
											<img class="img-thumb" src="/assets/img/default.jpg" width="70" alt="bnb icon" />
											<div className="d-flex flex-column">
												<span className="p-l-10 msg-creator-name">{c.owner.owner_id.nickname != null ? c.owner.owner_id.nickname : this.addressFormator(c.owner.owner_id.address)}</span>
												<p className="p-l-10">{c.text ? c.text : ""}</p>
											</div>
										</div>
									</div>
									<div className="item-list-detail-price">
										<div className="text-muted">prices</div>
										<div>
											<img class="img-thumb" src="/assets/img/bnb.png" height="16" width="16" alt="bnb icon" />
											<span>{c.listed ? convertToETH(c.price) : ""}</span>
										</div>
									</div>
								</div>
							</div>
						</a>
					</div>
				</div>
			)
		})
	}

	addressFormator(address) {
		return String(address).substring(0, 6) +
			"..." +
			String(address).substring(38)
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
											<h1>Home</h1>
										</div>
										{this.renderMsg()}
									</div>
								</div>
								<div className="col-sm-12 col-md-12 col-lg-4 col-xl-4 col-xxl-4">
									<div className="row">
										<Profile newUser={this.state.newUser}/>
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

export default Marketplace;
