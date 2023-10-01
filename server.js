const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Replace with your MySQL password
  database: 'employee_db',
}).promise();

// Function to display main menu
function mainMenu() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'menuChoice',
        message: 'What would you like to do?',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Update an employee role',
          'Exit',
        ],
      },
    ])
    .then((answers) => {
      switch (answers.menuChoice) {
        case 'View all departments':
          viewDepartments();
          break;
        case 'View all roles':
          viewRoles();
          break;
        case 'View all employees':
          viewEmployees();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee role':
          updateEmployeeRole();
          break;
        case 'Exit':
          db.end();
          console.log('Goodbye!');
          break;
      }
    });
}

// Function to view all departments
function viewDepartments() {
  db.query('SELECT * FROM department')
    .then(([rows]) => {
      console.table(rows);
      mainMenu();
    })
    .catch((error) => {
      console.error('Error viewing departments:', error);
      mainMenu();
    });
}

// Function to view all roles
function viewRoles() {
  db.query(
    'SELECT role.id, role.title, role.salary, department.name AS department FROM role JOIN department ON role.department_id = department.id'
  )
    .then(([rows]) => {
      console.table(rows);
      mainMenu();
    })
    .catch((error) => {
      console.error('Error viewing roles:', error);
      mainMenu();
    });
}

// Function to view all employees
function viewEmployees() {
  db.query(
    'SELECT employee.id, employee.first_name, employee.last_name, role.title AS job_title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee AS manager ON employee.manager_id = manager.id'
  )
    .then(([rows]) => {
      console.table(rows);
      mainMenu();
    })
    .catch((error) => {
      console.error('Error viewing employees:', error);
      mainMenu();
    });
}

// Function to add a department
function addDepartment() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter the name of the department:',
      },
    ])
    .then((answers) => {
      const department = { name: answers.name };
      db.query('INSERT INTO department SET ?', department)
        .then(() => {
          console.log('Department added successfully!');
          mainMenu();
        })
        .catch((error) => {
          console.error('Error adding department:', error);
          mainMenu();
        });
    });
}

// Function to add a role
function addRole() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter the title of the role:',
      },
      {
        type: 'input',
        name: 'salary',
        message: 'Enter the salary for the role:',
      },
      {
        type: 'input',
        name: 'department_id',
        message: 'Enter the department ID for the role:',
      },
    ])
    .then((answers) => {
      const role = {
        title: answers.title,
        salary: answers.salary,
        department_id: answers.department_id,
      };
      db.query('INSERT INTO role SET ?', role)
        .then(() => {
          console.log('Role added successfully!');
          mainMenu();
        })
        .catch((error) => {
          console.error('Error adding role:', error);
          mainMenu();
        });
    });
}

// Function to add an employee
function addEmployee() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'first_name',
        message: "Enter the employee's first name:",
      },
      {
        type: 'input',
        name: 'last_name',
        message: "Enter the employee's last name:",
      },
      {
        type: 'input',
        name: 'role_id',
        message: "Enter the employee's role ID:",
      },
      {
        type: 'input',
        name: 'manager_id',
        message: "Enter the employee's manager ID (or leave blank if none):",
      },
    ])
    .then((answers) => {
      const employee = {
        first_name: answers.first_name,
        last_name: answers.last_name,
        role_id: answers.role_id,
        manager_id: answers.manager_id || null,
      };
      db.query('INSERT INTO employee SET ?', employee)
        .then(() => {
          console.log('Employee added successfully!');
          mainMenu();
        })
        .catch((error) => {
          console.error('Error adding employee:', error);
          mainMenu();
        });
    });
}

// Function to update an employee's role
function updateEmployeeRole() {
  let employees;
  let roles;

  // First, get the list of employees and roles from the database
  db.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee')
    .then(([employeeRows]) => {
      employees = employeeRows;

      return db.query('SELECT id, title FROM role');
    })
    .then(([roleRows]) => {
      roles = roleRows;

      // Prompt the user to select an employee and a new role
      return inquirer.prompt([
        {
          type: 'list',
          name: 'employeeId',
          message: 'Select the employee you want to update:',
          choices: employees.map((employee) => ({
            name: employee.name,
            value: employee.id,
          })),
        },
        {
          type: 'list',
          name: 'roleId',
          message: 'Select the new role for the employee:',
          choices: roles.map((role) => ({
            name: role.title,
            value: role.id,
          })),
        },
      ]);
    })
    .then((answers) => {
      // Update the employee's role in the database
      return db.query('UPDATE employee SET role_id = ? WHERE id = ?', [
        answers.roleId,
        answers.employeeId,
      ]);
    })
    .then(() => {
      console.log('Employee role updated successfully!');
      mainMenu();
    })
    .catch((error) => {
      console.error('Error updating employee role:', error);
      mainMenu();
    });
}


// Start the application
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
  mainMenu(); // Start the main menu once the server is running
});
