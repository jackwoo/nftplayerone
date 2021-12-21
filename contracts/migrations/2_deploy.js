const NFT = artifacts.require('NFT.sol');
const Market = artifacts.require('Market.sol');
const Mintgle = artifacts.require('Mintgle.sol');

module.exports = async function (deployer, network, addresses) {
  // const [admin, _] = addresses;/

  // if (network === 'develop') {
  //   //await deployer.deploy(NFT, admin);
  //   //const nft = await NFT.deployed();
  //   await deployer.deploy(Market, admin, admin);
  // }

  // if (network == 'bscTestnet') {
  //   // admin address
  //   const ADMIN = '0xfE9Bb0D31791FCCc86D7B57032d3b49a95da4118';
  //   //await deployer.deploy(NFT, ADMIN);
  //   //const nft = await NFT.deployed();
  //   await deployer.deploy(Market, ADMIN, ADMIN);
  // }

  // if (network === 'bsc') {
  //   //Deployment logic for mainnet
  // }

  const SIGNER = '0xEFAAA03044E4C5f751A50E50aD6E0E804dc00E5b';
  deployer.deploy(Mintgle, SIGNER);


};