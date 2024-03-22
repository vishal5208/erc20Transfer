import React, { useState } from 'react';
import { ethers } from 'ethers';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import erc20Abi from './erc20Abi';

function TokenSender() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);

  const handleRecipientChange = (event) => {
    setRecipient(event.target.value);
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleContractAddressChange = (event) => {
    setContractAddress(event.target.value);
  };

  const handleWalletChange = (event) => {
    setWallet(event.target.value);
  };

  const handleCheckBalance = async () => {
    if (!wallet || !contractAddress) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(wallet);
    const contract = new ethers.Contract(contractAddress, erc20Abi, signer);
    
    const userBalance = await contract.balanceOf(wallet);
    setBalance(ethers.utils.formatEther(userBalance));
  };

  const handleSend = async () => {
    if (!wallet || !contractAddress || !amount || !recipient) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(wallet);
    const contract = new ethers.Contract(contractAddress, erc20Abi, signer);
    
    try {
      const tx = await contract.transfer(recipient, ethers.utils.parseEther(amount));
      await tx.wait();
      alert('Tokens sent successfully!');
    } catch (error) {
      console.error('Error sending tokens:', error);
      alert('Failed to send tokens.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <TextField
        label="ERC20 Contract Address"
        value={contractAddress}
        onChange={handleContractAddressChange}
        fullWidth
        margin="normal"
        sx={{ maxWidth: '400px' }}
      />
      <TextField
        label="Your Wallet Address"
        value={wallet}
        onChange={handleWalletChange}
        fullWidth
        margin="normal"
        sx={{ maxWidth: '400px' }}
      />
      <TextField
        label="Recipient Address"
        value={recipient}
        onChange={handleRecipientChange}
        fullWidth
        margin="normal"
        sx={{ maxWidth: '400px' }}
      />
      <TextField
        label="Amount"
        value={amount}
        onChange={handleAmountChange}
        fullWidth
        margin="normal"
        sx={{ maxWidth: '400px' }}
      />
      <Button variant="contained" color="primary" onClick={handleCheckBalance} style={{ marginBottom: '10px' }}>
        Check Balance
      </Button>
      <p>Your balance: {balance} ETH</p>
      <Button variant="contained" color="primary" onClick={handleSend}>
        Send Tokens
      </Button>
    </div>
  );
}

export default TokenSender;
