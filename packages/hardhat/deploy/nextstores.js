const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
    // Named Accounts are for improving developer experience, can be configured in hardhat.config.js
    const { deployer } = await getNamedAccounts();
    const { deploy } = deployments;

    let Marketplace = await deploy("Marketplace", {
        from: deployer,
        contract: "Marketplace",
        args: [],
        log: true,
    });

    function storeContractData(contract) { 
        const fs = require("fs");
        const contractsDir = __dirname + "/../../react-app/abi";
      
        if (!fs.existsSync(contractsDir)) {
          fs.mkdirSync(contractsDir);
        }
      
        const MktPlaceArtifact = artifacts.readArtifactSync("Marketplace");
      
        fs.writeFileSync(
          contractsDir + "/Marketplace.json",
          JSON.stringify({address: contract.address, abi: MktPlaceArtifact.abi}, null, 2)
        );
    }

    storeContractData(Marketplace);
    
};

module.exports.tags = ["Marketplace"];
