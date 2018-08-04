const _ = require('lodash');
const config = require('./test.config');
const Koa = require('koa');
const app = new Koa();

const morgan = require('koa-morgan');
const winston = require('../lib/winston')('server');
app.use(morgan('tiny', { stream: winston.stream }));

const data = require('./testData.json');
const adapter = require('../index');
app.use(adapter({
  caldavRoot: 'caldav',
  authMethod: async (user, pass) => {
    winston.debug(`user: ${user}, pass: ${pass}`);
    if (pass === 'pass') {
      return {
        user: user
      };
    }
  },
  getCalendar: async (userId, calendarId) => {
    return data.calendars[calendarId];
  },
  getEventsByDate: async (userId, calendarId, start, end) => {
    return _.filter(data.events, (v) => {
      return v.calendarId === calendarId &&
        v.startDate >= start &&
        v.endDate <= end;
    });
  }
}));

app.use((ctx) => {
  ctx.body = 'outside caldav server';
});

app.listen(config.port, () => winston.debug('Server started'));