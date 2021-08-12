pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    mapping (address => bool) private _minted;

    mapping (uint256 => bool) private _verified;

    mapping (uint256 => address) private _creators;

    address private _admin;

    constructor(address admin_) ERC721("NFT", "NFT") {
        _admin = admin_;
    }

    modifier onlyAdmin {
        require (
            msg.sender == _admin,
            "Only admin can call this function"
        );
        _;
    }

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

    function mintNFT(address to, string memory tokenURI) public returns (uint256) {
        //require(!_minted[to], "This address has already minted a token");
        _tokenIds.increment();

        uint256 newId = _tokenIds.current();
        _safeMint(to, newId);
        _setTokenURI(newId, tokenURI);
        _creators[newId] = msg.sender;
        _minted[to] = true;

        return newId;
    }

    function verify(uint256 tokenId) public onlyAdmin {
        _verified[tokenId] = true;
    }

    function _approve(address to, uint256 tokenId) internal override {
        super._approve(to, tokenId);
    } 
}