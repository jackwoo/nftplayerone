pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFT is ERC721URIStorage, ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    mapping (address => bool) private _verified;

    mapping (uint256 => address) private _creators;

    address private _admin;

    constructor (address admin_) ERC721("NFT", "NFT") {
        _admin = admin_;
    }

    modifier onlyAdmin {
        require (
            msg.sender == _admin,
            "Only admin can call this function"
        );
        _;
    }

    event Mint (
        uint256 indexed tokenId,
        address indexed creator,
        string tokenURI,
        uint256 timestamp
    );

    event Verification (
        address indexed creator,
        address indexed admin,
        uint256 timestamp
    );

    function isVerified(address addr) public view returns (bool) {
        return _verified[addr];
    }

    function creatorOf(uint256 tokenId) public view returns (address) 
    {
        return _creators[tokenId];
    }

    function mintNFT(string memory tokenURI) 
        public 
        nonReentrant 
        returns (uint256) 
    {
        _tokenIds.increment();

        uint256 newId = _tokenIds.current();
        _safeMint(msg.sender, newId);
        _setTokenURI(newId, tokenURI);
        _creators[newId] = msg.sender;

        emit Mint(
            newId,
            msg.sender,
            tokenURI,
            block.timestamp
        );

        return newId;
    }

    function verify(address creator) public onlyAdmin {
        require (!isVerified(creator));
        _verified[creator] = true;

        emit Verification(
            creator,
            msg.sender,
            block.timestamp
        );
    }
}