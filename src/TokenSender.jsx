import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import erc20Abi from './erc20Abi';

function TokenSender({ wallet }) {
  const initialState = {
    recipient: localStorage.getItem('recipient') || '',
    amount: localStorage.getItem('amount') || '',
    contractAddress: localStorage.getItem('contractAddress') || '',
    balance: localStorage.getItem('balance') || 0,
    tokenSymbol: '', // Initialize token symbol state
    transactionStatus: localStorage.getItem('transactionStatus') || 'idle', // Transaction status: idle, pending, success, or failure
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
      // Fetch token symbol
      const tokenSymbol = await contract.symbol();

      // Fetch user balance
      const userBalance = await contract.balanceOf(wallet);
      const formattedBalance = ethers.utils.formatUnits(userBalance, await contract.decimals());

      setState({ ...state, balance: formattedBalance, tokenSymbol });
      // Save balance to localStorage
      localStorage.setItem('balance', formattedBalance);
    } catch (error) {
      console.error('Error checking balance:', error);
      alert('Failed to check balance.');
    }
  };

  const handleSend = async () => {
    const { contractAddress, amount, recipient } = state;
  
    if (!wallet || !contractAddress || !amount || !recipient) return;
  
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(wallet);
    const contract = new ethers.Contract(contractAddress, erc20Abi, signer);
  
    try {
      setState({ ...state, transactionStatus: 'pending' }); // Set transaction status to pending
      localStorage.setItem('transactionStatus', 'pending'); // Update transaction status in localStorage
  
      const tx = await contract.transfer(recipient, ethers.utils.parseUnits(amount, await contract.decimals()));
      await tx.wait();
      setState({ ...state, transactionStatus: 'success' }); // Set transaction status to success
      localStorage.setItem('transactionStatus', 'success'); // Update transaction status in localStorage
    } catch (error) {
      console.error('Error sending tokens:', error);
      setState({ ...state, transactionStatus: 'failure' }); // Set transaction status to failure
      localStorage.setItem('transactionStatus', 'failure'); // Update transaction status in localStorage
    }
  };
  

  // Save state to localStorage on state change
  useEffect(() => {
    Object.keys(state).forEach(key => localStorage.setItem(key, state[key]));
  }, [state]);

  // Listen for changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const transactionStatus = localStorage.getItem('transactionStatus') || 'idle';
      setState(prevState => ({ ...prevState, transactionStatus }));
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
      </div>
    </div>
  );
}

export default TokenSender;
