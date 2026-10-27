// Product configuration, not a source of market data. Providers validate symbols.
export const portfolio = [
  ['RELIANCE', 'Reliance Industries', 'Energy'], ['TCS', 'Tata Consultancy Services', 'Technology'],
  ['HDFCBANK', 'HDFC Bank', 'Banking'], ['INFY', 'Infosys', 'Technology'],
  ['ICICIBANK', 'ICICI Bank', 'Banking'], ['BHARTIARTL', 'Bharti Airtel', 'Telecom'],
  ['LT', 'Larsen & Toubro', 'Industrials'], ['ITC', 'ITC', 'Consumer'],
  ['SUNPHARMA', 'Sun Pharmaceutical', 'Healthcare'], ['EICHERMOT', 'Eicher Motors', 'Auto'],
  ['TITAN', 'Titan Company', 'Consumer'], ['MARICO', 'Marico', 'Consumer'],
  ['CDSL', 'Central Depository Services', 'Financial services'], ['POLYCAB', 'Polycab India', 'Industrials'],
  ['APLAPOLLO', 'APL Apollo Tubes', 'Materials'],
].map(([symbol, name, sector]) => ({ symbol, name, sector }));
