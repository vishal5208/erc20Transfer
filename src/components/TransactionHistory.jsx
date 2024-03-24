import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const TransactionHistory = () => {
  const [history, setHistory] = useState([]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const updatedHistory = JSON.parse(localStorage.getItem('transactionHistory')) || [];
      setHistory(updatedHistory);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const chunks = (arr, size) => {
    return arr.reduce((chunks, el, i) => (i % size ? chunks[chunks.length - 1].push(el) : chunks.push([el])) && chunks, []);
  };

  const historyChunks = chunks(history, 4);

  return (
    <Card variant="outlined" style={{ marginTop: '20px', width: '100%', maxWidth: '100%' }}>
      <CardContent>
        <Typography variant="h5" component="h2">
          Transaction History
        </Typography>
        {historyChunks.map((chunk, index) => (
          <Box key={index} display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center">
            {chunk.map((transaction, idx) => (
              <Box key={idx} margin="10px" border="1px solid #ccc" borderRadius="5px" padding="20px" style={{ display: 'inline-block', width: '23%', minWidth: '300px' }}>
                <Typography variant="body1" gutterBottom>
                  Recipient: {`${transaction.recipient.slice(0, 3)}...${transaction.recipient.slice(-4)}`}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Amount: {transaction.amount}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Contract Address: {`${transaction.contractAddress.slice(0, 3)}...${transaction.contractAddress.slice(-4)}`}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Status: {transaction.status}
                </Typography>
                <Box display="flex" alignItems="center">
                  <Typography variant="body1" gutterBottom style={{ marginRight: '10px', flex: 1 }}>
                    Transaction Hash: {transaction.transactionHash.slice(0, 12)}...{' '}
                  </Typography>
                  <button onClick={() => copyToClipboard(transaction.transactionHash)} style={{ padding: '5px' }}>Copy</button>
                </Box>
              </Box>
            ))}
            {/* Fill with empty boxes if there are less than 4 transactions */}
            {[...Array(Math.max(4 - chunk.length, 0))].map((_, emptyIdx) => (
              <Box key={`empty-${emptyIdx}`} margin="10px" style={{ display: 'inline-block', width: '23%', minWidth: '300px' }}></Box>
            ))}
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
