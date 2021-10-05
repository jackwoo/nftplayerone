pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ShareTokenTemplate is ERC20 {

    address private _admin;

    constructor (string memory name_,
                 string memory symbol_,
                 address admin_) ERC20(name_, symbol_) 
    {
        _admin = admin_;
        _mint(address(this), 1000000);
    }

}