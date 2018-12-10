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
                    server: 'db1',
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
                    //dateformat:'yyyy-MM-dd HH:mm:ss',
                    interval:10,//间隔秒数
					disable:true,//配置该参数为 true 时，这个定时任务不会被启动。
                }
            }, output: {
                index: {
                    _index: "empi1",
                    _type: "pat",
                    //_id: "<%= SeqNo + '_' +  EmpiId %>",
                    _id: "<%= SeqNo %>"
                }
            }
        }
        ,
        "emr": {
            input: {
                db: {
                    server: 'db2',
                    user: 'sa',
                    password: '******',
                    database: 'ADT',
                },
                cfg:{
                    size:10,
                    table:'[PV1601] v(nolock) inner join [PID601] i(nolock) on v.VisitNumber=i.VisitNumber and v.SourceHospital=i.SourceHospital and v.InstitutionName=i.InstitutionName',
                    fields:`v.*,RegisterTime=case when v.InstitutionName='ZY' then AdmitDtTm else v.u_RegisterDtTm end,FName=rtrim(FName),Sex,LName,Street1,City,[State],HPhone,EthnicGroup,BirthPlace,Citizenship,DOB,SSN,u_PatientId,u_CardNo,u_InsuranceCode,u_CardAssignAuthorityName`,
                    order:'v.VisitNumber',
                    interval:10,
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
            }
        }
    }
};
