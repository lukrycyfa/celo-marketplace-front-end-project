// This hook is used make write calls to a smart contract (send transactions)
// Import the wagmi hooks to prepare and write to a smart contract
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
// Import the Marketplace ABI(Interface)
import MarketplaceInstance from "../../abi/Marketplace.json";
// Import BigNumber from ethers to handle big numbers used in Celo
import { BigNumber } from "ethers";

// write to a smart contract
export const useContractSend = (functionName: string, args: Array<any>, enablequery: boolean) => {
    // The gas limit to use when sending a transaction
    const gasLimit = BigNumber.from(1000000);
    const { config } = usePrepareContractWrite({
        // The address of the smart contract, in this case the Marketplace from the JSON file
        address: MarketplaceInstance.address as `0x${string}`,
        // The ABI of the smart contract, in this case the Marketplace from the JSON file
        abi: MarketplaceInstance.abi,
        // The smart contract function name to call
        functionName,
        // // The arguments to pass to the smart contract function
        args,
        // // Sets the automatically query state. 
        enabled: enablequery,
        onSettled(data, error) {
            console.log('Settled-0', { data, error })
        },
    })
    // Write to the smart contract using the prepared config
    var { data, isSuccess, write, writeAsync, error, isLoading } = useContractWrite(config)
    return { data, isSuccess, write, writeAsync, isLoading }

}