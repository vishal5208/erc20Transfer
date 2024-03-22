import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function Wallet({ onChangeWallet }) {
  const [open, setOpen] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(null);

  // Load wallet address from localStorage when component mounts
  useEffect(() => {
    const storedWallet = localStorage.getItem('wallet');
    if (storedWallet) {
      setConnectedWallet(storedWallet);
      onChangeWallet(storedWallet); // Pass the connected wallet address back to the parent
    }
  }, []); // Run only once when component mounts

  const handleConnectWallet = async () => {
    try {
      // Prompt user to connect to their Ethereum wallet
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // If successful, get the connected wallet address
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        const walletAddress = accounts[0];
        setConnectedWallet(walletAddress);
        onChangeWallet(walletAddress); // Pass the connected wallet address back to the parent
        setOpen(false);
        // Save connected wallet address to localStorage
        localStorage.setItem('wallet', walletAddress);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      // Handle error connecting wallet (e.g., show error message)
    }
  };

  const handleDisconnectWallet = () => {
    // Clear connected wallet address
    setConnectedWallet(null);
    onChangeWallet(null); // Pass null to indicate wallet disconnection
    // Remove wallet address from localStorage
    localStorage.removeItem('wallet');
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const formatWalletAddress = (address) => {
    if (!address) return '';
    const firstFour = address.substring(0, 4);
    const lastThree = address.substring(address.length - 3);
    return `${firstFour}...${lastThree}`;
  };

  return (
    <div>
      {connectedWallet ? (
        <Button variant="outlined" color="secondary" onClick={handleDisconnectWallet}>
          {formatWalletAddress(connectedWallet)} (Disconnect)
        </Button>
      ) : (
        <Button variant="contained" color="primary" onClick={handleConnectWallet}>
          Connect Wallet
        </Button>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Connect Wallet</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To use this application, please connect your Ethereum wallet.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Wallet;
