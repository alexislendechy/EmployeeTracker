INSERT INTO department (name)
VALUES ("Finance"),
       ("Legal"),
       ("Human Resources"),
       ("Marketing"),
       ("Sales");

INSERT INTO role (title, salary, department_id)
VALUES 
  ("Accountant", 60000, 1),
  ("Legal Counsel", 80000, 2),
  ("HR Manager", 70000, 3),
  ("Marketing Specialist", 65000, 4),
  ("Sales Representative", 60000, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
  ("John", "Doe", 1, NULL), -- John Doe is an Accountant, so role_id is 1
  ("Jane", "Smith", 2, NULL), -- Jane Smith is a Legal Counsel, so role_id is 2
  ("David", "Johnson", 3, NULL), -- David Johnson is an HR Manager, so role_id is 3
  ("Emily", "Williams", 4, NULL), -- Emily Williams is a Marketing Specialist, so role_id is 4
  ("Michael", "Brown", 5, NULL); -- Michael Brown is a Sales Representative, so role_id is 5

