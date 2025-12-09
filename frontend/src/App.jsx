import React, { useEffect, useState } from 'react';
import './App.css';

import Header from './components/Header';
import PortfolioSummary from './components/PortfolioSummary';
import AccountFilters from './components/AccountFilters';
import AccountsTable from './components/AccountsTable';
import RiskDistributionChart from './components/RiskDistributionChart';
import InterventionSlide from './components/InterventionSlide';

const API_BASE = 'http://127.0.0.1:8000';

function App() {
  const [summary, setSummary] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRiskBand, setSelectedRiskBand] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [error, setError] = useState('');

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/portfolio/summary`);
      if (!res.ok) throw new Error('Failed to load summary');
      const data = await res.json();
      setSummary(data);
    } catch (e) {
      setError(e.message || 'Error loading summary');
    }
  };

  const fetchAccounts = async (riskBand) => {
    try {
      let url = `${API_BASE}/api/accounts`;
      if (riskBand) {
        url += `?risk_band=${encodeURIComponent(riskBand)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load accounts');
      const data = await res.json();
      setAccounts(data);
    } catch (e) {
      setError(e.message || 'Error loading accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchSummary(), fetchAccounts(selectedRiskBand)])
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRiskBand]);

  const onSelectAccount = (account) => {
    setSelectedAccount(account);
  };

  const closeSlide = () => {
    setSelectedAccount(null);
  };

  const getIntervention = (account) => {
    switch (account.risk_band) {
      case 'Critical':
        return 'Critical Action: Immediate Outbound Call & Freeze Credit Limit';
      case 'High':
        return 'High Priority: Offer Payment Plan & Reduce Credit Limit';
      case 'Medium':
        return 'Caution: Send Payment Reminder & Financial Education Resources';
      case 'Low':
        return 'Opportunity: Offer Credit Limit Increase & Cross-sell Personal Loan';
      default:
        return 'No specific intervention required.';
    }
  };

  return (
    <div className="App">
      <Header />

      {error && <div className="error">{error}</div>}

      <PortfolioSummary summary={summary} />

      <AccountFilters
        selectedRiskBand={selectedRiskBand}
        onRiskBandChange={setSelectedRiskBand}
      />

      <section className="content-section">
        <AccountsTable
          accounts={accounts}
          loading={loading}
          onSelectAccount={onSelectAccount}
        />
        <RiskDistributionChart summary={summary} />
      </section>

      <div className={`intervention-slide ${selectedAccount ? 'open' : ''}`}>
        <InterventionSlide
          selectedAccount={selectedAccount}
          onClose={closeSlide}
          getIntervention={getIntervention}
        />
      </div>
    </div>
  );
}

export default App;
