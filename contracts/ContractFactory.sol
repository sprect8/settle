pragma solidity >=0.4.21 <0.7.0;
import "./Contract.sol";


contract ContractFactory {
    // list of contracts
    mapping(address => Contract) private _contracts;
    // mapping()
    mapping(address => address[]) private _myContracts;

    address private _usersAddress;

    constructor(address usersAddress) public {
        _usersAddress = usersAddress;
    }

    function createContract(
        uint256 proposalId,
        address buyer,
        address seller,
        string memory docAddress,
        uint16[] memory volumes,
        uint16[] memory ppi,
        uint256[2] memory paymentTerms,
        uint256 dayTerms,
        uint256 currency
    ) public returns (address contractAddress) {
        Contract c = new Contract(
            proposalId,
            buyer,
            seller,
            docAddress,
            volumes,
            ppi,
            paymentTerms[0],
            paymentTerms[1],
            dayTerms,
            currency,
            _usersAddress
        );
        _contracts[address(c)] = c;
        _myContracts[buyer].push(address(c));
        _myContracts[seller].push(address(c));

        contractAddress = address(c);
    }

    function getMyContracts()
        public
        view
        returns (address[] memory contractAddresses)
    {
        contractAddresses = _myContracts[msg.sender];
    }
}
