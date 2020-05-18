pragma solidity >=0.4.21 <0.7.0;
pragma experimental ABIEncoderV2;
import "./Settle.sol";


contract Contract {
    uint256 private _currency;
    uint256 private _proposalId;
    uint256 private _contractId;
    address private _owner;
    address private _seller;
    string private _docAddress;
    uint8 private _state; // active, inuse, expired
    uint8 private _activeTier;
    uint256 private _purchased; // to determine current tier

    uint16[] private _volumes;
    uint16[] private _ppi;
    uint256 private _percentage;
    uint256 private _dayTerms;
    address private _usersAddress;
    uint256 private _paymentTerms;

    event CreatedObject(uint256 id);
    event CreateAddress(address addr);

    struct POStruct {
        uint256 poId; // what is my id
        uint8 status;
        uint256 total; // how much you want to buy?
        uint256 deliveryDate; // when we expect delivery
        string docAddress;
        // string[] items; // don't need line item, just need to totals
        uint256 itemTotal; // amount added by the seller for additional costs
    }

    mapping(uint256 => POStruct) private _purchaseOrders; // purchase order id!
    mapping(uint256 => Settle) private _invoices; // purchase order id!

    uint256[] private _myPurchaseOrders; // invoice and po have same ids!!
    
    uint256 _currIndex;

    // the owner will create the contract
    constructor(
        uint256 proposalId,
        address buyer,
        address seller,
        string memory docAddress,
        uint16[] memory volumes,
        uint16[] memory ppi,
        uint256 paymentTerms,
        uint256 percentage,
        uint256 dayTerms,
        uint256 currency,
        address usersAddress
    ) public {
        _paymentTerms = paymentTerms;
        _proposalId = proposalId;
        _docAddress = docAddress;
        _owner = buyer;
        _seller = seller;
        _state = 1;
        _volumes = volumes;
        _ppi = ppi;
        _percentage = percentage;
        _dayTerms = dayTerms;
        _currency = currency;
        _usersAddress = usersAddress;
    }

    // owner will issue a PO
    function issuePurchaseOrder(
        uint256 deliveryDate,
        uint256 totalUnits,
        string memory docAddress
    ) public isOwner {
        _currIndex = _proposalId * 1000 + 1; // each contract has 1000 possible purchase orders
        POStruct memory po;
        po.poId = _currIndex;
        po.status = 1;
        po.total = totalUnits;
        po.deliveryDate = deliveryDate;
        po.docAddress = docAddress;

        _purchaseOrders[_currIndex] = po;
        _myPurchaseOrders.push(_currIndex);
        emit CreatedObject(_currIndex);
    }

    function reviewPurchaseOrder(
        uint256 poId,
        uint256 itemTotal,
        string memory docAddress
    ) public isSeller checkState(poId, 1) {
        // move it along
        // move po status to buyer to review the purchase order
        _purchaseOrders[poId].itemTotal = itemTotal; // total amount to increase the balance amount owed (shipping etc)
        _purchaseOrders[poId].status = 2;
        _purchaseOrders[poId].docAddress = docAddress;
    }

    function acceptPOTerms(uint256 poId, string memory docAddress)
        public
        isOwner
        checkState(poId, 2)
    {
        _purchaseOrders[poId].status = 3; // accept terms!
        _purchaseOrders[poId].docAddress = docAddress;
    }

    function indicateDelivered(uint256 poId, string memory docAddress)
        public
        isSeller
        checkState(poId, 3)
    {
        _purchaseOrders[poId].status = 4;
        _purchaseOrders[poId].docAddress = docAddress;
    }

    function ackDelivered(uint256 poId, string memory docAddress)
        public
        isOwner
        checkState(poId, 4)
    {
        _purchaseOrders[poId].status = 5;
        _purchaseOrders[poId].docAddress = docAddress;
    }

    function issueInvoice(uint256 poId) public isSeller checkState(poId, 5) {
        _purchaseOrders[poId].status = 6;
        // volume discount? // tbd
        uint256 amountOwed = _ppi[0] *
            _purchaseOrders[poId].total +
            _purchaseOrders[poId].itemTotal; // don't need to add item total to the total (already added);
        // settle - to maange the invoice payments
        Settle settle = new Settle(
            _currency,
            amountOwed,
            _dayTerms,
            _percentage,
            _owner,
            _seller,
            _usersAddress,
            _paymentTerms
        );

        _invoices[poId] = settle;
        emit CreateAddress(address(settle));
    }

    function getContract()
        public
        view
        isParticipant
        returns (
            uint256 proposalId,
            address[2] memory participants,
            uint256 state,
            string memory docAddress,
            uint16[] memory volumes,
            uint16[] memory ppi,
            uint256[2] memory paymentTerms,
            uint256[2] memory dayTerms
        )
    {
        proposalId = _proposalId;
        participants = [_owner, _seller];
        state = _state;
        docAddress = _docAddress;
        volumes = _volumes;
        ppi = _ppi;
        paymentTerms = [_paymentTerms, _percentage];
        dayTerms = [_dayTerms, _currency];
    }

    function getPurchaseOrder(uint256 poId)
        public
        view
        isParticipant
        returns (
            uint8 status,
            uint256 total,
            uint256 deliveryDate,
            uint256 itemTotal,
            string memory docAddress
        )
    {
        POStruct memory po = _purchaseOrders[poId];
        status = po.status;
        total = po.total;
        deliveryDate = po.deliveryDate;
        itemTotal = po.itemTotal;
        docAddress = _purchaseOrders[poId].docAddress;
    }

    function getInvoice(uint256 invoiceId)
        public
        view
        isParticipant
        returns (address settleAddress, string memory docAddress)
    {
        settleAddress = address(_invoices[invoiceId]);
        docAddress = _docAddress;
    }

    function checkInvoice(uint256 poId)
        public
        view
        isOwner
        checkState(poId, 6)
        returns (bool)
    {
        // confirm that everything is paid
        return _invoices[poId].isSettled();
    }

    event SettlementProof(uint256 sourceCurrency, uint256 targetCurrency, uint256 amount, bytes sourceProof, bytes targetProof);

    function settle(
        uint256 invoiceId,
        bytes memory reportPriceSource,
        bytes memory reportPriceTarget,
        uint256 sourceCurrency,
        uint256 usd // how much USD i want to pay (price report gives me how much usd per token)
    ) public isOwner checkState(invoiceId, 6) {
        _invoices[invoiceId].settle(
            reportPriceSource,
            reportPriceTarget,
            sourceCurrency,
            usd
        );

        if (_invoices[invoiceId].isSettled()) {
            //
            _purchaseOrders[invoiceId].status = 7; // we have fully paid the amount owing!
            _purchased += _purchaseOrders[invoiceId].total;
        }

        emit SettlementProof(sourceCurrency, _currency, usd, reportPriceSource, reportPriceTarget);
    }

    function getMyPurchaseOrders()
        public
        view
        isParticipant
        returns (uint256[] memory pos)
    {
        pos = _myPurchaseOrders;
    }

    modifier isParticipant() {
        require(
            _owner == msg.sender || _seller == msg.sender,
            "Not a participant"
        );
        _;
    }

    modifier validContract(uint256 contractId) {
        require(contractId <= _contractId, "Invalid Contract Id");
        _;
    }

    modifier isOwner {
        require(_owner == msg.sender, "Action can only be performed by owner");
        _;
    }

    modifier isSeller {
        require(
            _seller == msg.sender,
            "Action can only be performed by seller"
        );
        _;
    }

    modifier checkState(uint256 poId, uint8 state) {
        require(
            _purchaseOrders[poId].status == state,
            "Cannot perform action as state not valid"
        );
        _;
    }
}
