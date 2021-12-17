// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Mintgle is ERC721, Ownable, ReentrancyGuard {
    using Address for address;

    struct Offerer {
        
    }

    address internal _signer;
    mapping (uint256 => address) private _creators;
    mapping (uint256 => Offerer) private _offers;


    struct Offer {
        uint256 tid;
        address owner;
        uint256 amount;
        address buyer;
        bytes32 sigR;
        bytes32 sigS;
        uint8 sigV;
    }

    constructor(address signer)
    {
        _signer = signer;
    }

    uint256 constant chainId = 1337;
    address constant verifyingContract = 0x1C56346CD2A2Bf3202F771f50d3D14a367B48070;
    bytes32 constant salt = 0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558;
    string private constant EIP712_DOMAIN = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)";
    bytes32 private constant DOMAIN_SEPARATOR = keccak256(abi.encode(
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)"),
        keccak256("Mintgle"),
        keccak256("2"),
        chainId,
        verifyingContract,
        salt
    ));

    function hashOffer1(Offer memory offer) private pure returns (bytes32){
        return keccak256(abi.encode(
                keccak256("Offer(uint256 tid,address owner,uint256 amount,address buyer)"),
                offer.tid, offer.owner, offer.amount, offer.buyer
            ));
    }

    function hashOffer2(Offer memory offer) private pure returns (bytes32){
        return keccak256(abi.encodePacked(
            "\x19\x01",
        DOMAIN_SEPARATOR,
        keccak256(abi.encode(
                keccak256("Offer(uint256 tid,address owner,uint256 amount,address buyer,bytes32 sig)"),
                offer.tid, offer.owner, offer.amount, offer.buyer, offer.sig
            ))
        ));
    }

    function accept(Offer memory offer, bytes32 r, byte32 s, uint8 v) public {

        // validate offer
        require(ecrecover(hashOffer1(offer), offer.sigV, offer.sigR, offer.sigS) == _signer, "Wrong signature");

        require(ecrecover(hashOffer2(offer), v, r, s) == offer.buyer, "Wrong buyer");

        require(msg.sender == offer.owner, "Wrong owner");

        // mint if not minted

        // transfer weth to creator

    }

    function offer(uint256 pid) public payable {
        require(msg.value > 0, "offer must be positive");
        require(msg.value > _offers[pid], "offer amount must be larger than current offer");


    }

}
