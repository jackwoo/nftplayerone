pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface INFT is IERC721 {
    function isVerified(address creator) external view returns (bool);

    function creatorOf(uint256 tokenId) external view returns (address);

    function mintNFT(string memory tokenURI) external returns (uint256);

    function verify(address creator) external;
}