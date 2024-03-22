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
  };

  const [state, setState] = useState(initialState);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setState({ ...state, [name]: value });
  };

  const handleCheckBalance = async () => {
    const {contractAddress } = state;

    if (!wallet || !contractAddress) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(wallet);
    console.log(signer)
    const contract = new ethers.Contract(contractAddress, erc20Abi, signer);
    
    try {
      // Fetch token symbol
      const tokenSymbol = await contract.symbol();
    
      console.log(tokenSymbol)

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
    const { wallet, contractAddress, amount, recipient } = state;
    if (!wallet || !contractAddress || !amount || !recipient) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(wallet);
    const contract = new ethers.Contract(contractAddress, erc20Abi, signer);
    
    try {
      const tx = await contract.transfer(recipient, ethers.utils.parseUnits(amount, await contract.decimals()));
      await tx.wait();
      alert('Tokens sent successfully!');
    } catch (error) {
      console.error('Error sending tokens:', error);
      alert('Failed to send tokens.');
    }
  };

  // Save state to localStorage on state change
  useEffect(() => {
    Object.keys(state).forEach(key => localStorage.setItem(key, state[key]));
  }, [state]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <TextField
        label="ERC20 Contract Address"
        name="contractAddress"
        value={state.contractAddress}
        onChange={handleChange}
        fullWidth
        margin="normal"
        sx={{ maxWidth: '400px' }}
      />
      <TextField
        label="Recipient Address"
        name="recipient"
        value={state.recipient}
        onChange={handleChange}
        fullWidth
        margin="normal"
        sx={{ maxWidth: '400px' }}
      />
      <TextField
        label="Amount"
        name="amount"
        value={state.amount}
        onChange={handleChange}
        fullWidth
        margin="normal"
        sx={{ maxWidth: '400px' }}
      />
      <Button variant="contained" color="primary" onClick={handleCheckBalance} style={{ marginBottom: '10px' }}>
        Check Balance
      </Button>
      <p>Your balance: {state.balance} {state.tokenSymbol}</p> {/* Display token symbol */}
      <p>Sender: {wallet}</p> 
      <Button variant="contained" color="primary" onClick={handleSend}>
        Send Tokens
      </Button>
    </div>
  );
}

export default TokenSender;
