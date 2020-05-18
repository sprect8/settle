pragma solidity >=0.4.21 <0.7.0;
import "./ContractFactory.sol";


contract RFPs {
    struct RFPStruct {
        uint256 rfpId;
        address owner;
        string docAddress;
        uint8 status;
    }

    struct ProposalStruct {
        uint256 rfpId;
        uint256 proposalId;
        address buyer;
        address seller;
        uint8 currState;
        string docAddress;
        address contractId;
        bool buyerSigned;
        bool sellerSigned;
        uint16[] volumes;
        uint16[] ppi;
        uint256 percentage;
        uint256 dayTerms;
        uint256 currency;
    }

    event CreatedObject(uint256 id);
    event CreateAddress(address addr);

    uint256 private _currIds;
    mapping(uint256 => RFPStruct) private _rfps;
    mapping(uint256 => ProposalStruct) private _proposals;

    mapping(address => uint256[]) private _proposalsMap;
    mapping(address => uint256[]) private _rfpsMap;
    mapping(address => address[]) private _contractsMap;

    uint256[] private _allRFPs;

    ContractFactory private _contractFactory;

    constructor(address contractFactory) public {
        _contractFactory = ContractFactory(contractFactory);
    }

    function getAllRFPs() public view returns (uint256[] memory allRFPs) {
        allRFPs = _allRFPs;
    }

    function createRFP(string memory docAddress) public {
        _currIds+=1;
        _rfps[_currIds] = RFPStruct(_currIds, msg.sender, docAddress, 0); //0 is issued, 1 is awarded, 2 is declined
        emit CreatedObject(_currIds);
        _rfpsMap[msg.sender].push(_currIds);
        _allRFPs.push(_currIds);
    }

    function createProposal(uint256 rfpId, string memory docAddress)
        public
        cannotProposeOwnRFP(rfpId)
    {
        _currIds+=1;
        RFPStruct memory rfp = _rfps[rfpId];
        ProposalStruct memory proposal;

        proposal.rfpId = rfpId;
        proposal.proposalId = _currIds;
        proposal.buyer = rfp.owner;
        proposal.seller = msg.sender;
        proposal.currState = 2;
        proposal.docAddress = docAddress;

        _proposals[_currIds] = proposal;

        emit CreatedObject(_currIds);
        _proposalsMap[msg.sender].push(_currIds);
        _proposalsMap[rfp.owner].push(_currIds);
    }

    function updateTiers(
        uint256 proposalId,
        uint16[] memory volumes,
        uint16[] memory ppi
    ) public canUpdateProposalTerms(proposalId) {
        _proposals[proposalId].volumes = volumes;
        _proposals[proposalId].ppi = ppi;
    }

    function updateDiscount(
        uint256 proposalId,
        uint256 percentage,
        uint256 dayTerms
    ) public canUpdateProposalTerms(proposalId) {
        _proposals[proposalId].percentage = percentage;
        _proposals[proposalId].dayTerms = dayTerms;
    }

    function updateRFP(uint256 rfpId, uint8 status) public rfpOwner(rfpId) {
        _rfps[rfpId].status = status;
    }

    function buyerReject(uint256 proposalId)
        public
        validProposal(proposalId)
        proposalOwner(proposalId)
    {
        _proposals[proposalId].currState = 4; // declined
    }

    function buyerApprove(uint256 proposalId, string memory docAddress)
        public
        proposalOwner(proposalId)
        validProposal(proposalId)
        validState(proposalId, 2)
    {
        _proposals[proposalId].currState = 3; // move to signing phase
        _proposals[proposalId].docAddress = docAddress;
    }

    function signProposal(uint256 proposalId, string memory docAddress)
        public
        canSign(proposalId)
        proposalParticipants(proposalId)
        validProposal(proposalId)
        validState(proposalId, 3)
    {
        if (_proposals[proposalId].buyer == msg.sender) {
            _proposals[proposalId].buyerSigned = true;
        } else {
            _proposals[proposalId].sellerSigned = true;
        }

        if (
            _proposals[proposalId].buyerSigned ==
            _proposals[proposalId].sellerSigned
        ) {
            _proposals[proposalId].currState = 4;
        }
        _proposals[proposalId].docAddress = docAddress;
    }

    function createContractFromProposal(
        uint256 proposalId,
        string memory docAddress,
        string memory proposalDocAddress,
        uint16[] memory volumes,
        uint16[] memory ppi,
        uint256[2] memory paymentTerms,
        uint256 dayTerms,
        uint256 currency
    ) public proposalOwner(proposalId) canCreateContract(proposalId) {
        ProposalStruct storage po = _proposals[proposalId];
        address c = _contractFactory.createContract(
            proposalId,
            po.buyer,
            po.seller,
            docAddress,
            volumes,
            ppi,
            paymentTerms,
            dayTerms,
            currency
        );
        po.contractId = c;
        po.docAddress = proposalDocAddress;
        _contractsMap[po.buyer].push(c);
        _contractsMap[po.seller].push(c);
        po.currState+=1;

        emit CreateAddress(c);
    }

    function getContracts() public view returns (address[] memory contracts) {
        contracts = _contractsMap[msg.sender];
    }

    function getRFP(uint256 rfpId)
        public
        view
        returns (address owner, string memory docAddress, uint8 status)
    {
        RFPStruct memory rfp = _rfps[rfpId];
        owner = rfp.owner;
        docAddress = rfp.docAddress;
        status = rfp.status;
    }

    function getProposal(uint256 proposalId)
        public
        view
        validProposal(proposalId)
        proposalParticipants(proposalId)
        returns (
            address buyer,
            address seller,
            uint256 currState,
            string memory docAddress,
            address contractId,
            bool allSigned,
            uint16[] memory volumes,
            uint16[] memory ppi,
            uint256[2] memory terms,
            uint256 currency
        )
    {
        ProposalStruct memory s = _proposals[proposalId];
        buyer = s.buyer;
        seller = s.seller;
        currState = s.currState;
        contractId = s.contractId;
        allSigned = s.buyerSigned && s.sellerSigned;
        docAddress = s.docAddress;
        volumes = s.volumes;
        ppi = s.ppi;
        terms = [s.percentage, s.dayTerms];
        currency = s.currency;
    }

    function getMyProposals() public view returns (uint256[] memory) {
        return _proposalsMap[msg.sender];
    }

    function getMyRFPs() public view returns (uint256[] memory rfps) {
        rfps = _rfpsMap[msg.sender];
    }

    function getCurrentId() public view returns (uint256 currentId) {
        currentId = _currIds;
    }

    modifier canUpdateProposalTerms(uint256 proposalId) {
        require(
            _proposals[proposalId].seller == msg.sender &&
                _proposals[proposalId].currState == 2,
            "Cannot update proposal"
        );
        _;
    }

    modifier cannotProposeOwnRFP(uint256 rfpId) {
        require(_rfps[rfpId].owner != msg.sender, "Cannot bid on your own rfp");
        _;
    }

    modifier canCreateContract(uint256 proposalId) {
        require(
            _proposals[proposalId].currState == 4,
            "Cannot create contract unless owner and all signed"
        );
        _;
    }

    modifier validProposal(uint256 proposalId) {
        require(
            _proposals[proposalId].currState > 0,
            "This is not a valid proposal"
        );
        _;
    }

    modifier validState(uint256 proposalId, uint256 expected) {
        require(
            _proposals[proposalId].currState == expected,
            "Failed, state transitions not valid"
        );
        _;
    }

    modifier proposalParticipants(uint256 proposal) {
        require(
            _proposals[proposal].buyer == msg.sender ||
                _proposals[proposal].seller == msg.sender,
            "Not buyer or seller on Proposal"
        );
        _;
    }

    modifier proposalOwner(uint256 proposal) {
        require(
            _proposals[proposal].buyer == msg.sender,
            "Not buyer on Proposal"
        );
        _;
    }

    modifier rfpOwner(uint256 rfpId) {
        require(
            _rfps[rfpId].owner == msg.sender,
            "Cannot modify, you are not the owner of the RFP"
        );
        _;
    }

    modifier canSign(uint256 proposalId) {
        require(
            _proposals[proposalId].buyer == msg.sender ||
                _proposals[proposalId].seller == msg.sender,
            "Invalid user"
        );
        require(
            !(_proposals[proposalId].buyerSigned &&
                _proposals[proposalId].sellerSigned),
            "Proposal is already signed"
        );
        require(
            _proposals[proposalId].currState == 3,
            "RFP Is not ready to be signed"
        );
        _;
    }
}
