// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Mintgle is ERC721, Ownable, ReentrancyGuard {
    using Address for address;

    struct Offerer {
        address buyer;
        uint256 amount;
    }

    event Mint(uint256 tokenId, address creator, uint256 timestamp);
    event Offer(uint256 tokenId, address buyer, uint256 amount, uint256 timestamp);
    event Transfer(uint256 tokenId, address from, address to, uint256 amount, uint256 timestamp);

    address private _signer;
    mapping (uint256 => address) private _creators;
    mapping (uint256 => Offerer) private _offers;

    constructor(address signer)
    ERC721("Mintgle", "MTGL")
    {
        _signer = signer;
    }

    function setSigner(address signer) public onlyOwner {
        _signer = signer;
    }

    function getSigner() public view returns (address) {
        return _signer;
    }

    uint256 constant chainId = 1337;
    address constant verifyingContract = 0x1C56346CD2A2Bf3202F771f50d3D14a367B48070;
    bytes32 private constant DOMAIN_SEPARATOR = keccak256(abi.encode(
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
        keccak256("Mintgle"),
        keccak256("2"),
        chainId,
        verifyingContract
    ));

    function creatorOf(uint256 tokenId) public view returns (address){
        return _creators[tokenId];
    }

    function offerFor(uint256 tokenId) public view returns (Offerer memory) {
        return _offers[tokenId];
    }

    function makeOffer(uint256 tokenId) public payable nonReentrant{
        Offerer memory offer = offerFor(tokenId);
        require(msg.value > offer.amount, "offer amount must be larger than current offer");

        // refund current offer
        if(offer.buyer != address(0)){
            Address.sendValue(payable(offer.buyer), offer.amount);
        }

        // record new offer
        offer.amount = msg.value;
        offer.buyer = msg.sender;
        _offers[tokenId] = offer;
        emit Offer(tokenId, offer.buyer, offer.amount, block.timestamp);
    }

    function acceptOffer(uint256 tokenId) public nonReentrant {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        
        // check offer exists
        Offerer memory offer = offerFor(tokenId);
        require(offer.amount > 0, "no offer exists");

        // transfer
        _processOffer(offer, tokenId);
    }

    function mintAndSell(uint256 tokenId, uint256 nonce, bytes32 r, bytes32 s, uint8 v) public nonReentrant {
        // mint the token and get payment, this is siimlar to accept except the token has not been minted

        // verify the sender
        bytes32 hashed = _hashVoucher(tokenId, msg.sender, nonce);
        require(ecrecover(hashed, v, r, s) == _signer, "Wrong signature");

        // verify that token has not been minted
        require(creatorOf(tokenId) == address(0), "Token has been minted.");

        // verify offer exists
        Offerer memory offer = offerFor(tokenId);
        require(offer.amount > 0, "no offer exists");

        // mint it
        _mintgle(msg.sender, tokenId);

        // transfer
        _processOffer(offer, tokenId);
    }

    function _hashVoucher(uint256 tokenId, address creator, uint256 nonce) private pure returns (bytes32){
        return keccak256(abi.encodePacked(
            "\x19\x01",
        DOMAIN_SEPARATOR,
        keccak256(abi.encode(
                keccak256("Voucher(uint256 tokenId,address creator,uint256 nonce)"),
                tokenId, creator, nonce
            ))
        ));
    }

    function _processOffer(Offerer memory offer, uint256 tokenId) internal {
        address owner = ERC721.ownerOf(tokenId);
        address creator = creatorOf(tokenId);

        // transfer ownership
        ERC721.safeTransferFrom(owner, offer.buyer, tokenId);
 
        // send payment to owner and creator
        uint256 amount = offer.amount;
        uint256 payment = amount * 19 / 20;
        uint256 reward = amount * 3 / 100;
        if(owner != address(0)){
            Address.sendValue(payable(owner), payment);
        }
        if(creator != address(0)){
            Address.sendValue(payable(creator), reward);
        }

        // clear offer
        offer.amount = 0;
        offer.buyer = address(0);
        _offers[tokenId] = offer;
        emit Transfer(tokenId, owner, offer.buyer, amount, block.timestamp);
    }

    function _mintgle(address creator, uint256 tokenId) internal {
        _safeMint(creator, tokenId);
        _creators[tokenId] = creator;
        emit Mint(tokenId, creator, block.timestamp);
    }

    function testMint(uint256 tokenId) public nonReentrant {
        _mintgle(msg.sender, tokenId);
    }
}
