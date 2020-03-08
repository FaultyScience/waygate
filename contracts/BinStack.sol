pragma solidity ^0.4.24;

import "./ReferenceOracle.sol";

contract BinStack {

  address public owner;
  address public myAddress;
  // status can have values of:
  // "Active (payments outstanding)", "Active (no payments outstanding)",
  // "Active - next payment partially funded (payments outstanding)",
  // "Active - next payment partially funded (no payments outstanding)",
  // "Inactive - not funded (payments outstanding)",
  // "Inactive - not funded (no payments outstanding)",
  // "Inactive - no beneficiary (payments outstanding)",
  // "Inactive - no beneficiary (no payments outstanding)",
  // "Matured with payments outstanding", or "Matured"
  string public status;
  address public beneficiary;
  string public maturity;
  uint256 public strikeWei;
  uint256 public minFullFundingWei;
  bool public fullyFunded;
  bool public paymentsOutstanding;
  bool public long;
  uint256 public payoffAmountWei;
  uint256 public payoff;
  bool public payoffSet;
  uint256 private internalBalance;
  uint256 private maturityUnix;
  ReferenceOracle private referenceOracle;

  event StatusUpdated(string status, uint blockNum, uint blockTime);
  event BeneficiaryUpdated(address beneficiary, uint blockNum, uint blockTime);
  event MinFundingUpdated(uint256 minFullFunding, uint blockNum, uint blockTime);
  event FundingChanged(bool fullyFunded, uint256 balance, uint blockNum, uint blockTime);
  event PaymentsOutstandingUpdated(bool paymentsOutstanding, uint blockNum, uint blockTime);
  event DisbursementsTriggered(uint256 cfAmount, address recipient, uint blockNum, uint blockTime);

  modifier restricted() {
    if (msg.sender == owner) _;
  }

  constructor(
    string _maturity,
    uint256 _maturityUnix,
    uint256 _strikeWei,
    uint256 _payoffAmountWei,
    bool _long,
    address _referenceOracleAddress) public {

    owner = msg.sender;
    myAddress = address(this);
    status = "";
    beneficiary = 0x0;
    maturity = _maturity;
    strikeWei = _strikeWei;
    referenceOracle = ReferenceOracle(_referenceOracleAddress);
    maturityUnix = _maturityUnix;
    long = _long;
    payoffAmountWei = _payoffAmountWei;
    minFullFundingWei = _payoffAmountWei;
    fullyFunded = false;
    internalBalance = 0;
    payoff = 0;
    payoffSet = false;
    paymentsOutstanding = hasPaymentsOutstanding();

    updateStatus();
  }

  function terminate() external restricted {
    selfdestruct(msg.sender);
  }

  function getReferencePrice() private view returns (uint256) {
    return referenceOracle.getPrice();
  }

  function isMatured() private view returns (bool) {

    if (block.timestamp >= maturityUnix) {
      return true;
    }

    return false;
  }

  function isDeactivated() private view returns (bool) {

    if (isMatured() && !hasPaymentsOutstanding()) {
      return true;
    }

    return false;
  }

  function isFullyFunded() private view returns (bool) {

    if (internalBalance >= minFullFundingWei) {
      return true;
    }

    return false;
  }

  function hasPaymentsOutstanding() private view returns (bool) {

    if (isMatured() && (minFullFundingWei > 0)) { return true; }

    return false;
  }

  function hasBeneficiary() private view returns (bool) {

    if (beneficiary != 0x0) {
      return true;
    }

    return false;
  }

  function isActive() private view returns (bool) {

      if (!isDeactivated() && hasBeneficiary()) {
        return true;
      }

      return false;
  }

  function updateStatus() private {

    if (isDeactivated()) {
      status = "Matured";
    } else if (!hasBeneficiary()) {

      if (hasPaymentsOutstanding()) {
        status = "Inactive - no beneficiary (payments outstanding)";
      } else {
        status = "Inactive - no beneficiary (no payments outstanding)";
      }

    } else if (!isFullyFunded()) {

      if (internalBalance > 0) {

        if (hasPaymentsOutstanding()) {
          status = "Active - next payment partially funded (payments outstanding)";
        } else {
          status = "Active - next payment partially funded (no payments outstanding)";
        }
      } else {

        if (hasPaymentsOutstanding()) {
          status = "Inactive - not funded (payments outstanding)";
        } else {
          status = "Inactive - not funded (no payments outstanding)";
        }
      }

    } else if (isMatured() && hasPaymentsOutstanding()) {
      status = "Matured with payments outstanding";
    } else {

      if (hasPaymentsOutstanding()) {
        status = "Active (payments outstanding)";
      } else {
        status = "Active (no payments outstanding)";
      }
    }

    emit StatusUpdated(status, block.number, block.timestamp);
  }

  function fund() external payable {

    internalBalance += msg.value;

    if (internalBalance >= minFullFundingWei) {
      fullyFunded = true;
    } else {
      fullyFunded = false;
    }

    emit FundingChanged(fullyFunded, internalBalance, block.number, block.timestamp);
    updateStatus();
  }

  function setBeneficiary(address _ben) external restricted {

    beneficiary = _ben;

    emit BeneficiaryUpdated(beneficiary, block.number, block.timestamp);
    updateStatus();
  }

  function ping() external {

    // if (!isActive()) { return; }
    if (!hasBeneficiary() || (internalBalance == 0)) { return; }

    uint256 payment = 0;
    address recipient;
    uint256 refPrice = getReferencePrice();
    bool inTheMoney = false;

    if (block.timestamp >= maturityUnix) {

      if (payoffSet && hasPaymentsOutstanding()) {

        payment = (internalBalance >= minFullFundingWei) ? minFullFundingWei : internalBalance;
        disburseCashflow(payment, beneficiary);

        if (internalBalance > 0) {

          minFullFundingWei = internalBalance;
          disburseCashflow(internalBalance, owner);
        }

      } else {

        if (long) {
          if (refPrice >= strikeWei) { inTheMoney = true; }
        } else {
          if (refPrice <= strikeWei) { inTheMoney = true; }
        }

        if (!inTheMoney) {

          recipient = owner;
          minFullFundingWei = internalBalance;
          fullyFunded = true;
          payoff = 0;
          payment = internalBalance;

        } else {

          recipient = beneficiary;
          payoff = payoffAmountWei;
          payment = (internalBalance >= payoff) ? payoff : internalBalance;
        }

        if (internalBalance < minFullFundingWei) { fullyFunded = false; }

        disburseCashflow(payment, recipient);

        if (internalBalance > 0) {

          minFullFundingWei = internalBalance;
          disburseCashflow(internalBalance, owner);
        }

        payoffSet = true;
      }

      paymentsOutstanding = hasPaymentsOutstanding();
      emit PaymentsOutstandingUpdated(paymentsOutstanding, block.number, block.timestamp);
    }

    updateStatus();
  }

  function disburseCashflow(uint256 _amt, address _recipient) private {

    if (internalBalance >= _amt) {

      _recipient.transfer(_amt);
      minFullFundingWei -= _amt;
      internalBalance -= _amt;

    } else {
      fullyFunded = false;
    }

    emit DisbursementsTriggered(_amt, _recipient, block.number, block.timestamp);
    emit MinFundingUpdated(minFullFundingWei, block.number, block.timestamp);
    emit FundingChanged(fullyFunded, internalBalance, block.number, block.timestamp);
  }
}
