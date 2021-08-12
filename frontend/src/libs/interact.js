import { pinJSONToIPFS, pinFileToIPFS } from "./pinata.js";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from 'web3';
import Web3Modal from "web3modal";
const marketABI = require(process.env.REACT_APP_CONTRACT).abi;
const marketAddress = process.env.REACT_APP_CONTRACTADDRESS;

const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          97: "https://data-seed-prebsc-1-s1.binance.org:8545/"
        },
        network: "bsc"
      }
    }
  }
})

var web3;
var provider;
var accounts;
var address;
var networkId;
var chainId;

/*
  1 -> Market Contract
  2 -> NFT Contract
*/
function loadContract() {
    return new web3.eth.Contract(marketABI, marketAddress);
}

// Convert BNB to wei
function bToW(bnb){
  if (window.ethereum) {
    try {
      return web3.utils.toWei(bnb, 'ether');
    } catch (err) {
      console.log(err);
    }
  }
}

export const PriceBTOW = (b) =>{
  return bToW(b);
}

async function init() {
  if (web3Modal.cachedProvider) {
    provider = await web3Modal.connect();
    await subscribeProvider(provider);
    web3 = new Web3(provider);
    web3.eth.extend({
      methods: [
        {
          name: "chainId",
          call: "eth_chainId",
          outputFormatter: web3.utils.hexToNumber
        }
      ]
    });
    accounts = await web3.eth.getAccounts();
    address = accounts[0];
    networkId = await web3.eth.net.getId();
    chainId = await web3.eth.chainId();
  }
}

async function subscribeProvider(provider) {
  if (!provider.on) {
    return;
  }
  provider.on("close", () => console.log(1));
  provider.on("accountsChanged", async (accounts) => {
    console.log("accountsChanged" , accounts[0])
  });
  provider.on("chainChanged", async (chainId) => {
    console.log("chainChanged" , chainId)
  });

  provider.on("networkChanged", async (networkId) => {
    console.log("chainChanged" , networkId)
  });
};

export const connectWallet = async () => {
  try {
    provider = await web3Modal.connect();
  } catch (e) {
    console.log(e);
  }

  if (provider) {
    try {
      web3 = new Web3(provider);
      accounts = await web3.eth.getAccounts();
      address = accounts[0];
      return {
        status: "connected",
        address: address
      };
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" rel="noreferrer" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const getCurrentWalletBalance = async (address) => {
  if (window.ethereum) {
    try {
      return web3.eth.getBalance(address);
    } catch (err) {
      console.log(err);
    }
  }
}

export const getCurrentWalletNFT = async (address) => {
  if (window.ethereum) {
    try {
      window.contract = loadContract();
      return await window.contract.methods.balanceOf(address).call();
    } catch (err) {
      console.log(err);
    }
  }
}

export const listItem = async (token_id, price, address) => {
  if (window.ethereum) {
    let contract = loadContract();
    let listing = await contract.methods.listToken(token_id, price).send({from: address})
    console.log(listing);
    return listing;
  }
}

export const editListing = async (token_id, price, address) => {
  if (window.ethereum) {
    let contract = loadContract();
    let listing = await contract.methods.setPrice(token_id, price).send({from: address})
    return listing;
  }
}

export const purchaseItem = async (token_id, address, price) => {
  if (window.ethereum){
    let contract = loadContract();
    let listed = await contract.methods.isListed(token_id).call();
    console.log("item listed: ", listed);
    if(!listed){
      console.log("not listed");
      return;
    }

    let weiPrice = await bToW(price.toString());
    let purchase = await contract.methods.buyToken(token_id).send({from: address, value: weiPrice});
    return purchase;
  }
}

export const checkListing = async (token_id) => {
  if(window.ethereum){
    let contract = loadContract();
    let listed = await contract.methods.isListed(token_id).call()
    console.log(listed);
  }
}

export const cancelListing = async (token_id, address) => {
  if(window.ethereum){
    let contract = loadContract();
    let cancel = await contract.methods.cancelListing(token_id).send({from: address});
    console.log(cancel);
  }
}

export const convertToETH = (wei) => {
  if (window.ethereum) {
    try {
      return web3.utils.fromWei(wei, 'ether');
    } catch (err) {
      console.log(err);
    }
  }
}

export const disconnectWallet = async () => {
  if (web3 && web3.currentProvider && web3.currentProvider.close) {
    await web3.currentProvider.close();
  }
  await web3Modal.clearCachedProvider();
  web3 = null;
  provider = null;
  address = "";
}

export const getCurrentWallet = async () => {
  await init();
  if (!address) {
    return false;
  } else {
    return {
      address: address,
      status: "Connected",
    };
  }
};

export const mintNFT = async (file, metadata) => {
  if (metadata.name.trim() == "" || metadata.gender.trim() == "" || metadata.birthday.trim() == "") {
    return {
      success: false,
      status: "❗Please make sure all fields are completed before minting.",
    };
  }

  let metaname = metadata.name.toLowerCase().replaceAll(" ", "_");
  let data = new FormData();
  data.append('file', file);
  let postdata = JSON.stringify({
    name: metaname + "_img_" + Date.now(),
    keyvalues: metadata
  })
  data.append('pinataMetadata', postdata);
  const fileResponse = await pinFileToIPFS(data);
  if (!fileResponse.success) {
    return {
      success: false,
      status: "😢 Something went wrong while uploading your tokenURI.",
    }
  }

  metadata['image_url'] = fileResponse.pinataUrl
  postdata = {
    "pinataContent": metadata,
    "pinataMetadata": {
      "name": metaname + "_" + Date.now()
    }
  }
  const pinataResponse = await pinJSONToIPFS(postdata);
  if (!pinataResponse.success) {
    return {
      success: false,
      status: "😢 Something went wrong while uploading your tokenURI.",
    }
  }
  
  const tokenURI = pinataResponse.pinataUrl;
  let nftc = new web3.eth.Contract(marketABI, marketAddress);

  try {
    let data = await nftc.methods.mintNFT(tokenURI).send({from: address})
    return {
      token_id: data.events.Mint.returnValues.tokenId,
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message,
    };
  }
};