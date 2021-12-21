const Mintgle = artifacts.require('Mintgle.sol');

module.exports = async function (deployer, network, addresses) {
  const SIGNER = '0xEFAAA03044E4C5f751A50E50aD6E0E804dc00E5b';
  deployer.deploy(Mintgle, SIGNER);
};
