

const getInboxItems = async (page) => {

    // category, product, description, sender, date, lastModified
    const data = [
        {
            category: 'rfp',
            product: 'Iron Ore Shipment',
            description: "Iron Ore - 200 tonnes",
            sender: 'Rio Tinto',
            date: "2020-May-22",
            lastModified: "5 minutes ago"
        },
        {
            category: 'rfp',
            product: 'Iron Ore Shipment',
            description: "Iron Ore - 200 tonnes",
            sender: 'Rio Tinto',
            date: "2020-May-22",
            lastModified: "5 minutes ago"
        },
        {
            category: 'po',
            product: 'Iron Ore Shipment',
            description: "Iron Ore - 200 tonnes",
            sender: 'Rio Tinto',
            date: "2020-May-22",
            lastModified: "5 minutes ago"
        },
        {
            category: 'invoice',
            product: 'Iron Ore Shipment',
            description: "Iron Ore - 200 tonnes",
            sender: 'Rio Tinto',
            date: "2020-May-22",
            lastModified: "5 minutes ago"
        },
    ];

    return data;
};

export {
    getInboxItems
};