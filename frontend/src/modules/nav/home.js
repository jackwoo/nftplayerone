import React, { Component, Fragment } from 'react';
import { Link } from "react-router-dom";
import UserModel from '../../model/UserModel';
import { connectWallet } from "../../libs/interact";

class Home extends Component {

	constructor(props) {
		super(props);
		this.state = {
			item: {}
		}
	}

	connect() {
		connectWallet().then((response) => {
			let data = {
				address: response.address
			}
			UserModel.connect(data).then(res => {
				this.storeToken(res.data.token);
				let redirect = "/home";
				if (res.data.newUser) {
					redirect += "?newuser=true"
				}
				window.location.replace(redirect);
			}).catch(e => {
				console.log(e);
			})
		}).catch(e => {
			console.log(e);
		})
	}

	storeToken(data) {
		UserModel.storeToken(data);
	}

	render() {
		return (
			<Fragment>
				<div className="content-wrapper">
					<div className="content container">
						<section className="padding-xl center hero">
							<div className="d-flex flex-column justify-content-center align-items-center">
								<h1 className="featured-title">NFT Player One <span className="flashing-content">|</span></h1>
								<p className="featured-subtitle text-center">NFTPlayerOne is like <span className="highlight-yellow">Twitter but every tweet is an NFT & can be transacted.</span><br />
									Have a marvelous achievement, or a memorable event, or came up with some words of wisdom?Mint it into an NFT which stays permanently on the blockchain.<br />
									<span className="highlight-yellow">Everything worth to be memorized is worth an NFT and will be valuable in the Web3.0 Metaverse.</span>
								</p>
								<button className="btn btn-primary connect-btn m-5" onClick={() => this.connect()}>Connect to My Wallet</button>
								<p>* You earn 3% fee for <span className="highlight-yellow">every transaction</span> of your NFTs.<br />
									* No fees except gas when you mint.<button className="try-now-btn highlight-blue" onClick={() => this.connect()}>Try it Now!</button></p>
							</div>
						</section>
					</div>
				</div >
			</Fragment >
		);
	}
}

export default Home;
