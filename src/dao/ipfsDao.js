import IPFS from "ipfs-http-client";

const IPFSNode = IPFS({ host: "ipfs.infura.io", port: 5001, protocol: "https" });
console.log('IPFS node is ready');


const createIPFS = async (json) => {
    const result = await IPFSNode.add(JSON.stringify(json));//uffer.from(JSON.stringify(rfp)));

    // .then(res => {
    //     const hash = res[0].hash
    //     console.log('added data hash:', hash)
    //     return ipfs.files.cat(hash)
    // })
    // .then(output => {
    //     console.log('retrieved data:', JSON.parse(output))
    // })
    let filePath;
    for await (const file of result) {
        console.log("TCL: App -> forawait -> file", file);
        filePath = file.path;
    }
    console.log("FilePath", filePath);
    return filePath;
}


export default IPFSNode;
export {
    createIPFS
};