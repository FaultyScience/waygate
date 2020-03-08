pragma solidity ^0.4.24;

import "./SetStack.sol";

contract StackFactory {

  address public owner;
  address public myAddress;
  address[] public setStacks;

  event StacksUpdated(uint len, uint blockNum, uint blockTime);

  modifier restricted() {
    if (msg.sender == owner) _;
  }

  constructor() public {

    owner = msg.sender;
    myAddress = address(this);
  }

  function createSetStack(
    string _maturity,
    uint256 _maturityUnix,
    string _cashflowDates,
    uint256[] _cashflowDatesUnix,
    uint256[] _cashflowAmountsWei,
    string _cashflows) public {

    address newSetStack = new SetStack(_maturity, _maturityUnix, _cashflowDates,
                                           _cashflowDatesUnix, _cashflowAmountsWei,
                                           _cashflows);

    setStacks.push(newSetStack);

    emit StacksUpdated(setStacks.length, block.number, block.timestamp);
  }

  function getStacksLength() public view returns(uint256) {
    return setStacks.length;
  }

  function terminate() external restricted {
    selfdestruct(msg.sender);
  }
}
