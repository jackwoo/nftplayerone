import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { mintNFT } from '../../libs/interact';
import ItemModel from '../../libs/ItemModel';
import { getCurrentWallet } from "../../libs/interact";
import FileUpload from "../../libs/fileUpload";

class Create extends Component {

    constructor(props) {
        super(props);
        this.state = {
            image_url: "",
            firstName: "",
            lastName: "",
            birthday: "",
            gender: "Male",
            generated: false,
            item_id: "",
            isCreating: false,
            file: ""
        }
    }

    componentDidMount() {
        // Call verficiation api
        getCurrentWallet().then((response) => {
            if (response.address) {
                this.setState({
                    walletAddress: response.address,
                    connected: true
                })
            } else {
                this.props.history.push("/wallet");
            }
        })
    }

    setURL(url) {
        this.setState({
            url: url
        })
    }

    setFirstName(firstName) {
        this.setState({
            firstName: firstName
        })
    }

    setLastName(lastName) {
        this.setState({
            lastName: lastName
        })
    }

    setBirthday(birthday) {
        this.setState({
            birthday: birthday
        })
    }

    setGender(gender) {
        this.setState({
            gender: gender
        })
    }

    onCreatePressed = async () => {
        this.setState({
            isCreating: true
        })

        let wallet = await getCurrentWallet();
        if (!wallet) {
            this.setState({
                isCreating: false
            })
            return
        }

        let data = {
            name: this.state.lastName + " " + this.state.firstName,
            gender: this.state.gender,
            birthday: this.state.birthday,
            address: wallet.address,
        };

        mintNFT(this.state.image_url, data).then((response) => {
            if (response.success) {
                ItemModel.retrieveByToken(response.token_id).then((res) => {
                    this.setState({
                        generated: true,
                        item_id: res.data,
                        isCreating: false
                    })
                }).catch(e => {
                    console.log(e);
                    this.setState({
                        isCreating: false
                    })
                })
            } else {
                this.setState({
                    isCreating: false
                })
            }
        }).catch(e => {
            console.log(e);
            this.setState({
                isCreating: false
            })
        })
    }

    handleFile(e){
        this.setState({
            file: e.target.files
        })
    }

    handleUpload(data){
        this.setState({image_url: data});
    }

    render() {
        return (
            <Fragment>
                <div className="content-wrapper">
                    <div className="content container">
                        <section className="page-content">
                            <div className="row">
                                <div className="col-md-12">
                                    {this.state.isCreating &&
                                        <div className="card">
                                            <div className="card-body text-center">
                                                <h2>Please do not close the window, we are genrating your NFT!</h2>
                                                <div className="preloader pl-xxl pls-primary">
                                                    <svg className="pl-circular" viewBox="25 25 50 50">
                                                        <circle className="plc-path" cx="50" cy="50" r="20"></circle>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    {this.state.generated &&
                                        <div className="card">
                                            <div className="card-body text-center">
                                                <h1 className="text-center p-20">Congrates, you have successfully created your NFT!</h1>
                                                <div className="m-t-10 m-b-50">
                                                    <img className="Image--image" src="/assets/img/checked.png" width="120" alt="success logo" />
                                                </div>
                                                <Link to="/profile" className="p-20">
                                                    <button className="btn btn-secondary">View NFT</button>
                                                </Link>
                                                <Link to={"/marketplace/" + this.state.item_id} className="p-20">
                                                    <button className="btn btn-primary">Sell NFT</button>
                                                </Link>
                                            </div>
                                        </div>
                                    }
                                    {!this.state.isCreating && !this.state.generated &&
                                        <div className="card">
                                            <div className="card-body">
                                                <h1 className="text-center p-20">Create the ONE & ONLY NFT Representing Yourself</h1>
                                                <div className="row">
                                                    <div className="col-lg-5">
                                                        <FileUpload className="image-preview product-image-preview"
                                                            type="image"
                                                            src={this.state.image_url}
                                                            fileOnly
                                                            onUpload={(d) => this.handleUpload(d)}
                                                        />
                                                    </div>
                                                    <div className="col-lg-7">
                                                        <div className="form-group">
                                                            <label>First Name</label>
                                                            <input type="text" className="form-control" placeholder="First Name" onChange={(e) => this.setFirstName(e.target.value)} />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Last Name</label>
                                                            <input type="text" className="form-control" placeholder="Last Name" onChange={(e) => this.setLastName(e.target.value)} />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Gender</label>
                                                            <select className="form-control" onChange={(e) => this.setGender(e.target.value)} defaultValue="Male">
                                                                <option value="Male">Male</option>
                                                                <option value="Female">Female</option>
                                                                <option value="Other">Other</option>
                                                                <option value="Not To Say">Perfer not to say</option>
                                                            </select>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Birthday</label>
                                                            <input type="date" className="form-control" placeholder="Birthday" onChange={(e) => this.setBirthday(e.target.value)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-footer bg-light">
                                                <div className="form-actions">
                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <button className="btn btn-primary btn-rounded" onClick={() => this.onCreatePressed()}>Create</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </Fragment >
        );
    }
}

export default Create;
