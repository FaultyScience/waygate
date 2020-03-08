pragma solidity ^0.4.24;

contract SetStack {

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
  string public cashflowDates;
  string public cashflows;
  uint256 public minFullFundingWei;
  uint256 public minNextPayFundingWei;
  bool public fullyFunded;
  bool public nextPayFunded;
  bool public paymentsOutstanding;
  uint256 private internalBalance;
  uint256 private maturityUnix;
  uint256[] private cashflowDatesUnix;
  uint256[] private cashflowAmountsWei;
  uint256[] private cashflowDatesRemainingUnix;
  uint256[] private cashflowAmountsRemaining;

  event StatusUpdated(string status, uint blockNum, uint blockTime);
  event BeneficiaryUpdated(address beneficiary, uint blockNum, uint blockTime);
  event MinFundingUpdated(uint256 minFullFunding, uint256 minNextPayFunding, uint blockNum, uint blockTime);
  event FundingChanged(bool fullyFunded, bool nextPayFunded, uint256 balance, uint blockNum, uint blockTime);
  event PaymentsOutstandingUpdated(bool paymentsOutstanding, uint blockNum, uint blockTime);
  event DisbursementsTriggered(uint256 num, uint256 cfAmount, uint blockNum, uint blockTime);
  event CFremaining(uint256 len, uint256 cfDate, uint256 cfAmount, uint blockNum, uint blockTime);
  // event cfDatesRemChanged(uint256[] cfDatesRem, uint blockNum, uint blockTime);
  // event cfAmountsRemChanged(uint256[] cfAmountsRem, uint blockNum, uint blockTime);

  modifier restricted() {
    if (msg.sender == owner) _;
  }

  constructor(
    string _maturity,
    uint256 _maturityUnix,
    string _cashflowDates,
    uint256[] _cashflowDatesUnix,
    uint256[] _cashflowAmountsWei,
    string _cashflows) public {

    require(_cashflowDatesUnix.length == _cashflowAmountsWei.length);
    require(_cashflowDatesUnix.length > 0);
    require(isAscending(_cashflowDatesUnix));
    require(isNonNegative(_cashflowAmountsWei));

    owner = msg.sender;
    myAddress = address(this);
    status = "";
    beneficiary = 0x0;
    maturity = _maturity;
    cashflowDates = _cashflowDates;
    cashflowAmountsWei = _cashflowAmountsWei;
    cashflows = _cashflows;
    minFullFundingWei = calcMinFullFunding(_cashflowAmountsWei);
    minNextPayFundingWei = calcMinNextPayFunding(_cashflowAmountsWei);
    fullyFunded = false;
    nextPayFunded = false;
    internalBalance = 0;
    maturityUnix = _maturityUnix;
    cashflowDatesUnix = _cashflowDatesUnix;
    cashflowDatesRemainingUnix = _cashflowDatesUnix;
    cashflowAmountsRemaining = _cashflowAmountsWei;
    paymentsOutstanding = hasPaymentsOutstanding(_cashflowDatesUnix);

    updateStatus(_cashflowDatesUnix);
  }

  function terminate() external restricted {
    selfdestruct(msg.sender);
  }

  function calcMinFullFunding(uint256[] _cfAmts) private pure returns (uint256) {

    uint256 sum = 0;

    for (uint i = 0; i < _cfAmts.length; i++) {
      sum += _cfAmts[i];
    }

    return sum;
  }

  function calcMinNextPayFunding(uint256[] _cfAmts) private pure returns (uint256) {

    if (_cfAmts.length == 0) {
      return 0;
    } else {
      return _cfAmts[0];
    }
  }

  function isMatured() private view returns (bool) {

    if (block.timestamp >= maturityUnix) {
      return true;
    }

    return false;
  }

  function isDeactivated(uint256[] _cfDatesRem) private view returns (bool) {

    if (isMatured() && !hasPaymentsOutstanding(_cfDatesRem)) {
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

  function isNextPayFunded() private view returns (bool) {

    if (internalBalance >= minNextPayFundingWei) {
      return true;
    }

    return false;
  }

  function hasPaymentsOutstanding(uint256[] _cfDatesRem) private view returns (bool) {

    if (_cfDatesRem.length == 0) { return false; }

    if (block.timestamp >= _cfDatesRem[0]) {
      return true;
    }

    return false;
  }

  function hasBeneficiary() private view returns (bool) {

    if (beneficiary != 0x0) {
      return true;
    }

    return false;
  }

  function isActive(uint256[] _cfDatesRem) private view returns (bool) {

      if (!isDeactivated(_cfDatesRem) && hasBeneficiary() && isNextPayFunded()) {
        return true;
      }

      return false;
  }

  function updateStatus(uint256[] _cfDatesRem) private {

    if (isDeactivated(_cfDatesRem)) {
      status = "Matured";
    } else if (!hasBeneficiary()) {

      if (hasPaymentsOutstanding(_cfDatesRem)) {
        status = "Inactive - no beneficiary (payments outstanding)";
      } else {
        status = "Inactive - no beneficiary (no payments outstanding)";
      }

    } else if (!isNextPayFunded()) {

      if (internalBalance > 0) {

        if (hasPaymentsOutstanding(_cfDatesRem)) {
          status = "Active - next payment partially funded (payments outstanding)";
        } else {
          status = "Active - next payment partially funded (no payments outstanding)";
        }
      } else {

        if (hasPaymentsOutstanding(_cfDatesRem)) {
          status = "Inactive - not funded (payments outstanding)";
        } else {
          status = "Inactive - not funded (no payments outstanding)";
        }
      }

    } else if (isMatured() && hasPaymentsOutstanding(_cfDatesRem)) {
      status = "Matured with payments outstanding";
    } else {

      if (hasPaymentsOutstanding(_cfDatesRem)) {
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
      nextPayFunded = true;

    } else if (internalBalance >= minNextPayFundingWei) {

      fullyFunded = false;
      nextPayFunded = true;

    } else {

      fullyFunded = false;
      nextPayFunded = false;
    }

    emit FundingChanged(fullyFunded, nextPayFunded, internalBalance, block.number, block.timestamp);
    updateStatus(cashflowDatesRemainingUnix);
  }

  function setBeneficiary(address _ben) external restricted {

    beneficiary = _ben;

    emit BeneficiaryUpdated(beneficiary, block.number, block.timestamp);
    updateStatus(cashflowDatesRemainingUnix);
  }

  function ping() external {

    // if (!isActive(cashflowDatesRemainingUnix)) { return; }
    if (!hasBeneficiary() || (internalBalance == 0)) { return; }

    uint256 currentTime = block.timestamp;
    uint256 newLength;
    uint256 cfDatesRemLength = cashflowDatesRemainingUnix.length;
    uint256 partialPayment = 0;

    for (uint i = 0; i < cfDatesRemLength; i++) {

      if (currentTime >= cashflowDatesRemainingUnix[i]) {

        if (internalBalance < cashflowAmountsRemaining[i]) {

          if (internalBalance > 0) {

            partialPayment = internalBalance;
            minNextPayFundingWei = cashflowAmountsRemaining[i] - partialPayment;

            disburseCashflow(partialPayment);
            cashflowAmountsRemaining[i] -= partialPayment;
          }

          fullyFunded = false;
          nextPayFunded = false;
        }

        if (nextPayFunded) {
          disburseCashflow(cashflowAmountsRemaining[i]);
        } else {
          break;
        }
      } else {
        break;
      }
    }

    if (partialPayment > 0) {
      emit DisbursementsTriggered(i + 1, cashflowAmountsRemaining[0], block.number, block.timestamp);
    } else {
      emit DisbursementsTriggered(i, cashflowAmountsRemaining[0], block.number, block.timestamp);
    }

    if ((i > 0) || (partialPayment > 0)) {

      if (i > 0) {

        newLength = cfDatesRemLength - i;

        for (uint j = 0; j < newLength; j++) {

          cashflowDatesRemainingUnix[j] = cashflowDatesRemainingUnix[cfDatesRemLength - newLength + j];
          cashflowAmountsRemaining[j] = cashflowAmountsRemaining[cfDatesRemLength - newLength + j];
        }

        cashflowDatesRemainingUnix.length = newLength;
        cashflowAmountsRemaining.length = newLength;
      }

      minNextPayFundingWei = calcMinNextPayFunding(cashflowAmountsRemaining);
      nextPayFunded = isNextPayFunded();

      emit MinFundingUpdated(minFullFundingWei, minNextPayFundingWei, block.number, block.timestamp);
      emit FundingChanged(fullyFunded, nextPayFunded, internalBalance, block.number, block.timestamp);
    }

    if (cashflowDatesRemainingUnix.length > 0) {
      emit CFremaining(cashflowDatesRemainingUnix.length, cashflowDatesRemainingUnix[0], cashflowAmountsRemaining[0], block.number, block.timestamp);
    } else {
      emit CFremaining(cashflowDatesRemainingUnix.length, 0, 0, block.number, block.timestamp);
    }

    paymentsOutstanding = hasPaymentsOutstanding(cashflowDatesRemainingUnix);
    emit PaymentsOutstandingUpdated(paymentsOutstanding, block.number, block.timestamp);

    updateStatus(cashflowDatesRemainingUnix);
  }

  function disburseCashflow(uint256 _amt) private {

    if (internalBalance >= _amt) {

      beneficiary.transfer(_amt);
      minFullFundingWei -= _amt;
      internalBalance -= _amt;

    } else {

      fullyFunded = false;
      nextPayFunded = false;
    }
  }

  function isAscending(uint256[] _arr) private pure returns (bool) {

    if ((_arr.length == 0) || (_arr.length == 1)) {
      return true;
    }

    for (uint i = 0; i < (_arr.length - 1); i++) {
      if (_arr[i] > _arr[i + 1]) { return false; }
    }

    return true;
  }

  function isNonNegative(uint256[] _arr) private pure returns (bool) {

    if (_arr.length == 0) {
      return true;
    }

    for (uint i = 0; i < _arr.length; i++) {
      if (_arr[i] < 0) { return false; }
    }

    return true;
  }

  function() public payable {

    if (msg.value > 0) {
      msg.sender.transfer(msg.value);
    }
  }
}
