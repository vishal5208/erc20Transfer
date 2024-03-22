import React, { useState, useEffect } from 'react';
import TokenSender from './TokenSender';
import Wallet from './components/Wallet';
import Grid from '@mui/material/Grid';

function App() {
  // Initialize wallet state from localStorage or null if not found
  const [wallet, setWallet] = useState(() => {
    const storedWallet = localStorage.getItem('wallet');
    return storedWallet !== null ? storedWallet : null;
  });

  useEffect(() => {
    localStorage.setItem('wallet', wallet);
  }, [wallet]);

  const handleWalletChange = (newWallet) => {
    setWallet(newWallet);
  };

  return (
    <div className="App">
      <header className="App-header">
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <h1>ERC20 Token Sender</h1>
          </Grid>
          <Grid item>
            <Wallet onChangeWallet={handleWalletChange} />
          </Grid>
        </Grid>
        <TokenSender wallet={wallet} />
      </header>
    </div>
  );
}

export default App;
