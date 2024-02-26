$(document).ready(function() {
    let employeeData = []; // Array to store employee data
    let currentPage = 1; // Current page
    const recordsPerPage = 8; // Number of records per page
    let currentSortColumn = ''; // Current sort column
    let isAscending = true; // Flag to track sort order

    // Fetch data from the API
    function fetchData() {
        $.ajax({
            url: 'https://api.findofficers.com/hiring_test/get_all_employee',
            method: 'GET',
            success: function(data) {
                employeeData = data; // Store data in employeeData array
                renderTable(); // Render table with initial data
            },
            error: function(err) {
                console.error('Error fetching data:', err);
            }
        });
    }

    // Render table with sorted and paginated data
    function renderTable() {
        // Sort data based on column and order
        let sortedData = sortData(employeeData, currentSortColumn, isAscending);
        
        // Filter data based on search query
        let filteredData = searchFilter(sortedData);
        
        // Calculate total pages
        const totalPages = Math.ceil(filteredData.length / recordsPerPage);
        
        // Paginate data
        let paginatedData = filteredData.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

        // Clear existing table rows
        $('#employeeTableBody').empty();

        // Render table rows
        paginatedData.forEach(function(employee) {
            $('#employeeTableBody').append(`
                <tr>
                    <td>${employee.employeeID}</td>
                    <td>${employee.firstName} ${employee.lastName}</td>
                    <td>${employee.email}</td>
                    <td>${employee.phoneNumber}</td>
                </tr>
            `);
        });

        // Render pagination controls
        renderPagination(totalPages);
    }

    // Sort data based on column and order
    function sortData(data, column, ascending) {
        if (column === '') return data;

        return data.sort((a, b) => {
            let valA = getColumnValue(a, column);
            let valB = getColumnValue(b, column);

            if (typeof valA === 'string') {
                valA = valA.toUpperCase();
                valB = valB.toUpperCase();
            }

            if (valA < valB) return ascending ? -1 : 1;
            if (valA > valB) return ascending ? 1 : -1;
            return 0;
        });
    }

    // Get value of a column from an employee object
    function getColumnValue(employee, column) {
        switch (column) {
            case 'id':
                return employee.employeeID;
            case 'name':
                return `${employee.firstName} ${employee.lastName}`;
            case 'email':
                return employee.email;
            case 'phone':
                return employee.phoneNumber;
            default:
                return ''; // Return empty string for unknown columns
        }
    }

    // Filter data based on search query
    function searchFilter(data) {
        const searchQuery = $('#searchInput').val().trim().toLowerCase();

        if (searchQuery === '') return data;

        return data.filter(employee => {
            return (
                employee.employeeID.toLowerCase().includes(searchQuery) ||
                `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchQuery) ||
                employee.email.toLowerCase().includes(searchQuery) ||
                employee.phoneNumber.toLowerCase().includes(searchQuery)
            );
        });
    }

    // Render pagination controls
    function renderPagination(totalPages) {
        $('#pagination').empty();

        for (let i = 1; i <= totalPages; i++) {
            $('#pagination').append(`<button class="pagination-button">${i}</button>`);
        }
    }

    // Fetch data when the page loads
    fetchData();

    // Attach event listeners
    // Sorting - Attach click event listener to column headers
    $('#employeeTable th').click(function() {
        const column = $(this).data('sort');

        if (currentSortColumn === column) {
            isAscending = !isAscending;
        } else {
            currentSortColumn = column;
            isAscending = true;
        }

        renderTable();
    });

    // Searching - Attach input event listener to the search input field
    $('#searchInput').on('input', function() {
        renderTable();
    });

    // Pagination - Attach click event listeners to pagination controls
    $(document).on('click', '.pagination-button', function() {
        currentPage = parseInt($(this).text());
        renderTable();
    });
});