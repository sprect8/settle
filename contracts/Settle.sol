pragma solidity >=0.4.21 <0.7.0;
pragma experimental ABIEncoderV2;

import {BandChainLib} from "bandchain-helper-library/contracts/BandChainLib.sol";
import {IBridge} from "bandchain-helper-library/contracts/IBridge.sol";
import "./Users.sol";


contract Settle {
    using BandChainLib for bytes;

    address private _deployerAddress;

    // settlement contract holds the target currency
    uint256 private _settleCurrency; // BAND / BTC / ETH
    uint256 private _totalOwed; // USD currently owed
    uint256 private _totalPaid; // USD total paid
    uint256 private _eligibleDiscount; //
    uint256 private _paidBefore; // if fully paid, we can flag payment with dscount
    uint256 private _invoiceDate;
    uint256 private _invoiceDueDate;
    address private _buyer;
    address private _seller;
    bool private _settled;

    Users private _users;

    uint256 private _totalSettleCurrency; // total amount of settle currency held

    IBridge public bridge;


    // note: settlement happens in real time and Settle accepts the payments on behalf of the invoicer

    constructor(
        uint256 currency,
        uint256 totalOwed,
        uint256 dayTerms,
        uint256 percentage,
        address buyer,
        address seller,
        address userContractAddress,
        uint256 paymentTerms
    ) public {
        _settleCurrency = currency;
        _totalOwed = totalOwed; // raise it by 1m so we can get more accurate represntation
        _invoiceDate = block.timestamp;
        _invoiceDueDate = block.timestamp + paymentTerms * 1 days;
        if (dayTerms > 0 && percentage > 0) {
            _paidBefore = block.timestamp + dayTerms * 1 days; // if you pay before this date you get discount
            _eligibleDiscount = (totalOwed * percentage)/100; // should divide by 100, but because we raise by 100, cancelled out
        }

        _buyer = buyer;
        _seller = seller;
        _users = Users(userContractAddress);

        _deployerAddress = msg.sender;
    }

    event EmitObj(uint256 rqeuiredCoins, uint256 myBalance);

    function settle(
        bytes memory reportPriceSource,
        bytes memory reportPriceTarget,
        uint256 sourceCurrency,
        uint256 usd // how much I want to pay in USD
    ) public invoiceNotSettled calledByContract {
        // determine how much I want to settle
        // ensure i have sufficient balance
        // IBridge.VerifyOracleDataResult memory result = bridge.relayAndVerify(
        //     reportPriceSource
        // );
        // uint64[] memory decodedInfoSource = result.data.toUint64List();

        // IBridge.VerifyOracleDataResult memory resulttarget = bridge.relayAndVerify(
        //     reportPriceTarget
        // );
        // uint64[] memory decodedInfoTarget = resulttarget.data.toUint64List();

        // remove hard-coding later
        // note: our balance increased by factor of 100x100x100 and the latest price is factor of 100
        // when interpreting results in front end, divide by 10,000

        uint256 latestPrice = [934673, 105, 19998][sourceCurrency];//uint256(decodedInfoSource[0]); // *100 (in USD)

        // how many tokens do I need to pay the USD I asked for?
        uint256 requiredCoins = usd * 100 * 100 * 100 * 100 / latestPrice; // this is how many i need x 100 - how much to decrease by
        uint256 latestPriceTarget = [934673, 105, 19998][_settleCurrency];//uint256(decodedInfoTarget[0]);

        uint256 targetCoins = usd * 100 * 100 * 100 * 100 / latestPriceTarget; // this is how many target coins I get based on price

        emit EmitObj(requiredCoins, _users.getBalance(_buyer)[sourceCurrency]);

        // ensure that I have enough money
        require(_users.getBalance(_buyer)[sourceCurrency] > requiredCoins, "You do not have sufficient credit to settle amount");
                
        _totalSettleCurrency += targetCoins; // increase by target amount
        _totalPaid += usd; // increase amount paid by the usd paid (with 1m multiplier for decimals);
        _users.decreaseBalance(_buyer, sourceCurrency, requiredCoins); // decrease by source amount

        _settled = isSettled(); //_totalOwed <= (_totalPaid + eligibleDiscountAvailable());
        // whether or not we are now settled (including discounts)
    }

    // function settleEth() public {}

    // function settleBtc(uint256 usd) public {
    //     // total USD to settle using BTC (e.g. if I have 100 BTC and I settle 1000 USD, figure out price and reduce my BTC by that amount)
    // }

    // function settleBand(uint256 usd) public {}

    function withdraw() public isInvoiceOwner canWithdraw {
        _users.updateBalance(msg.sender, _settleCurrency, _totalSettleCurrency);
    }

    function isSettled() public view returns (bool settled) {
        uint256 discount = eligibleDiscountAvailable();

        if (_totalOwed <= (_totalPaid + discount)) {
            settled = true;
        }
        else {
            settled = false;
        }
    }

    function eligibleDiscountAvailable()
        public
        view
        returns (uint256 discount)
    {
        bool isEligible = block.timestamp < _paidBefore;

        if (isEligible) {
            discount = _eligibleDiscount;
        } else {
            discount = 0;
        }
    }

    function getSettleDetails()
        public
        view
        returns (
            uint256 settleCurrency,
            uint256 totalOwed,
            uint256 totalPaid,
            uint256 eligibleDiscount,
            bool isEligible,
            bool settled,
            uint256 paidBefore,
            address buyer,
            address seller,
            uint256[2] memory invoiceDates
        )
    {
        settleCurrency = _settleCurrency;
        totalOwed = _totalOwed;
        totalPaid = _totalPaid;
        eligibleDiscount = _eligibleDiscount;
        paidBefore = _paidBefore;
        buyer = _buyer;
        seller = _seller;
        isEligible = block.timestamp < _paidBefore;

        settled = isSettled();

        invoiceDates = [_invoiceDate, _invoiceDueDate];
    }

    modifier calledByContract {
        require(msg.sender == _deployerAddress, "Only the contract who deployed this can call settle");
        _;
    }

    modifier invoiceNotSettled {
        require(!_settled, "Amount owed on invoice has been settled");
        _;
    }

    modifier canWithdraw {
        require(
            _invoiceDueDate <= block.timestamp ||
                (_settled && _totalSettleCurrency > 0),
            "Cannot withdraw yet, invoice due date not expired, and invoice not fully paid"
        );
        _;
    }

    modifier isInvoiceOwner {
        require(
            msg.sender == _seller,
            "Cannot perform action, only invoice owner can do this"
        );
        _;
    }
}
