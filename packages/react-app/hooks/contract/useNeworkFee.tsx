// This hook is utilized to return network fee information
// import dependencies and utilities from react.
import { useState, useEffect } from "react";
// Import useFeeData for network fee information
import { useFeeData } from 'wagmi';

// Define the `useFeeInfo` hook.
export const useFeeInfo = () => {
    // Define the states for the gasPrice and maxFeePerGas
    const [gasPrice, setgasPrice] = useState<String | any>("")
    const [maxFeePerGas, setmaxFeePerGas] = useState<String | any>("")
    // Instanciate the `useFeeData` hook to retrive gas price data.
    var { data, isSuccess } = useFeeData({
        formatUnits: 'wei',
        watch: true,
        chainId: 44787,
        onSuccess(data) {
            console.log('Success', data)
            console.clear()
        },
    })

    // Assign gasPrice and maxFeePerGas to thier states
    useEffect(() => {
        if (isSuccess) {
            setgasPrice(data?.formatted.gasPrice);
            setmaxFeePerGas(data?.formatted.maxFeePerGas);
        }
    }, [isSuccess])
    // Return gasPrice and maxFeePerGas
    return { gasPrice, maxFeePerGas }
}