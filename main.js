// Employee data with updated structure
let employees = [
  { 
    id: 1,
    name: "Erfan Almrwani",
    role: "Frontend Developer", 
    status: "Active",
    salary: 85000,
    bonusPercentage: 0
  },
  { 
    id: 2, 
    name: "Ali Mohammed", 
    role: "System Analyst", 
    status: "On Leave",
    salary: 75000,
    bonusPercentage: 0
  },
  { 
    id: 3, 
    name: "Ahmed Said", 
    role: "Manager", 
    status: "Active",
    salary: 120000,
    bonusPercentage: 0
  },
];

let trash = [];
let currentFilters = {};
let currentEmployeeIdForBonus = null;

// DOM elements
const employeeForm = document.getElementById("employeeForm");
const employeeList = document.querySelector("#employeeList");
const trashList = document.getElementById("trashList");
const toggleTrashBtn = document.getElementById("toggleTrash");
const hideTrashBtn = document.getElementById("hideTrash");
const trashSection = document.getElementById("trashSection");
const activeCount = document.getElementById("activeCount");
const trashCount = document.getElementById("trashCount");
const totalPayroll = document.getElementById("totalPayroll");
const dateElement = document.querySelector("#date");
const bonusModal = document.getElementById("bonusModal");
const closeModal = document.querySelector(".close");
const applyBonusBtn = document.getElementById("applyBonus");
const deleteLowSalaryBtn = document.getElementById("deleteLowSalary");
const applyFiltersBtn = document.getElementById("applyFilters");
const clearFiltersBtn = document.getElementById("clearFilters");

// Initialize the app
function initApp() {
  showEmployees();
  updateCounters();
  updateTotalPayroll();

  employeeForm.addEventListener("submit", handleEmployeeForm);
  toggleTrashBtn.addEventListener("click", () => trashSection.style.display = "block");
  hideTrashBtn.addEventListener("click", () => trashSection.style.display = "none");
  employeeList.addEventListener("click", handleEmployeeAction);
  trashList.addEventListener("click", handleTrashAction);
  closeModal.addEventListener("click", () => bonusModal.style.display = "none");
  applyBonusBtn.addEventListener("click", applyBonus);
  deleteLowSalaryBtn.addEventListener("click", deleteLowSalaryEmployees);
  applyFiltersBtn.addEventListener("click", applyFilters);
  clearFiltersBtn.addEventListener("click", clearFilters);

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === bonusModal) {
      bonusModal.style.display = "none";
    }
  });
}

function handleEmployeeForm(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const role = document.getElementById("role").value.trim();
  const salary = document.getElementById("salary").value.trim();
  const status = document.getElementById("status").value;

  if (!validateForm(name, role, salary, status)) {
    return;
  }

  const newEmployee = {
    id: Date.now(),
    name,
    role,
    salary: parseInt(salary.replace(/,/g, '')),
    status,
    bonusPercentage: 0
  };
  
  employees.push(newEmployee);
  showEmployees();
  updateCounters();
  updateTotalPayroll();
  employeeForm.reset();
}

function validateForm(name, role, salary, status) {
  let isValid = true;
  const nameRegex = /^[a-zA-Z\s]{2,}$/;
  const roleRegex = /^[a-zA-Z\s]{2,}$/;
  const salaryRegex = /^[0-9,]+$/;

  // Validate name
  if (!nameRegex.test(name)) {
    showError("name", "Please enter a valid name (min 2 characters)");
    isValid = false;
  } else {
    clearError("name");
  }

  // Validate role
  if (!roleRegex.test(role)) {
    showError("role", "Please enter a valid role (min 2 characters)");
    isValid = false;
  } else {
    clearError("role");
  }

  // Validate salary
  const salaryValue = parseInt(salary.replace(/,/g, ''));
  if (!salaryRegex.test(salary) || isNaN(salaryValue) || salaryValue <= 0) {
    showError("salary", "Please enter a valid salary (positive number)");
    isValid = false;
  } else {
    clearError("salary");
  }

  // Validate status
  if (!status) {
    showError("status", "Please select employee status");
    isValid = false;
  } else {
    clearError("status");
  }

  return isValid;
}

