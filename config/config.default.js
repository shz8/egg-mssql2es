'use strict';

/**
 * egg-mssql2es default config
 * @member Config#mssql2es
 * @property {String} SOME_KEY - some description
 */
exports.mssql2es = {
    es: {
        host: '136.100.102.231:9200',
        log: 'warning',
    },
    rules: {
        "empi": {
            input: {
                db: {
                    server: '192.168.0.111',
                    user: 'sa',
                    password: '******',
                    database: 'EMPI',
                },
                cfg: {
                    size: 10000,
                    table: '[PatientInfo] i(nolock) inner join [DomainPatients] p(nolock) on i.seqno=p.seqno and p.Status>-1',
                    fields: 'i.*,[IsEmpiPatient],[EmpiId],[DomainId],[PatientIdInDomain],[EventTime],[EventRecordTime],p.[Status],[Similarity]',
                    order: 'i.SeqNo',
                    max:'0',
                    //pkey: ''
                    //dateformat:'yyyy-MM-dd HH:mm:ss',
                }
            }, output: {
                index: {
                    _index: "empi1",
                    _type: "pat",
                    _id: "${SeqNo}"
                }
            }, schedule: {
                interval: '1m', // 1 分钟间隔
            }
        }
        /*,
        "emr": {
            input: {
                db: {
                    server: 'zscdr',
                    user: 'cdrsa',
                    password: 'Cdrsa@2014',
                    database: 'ADT',
                },
                cfg:{
                    size:10,
                    table:'',
                    fields:'',
                    order:'',
                    pkey:'${VisitNumber}'
                }
            }, output: {
                es: {
                    hosts: "136.100.102.231:9200",
                    log: 'trace',
                },
                index: {
                    _index: "adt",
                    _type: "patvisit",
                    //_id:""
                }
            },schedule: {
    interval: '1m', // 1 分钟间隔
    type: 'all', // 指定所有的 worker 都需要执行
  }
        }*/
    }
};
