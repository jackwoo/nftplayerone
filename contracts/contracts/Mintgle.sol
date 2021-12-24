// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Mintgle is ERC721URIStorage, Ownable, ReentrancyGuard {
    using Address for address;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    struct Offerer {
        address buyer;
        uint256 amount;
    }

    event Mint(uint256 indexed tokenId, address indexed creator, string tokenURI, uint256 price, uint256 timestamp);
    event ChangePrice(uint256 indexed tokenId, uint256 price, uint256 timestamp);
    event Offer(uint256 indexed tokenId, address indexed buyer, uint256 amount, uint256 timestamp);
    event Transfer(uint256 indexed tokenId, address indexed from, address indexed to, uint256 amount, uint256 timestamp);

    mapping (uint256 => address) private _creators;
    mapping (uint256 => uint256) private _prices;
    mapping (uint256 => Offerer) private _offers;

    constructor()
    ERC721("Mintgle", "MTGL")
    {
    }

    function creatorOf(uint256 tokenId) public view returns (address){
        return _creators[tokenId];
    }

    function offerFor(uint256 tokenId) public view returns (Offerer memory) {
        return _offers[tokenId];
    }

    function makeOffer(uint256 tokenId) public payable nonReentrant{
        require(_creators[tokenId] != address(0), "NFT has not been minted");

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
        require(_isApprovedOrOwner(_msgSender(), tokenId), "caller is not owner nor approved");
        
        // check offer exists
        Offerer memory offer = offerFor(tokenId);
        require(offer.amount > 0, "no offer exists");

        // transfer
        _processOffer(offer, tokenId);
    }

    function mintgle(string memory tokenURI, uint256 price) public nonReentrant returns (uint256) {
        _tokenIds.increment();

        uint256 tokenId = _tokenIds.current();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        _creators[tokenId] = msg.sender;
        _prices[tokenId] = price;

        emit Mint(tokenId, msg.sender, tokenURI, price, block.timestamp);
        return tokenId;
    }

    function setPrice(uint256 tokenId, uint256 price) public nonReentrant {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "caller is not owner nor approved");

        _prices[tokenId] = price;
        emit ChangePrice(tokenId, price, block.timestamp);
    }

    function getPrice(uint256 tokenId) public view returns (uint256) {
        return _prices[tokenId];
    }

    function buy(uint256 tokenId) public payable nonReentrant {
        require(_creators[tokenId] != address(0), "NFT has not been minted");
        require(_prices[tokenId] > 0, "NFT does not have a fixed price.");
        require(msg.value >= _prices[tokenId], "Value is not enough to pay for the price");

        Offerer memory offer;
        offer.amount = msg.value;
        offer.buyer = msg.sender;

        _processOffer(offer, tokenId);
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
        _prices[tokenId] = 0;
        emit Transfer(tokenId, owner, offer.buyer, amount, block.timestamp);
    }
}
