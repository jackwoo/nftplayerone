import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import {
    getCurrentWallet,
} from "../../libs/interact";
import UserModel from '../../model/UserModel';
import moment from "moment";
import { Modal } from "react-bootstrap";
const API_HOST = process.env.REACT_APP_API_URL;

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            connected: false,
            walletAddress: "",
            items: [],
            profile: {},
            fields: {},
            showProfile: false
        }
    }

    componentDidMount() {
        getCurrentWallet().then((res) => {
            if (res.address) {
                this.setState({
                    walletAddress: res.address,
                    connected: true
                })
            } else {
                window.location.replace("/");
            }
        })
        if(this.props.newUser){
            this.setState({
                showProfile: true
            })
        }
        this.getProfile();
    }


    getProfile() {
        UserModel.profile().then(res => {
            let fields = {};
            fields["nickname"] = res.data.nickname;
            fields["fullname"] = res.data.fullname;
            if(res.data.dob){
                let dob = res.data.dob.split("-");
                fields["dobY"] = dob[0];
                fields["dobM"] = dob[1];
                fields["dobD"] = dob[2];
            }

            this.setState({
                profile: res.data,
                fields: fields
            })
        })
    }

    saveProfile() {
		let fields = this.state.fields;
		let data = {}
		if(fields.nickname){
			data["nickname"] = fields.nickname;
		}

		if(fields.fullname){
			data["fullname"] = fields.fullname;
		}

		if(fields.gender){
			data["gender"] = fields.gender;
		}

		if(fields.dobY && fields.dobM && fields.dobD){
			data["dob"] = `${fields.dobY}-${fields.dobM}-${fields.dobD}`;
		}

		UserModel.updateProfile(data).then(res => {
			console.log(res.data);
		}).catch(e => {
			console.log(e);
		})
		window.location.reload();
	}

	handleChange(field, e) {
		let fields = this.state.fields;
		fields[field] = e.target.value;
		this.setState({ fields });
	}

	closeProfile() {
		this.setState({
			showProfile: false
		})
	}

    renderDobY() {
		let options = []
		for (let i = moment().year(); i > 1900; i--) {
			options.push(i);
		}

		return (
			<Fragment>
				<option disabled selected>YYYY</option>
				{
					options.map(function (mark, i) {
						return <option
							key={i}
							value={mark}>
							{mark}
						</option>
					})
				}
			</Fragment>
		);
	}

	renderDobM() {
		let options = []
		for (let i = 1; i < 13; i++) {
			options.push(i);
		}

		return <Fragment>
			<option disabled selected>MM</option>
			{
				options.map(function (mark, i) {
					return <option
						key={i}
						value={mark}>
						{mark}
					</option>
				})
			}
		</Fragment>
	}

	renderDobD() {
		let options = []
		for (let i = 1; i < 32; i++) {
			options.push(i);
		}

		return <Fragment>
			<option disabled selected>DD</option>
			{
				options.map(function (mark, i) {
					return <option
						key={i}
						value={mark}>
						{mark}
					</option>
				})
			}
		</Fragment>
	}

    openProfile(){
        this.setState({
            showProfile: true
        })
    }

    render() {
        return (
            <Fragment>
                <div className="col-12">
                    <div className="card card-pills">
                        <div className="card-header">
                            <div className="d-flex m-b-50">
                                <div>
                                    <img className="profile-image" src={this.state.profile.image_url ? API_HOST + this.state.profile.image_url : "/assets/img/default.jpg"} alt="profile" width="50" />
                                </div>
                                <div className="p-l-10">
                                    <h4>{this.state.profile.nickname ? this.state.profile.nickname : "Unnamed"}</h4>
                                    <div className="fb-page-description">{
                                        String(this.state.walletAddress).substring(0, 6) +
                                        "..." +
                                        String(this.state.walletAddress).substring(38)
                                    }</div>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="d-flex flex-column side-nav">
                                <div className="p-2"><Link to="/home">Home</Link></div>
                                <div className="p-2"><Link to="/creation">Moments Minted</Link></div>
                                <div className="p-2"><Link to="/inwallet">NFTs Owned</Link></div>
                                <div className="p-2"><Link to="/activity">My Activity</Link></div>
                                <div className="p-2"><button className="btn profile-btn" onClick={() => this.openProfile()}>My Profile</button></div>
                            </div>
                        </div>
                    </div>
                </div>
                <Modal dialogClassName="modal-lg" show={this.state.showProfile} onHide={() => this.closeProfile()} centered>
					<Modal.Header className="align-items-center" closeButton>
						<h2 className="text-center m-0">My Profile</h2>
					</Modal.Header>
					<Modal.Body>
						<div className="container">
							<div className="form-group">
								<label for="demoTextInput1">Nickname*</label>
								<div className="input-group mb-2 mr-sm-2">
									<input type="text" className="form-control" placeholder="Nickename" onChange={this.handleChange.bind(this, "nickname")}
										value={this.state.fields["nickname"]} />
								</div>
							</div>
							<div className="form-group">
								<label for="demoTextInput1">Full Name</label>
								<div className="input-group mb-2 mr-sm-2">
									<input type="text" className="form-control" placeholder="Full name" onChange={this.handleChange.bind(this, "fullname")}
										value={this.state.fields["fullname"]} />
								</div>
							</div>
							<div className="form-group">
								<label for="demoTextInput1">Gender</label>
								<div className="input-group mb-2 mr-sm-2">
									<select class="form-control form-select" onChange={this.handleChange.bind(this, "gender")}
										value={this.state.fields["gender"]}>
										<option value="1">Male</option>
										<option value="2">Female</option>
										<option value="0">Don't want to disclose</option>
									</select>
								</div>
							</div>
							<div className="form-group">
								<label for="demoTextInput1">Date of Birth</label>
								<div className="d-flex">
									<select class="form-control form-select m-2" onChange={this.handleChange.bind(this, "dobY")}
										value={this.state.fields["dobY"]}>
										{this.renderDobY()}
									</select>
									<select class="form-control form-select m-2" onChange={this.handleChange.bind(this, "dobM")}
										value={this.state.fields["dobM"]}>
										{this.renderDobM()}
									</select>
									<select class="form-control form-select m-2" onChange={this.handleChange.bind(this, "dobD")}
										value={this.state.fields["dobD"]}>
										{this.renderDobD()}
									</select>
								</div>
							</div>
						</div>

					</Modal.Body>
					<Modal.Footer className="justify-content-center">
						<div className="text-center">
							<button className="btn btn-primary" onClick={() => this.saveProfile()}>
								Save
							</button>
						</div>
					</Modal.Footer>
				</Modal>
            </Fragment>
        )
    }
}

export default Profile;