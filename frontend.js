import { drawDayChart } from 'burndown';

document.addEventListener('DOMContentLoaded', function() {
  let vis = JSON.parse(document.getElementById('rdserve-issue-data').textContent);
  let dayChartOptions = JSON.parse(document.getElementById('rdserve-daychart-options').textContent);
  drawDayChart(vis, null, dayChartOptions);
});
