const sql = require('mssql');

module.exports = async (context,req) => {
try
{
    var conn = await getConn();
    if(req.body.action === "Approve")
        await conn.query(`update assettask set statusid = 789 where assettaskid = ${req.body.assettaskid}`);
    else if(req.body.action === "Reject")
    {
        await conn.query(`delete from approvalqueue where assettaskid = ${req.body.assettaskid}`);
        await conn.query(`update assettask set statusid = 788 where assettaskid = ${req.body.assettaskid}`);
    }
    context.res = {body: {message: "Success", data:null}};
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