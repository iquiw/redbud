const _ = require('koa-route');
const koa = require('koa');
const views = require('koa-views');
const send = require('koa-send');
const moment = require('moment');

const Redmine = require('./lib/redmine');

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
