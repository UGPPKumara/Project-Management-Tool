import React from 'react';

const StatCard = ({ title, value, color }) => (
  <div className={`p-4 rounded-lg shadow-md text-white ${color}`}>
    <h3 className="text-sm font-medium uppercase">{title}</h3>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

export default StatCard;