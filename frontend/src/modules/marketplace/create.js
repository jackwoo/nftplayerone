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
            text: "",
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

    setText(text) {
        this.setState({
            text: text
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
            text: this.state.text
        };

        mintNFT(data).then((response) => {
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

    render() {
        return (
            <Fragment>
                <div className="content-wrapper">
                    <div className="content container">
                        <section className="page-content" style={{"padding": "0px"}}>
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
                                                <h1 className="p-20">Congrates, you have successfully created your NFT!</h1>
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
                                        <div className="create-card">
                                            <h1 className="p-b-10">What's Happening <span className="flashing-content">|</span></h1>
                                            <div className="form-group">
                                                <textarea className="form-control" rows="6" placeholder="Message.." onChange={(e) => this.setText(e.target.value)} />
                                            </div>
                                            <div className="row">
                                                <div className="col-md-12 text-right">
                                                    <button className="btn btn-primary btn-rounded" onClick={() => this.onCreatePressed()}>Mint</button>
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
