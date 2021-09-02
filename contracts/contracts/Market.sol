pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./INFT.sol";

contract Market is ReentrancyGuard {
    using Address for address;
    using Counters for Counters.Counter;

    struct ListingInfo {
        uint256 price;
        address owner;
        bool onList;
    }

    address private _admin;

    mapping (uint256 => ListingInfo) private _listings;

    mapping (address => bool) private _nftContracts;

    mapping (address => uint256) private _rewards;

    uint256 private _feeBalance;

    constructor (address admin_, address nftAddr_) {
        _admin = admin_;
        _nftContracts[nftAddr_] = true;
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
            _listings[tokenId].owner == msg.sender, 
            "Only token owner can call this function"
        );
        _;
    }

    modifier onlyRegisteredNFTContract (address addr) {
        require (
            _nftContracts[addr],
            "NFT contract is not registered"
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

    event RewardWithdrawal (
        address indexed creator,
        uint256 amount,
        uint256 timestamp
    );

    event FeeWithdrawal (
        address indexed admin,
        uint256 amount,
        uint256 timestamp
    );

    event NFTContractRegistration (
        address indexed contractAddr,
        address indexed admin,
        uint256 timestamp
    );

    function isListed(uint256 tokenId) public view returns (bool) {
        return _listings[tokenId].onList;
    }

    function priceOf(uint256 tokenId) public view returns (uint256) {
        require (isListed(tokenId), "Token not listed");
        return _listings[tokenId].price;
    }

    function rewardOf(address creator) public view returns (uint256) {
        return _rewards[creator];
    }

    function feeBalance() public view returns (uint256) {
        return _feeBalance;
    }

    function listToken(address nftAddr, uint256 tokenId, uint256 price) 
        public 
        onlyRegisteredNFTContract(nftAddr) 
    {
        require (price > 0, "Invalid price");
        require (!isListed(tokenId), "Token already listed");

        INFT nft = INFT(nftAddr);
        require (nft.ownerOf(tokenId) == msg.sender, 
                "Caller is not owner");
        require (nft.getApproved(tokenId) == address(this) ||
                 nft.isApprovedForAll(msg.sender, address(this)), 
                "Token not approved to market");

        nft.transferFrom(msg.sender, address(this), tokenId);
        _listings[tokenId] = ListingInfo(price, msg.sender, true);

        emit Listing(
            tokenId,
            msg.sender,
            price,
            block.timestamp
        );
    }

    function cancelListing(address nftAddr, uint256 tokenId) 
        public 
        onlyRegisteredNFTContract(nftAddr) 
        onlyTokenOwner(tokenId) 
    {
        require (isListed(tokenId), "Invalid token");

        INFT(nftAddr).safeTransferFrom(address(this), msg.sender, tokenId);
        _listings[tokenId].onList = false;

        emit Cancellation(
            tokenId,
            msg.sender,
            block.timestamp
        );
    }

    function setPrice(address nftAddr, uint256 tokenId, uint256 price) 
        public 
        onlyRegisteredNFTContract(nftAddr) 
        onlyTokenOwner(tokenId) 
    {
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

    function buyToken(address nftAddr, uint256 tokenId) 
        public 
        payable 
        nonReentrant 
        onlyRegisteredNFTContract(nftAddr) 
    {
        require (isListed(tokenId), "Invalid token");


        address owner = _listings[tokenId].owner;
        require (owner != msg.sender, 
                "Attempt to buy owned token");

        uint256 price = priceOf(tokenId);
        require (msg.value == price, "Price not match");

        INFT nft = INFT(nftAddr);
        uint256 payment = price * 19 / 20;
        uint256 reward = price * 3 / 100;
        Address.sendValue(payable(owner), payment);
        _rewards[nft.creatorOf(tokenId)] += reward;
        _feeBalance += price - payment - reward;

        nft.safeTransferFrom(address(this), msg.sender, tokenId);
        _listings[tokenId].onList = false;

        emit Purchase(
            tokenId,
            msg.sender,
            owner,
            price,
            block.timestamp
        );
    }

    function withdrawReward(uint256 amount) 
        public 
        nonReentrant 
    {
        require (_rewards[msg.sender] > 0, "Current reward is zero");
        require (amount <= _rewards[msg.sender], 
                "Withdrawal exceeds reward balance");

        Address.sendValue(payable(msg.sender), amount);
        _rewards[msg.sender] -= amount;

        emit RewardWithdrawal(
            msg.sender,
            amount,
            block.timestamp
        );
    }

    function withdrawFee(uint256 amount) 
        public 
        nonReentrant 
        onlyAdmin 
    {
        require (amount <= _feeBalance, 
                "Withdrawal exceeds fee balance");

        Address.sendValue(payable(msg.sender), amount);
        _feeBalance -= amount;

        emit FeeWithdrawal(
            msg.sender,
            amount,
            block.timestamp
        );
    }

    function registerNFTContract(address nftAddr) 
        public 
        onlyAdmin 
    {
        _nftContracts[nftAddr] = true;

        emit NFTContractRegistration(
            nftAddr,
            msg.sender,
            block.timestamp
        );
    }
}