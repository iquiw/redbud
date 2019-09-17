import { drawDayChart } from 'burndown';

document.addEventListener('DOMContentLoaded', function() {
  let vis = JSON.parse(document.getElementById('rdserve-issue-data').textContent);
  drawDayChart(vis);
});