function showError(field, message) {
  document.getElementById(field).classList.add("input-error");
  const errorElement = document.getElementById(`${field}Error`);
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

function clearError(field) {
  document.getElementById(field).classList.remove("input-error");
  document.getElementById(`${field}Error`).style.display = "none";
}

function showEmployees() {
  // Apply filters
  let filteredEmployees = employees;
  
  if (Object.keys(currentFilters).length > 0) {
    filteredEmployees = employees.filter(employee => {
      // Name filter
      if (currentFilters.name && 
          !employee.name.toLowerCase().includes(currentFilters.name.toLowerCase())) {
        return false;
      }
      
      // Role filter
      if (currentFilters.role && 
          !employee.role.toLowerCase().includes(currentFilters.role.toLowerCase())) {
        return false;
      }
      
      // Salary range filter
      if (currentFilters.salaryMin && employee.salary < currentFilters.salaryMin) {
        return false;
      }
      if (currentFilters.salaryMax && employee.salary > currentFilters.salaryMax) {
        return false;
      }
      
      // Status filter
      if (currentFilters.status && employee.status !== currentFilters.status) {
        return false;
      }
      
      return true;
    });
  }

  if (filteredEmployees.length === 0) {
    employeeList.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <div>📋</div>
          <h3>No employees found</h3>
          <p>Try adjusting your filters</p>
        </td>
      </tr>
    `;
    return;
  }

  employeeList.innerHTML = "";

  filteredEmployees.forEach((employee) => {
    const row = document.createElement("tr");
    row.setAttribute("data-id", employee.id);

    // Status badge
    let statusBadge = "";
    if (employee.status === "Active") statusBadge = "badge-active";
    else if (employee.status === "On Leave") statusBadge = "badge-leave";
    else if (employee.status === "Terminated") statusBadge = "badge-terminated";

    // Calculate bonus
    const bonusAmount = employee.salary * (employee.bonusPercentage / 100);
    
    // Name badges
    const nameBadges = [];
    if (employee.salary >= 100000) {
      nameBadges.push(`<span class="badge badge-high-salary">High Salary</span>`);
    }
    if (employee.bonusPercentage > 0) {
      nameBadges.push(`<span class="badge badge-bonus">Bonus: ${employee.bonusPercentage}%</span>`);
    }

    row.innerHTML = `
      <td>
        <div class="name-with-badges">
          ${employee.name}
          <div class="name-badges">${nameBadges.join('')}</div>
        </div>
      </td>
      <td>${employee.role}</td>
      <td>${formatCurrency(employee.salary)}</td>
      <td>${formatCurrency(bonusAmount)}</td>
      <td><span class="badge ${statusBadge}">${employee.status}</span></td>
      <td class="actions">
        <button class="btn btn-warning edit-btn">Edit</button>
        <button class="btn btn-primary bonus-btn">Bonus</button>
        <button class="btn btn-danger delete-btn">Delete</button>
      </td>
    `;

    employeeList.appendChild(row);
  });
}

// Format currency
function formatCurrency(amount) {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).replace('USD', 'SAR');
}

function showTrashList() {
  if (trash.length === 0) {
    trashList.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <div>🗑️</div>
          <h3>Trash is empty</h3>
          <p>Deleted employees will appear here</p>
        </td>
      </tr>
    `;
    return;
  }

  trashList.innerHTML = "";

  trash.forEach((employee) => {
    const row = document.createElement("tr");
    row.setAttribute("data-id", employee.id);

    // Status badge
    let statusBadge = "";
    if (employee.status === "Active") statusBadge = "badge-active";
    else if (employee.status === "On Leave") statusBadge = "badge-leave";
    else if (employee.status === "Terminated") statusBadge = "badge-terminated";
    
    // Calculate bonus
    const bonusAmount = employee.salary * (employee.bonusPercentage / 100);

    row.innerHTML = `
      <td>${employee.name}</td>
      <td>${employee.role}</td>
      <td>${formatCurrency(employee.salary)}</td>
      <td>${formatCurrency(bonusAmount)}</td>
      <td><span class="badge ${statusBadge}">${employee.status}</span></td>
      <td class="actions">
        <button class="btn btn-success restore-btn">Restore</button>
        <button class="btn btn-danger permanent-delete-btn">Delete Permanently</button>
      </td>
    `;

    trashList.appendChild(row);
  });
}

function handleEmployeeAction(e) {
  if (e.target.classList.contains("edit-btn")) {
    const row = e.target.closest("tr");
    const id = parseInt(row.getAttribute("data-id"));
    const employee = employees.find(emp => emp.id === id);
    if (employee) editEmployee(employee);
  } 
  else if (e.target.classList.contains("delete-btn")) {
    const row = e.target.closest("tr");
    const id = parseInt(row.getAttribute("data-id"));
    deleteEmployee(id);
  }
  else if (e.target.classList.contains("bonus-btn")) {
    const row = e.target.closest("tr");
    const id = parseInt(row.getAttribute("data-id"));
    openBonusModal(id);
  }
}

function openBonusModal(id) {
  currentEmployeeIdForBonus = id;
  const employee = employees.find(emp => emp.id === id);
  if (employee) {
    document.getElementById("bonusPercentage").value = employee.bonusPercentage;
    bonusModal.style.display = "block";
    document.getElementById("bonusError").style.display = "none";
  }
}

function applyBonus() {
  const bonusInput = document.getElementById("bonusPercentage");
  const bonusValue = parseInt(bonusInput.value);
  
  if (isNaN(bonusValue) || bonusValue < 0 || bonusValue > 100) {
    document.getElementById("bonusError").style.display = "block";
    return;
  }
  
  document.getElementById("bonusError").style.display = "none";
  
  const employeeIndex = employees.findIndex(emp => emp.id === currentEmployeeIdForBonus);
  if (employeeIndex !== -1) {
    employees[employeeIndex].bonusPercentage = bonusValue;
    showEmployees();
    bonusModal.style.display = "none";
  }
}

function updateTotalPayroll() {
  const total = employees.reduce((sum, employee) => sum + employee.salary, 0);
  totalPayroll.textContent = formatCurrency(total);
}

function deleteLowSalaryEmployees() {
  if (!confirm("Are you sure you want to delete all employees with salary ≤ 20,000 SAR?")) return;
  
  const lowSalaryEmployees = employees.filter(emp => emp.salary <= 20000);
  
  if (lowSalaryEmployees.length === 0) {
    alert("No employees found with salary ≤ 20,000 SAR");
    return;
  }
  
  // Move to trash
  trash.push(...lowSalaryEmployees);
  
  // Remove from active employees
  employees = employees.filter(emp => emp.salary > 20000);
  
  showEmployees();
  showTrashList();
  updateCounters();
  updateTotalPayroll();
}

function applyFilters() {
  currentFilters = {
    name: document.getElementById("nameFilter").value,
    role: document.getElementById("roleFilter").value,
    salaryMin: document.getElementById("salaryMin").value ? parseInt(document.getElementById("salaryMin").value) : null,
    salaryMax: document.getElementById("salaryMax").value ? parseInt(document.getElementById("salaryMax").value) : null,
    status: document.getElementById("statusFilter").value
  };
  
  showEmployees();
}

function clearFilters() {
  document.getElementById("nameFilter").value = "";
  document.getElementById("roleFilter").value = "";
  document.getElementById("salaryMin").value = "";
  document.getElementById("salaryMax").value = "";
  document.getElementById("statusFilter").value = "";
  
  currentFilters = {};
  showEmployees();
}

function editEmployee(employee) {
  const newName = prompt("Enter new name:", employee.name);
  if (newName === null) return; // Cancelled
  
  const newRole = prompt("Enter new role:", employee.role);
  if (newRole === null) return;
  
  const newStatus = prompt(
    "Enter new status (Active, On Leave, Terminated):",
    employee.status
  );
  if (newStatus === null) return;
  
  // Validate status
  if (!["Active", "On Leave", "Terminated"].includes(newStatus)) {
    alert("Invalid status! Please enter: Active, On Leave, or Terminated");
    return;
  }
  
  // Update employee
  employee.name = newName.trim();
  employee.role = newRole.trim();
  employee.status = newStatus;
  
  showEmployees();
}

function deleteEmployee(id) {
  if (!confirm("Are you sure you want to delete this employee?")) return;
  
  const employeeIndex = employees.findIndex(emp => emp.id === id);
  if (employeeIndex === -1) return;
  
  // Move to trash
  const [deletedEmployee] = employees.splice(employeeIndex, 1);
  trash.push(deletedEmployee);
  
  showEmployees();
  showTrashList();
  updateCounters();
  updateTotalPayroll();
}

function restoreEmployee(index) {
  const [restoredEmployee] = trash.splice(index, 1);
  employees.push(restoredEmployee);
  
  showEmployees();
  showTrashList();
  updateCounters();
  updateTotalPayroll();
}

function permanentDeleteEmployee(index) {
  if (!confirm("Are you sure you want to permanently delete this employee? This cannot be undone")) return;
  
  trash.splice(index, 1);
  showTrashList();
  updateCounters();
}

function handleTrashAction(e) {
  if (e.target.classList.contains("restore-btn")) {
    const row = e.target.closest("tr");
    const id = parseInt(row.getAttribute("data-id"));
    const employeeIndex = trash.findIndex(emp => emp.id === id);
    if (employeeIndex !== -1) restoreEmployee(employeeIndex);
  }
  else if (e.target.classList.contains("permanent-delete-btn")) {
    const row = e.target.closest("tr");
    const id = parseInt(row.getAttribute("data-id"));
    const employeeIndex = trash.findIndex(emp => emp.id === id);
    if (employeeIndex !== -1) permanentDeleteEmployee(employeeIndex);
  }
}

function updateCounters() {
  activeCount.textContent = employees.length;
  trashCount.textContent = trash.length;
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", initApp);