// This hook is utilized to return connection status, address and account balance
// Import useAccount, useBalance from wagmi for connection status, address and account balance
import { useAccount, useBalance } from 'wagmi';
// Import the ERC20 ABI(Interface)
import erc20Instance from "../../abi/erc20.json";

// Define the `useRetriveBalance` hook.
export const useRetriveBalance = () => {
  // Retrive connected account's `address` and isConnected status.
  const { address, isConnected } = useAccount();
  // Retrive connected account's balance for the erc20Instance
  const { data: cusdBalance } = useBalance({
    address,
    token: erc20Instance.address as `0x${string}`,
    watch: true,
  });

  // Return the `address`, `balance` and `isConnected`
  return { address, cusdBalance, isConnected }
}