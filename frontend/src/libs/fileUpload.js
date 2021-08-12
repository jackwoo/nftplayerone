import React, { Component, Fragment } from 'react';
import axios from 'axios';
const API_HOST = process.env.REACT_APP_API_URL;

class FileUpload extends Component {

    constructor(props) {
        super(props);
        this.inputRef = React.createRef();
    }

    handleClick(e) {
        this.inputRef.current.click();
    }

    handleUpload(e) {
        let files = e.target.files || e.dataTransfer.files;
        if (!files.length)
            return;
        // check file type
        let file = files[0];
        let mime = file.type.toLowerCase()
        if (this.props.type == 'image') {
            // check that file is an image
            if (['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].indexOf(mime) == -1) {
                alert('Please choose an image.');
                return;
            }
        }

        if(this.props.fileOnly){
            this.props.onUpload(file);
            return;
        }

        const url = API_HOST + "/upload";
        const formData = new FormData();
        formData.append('file', file)
        if (typeof this.props.folder !== 'undefined') {
            formData.append('folder', this.props.folder);
        }
        const cfg = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        }
        axios.post(url, formData, cfg).then(response => {
            let data = response.data.data;
            if (this.props.onUpload) {
                this.props.onUpload(data);
            }
        }).catch(error => console.log(error))
    }

    displayImage(src){
        if(this.props.fileOnly){
            return <img src={URL.createObjectURL(src)} onClick={(e) => this.handleClick(e)} />
        } else {
            return <img src={API_HOST + src} onClick={(e) => this.handleClick(e)} />
        }
    }

    render() {
        let src = "";
        if(this.props.fileOnly){
            src = this.props.src;
        } else if (this.props.src && this.props.src != '' && this.props.type == 'image') {
            src = this.props.src;
        }
        else if (this.props.placeholder && this.props.placeholder != '') {
            src = this.props.placeholder;
        }

        return (
            <div className={this.props.className + ' file-upload'} style={{ "width": "100%" }}>
                <div className="min-h-200">
                    <h5 className="text-center">Profile Image</h5>
                    <div className="dropzone dz-clickable" id="singleFileUpload" onClick={(e) => this.handleClick(e)}>
                        <div className="dz-message needsclick singleFileUpload">
                            {src != "" ?
                                this.displayImage(src)
                                :
                                <Fragment>
                                    <h6 className="card-title text-center p-t-50">Drop files here or click to upload.</h6>
                                    <i className="icon dripicons-cloud-upload gradient-1"></i>
                                    <div className="d-block text-center">
                                        <button type="button" className="btn btn-primary btn-rounded btn-floating btn-lg">Upload</button>
                                    </div>
                                </Fragment>
                            }

                        </div>
                        <input ref={this.inputRef} className="hide" type="file"
                            onChange={(e) => this.handleUpload(e)} />
                    </div>
                </div>
            </div>
        );
    }
}

export default FileUpload;
