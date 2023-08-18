// This hook is utilzed to return network fee information
// Import useFeeData for network fee information
import { useFeeData } from 'wagmi';

// Define the `useFeeInfo` hook.
export const useFeeInfo = () => {
    // Instanciate the `useFeeData` hook to retrive gas price data.
    var { data, isSuccess, status, error, isLoading } = useFeeData({
        formatUnits: 'wei',
        watch: true,
        chainId: 44787,
        onSuccess(data) {
            console.log('Success', data)
        },
    })
    // Return data and other states.
    return { data, isSuccess, status, error, isLoading }
}