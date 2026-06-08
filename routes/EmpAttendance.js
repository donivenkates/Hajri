const express = require("express");
const router = express.Router();

const { sql, poolPromise } = require("../db");


router.post("/login", async (req, res) => {
  try {
    const pool = await poolPromise;
    const { Username, Password } = req.body;

    const result = await pool
      .request()
      .input("Username", sql.VarChar(200), Username)
      .input("Password", sql.VarChar(100), Password)
      .query(`
        SELECT Id, Name, Username, RoleId, SuperId
        FROM dbo.Users
        WHERE Username = @Username AND Password = @Password
      `);

    // Check if user exists
    if (result.recordset.length === 0) {
      return res.status(401).json({
        status: false,
        message: "Incorrect username or password",
      });
    }

    res.status(200).json({
      status: true,
      message: "Login successful",
      data: result.recordset[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});


router.get("/getemployees", async (req, res) => {
  try {
    const pool = await poolPromise;
    const { SuperId } = req.query;
    const result = await pool.request()
    .input("SuperId",sql.Int,SuperId).query(`
      SELECT Id,Name,Mobile,Age,Amount FROM dbo.Registrations where IsActive = 1 AND SuperId = @SuperId
    `);

    res.status(200).json({
      status: true,
      data: result.recordset,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

router.post("/addEmployee", async (req, res) => {
  try {
    console.log(req.body);
    const { SuperId,Name, Mobile, Age, Amount, UserId } = req.body;

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("SuperId", sql.Int, SuperId)
      .input("Name", sql.VarChar(100), Name)
      .input("Mobile", sql.VarChar(15), Mobile)
      .input("Age", sql.Int, Age)
      .input("Amount", sql.Decimal(18, 2), Amount)
      .input("UserId", sql.Int, UserId)
      .query(`
        INSERT INTO dbo.Registrations
        (
         SuperId, Name,Mobile,Age,Amount,IsActive,CreatedBy,CreatedOn
        )
        VALUES
        (
         @SuperId, @Name,@Mobile, @Age, @Amount, 1,@UserId,GETDATE())
      `);

    res.status(201).json({
      status: true,
      message: "Employee added successfully",
      rowsAffected: result.rowsAffected,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});
router.post("/addAttendanceBulk", async (req, res) => {
  try {
    const attendanceList = req.body.Json;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("Json", sql.NVarChar(sql.MAX), JSON.stringify(attendanceList))
      .execute("dbo.SP_AddAttendanceBulk");

    res.status(200).json({
      status: true,
      message: "Bulk attendance inserted successfully",
      result: result.recordset
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: false,
      message: error.message
    });
  }
});


router.get("/getProjects", async (req, res) => {
  try {
    const { SuperId } = req.query;
    const pool = await poolPromise;

    const result = await pool.request()
    .input("SuperId",sql.Int,SuperId).query(`
      Select Id,Name,ClientName,Mobile,Amount,Address,Notes,CreatedBy, Advance from  dbo.Project where Isactive = 1 AND SuperId = @SuperId
    `);
    res.status(200).json({
      status: true,
      data: result.recordset,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

router.post("/addProject", async (req, res) => {
  try {
    const { SuperId,Name, ClientName, Mobile, Amount, Address,Advance,Notes,UserId,Startdate } = req.body;

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("SuperId", sql.Int, SuperId)
      .input("Name", sql.VarChar(200), Name || null)
      .input("ClientName", sql.VarChar(200), ClientName)
      .input("Mobile", sql.VarChar(20), Mobile || null)
      .input("Amount", sql.Int, Amount || null)
      .input("Address", sql.VarChar(200), Address || null)
      .input("Advance",sql.Int,Advance || null)
      .input("Notes",sql.VarChar(200), Notes || null)
      .input("UserId", sql.Int, UserId)
      .input("Startdate", sql.Date, Startdate || null)
      .query(`
        INSERT INTO DBO.Project (SuperId,Name,ClientName,Mobile,Amount,Address,Advance,Notes,CreatedBy,Startdate)
VALUES (@SuperId,@Name,@ClientName,@Mobile,@Amount,@Address,@Advance,@Notes,@UserId,@Startdate)
      `);

    res.status(201).json({
      status: true,
      message: "Project added successfully",
      rowsAffected: result.rowsAffected,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

router.post("/updateProject", async (req, res) => {
  try {
    const {Id, SuperId,Name, ClientName, Mobile, Amount, Address,Advance,Notes,UserId,Startdate } = req.body;

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("SuperId", sql.Int, SuperId)
      .input("Name", sql.VarChar(200), Name || null)
      .input("ClientName", sql.VarChar(200), ClientName)
      .input("Mobile", sql.VarChar(20), Mobile || null)
      .input("Amount", sql.Int, Amount || null)
      .input("Address", sql.VarChar(200), Address || null)
      .input("Advance",sql.Int,Advance || null)
      .input("Notes",sql.VarChar(200), Notes || null)
      .input("UserId", sql.Int, UserId)
      .input("Startdate", sql.Date, Startdate || null)
      .input("Id", sql.Int, Id)
      .query(`
        UPDATE DBO.Project SET SuperId = @SuperId, Name = @Name, ClientName = @ClientName, Mobile=@Mobile, Amount = @Amount,Address = @Address,
Advance = @Advance, Notes = @Notes, UpdatedBy = @UserId,UpdatedOn = Getdate(),
Startdate = @Startdate
Where Id = @Id
      `);

    res.status(201).json({
      status: true,
      message: "Project Updated successfully",
      rowsAffected: result.rowsAffected,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

router.post("/CloseProject", async (req, res) => {
  try {
    const {Id, Enddate } = req.body;

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("Enddate", sql.Date, Enddate || null)
      .input("Id", sql.Int, Id)
      .query(`
        UPDATE DBO.Project SET Enddate = @Enddate,Isactive = 0 Where Id = @Id
      `);

    res.status(201).json({
      status: true,
      message: "Project closed successfully",
      rowsAffected: result.rowsAffected,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

router.post("/AddEmpPayments", async (req, res) => {
  try {
    const {EmployeeId,DateOftrasaction,Amount,PaymentType,Notes,UserId} = req.body;
    if (
      !EmployeeId ||
      !DateOftrasaction ||
      !Amount ||
      !PaymentType ||
      !UserId
    ) {
      return res.status(400).json({
        status: false,
        message: "Required fields are missing"
      });
    }

    const pool = await poolPromise;
    const result = await pool.request()
    .input("EmployeeId",sql.Int,EmployeeId)
    .input("DateOftrasaction",sql.Date,DateOftrasaction)
    .input("Amount",sql.Decimal(18,2),Amount)
    .input("PaymentType",sql.VarChar(50),PaymentType)
    .input("Notes",sql.VarChar(200),Notes || null)
    .input("UserId",sql.Int,UserId)
    .query(`
      INSERT INTO DBO.EmpPayments(Regid,DateOftrasaction,Amount,PaymentType,Notes,CreatedBy,CreatedOn)
      VALUES(@EmployeeId,@DateOftrasaction,@Amount,@PaymentType,@Notes,@UserId,GETDATE())
    `);
    res.status(200).json({
      status: true,
      message: "Payment recorded successfully",
      rowsAffected: result.rowsAffected
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: error.message
    });
   }
  });
router.get("/GetAttendances", async (req, res) => {
  try {
    const { SuperId, RegId ,Startdate,EndDate} = req.query;

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("SuperId", sql.Int, SuperId)
      .input("RegId", sql.Int, RegId || 0)
      .input("Startdate", sql.Date, Startdate)
      .input("EndDate", sql.Date, EndDate)
      .query(`
        
Select EA.Id, RegId,REG.Name as EmpName,REG.Mobile, ProjectId,P.ClientName,  DateOftrasaction,Attendance,IsPresent,EA.Notes,EA.CreatedBy from dbo.EmpAttendance as EA
INNER JOIN dbo.Registrations as REG ON REG.ID = EA.RegId
INNER JOIN dbo.Project AS P ON P.Id = EA.ProjectId
Where REG.SuperId = @SuperId And REG.IsActive = 1 AND (EA.RegId = @RegId OR @RegId = 0) AND CONVERT(DATE, EA.DateOftrasaction)
      BETWEEN @Startdate AND @EndDate
        ORDER BY EA.DateOftrasaction DESC
      `);

    res.status(200).json({
      status: true,
      message: "Attendance fetched successfully",
      data: result.recordset
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: false,
      message: error.message
    });
  }
});


router.post("/AddClientPayments", async (req, res) => {
  try {
    const {ClientId,DateOftrasaction,Amount,PaymentType,Notes,UserId} = req.body;
    if (
      !ClientId ||
      !DateOftrasaction ||
      !Amount ||
      !PaymentType ||
      !UserId
    ) {
      return res.status(400).json({
        status: false,
        message: "Required fields are missing"
      });
    }

    const pool = await poolPromise;
    const result = await pool.request()
    .input("ClientId",sql.Int,ClientId)
    .input("DateOftrasaction",sql.Date,DateOftrasaction)
    .input("Amount",sql.Decimal(18,2),Amount)
    .input("PaymentType",sql.VarChar(50),PaymentType)
    .input("Notes",sql.VarChar(200),Notes || null)
    .input("UserId",sql.Int,UserId)
    .query(`
      INSERT INTO [dbo].[ClientPayments] (ClientId,DateOftrasaction,Amount,PaymentType,Notes,CreatedBy,Isactive,CreatedOn)
Values (@ClientId,@DateOftrasaction,@Amount,@PaymentType,@Notes,@UserId,1,GETDATE())
    `);
    res.status(200).json({
      status: true,
      message: "Payment recorded successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: error.message
    });
   }
  });

  router.get("/getClientPayments", async (req, res) => {
  try {
    const { ClientId }  = req.query;

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("ClientId", sql.Int, ClientId)
      .query(`
Select CP.Id,ClientId,P.ClientName,p.Name As ProjectName,CONVERT(VARCHAR(10), CP.DateOftrasaction, 103) AS DateOftrasaction,CP.Amount,PaymentType,CP.Notes 
from [dbo].[ClientPayments] as CP
INNER JOIN DBO.Project AS P ON p.Id = CP.ClientId
WHERE ClientId = @ClientId ORDER BY ID DESC
      `);

    res.status(200).json({
      status: true,
      message: "Client Payments fetched successfully",
      data: result.recordset
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: false,
      message: error.message
    });
  }
});
router.post("/AddExpenses", async (req,res) => {
  try {
    const {ProjectId,SuperId,Amount,ExpenseType,DateOfTransaction,Notes,UserId} = req.body;
    if (!SuperId) {
      return res.status(400).json({
        status:false,
        message:"SuperId Is Required"
      })}
      const pool = await poolPromise;
      const result = await pool.request()
      .input("ProjectId",sql.Int, ProjectId || null)
      .input("SuperId",sql.Int, SuperId)
      .input("Amount", sql.Int, Amount || null)
      .input("ExpenseType", sql.Int, ExpenseType || null)
      .input ("DateOfTransaction", sql.Date, DateOfTransaction || null)
      .input("Notes", sql.VarChar(200), Notes || null)
      .input("UserId", sql.Int, UserId).query(`
        INSERT INTO dbo.Expenses (ProjectId,SuperId,Amount,ExpensesType,DateOfTrasaction,Notes,CreateBy)
Values (@ProjectId,@SuperId,@Amount,@ExpenseType,@DateOfTransaction,@Notes,@UserId)`)
      res.status(200).json({
        status:true,
        message:"Expenses Added Successfully",
      });
    } catch (error) {
      console.error(error);
    
      return res.status(500).json({
        status:false,
        message: error.message
      } );
    }
  })
router.get("/getExpenses", async (req,res) => {
    try {
      const { SuperId } = req.query;
      const pool = await poolPromise;
      const result = await pool.request()
      .input("SuperId", sql.Int, SuperId).query(`
        SELECT Ex.*,P.Name FROM dbo.Expenses EX
lEFT JOIN dbo.Project as p ON p.Id = EX.ProjectId
Where ex.SuperId = @SuperId Order BY Id Desc `);
      res.status(200).json({
        status:true,
        data: result.recordset
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: error.message
      });
      }
  })

  router.get("/getEmpPaymentd", async (req,res) => {
    try {
    const {RegId} = req.query;
    const pool = await poolPromise;   
    const result = await pool.request()
    .input("RegId", sql.Int, RegId).query(`
      Select EP.*,Reg.Name as Employee from dbo.EmpPayments EP
INNER JOIN [dbo].[Registrations] as Reg ON Reg.Id = Ep.RegId
where EP.RegId = @RegId
    `)
     res.status(200).json({
      status:true,
      data: result.recordset
     })
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: error.message
      });
    }
});



module.exports = router;
