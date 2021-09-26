import React, { Component, Fragment } from 'react';
import UserModel from '../../model/UserModel';
import {
	convertToETH,
	getCurrentWallet
} from "../../libs/interact";
import CreateNFT from "../marketplace/create";
import Profile from "../profile/profile";

class Creation extends Component {
	constructor(props) {
		super(props);
		this.state = {
			connected: false,
			creations: []
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
		UserModel.profile(address).then(res => {
			this.setState({
				creations: res.data.nft
			})
		})
	}

	renderItem = (data) => {
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
											<h1>Creation</h1>
										</div>
										{this.state.connected ? this.renderItem(this.state.creations) :
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

export default Creation;
