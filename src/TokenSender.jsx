import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import erc20Abi from './erc20Abi';

function TokenSender({ wallet }) {
  const [errorMessage, setErrorMessage] = useState('');
  const [expectedTime, setExpectedTime] = useState(null);


  const initialState = {
    recipient: localStorage.getItem('recipient') || '',
    amount: localStorage.getItem('amount') || '',
    contractAddress: localStorage.getItem('contractAddress') || '',
    balance: localStorage.getItem('balance') || 0,
    tokenSymbol: '', 
    transactionStatus: localStorage.getItem('transactionStatus') || 'idle', 
    transactionHash: localStorage.getItem('transactionHash') || null,
  };

  const [state, setState] = useState(initialState);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setState({ ...state, [name]: value });
  };

  const handleCheckBalance = async () => {
    const { contractAddress } = state;

    if (!wallet || !contractAddress) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(wallet);
    const contract = new ethers.Contract(contractAddress, erc20Abi, signer);

    try {
      const tokenSymbol = await contract.symbol();
      const userBalance = await contract.balanceOf(wallet);
      const formattedBalance = ethers.utils.formatUnits(userBalance, await contract.decimals());

      setState({ ...state, balance: formattedBalance, tokenSymbol });
      localStorage.setItem('balance', formattedBalance);
    } catch (error) {
      console.error('Error checking balance:', error);
      alert('Failed to check balance.');
    }
  };

    async function getExpectedTransactionTime(transactionHash, provider, confirmationsNeeded = 12) {
      try {
          const transactionReceipt = await provider.getTransactionReceipt(transactionHash);
          if (!transactionReceipt) {
              return null; // Transaction receipt not available yet
          }
          
          const currentBlockNumber = await provider.getBlockNumber();
          const blocksToConfirm = transactionReceipt.blockNumber - currentBlockNumber + confirmationsNeeded;
          const averageBlockTimeSeconds = 13; // Adjust this value based on the blockchain network
          
          const expectedTimeSeconds = blocksToConfirm * averageBlockTimeSeconds;
          return expectedTimeSeconds;
      } catch (error) {
          console.error('Error getting expected transaction time:', error);
          return null;
      }
  }


  const handleSend = async () => {
    const { contractAddress, amount, recipient } = state;
  
    if (!wallet || !contractAddress || !amount || !recipient) return;
  
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(wallet);
    const contract = new ethers.Contract(contractAddress, erc20Abi, signer);
  
    try {
      setState({ ...state, transactionStatus: 'pending' });

      const { contractAddress, amount, recipient } = state;
  
      if (!wallet || !contractAddress || !amount || !recipient) return;
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner(wallet);
      const contract = new ethers.Contract(contractAddress, erc20Abi, signer);
  
      const tx = await contract.transfer(recipient, ethers.utils.parseUnits(amount, await contract.decimals()));
      const transactionHash = tx.hash;
      localStorage.setItem('transactionHash', transactionHash); // Update local storage with new transaction hash
  
      // Wait for the transaction to be mined
      await tx.wait();
  
      // Get expected transaction time after transaction is mined
      const expectedTimeSeconds = await getExpectedTransactionTime(transactionHash, provider);
      console.log(expectedTime)
      setExpectedTime(expectedTimeSeconds); // Set expected time in state
  
      setState({ ...state, transactionStatus: 'success', transactionHash });

    } catch (error) {
      console.error('Error sending tokens:', error);
  
      // Handle "transaction was replaced" error
      if (error.code === 'TRANSACTION_REPLACED') {
        console.log('Replacement Transaction:', error.replacement);
        const gasPrice = error.replacement.gasPrice ? ethers.utils.formatUnits(error.replacement.gasPrice, 'gwei') : 'Unknown';
        const gasLimit = error.replacement.gasLimit ? error.replacement.gasLimit.toString() : 'Unknown';
        const errorMessage = `Gas Price: ${gasPrice} Gwei, Gas Limit: ${gasLimit}`;
        setErrorMessage(errorMessage);
        setState({ ...state, transactionStatus: 'replaced' });
      } else {
        let gasMessage = 'Failed to send tokens';
        if (error.gasPrice) {
          gasMessage += ` Gas Price: ${error.gasPrice.toString()}`;
        }
        if (error.gasLimit) {
          gasMessage += ` Gas Limit: ${error.gasLimit.toString()}`;
        }
        setErrorMessage(gasMessage);
        setState({ ...state, transactionStatus: 'failure' });
      }
    }
  };
  
  
  async function checkTransactionStatus(transactionHash, wallet) {
    if (!wallet || !transactionHash) return null;
  
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(wallet);
  
    try {
      // Check the most recent transaction status
      const transactionReceipt = await signer.provider.getTransactionReceipt(transactionHash);

      if (transactionReceipt) {
        if (transactionReceipt.status === 1) { // Status 1 indicates success
          return 'success';
        } else if (transactionReceipt.status === 0) { // Status 0 indicates failure
          return 'failure';
        }
      } else {
        // Transaction is still pending
        return 'pending';
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return 'error';
    }
  }
  
  useEffect(() => {
   
    const transactionHash = localStorage.getItem('transactionHash');
  
    // Call checkTransactionStatus function
    const checkStatusRecursively = async () => {
      try {
        const status = await checkTransactionStatus(transactionHash, wallet);
        // Update the state or take further action based on the transaction status
  
        if (status === 'pending') {
          // If transaction is still pending, wait for a few seconds and check again
          setTimeout(checkStatusRecursively, 5000); // Check again after 5 seconds
        }
      } catch (error) {
        console.error("Error checking transaction status:", error);
      }
    };  
  
    if (transactionHash) {
      checkStatusRecursively();
    }
  }, []);
  
  
  

  useEffect(() => {
    const getTransactionStatus = async () => {
      if (!wallet || !state.transactionHash) return;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner(wallet);

      try {
        const transactionReceipt = await signer.provider.getTransactionReceipt(state.transactionHash);
        if (transactionReceipt) {
          if (transactionReceipt.status === 1) { 
            setState(prevState => ({ ...prevState, transactionStatus: 'success' }));
            localStorage.removeItem('transactionHash'); 
          } else if (transactionReceipt.status === 0) { 
            setState(prevState => ({ ...prevState, transactionStatus: 'failure' }));
          }
        } else {
          setTimeout(getTransactionStatus, 2000);
        }
      } catch (error) {
        console.error('Error checking transaction status:', error);
        setState(prevState => ({ ...prevState, transactionStatus: 'failure' }));
      }
    };

    getTransactionStatus();
  }, [state.transactionHash, wallet]);

  useEffect(() => {
    Object.keys(state).forEach(key => localStorage.setItem(key, state[key]));
  }, [state]);

 


  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px', width: '100%', maxWidth: '500px' }}>
        <Button variant="contained" color="primary" onClick={handleCheckBalance} style={{ marginBottom: '10px' }}>
          Check Balance
        </Button>
        <p>Your balance: {state.balance} {state.tokenSymbol}</p>
        <p>Sender: {wallet}</p>
      </div>
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', width: '100%', maxWidth: '500px' }}>
        <TextField
          label="ERC20 Contract Address"
          name="contractAddress"
          value={state.contractAddress}
          onChange={handleChange}
          fullWidth
          margin="normal"
          sx={{ marginBottom: '20px' }}
        />
        <TextField
          label="Recipient Address"
          name="recipient"
          value={state.recipient}
          onChange={handleChange}
          fullWidth
          margin="normal"
          sx={{ marginBottom: '20px' }}
        />
        <TextField
          label="Amount"
          name="amount"
          value={state.amount}
          onChange={handleChange}
          fullWidth
          margin="normal"
          sx={{ marginBottom: '20px' }}
        />
        <Button variant="contained" color="primary" onClick={handleSend}>
          Send Tokens
        </Button>
        {state.transactionStatus === 'pending' && <p>Transaction is pending...</p>}
        {state.transactionStatus === 'success' && <p>Transaction succeeded!</p>}
        {state.transactionStatus === 'failure' && <p>Transaction failed.</p>}
        {state.transactionStatus === 'replaced' && <p style={{ fontSize: '24px', color: 'red' }}>Transaction was replaced!</p>}
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        {expectedTime && <p>Expected time for transaction to be mined: {expectedTime} seconds</p>}
        {state.transactionHash && <p>Transaction Hash: {state.transactionHash}</p>}


      </div>
    </div>
  );
}

export default TokenSender;
