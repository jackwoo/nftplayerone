pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Market is ERC721URIStorage {
    using Address for address;
    using Counters for Counters.Counter;

    struct ListingInfo {
        uint256 price;
        bool onList;
    }

    address payable private _platform;

    address private _admin;

    Counters.Counter private _tokenIds;

    mapping (uint256 => ListingInfo) private _listings;

    mapping (address => bool) private _minted;

    mapping (uint256 => bool) private _verified;

    mapping (uint256 => address) private _creators;

    constructor (address admin_, address payable platform_) ERC721("NFT", "NFT") {
        _admin = admin_;
        _platform = platform_;
    }

    modifier onlyAdmin {
        require (
            msg.sender == _admin,
            "Only admin can call this function"
        );
        _;
    }

    modifier onlyTokenOwner (uint256 tokenId) {
        require (
            ownerOf(tokenId) == msg.sender, 
            "Only token owner can call this function"
        );
        _;
    }

    modifier onlyUnlistedToken (uint256 tokenId) {
        require (
            !isListed(tokenId),
            "Operation cannot be done to listed token"
        );
        _;
    }

    event Listing (
        uint256 tokenId,
        address indexed from,
        uint256 price,
        uint256 timestamp
    );

    event Cancellation (
        uint256 tokenId,
        address indexed from,
        uint256 timestamp
    );

    event Edit (
        uint256 tokenId,
        address indexed from,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 timestamp
    );

    event Purchase (
        uint256 tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 timestamp
    );

    event Mint (
        uint256 tokenId,
        address indexed creator,
        string tokenURI,
        uint256 timestamp
    );

    function hasMinted(address addr) public view returns (bool) {
        return _minted[addr];
    }

    function hasVerified(uint256 tokenId) public view returns (bool) {
        return _verified[tokenId];
    }

    function creatorOf(uint256 tokenId) public view returns (address) 
    {
        return _creators[tokenId];
    }

    function mintNFT(string memory tokenURI) public returns (uint256) {
        // require(!_minted[msg.sender], "This address has already minted a token");
        _tokenIds.increment();

        uint256 newId = _tokenIds.current();
        _safeMint(msg.sender, newId);
        _setTokenURI(newId, tokenURI);
        _creators[newId] = msg.sender;
        _minted[msg.sender] = true;

        emit Mint(
            newId,
            msg.sender,
            tokenURI,
            block.timestamp
        );

        return newId;
    }

    function verify(uint256 tokenId) public onlyAdmin {
        _verified[tokenId] = true;
    }

    function isListed(uint256 tokenId) public view returns (bool) {
        return _listings[tokenId].onList;
    }

    function priceOf(uint256 tokenId) public view returns (uint256) {
        require (isListed(tokenId), "Token not listed");
        return _listings[tokenId].price;
    }

    function approve(address to, uint256 tokenId) public onlyUnlistedToken(tokenId) override {
        super.approve(to, tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) public onlyUnlistedToken(tokenId) override {
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public onlyUnlistedToken(tokenId) override {
        super.safeTransferFrom(from, to, tokenId, _data);
    }

    function listToken(uint256 tokenId, uint256 price) public onlyTokenOwner(tokenId) {
        require (price > 0, "Invalid price");
        require (!isListed(tokenId), "Token already listed");

        _listings[tokenId] = ListingInfo(price, true);

        emit Listing(
            tokenId,
            msg.sender,
            price,
            block.timestamp
        );
    }

    function cancelListing(uint256 tokenId) public onlyTokenOwner(tokenId) {
        require (isListed(tokenId), "Invalid token");

        _listings[tokenId].onList = false;

        emit Cancellation(
            tokenId,
            msg.sender,
            block.timestamp
        );
    }

    function setPrice(uint256 tokenId, uint256 price) public onlyTokenOwner(tokenId) {
        require (price > 0, "Invalid price");
        require (isListed(tokenId), "Invalid token");
    
        uint256 oldPrice = _listings[tokenId].price;
        _listings[tokenId].price = price;

        emit Edit(
            tokenId,
            msg.sender,
            oldPrice,
            price,
            block.timestamp
        );
    }

    function buyToken(uint256 tokenId) public payable {
        require (isListed(tokenId), "Invalid token");
        require (ownerOf(tokenId) != msg.sender, "Attempt to buy owned token");

        uint256 price = priceOf(tokenId);
        require (msg.value == price, "Price not match");

        uint256 payment = price * 19 / 20;
        uint256 bonus = (price - payment) / 2;
        uint256 fee = price - payment - bonus;
        address owner = ownerOf(tokenId);
        Address.sendValue(payable(owner), payment);
        Address.sendValue(payable(creatorOf(tokenId)), bonus);
        Address.sendValue(_platform, fee);

        _safeTransfer(ownerOf(tokenId), msg.sender, tokenId, '');
        _listings[tokenId].onList = false;

        emit Purchase(
            tokenId,
            msg.sender,
            owner,
            price,
            block.timestamp
        );
    }
}