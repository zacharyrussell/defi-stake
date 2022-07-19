import { useEffect, useState } from "react"
import { useContractFunction, useEthers } from "@usedapp/core"
import TokenFarm from "../chain-info/contracts/TokenFarm.json"
import Erc20 from "../chain-info/contracts/MockERC20.json"
import { utils, constants } from "ethers"
import { Contract } from "@ethersproject/contracts"
import networkMapping from "../chain-info/deployments/map.json"

/**
 * This hook is a bit messy but exposes a 'send' which makes two transactions.
 * The first transaction is to approve the ERC-20 token transfer on the token's contract.
 * Upon successful approval, a second transaction is initiated to execute the transfer by the TokenFarm contract.
 * The 'state' returned by this hook is the state of the first transaction until that has status "Succeeded".
 * After that it is the state of the second transaction.
 * @param tokenAddress - The token address of the token we wish to stake
 */
export const useStakeTokens = (tokenAddress: string) => {
    const { chainId } = useEthers()
    const { abi } = TokenFarm
    const tokenFarmContractAddress = chainId ? networkMapping[String(chainId)]["TokenFarm"][0] : constants.AddressZero

    const tokenFarmInterface = new utils.Interface(abi)

    const tokenFarmContract = new Contract(
        tokenFarmContractAddress,
        tokenFarmInterface
    )

    const ERC20ABI = Erc20.abi
    const erc20Interface = new utils.Interface(ERC20ABI)
    const erc20Contract = new Contract(tokenAddress, erc20Interface)
    const { send: approveErc20Send, state: approveErc20State } =
        useContractFunction(erc20Contract, "approve", {
            transactionName: "Approve ERC20 Transfer",
        })
    const approveAndStake = (amount: string) => {
        setAmountToStake(amount)
        return approveErc20Send(tokenFarmContractAddress, amount)
    }



    const { send: stakeSend, state: stakeState } = useContractFunction(tokenFarmContract, "stakeTokens", { transactionName: "Stake Tokens", })


    const [amountToStake, setAmountToStake] = useState("0")

    useEffect(() => {
        if (approveErc20State.status === "Success") {
            stakeSend(amountToStake, tokenAddress)
        }

    }, [approveErc20State, amountToStake, tokenAddress]) // eslint-disable-line react-hooks/exhaustive-deps

    const [state, setState] = useState(approveErc20State)

    useEffect(() => {
        if (approveErc20State.status === "Success") {
            setState(stakeState)
        } else {
            setState(approveErc20State)
        }
    }, [approveErc20State, stakeState])

    return { approveAndStake, state }
    // approve 

    // stake tokens
}