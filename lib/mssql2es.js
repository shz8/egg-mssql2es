'use strict';

const assert = require('assert');
const mssql = require('mssql');
const common = require('./common');
const elasticsearch = require('elasticsearch');
const fs = require('fs');
/*
module.exports = async app => {
    await common.sleep(6000);
    async function init(){

    };
    await init();
    return {
        async task() {
            console.log('task', new Date())
        }
    }
};
*/
let rules = {};
class mssql2es {
    set rules(val) {
        rules = val;
    }
    get rules() {
        return rules;
    }
    constructor(_app) {
        this.app = _app;
        this.logger = _app.logger;
    }
    async task() {
        for (let k in this.rules) {
            this.processTask(this.rules[k], k);
        }
    }
    async updatedata(d) {
        console.log(d)
        if (d && d.key) {
            if (this.rules[d.key]) {
                this.rules[d.key][d.field] = d.val;
            }
        }
    }
    async sendtoapp(d) {
        this.app.messenger.sendToApp('updatedata', d);
    }
    async processTask(rule, k) {
        let max = ''
        try {
            let config = (rule.input && rule.input.cfg) || {}
            rule.total = rule.total || 0
            await this.sendtoapp({ key: k, field: 'total', val: (rule.total+1) })
            if ((rule.total-1) % config.interval > 0) return;
            if (this.rules[k].isrunning) return;
            await this.sendtoapp({ key: k, field: 'isrunning', val: true })
            if (rule.input && rule.output && rule.esclient) {
                max = config.max;
                let index = rule.output.index;
                let file = `./logs/${index._index}_${index._type}.txt`;
                if (fs.existsSync(file)) {
                    max = fs.readFileSync(file);
                }
                let sql = `select top ${config.size || 1000} ${config.fields || '*'} from ${config.table} where ${config.order}>'${max}' order by ${config.order}`;
                await this.logger.info(sql)
                let pkey = config.pkey || config.order || '';
                pkey = pkey.split('.')[pkey.split('.').length - 1]
                let pool = await this.getClient(rule.input.db);
                let request = new mssql.Request(pool);
                let rlt = await request.query(sql);
                pool && pool.close();
                let data = rlt.recordset;
                if (data && data.length > 0) {
                    let newmax = data[data.length - 1][pkey];
                    if (newmax && typeof newmax != 'string' && newmax.length > 0) {
                        newmax = newmax[0]
                    }
                    let len = data.length;
                    for (let idx = len - 1; idx >= 0; idx--) {
                        if (config.dateformat) {
                            for (let key in data[idx]) {
                                if (data[idx][key] instanceof Date) {
                                    data[idx][key] = common.format(data[idx][key])
                                }
                            }
                        }
                        data.splice(idx, 0, { index: { _index: index._index, _type: index._type, _id: `${data[idx][pkey]}` } })
                    }
                    await this.iM(data, rule.esclient);
                    await this.logger.info(`complate:${data.length} 条数据！`)
                    fs.writeFileSync(file, newmax);
                }
            }
        }
        catch (err) {
            this.app.logger.error(err);
        }
        await this.logger.info('max=' + max + '    ' + new Date())
        //this.rules[k].isrunning = false;
        await this.sendtoapp({ key: k, field: 'isrunning', val: false });
    }
    async iM(d, esclient) {
        try {
            let rlt = await esclient.bulk({
                body: d // 文档到内容
            });
            //console.log(rlt)
        }
        catch (err) {
            this.logger.error(err)
        }
    };
    async init() {
        this.rules = {};
        this.logger.info('init mssql2es')
        if (this.app.config.mssql2es) {
            this.rules = this.app.config.mssql2es.rules;
            for (let k in this.rules) {
                try {
                    let r = this.rules[k];
                    let cfg = r.input.cfg;
                    if (!(Number.isInteger(cfg.interval) && cfg.interval > 0)) {
                        cfg.interval = 5;
                    }
                    this.rules[k].input.cfg = cfg;
                    if (r.input && r.output) {
                        let es = r.output.es || this.app.config.mssql2es.es;
                        if (es) {
                            this.rules[k].esclient = new elasticsearch.Client(es);
                        }
                        if (r.input.db) {

                        }
                    }
                }
                catch (err) {
                    this.logger.error(err);
                }
            }
        }
    }
    async getClient(cfg) {
        const pool = new mssql.ConnectionPool(cfg);
        const client = await pool.connect();

        pool.on('error', (err) => {
            console.log('mssqlpool', err);
        });

        mssql.on('error', (err) => {
            console.log('mssqlglobal', err);
        });
        return client;
    }

}
module.exports = mssql2es;
