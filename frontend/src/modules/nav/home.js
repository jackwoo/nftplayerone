import React, { Component, Fragment } from 'react';
import { Link } from "react-router-dom"
import ItemModel from "../../libs/ItemModel";

class Home extends Component {

	constructor(props) {
		super(props);
		this.state = {
			item: {}
		}
	}

	componentDidMount() {
		this.getItem();
	}

	getItem() {
		ItemModel.getFeatured().then(res => {
			this.setState({
				item: res.data
			})
		}).catch(err => {
			console.log(err);
		})
	}

	render() {
		return (
			<Fragment>
				<div className="featured-background-container">
					<div className="featured-background"></div>
				</div>
				<div className="content-wrapper">
					<div className="content container">
						<section className="page-content home-featured-section">
							<div className="row">
								<div className="col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6">
									<h1 className="featured-title">The ONE & ONLY NFT Representing Yourself</h1>
									<h2 className="featured-subtitle">Play NFTPlayerOne not just for fun, but to be rich.</h2>
									<a href="/marketplace"><button className="btn btn-info featured-btn">Explore</button></a>
									<a href="/mynft"><button className="btn btn-secondary featured-btn">Create</button></a>
								</div>
								{this.state.item._id &&
									<div className="col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6">
										<Link to={"/marketplace/" + this.state.item._id}>
											<div className="card">
												<div className="card-content">
													<div className="card-body">
														<div className="media">
															<img className="align-self-center mr-3 w-40 rounded-circle" 
																src={this.state.item.onwer ? this.state.item.owner.image_url : "/assets/img/default.jpg"} alt="profile" />
															<div className="media-body text-left">
																<span><a href="#!">{this.state.item.onwer ? this.state.item.owner.username : "Unnamed"}</a></span>
																<p className="mb-0">
																	<strong className="">{this.state.item.text}</strong>
																</p>
															</div>
														</div>
													</div>
												</div>
											</div>
										</Link>
									</div>
								}
							</div>
						</section>
					</div>
				</div>
			</Fragment>
		);
	}
}

export default Home;
