const express = require("express");
const router = express.Router();

const {sql,poolPromise} = require("../db");

router.get("/getEmployeeReport", async (req,res) => {
    try {
        const {SuperId, RegId} = req.query;
        const pool = await poolPromise;
        const result = await pool.request()
        .input("SuperId", sql.Int, SuperId)
        .input("RegId", sql.Int, RegId).query(`
            Select Employee, Parday as Perday,WorkingDays,Total,Paid,Due from dbo.V_GetEmployeeReport
Where SuperId = @SuperId And (RegId = @RegId OR @RegId = 0)`);
            res.status(200).json({
                status: true,
                data: result.recordset})
            } catch (error){
                res.status(500).json({
                    status: false,
                    message: error.message,
                });
}
});

router.get("/getClientReport", async (req,res) => {
    try {
        const {SuperId, ClientId} = req.query;
        const pool = await poolPromise;
        const result = await pool.request()
        .input("SuperId", sql.Int, SuperId)
        .input("ClientId", sql.Int, ClientId).query(`
            Select C.ClientId,P.Name,CAST(P.CreatedOn as DATE) As Date,P.Amount as Badget,P.Advance,SUM(C.Amount) as Paid, P.Amount - (P.Advance + SUM(C.Amount)) AS Balance
from dbo.Project as P
INNER JOIN dbo.ClientPayments as C ON C.ClientId = P.id 
Where P.SuperId = @SuperId And (C.ClientId = @ClientId OR @ClientId = 0)
GROUP BY C.ClientId, P.Name,CAST(P.CreatedOn AS DATE),P.Amount,P.Advance;
`);
            res.status(200).json({
                status: true,
                data: result.recordset})
            } catch (error){
                res.status(500).json({
                    status: false,
                    message: error.message,
                });
}
});

router.get("/getEmpPayments", async (req,res) => {
    try{
        const {RegId} = req.query
        const pool = await poolPromise;
        const result = await pool.request()
        .input("RegId",sql.Int, RegId).query(`
        select REG.Name,CONVERT(Varchar(20),Ep.Dateoftrasaction,23) as Date,EP.Amount,PaymentType,Notes from [dbo].[EmpPayments] as EP
        INNER JOIN dbo.Registrations REG ON REG.Id = EP.RegId Where EP.RegId = @RegId
            `);
        res.status(200).json({
            status: true,
            data: result.recordset})
        } catch (error){
            res.status(500).json({
                status: false,
                message: error.message
            });
        }
 });

router.get("/getEmpAtterdanceReport", async (req,res) => {
    try{
        const {RegId} = req.query
        const pool = await poolPromise;
        const result = await pool.request()
        .input("RegId",sql.Int, RegId).query(`
            Select P.Name as Project,Reg.Name as Employee, RegId,CONVERT(Varchar(20),DateofTrasaction, 23) as date,Attendance
from dbo.EmpAttendance as att
INNER JOIN dbo.Registrations REG ON REG.Id = att.RegId
INNER JOIN dbo.Project p ON p.Id = att.ProjectId
Where att.RegId = @RegId
            `);
            res.status(200).json({
                status: true,
                date: result.recordset})
            } catch (error) {
                res.status(500).json({
                    status: false,
                    message: error.message
                })
            }
        })


module.exports = router;
