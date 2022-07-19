// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.9.0;

import "./TRC20.sol";

contract PackagePrices {
  uint256 pet;
  uint256 tetra_pak;
  uint256 glass;
  uint256 aluminium;

  function SetPrices(
	uint256 pet_price,
	uint256 tetra_pak_price,
	uint256 glass_price,
	uint256 aluminium_price) public {

	pet = pet_price;
	tetra_pak = tetra_pak_price;
	glass = glass_price;
	aluminium = aluminium_price;
  }

  function GetPrices() public view returns(
	uint256 _pet, uint256 _tetra_pak, uint256 _glass, uint256 _aluminium) {
	  return (pet, tetra_pak, glass, aluminium);
  }
}

contract RecyclingMachine {

	event Paid(address indexed to, address indexed from, uint256 amount);

  TRC20 USDTContract;
	address owner;
	address payable donationAddress;
	uint256 numOfDonations;
	uint256 totalAmountDonated;
	uint256 numOfPayouts;
	uint256 totalTrxAmountPaidOut;
  uint256 totalUsdtAmountPaidOut;
	
	constructor(address payable donationAddr, address usdtAddress) {
	  owner = msg.sender;
	  donationAddress = donationAddr;
	  numOfDonations = 0;
	  totalAmountDonated = 0;
	  numOfPayouts = 0;
	  totalTrxAmountPaidOut = 0;
    totalUsdtAmountPaidOut = 0;
    USDTContract = TRC20(usdtAddress);
	}
	
	modifier restricted() {
	  require(msg.sender == owner);
	  _;
	}

	function setDonationAddress(address payable donationAddr) restricted public {
	  donationAddress = donationAddr;
	}

	function getDonationAddress() public view returns(address){
	  return donationAddress;
	}
	
	function addFunds() public payable {}
	
	function checkTrxBalance() public view returns(uint256) {
	  return address(this).balance;
	}

	function checkUsdtBalance() public view returns(uint256) {
	  return USDTContract.balanceOf(address(this));
	}
	
	function withdraw() payable restricted public {
	  payable(msg.sender).transfer(address(this).balance);
	  USDTContract.transfer(payable(msg.sender), USDTContract.balanceOf(address(this)));
	}
	
	function payOut(address payable receiver, uint256 amount, bool isStableCoin) payable restricted public {
	  if (isStableCoin) {
		  USDTContract.transfer(receiver, amount);
      totalUsdtAmountPaidOut += amount;
	  }
	  else {
		  receiver.transfer(amount);
      totalTrxAmountPaidOut += amount;
	  }
	  numOfPayouts++;
	  emit Paid(receiver, owner, amount);
	}

	function donate(uint256 amount) payable restricted public {
	  donationAddress.transfer(amount);
	  numOfDonations++;
	  totalAmountDonated += amount;
	  emit Paid(donationAddress, owner, amount);
	}

	function getStatistics() public view returns(
	  uint256 _numOfDonations, uint256 _totalAmountDonated, 
	  uint256 _numOfPayouts, uint256 _totalUsdtAmountPaidOut, 
    uint256 _totalTrxAmountPaidOut) {
		return (numOfDonations, totalAmountDonated, numOfPayouts, totalUsdtAmountPaidOut, totalTrxAmountPaidOut);
  }
}
