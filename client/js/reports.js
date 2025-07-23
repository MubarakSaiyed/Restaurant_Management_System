// client/js/reports.js

import { authedFetch } from './api.js';

async function drawSales() {
  const res  = await authedFetch('/reports/sales?days=7');
  const data = await res.json();
  const labels = data.map(d => d.date);
  const values = data.map(d => parseFloat(d.revenue));

  new Chart(document.getElementById('chart-sales'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Revenue (NPR)',
        data: values,
        borderColor: '#6D4C41',
        backgroundColor: 'rgba(109,76,65,0.2)',
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: v => 'NPR ' + v }
        }
      }
    }
  });
}

async function drawInventory() {
  const res  = await authedFetch('/reports/inventory-trends');
  const data = await res.json();
  const labels = data.map(d => d.name);
  const sold   = data.map(d => d.sold);
  const stock  = data.map(d => d.stock);

  new Chart(document.getElementById('chart-inventory'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Sold',
          data: sold,
          backgroundColor: 'rgba(109,76,65,0.7)'
        },
        {
          label: 'In Stock',
          data: stock,
          backgroundColor: 'rgba(215,204,200,0.7)'
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        x: { beginAtZero: true }
      }
    }
  });
}

async function drawStaff() {
  const res  = await authedFetch('/reports/staff-kpis');
  const data = await res.json();
  const labels = data.map(d => d.name);
  const values = data.map(d => d.count);

  new Chart(document.getElementById('chart-staff'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Orders Processed',
        data: values,
        backgroundColor: 'rgba(109,76,65,0.7)'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  drawSales();
  drawInventory();
  drawStaff();
});
