pragma solidity >=0.4.21 <0.7.0;


contract Users {
    struct UserStruct {
        address addr;
        string name;
        uint256 role;
        uint256[3] currencies;
    }

    event UserRegistered(address addr, uint256[3] currencies);

    mapping(address => UserStruct) private _users;

    function register(string memory name, uint256 role) public notRegistered {
        _users[msg.sender] = UserStruct(
            msg.sender,
            name,
            role,
            [uint256(10 * 100*100*100), uint256(1000 * 100*100*100), uint256(500 * 100*100*100)]
        );
        // emit UserRegistered(msg.sender, _users[msg.sender].currencies);
    }

    function getBalance(address addr)
        public
        view
        returns (uint256[3] memory currencies)
    {
        currencies = _users[addr].currencies;        
    }

    function getMyBalance()
        public
        view
        returns (uint256[3] memory currencies)
    {
        UserStruct memory user = _users[msg.sender];
        currencies = user.currencies;        
    }

    // this is only here for PoC, realistically we would integrate directly with the currency in question
    function updateBalance(address user, uint256 currencyId, uint256 balance)
        public
    {
        _users[user].currencies[currencyId % 3] += balance;
    }

    function decreaseBalance(address user, uint256 currencyId, uint256 balance)
        public
    {
        _users[user].currencies[currencyId % 3] -= balance;
    }

    function userExists()
        public
        view
        returns (bool exists, string memory name, uint256 role)
    {
        exists = _users[msg.sender].role > 0;
        name = _users[msg.sender].name;
        role = _users[msg.sender].role;
    }

    function getUser(address addr)
        public
        view
        returns (string memory name, uint256 role)
    {
        name = _users[addr].name;
        role = _users[addr].role;
    }

    modifier notRegistered() {
        require(_users[msg.sender].role < 1, "User already registered");
        _;
    }
}
