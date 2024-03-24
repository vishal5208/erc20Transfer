import React from 'react';
import TokenSender from './TokenSender';
import Wallet from './components/Wallet';
import Grid from '@mui/material/Grid';
import TransactionHistory from './components/TransactionHistory';

import { WalletProvider } from './components/WalletContext';

function App() {
  return (
    <WalletProvider>
      <div className="App">
        <header className="App-header">
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item xs={12} md={6}>
              <h1>ERC20 Token Sender</h1>
            </Grid>
            <Grid item xs={12} md={6} style={{ textAlign: 'right' }}>
              <Wallet />
            </Grid>
          </Grid>
          <TokenSender />
        </header>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={10} lg={8} xl={6}>
            <TransactionHistory />
          </Grid>
        </Grid>
      </div>
    </WalletProvider>
  );
}

export default App;
