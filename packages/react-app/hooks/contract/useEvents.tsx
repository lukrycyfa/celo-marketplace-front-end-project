// This hook is utilzed to make use of logs from Approved events specifically
// for buyers from this market place utilizing the useApprove hook to approve the purchase of a product
// import dependencies and utilities from react.
import { useState, useEffect } from "react";
// Import the `useContractEvent` hook to from wagmi
import { useContractEvent } from 'wagmi';
// Import the ERC20 ABI(Interface)
import Erc20Instance from "../../abi/erc20.json";
// Import the Marketplace ABI(Interface)
import MarketplaceInstance from "../../abi/Marketplace.json";

// Define the `useContractEvents` hook taking an `eventName`, `address` and `confirm` as parameters
export const useContractEvents = (eventName: String | any, address: String | any, confirm: boolean) => {
    // Sets the state for an approved event
    const [approvedEvent, setApprovedEvent] = useState(false);
    // Sets the logs returned from the event
    const [logs, setLogs] = useState<[] | any>([])
    // Prepare the hooke to subscribe to the Erc20 Smart contract
    const unwatch = useContractEvent({
        // The address of the smart contract, in this case the ERC20 cUSD token address from the JSON file
        address: Erc20Instance.address as `0x${string}`,
        // The ABI of the smart contract, in this case the ERC20 cUSD token address from the JSON file
        abi: Erc20Instance.abi,
        // The smart contract even to listen to
        eventName: eventName,
        //Sets Logs from log returned to the listner and unsubscribes from the event `unwatch?.()`
        listener(log) {
            console.log(log)
            setLogs(log);
            unwatch?.();
        },
    })

    // Sets `approvedEvent` and `Logs` states... 
    // if args from the approved event matches the caller adddress, the marketplace address and `confirm` from the requesting component ('product')
    useEffect(() => {
        if (logs.length > 0) {
            var _aprIdx = logs.findIndex((lg: object | any) => lg.args.owner.toUpperCase() == address.toUpperCase() &&
                lg.args.spender.toUpperCase() == MarketplaceInstance.address.toUpperCase())
            if (_aprIdx >= 0 && confirm) {
                setApprovedEvent(true);
                setLogs([]);
            }
        }
    }, [logs, unwatch, confirm]);

    // returns approvedEvent and setApprovedEvent
    return { approvedEvent, setApprovedEvent };

}