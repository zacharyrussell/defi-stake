
import { Token } from "../Main"
import { useNotifications } from "@usedapp/core"

import { Button, Input, CircularProgress, Snackbar } from "@material-ui/core"
import React, { useEffect, useState } from "react"
import { Alert } from "@material-ui/lab"
import { useStakeTokens } from "../../hooks/useStakeTokens"
import { utils } from "ethers"

export interface StakeFormProps {
    token: Token
}


export const StakeForm = ({ token }: StakeFormProps) => {

    const { address: tokenAddress } = token // eslint-disable-line react-hooks/exhaustive-deps
    //const { account } = useEthers()
    //const tokenBalance = useTokenBalance(tokenAddress, account)
    //const formattedTokenBalance: number = tokenBalance ? parseFloat(formatUnits(tokenBalance, 18)) : 0 // eslint-disable-line react-hooks/exhaustive-deps
    const [amount, setAmount] = useState<number | string | Array<number | string>>(0)
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = event.target.value === "" ? "" : Number(event.target.value)
        setAmount(newAmount)
    }
    const { notifications } = useNotifications()

    const { approveAndStake, state: approveErc20State } = useStakeTokens(tokenAddress)
    const handleStakeSubmit = () => {
        const amountAsWei = utils.parseEther(amount.toString())
        return approveAndStake(amountAsWei.toString())
    }


    const isMining = approveErc20State.status === "Mining"
    const [showErc20ApprovalSuccess, setShowErc20ApprovalSuccess] = useState(false)
    const [showStakeTokenSuccess, setShowStakeTokenSucess] = useState(false)
    const handleCloseSnack = () => {
        setShowErc20ApprovalSuccess(false)
        setShowStakeTokenSucess(false)
    }

    useEffect(() => {
        if (notifications.filter(
            (notification) =>
                notification.type === "transactionSucceed" &&
                notification.transactionName === "Approve ERC20 Transfer").length > 0) {
            setShowErc20ApprovalSuccess(true)
            setShowStakeTokenSucess(false)
        }
        if (notifications.filter(
            (notification) =>
                notification.type === "transactionSucceed" &&
                notification.transactionName === "Stake Tokens").length > 0) {
            setShowErc20ApprovalSuccess(false)
            setShowStakeTokenSucess(true)
        }



    }, [notifications, showErc20ApprovalSuccess, showStakeTokenSuccess])
    return (
        <>
            <div>
                <Input
                    onChange={(handleInputChange)} />
                <Button
                    onClick={handleStakeSubmit}
                    color="primary"
                    size="large"
                    disabled={isMining}>
                    {isMining ? <CircularProgress size={26} /> : "Stake!"}</Button>
            </div>
            <Snackbar
                open={showErc20ApprovalSuccess}
                autoHideDuration={5000}
                onClose={handleCloseSnack}>
                <Alert onClose={handleCloseSnack} severity="success">
                    ERC-20 token transfer approved! Now approve the 2nd transcation
                </Alert>
            </Snackbar>
            <Snackbar
                open={showStakeTokenSuccess}
                autoHideDuration={5000}
                onClose={handleCloseSnack}>
                <Alert onClose={handleCloseSnack} severity="success">
                    Token Staked!
                </Alert>
            </Snackbar>
        </>
    )
}