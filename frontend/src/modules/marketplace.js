import React, { Component, Fragment } from 'react';
import ItemModel from "../libs/ItemModel";
import {
	convertToETH,
	getCurrentWallet
} from "../libs/interact";
const API_HOST = process.env.REACT_APP_API_URL;

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
				console.log(response.data);
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
								<div className="col-sm-12 col-md-12 col-lg-3 col-xl-3 col-xxl-2">
									<div className="card card-menu">
										<div className="card-header">Category</div>
										<div className="card-body p-10">
											<ul className="nav metismenu">
												<li className="nav-dropdown active">
													<a className="has-arrow" href="#!" aria-expanded="false"><span>Gender</span></a>
													<ul className="collapse in nav-sub">
														<li><a href="#!"><span>Male</span></a></li>
														<li className="active"><a href="#!"><span>Female</span></a></li>
													</ul>
												</li>
											</ul>
										</div>
									</div>
								</div>
								<div className="col-sm-12 col-md-12 col-lg-9 col-xl-9 col-xxl-10">
									<div className="row">
										{this.state.collections.map((c, i) => {
											return (
												<div className="col-xs-6 col-md-6 col-lg-4 col-xl-4" key={i}>
													<div className="card p-20">
														<a href={"/marketplace/" + c._id}>
															<div className="card-img-top-container">
																<img className="card-img-top" src={c.image_url} alt="" />
															</div>
															<div className="card-body p-10">
																<div className="row m-t-20">
																	<div className="col-7">
																		<h5 className="m-b-6">{c.name}</h5>
																	</div>
																	<div className="text-right col-5">
																		{c.listed &&
																			<p className="card-text">
																				<img className="img-thumb" src="/assets/img/bnb.png" height="16" width="16" alt="bnb icon" />
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
