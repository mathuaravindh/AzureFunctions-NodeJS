const sql = require('mssql');

module.exports = async (context,req) => {
try{
    var conn = await getConn();
    var result = {};
    var queryResult = await conn.query(`select ak.AssetID,ak.AssetTaskID,[Type] =  CASE    
    WHEN DATEDIFF(day, GETDATE(), ak.WarnTime) >= 0 THEN 'Upcoming'    
    WHEN (ak.WarnTime IS NULL OR DATEDIFF(day, GETDATE(), ak.WarnTime) < 0) AND DATEDIFF(day, GETDATE(), ak.DueTime) >= 0 THEN 'Warning'    
    WHEN DATEDIFF(day, GETDATE(), ak.DueTime) < 0 THEN 'PastDue'    
    ELSE NULL
    END from Assettask ak 
  where ak.statusid = 788 and ak.userid = (select userid from [user] where userguid = '${req.body.userGuid}')
  union
  select ak.AssetID,aq.AssetTaskID,[Type] =  CASE    
    WHEN DATEDIFF(day, GETDATE(), aq.WarnTime) >= 0 THEN 'Upcoming'    
    WHEN (aq.WarnTime IS NULL OR DATEDIFF(day, GETDATE(), aq.WarnTime) < 0) AND DATEDIFF(day, GETDATE(), aq.DueTime) >= 0 THEN 'Warning'    
    WHEN DATEDIFF(day, GETDATE(), aq.DueTime) < 0 THEN 'PastDue'    
    ELSE NULL
    END from ApprovalQueue aq join AssetTask ak on aq.AssetTaskId = ak.AssetTaskId
  where aq.DateComplete IS NULL and aq.userid = (select userid from [user] where userguid = '${req.body.userGuid}')`);

result.upcomingCount = queryResult.recordset.filter(x => {
    return x.Type === "Upcoming"
    }).length;
result.warningCount = queryResult.recordset.filter(x => {
    return x.Type === "Warning"
    }).length;
result.pastdueCount = queryResult.recordset.filter(x => {
    return x.Type === "PastDue"
    }).length;
result.totalCount = queryResult.recordset.length;
context.res = {body: result};
}
catch(e)
{
    context.res = {status: 500, body: {message: "Failed", error: e.message}};
}
}

const getConn = async () => {
    await sql.connect('Server=misql-xm-cascade-dev-cus.331c5123c6d7.database.windows.net;Database=CascadeTransactions;User Id=REOUser;Password=Solut10nSt@r;Encrypt=true');
    return sql;
}