import fs from 'fs';
import moment from 'moment';
import request from 'superagent';

import dotenv from 'dotenv';

const CA_PATH = process.env['REDMINE_CA_PATH'];
const CA = CA_PATH ? fs.readFileSync(CA_PATH) : null;

export class Redmine {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey  = apiKey;
  }

  async getVersionIssues(verId) {
    let version = await this.getVersion(verId);
    let issues = await this.getIssues(verId);
    return {
      version: version.name,
      dueDate: version.due_date,
      issues: issues,
    };
  }

  async getVersion(verId) {
    let rsp = await this.request(`versions/${verId}.json`);
    return rsp.body.version;
  }

  async getIssues(verId) {
    let total;
    let offset = 0;
    let issues = [];
    while (!total || offset < total) {
      let rsp = await this.request(`issues.json`).query({
        'fixed_version_id': verId,
        'status_id': '*',
        'offset': offset
      });
      for (let issue of rsp.body.issues) {
        let open = moment(issue.created_on, moment.ISO_8601);
        let close = null;
        if (issue.closed_on) {
          close = moment(issue.closed_on, moment.ISO_8601);
        }
        issues.push({
          id: issue.id,
          open: open.format('YYYY-MM-DD'),
          close: close ? close.format('YYYY-MM-DD') : null,
        });
      }
      offset += rsp.body.issues.length;
      total = rsp.body.total_count;
    }
    return issues.reverse();
  }

  request(resource) {
    let url = this.baseUrl.replace(/\/$/, '') + '/' + resource;
    return request
      .get(url)
      .ca(CA)
      .set('X-Redmine-API-Key', this.apiKey);
  }
}
