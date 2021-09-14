import React, { Component, Fragment } from 'react';
import ItemModel from "../../libs/ItemModel";
import {
	convertToETH,
	getCurrentWallet
} from "../../libs/interact";
import CreateNFT from "../marketplace/create";

class Marketplace extends Component {
	constructor(props) {
		super(props);
		this.state = {
			collections: []
		}
	}

	componentDidMount() {
		getCurrentWallet().then((res) => {
			ItemModel.list().then((response) => {
				this.setState({
					collections: response.data
				})
			})
		})
	}

	render() {
		return (
			<Fragment>
				<div className="content-wrapper">
					<div className="content container">
						<section className="page-content">
							<div className="row">
								<div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xxl-12 card">
									<div className="row">
										<CreateNFT/>
									</div>
									<div className="row">
										{this.state.collections.map((c, i) => {
											return (
												<div class="col-12" key={i}>
													<div class="card p-10">
														<a href={"/marketplace/" + c._id}>
															<div class="card-body p-10">
																<div className="item-list-detail">
																	<div className="item-list-detail-info">
																		<p>{c.text ? c.text : ""}</p>
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
										})}
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
