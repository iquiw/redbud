import _ from 'koa-route';
import koa from 'koa';
import views from '@ladjs/koa-views';
import send from 'koa-send';
import moment from 'moment';

import { Redmine } from './lib/redmine.js';

const PATH_PREFIX = process.env['REDBUD_PATH_PREFIX'] || '';
const PORT = process.env['REDBUD_PORT'] || '3000';

function isValidVersion(s) {
  return s && /^\d+$/.test(s);
}

function isValidDate(s) {
  return s && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function setError(ctx, msg) {
  ctx.status = 400;
  ctx.body = {
    error: msg
  };
}

async function index(ctx) {
  const redmine = new Redmine(process.env['REDMINE_BASE_URL'], process.env['REDMINE_API_KEY']);

  let {
    versionId,
    startDate,
    endDate,
    dueDate,
    label,
    step,
  } = ctx.request.query;

  if (!isValidVersion(versionId)) {
    setError(ctx, 'Please specify version number as "versionId".');
    return;
  }

  if (!isValidDate(startDate)) {
    setError(ctx, 'Please specify "startDate" in YYYY-MM-DD format.');
    return;
  }

  let vis = await redmine.getVersionIssues(versionId);
  vis.startDate = startDate;
  vis.endDate = endDate || moment().subtract(1, 'days').format('YYYY-MM-DD');
  vis.dueDate = dueDate || vis.dueDate;

  if (!isValidDate(vis.dueDate)) {
    setError(ctx, 'Please specify "dueDate" in the version or as query string in YYYY-MM-DD format.');
    return;
  }

  await ctx.render('index.html', {
    issues: JSON.stringify(vis),
    dayChartOptions: JSON.stringify({
      showLabel: label != '0',
      stepSize: Number.parseInt(step, 10)
    }),
    prefix: PATH_PREFIX
  });
}

const app = new koa();
app
  .use(views('views', { map: { html: 'nunjucks' } }))
  .use(_.get(PATH_PREFIX + '/', index))
  .use(_.get(PATH_PREFIX + '/dist/index.js', async (ctx) => {
    await send(ctx, 'dist/index.js');
  }));
app.listen(PORT);
